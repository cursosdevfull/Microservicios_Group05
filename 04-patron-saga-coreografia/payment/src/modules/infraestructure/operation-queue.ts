import RepositoryQueue from "../application/repository-queue";
import BrokerBootstrap from "../../bootstrap/broker.bootstrap";
import Repository from "../application/repository";
import { PaymentBuilder, PaymentEntity } from "../domain/payment.entity";

export default class OperationQueue implements RepositoryQueue {
  constructor(private operation: Repository) {}

  async sendMessage(message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const queueName = "BILLED_ORDER_EVENT";
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
    const queueName = "ORDER_CREATE_EVENT";

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
    const exchangeName = "FAILED_ERROR_EXCHANGE";
    await channel.assertExchange(exchangeName, "topic", { durable: true });

    const routingKeys = [
      "store.order_cancelled.error",
      "delivery.order_cancelled.error",
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
    const exchangeName = "ORDER_CONFIRMED_EXCHANGE";
    await channel.assertExchange(exchangeName, "fanout", { durable: true });

    const assertQueue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(assertQueue.queue, exchangeName, "");

    channel.consume(assertQueue.queue, (message: any) => callback(message), {
      noAck: false,
    });
  }

  async consumerConfirmOrder(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "APPROVED";

    await this.operation.update(messageAsJSON.transaction, status);
  }

  async consumerError(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "CANCELLED";

    await this.operation.update(messageAsJSON.transaction, status);
  }

  async consumerCreated(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "PENDING";

    const orderEntity = new PaymentBuilder()
      .addName(messageAsJSON.data.name)
      .addItemCount(messageAsJSON.data.itemCount)
      .addTransaction(messageAsJSON.data.transaction)
      .addStatus(status)
      .build();

    const response = await this.operation.insert(orderEntity);

    await this.sendMessage(response);
    // await this.sendMessageError(response);

    const channel = BrokerBootstrap.getChannel();
    channel.ack(message);
  }
}
