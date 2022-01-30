import RepositoryQueue from "../application/repository-queue";
import BrokerBootstrap from "../../bootstrap/broker.bootstrap";
import Repository from "../application/repository";
import { PaymentBuilder, PaymentEntity } from "../domain/payment.entity";
import {
  EXCHANGE_NAME,
  EXCHANGE_TYPE,
  QUEUE_NAME,
  ROUTING_KEY_ERROR,
  TYPE_MESSAGE,
} from "./enum";

export default class OperationQueue implements RepositoryQueue {
  constructor(private operation: Repository) {}

  async sendMessage(message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const queueName = QUEUE_NAME.ORCHESTATOR_EVENT;
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }

  async sendMessageError(message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const messageAsString = JSON.stringify(message);

    const exchangeName = "FAILED_ERROR_EXCHANGE";
    await channel.assertExchange(exchangeName, "topic", { durable: true });
    channel.publish(
      exchangeName,
      "payment.order_cancelled.error",
      Buffer.from(messageAsString)
    );
  }

  async receiveMessage(): Promise<void> {
    const channel = BrokerBootstrap.getChannel();

    await this.receiveMessageCreated(channel, this.consumerCreated.bind(this));
    await this.receiveMessageError(channel, this.consumerError.bind(this));
    await this.receiveMessageConfirmOrder(
      channel,
      this.consumerConfirmOrder.bind(this)
    );
  }

  async receiveMessageCreated(
    channel: any,
    callback: (message: any, isError: boolean) => void
  ) {
    const queueName = QUEUE_NAME.ORDER_CREATE_EVENT;

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (message: any) => {
        callback(message, false);
      },
      { noAck: false }
    );
  }

  async receiveMessageError(channel: any, callback: (message: any) => void) {
    const exchangeName = EXCHANGE_NAME.FAILED_ERROR_EXCHANGE;
    await channel.assertExchange(exchangeName, "topic", { durable: true });

    const routingKeys = [
      ROUTING_KEY_ERROR.STORE_ERROR,
      ROUTING_KEY_ERROR.DELIVERY_ERROR,
    ];
    const assertQueue = await channel.assertQueue("", { exclusive: true });

    for (const routingKey of routingKeys) {
      channel.bindQueue(assertQueue.queue, exchangeName, routingKey);
    }

    channel.consume(assertQueue.queue, (message: any) => callback(message), {
      noAck: false,
    });
  }

  async receiveMessageConfirmOrder(
    channel: any,
    callback: (message: any) => void
  ) {
    const exchangeName = EXCHANGE_NAME.ORDER_CONFIRMED_EXCHANGE;
    await channel.assertExchange(exchangeName, EXCHANGE_TYPE.FANOUT, {
      durable: true,
    });

    const assertQueue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(assertQueue.queue, exchangeName, "");

    channel.consume(assertQueue.queue, (message: any) => callback(message), {
      noAck: false,
    });
  }

  async consumerConfirmOrder(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "APPROVED";

    await this.operation.update(messageAsJSON.payload.transaction, status);
  }

  async consumerError(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "CANCELLED";

    await this.operation.update(messageAsJSON.payload.transaction, status);
  }

  async consumerCreated(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "PENDING";

    const orderEntity = new PaymentBuilder()
      .addName(messageAsJSON.payload.name)
      .addItemCount(messageAsJSON.payload.itemCount)
      .addTransaction(messageAsJSON.payload.transaction)
      .addStatus(status)
      .build();

    const response = await this.operation.insert(orderEntity);

    await this.sendMessage({
      type: TYPE_MESSAGE.ORDER_BILLED,
      payload: response,
    });
    // await this.sendMessageError(response);

    const channel = BrokerBootstrap.getChannel();
    channel.ack(message);
  }
}
