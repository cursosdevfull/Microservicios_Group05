import RepositoryQueue from "../application/repository-queue";
import BrokerBootstrap from "../../bootstrap/broker.bootstrap";
import Repository from "../application/repository";
import {
  EXCHANGE_NAME,
  EXCHANGE_TYPE,
  QUEUE_NAME,
  ROUTING_KEY_ERROR,
} from "./enums";

export default class OperationQueue implements RepositoryQueue {
  constructor(private operation: Repository) {}

  async sendMessage(message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const queueName = QUEUE_NAME.ORCHESTATOR_EVENT;
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }

  async receiveMessage(): Promise<void> {
    const channel = BrokerBootstrap.getChannel();

    await this.receiveMessageSuccess(channel, this.consumerSuccess.bind(this));
    await this.receiveMessageError(channel, this.consumerError.bind(this));
    await this.receiveMessageConfirmOrder(
      channel,
      this.consumerConfirmOrder.bind(this)
    );
  }

  async receiveMessageSuccess(channel: any, callback: (message: any) => void) {
    const queueName = QUEUE_NAME.ORDER_DELIVERIED_EVENT;
    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (message: any) => {
        callback(message);
      },
      { noAck: false }
    );
  }

  async receiveMessageError(channel: any, callback: (message: any) => void) {
    const exchangeName = EXCHANGE_NAME.FAILED_ERROR_EXCHANGE;
    await channel.assertExchange(exchangeName, EXCHANGE_TYPE.TOPIC, {
      durable: true,
    });

    const routingKey = ROUTING_KEY_ERROR.ORDER_CANCELLED;
    const assertQueue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

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

  async consumerError(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "CANCELLED";

    await this.operation.update(messageAsJSON.payload.transaction, status);
  }

  async consumerSuccess(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "APPROVED";

    await this.operation.update(messageAsJSON.payload.transaction, status);
  }

  async consumerConfirmOrder(message: any) {
    console.log("consumerConfirmOrder", JSON.parse(message.content.toString()));
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "APPROVED";

    await this.operation.update(messageAsJSON.payload.transaction, status);
  }
}
