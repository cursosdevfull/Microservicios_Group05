import RepositoryQueue from "../application/repository-queue";
import BrokerBootstrap from "../../bootstrap/broker.bootstrap";
import Repository from "../application/repository";

export default class OperationQueue implements RepositoryQueue {
  constructor(private operation: Repository) {}

  async sendMessage(message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const queueName = "ORDER_CREATE_EVENT";
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
    const queueName = "ORDER_DELIVERIED_EVENT";
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
    const exchangeName = "FAILED_ERROR_EXCHANGE";
    await channel.assertExchange(exchangeName, "topic", { durable: true });

    const routingKey = "*.order_cancelled.error";
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
    const exchangeName = "ORDER_CONFIRMED_EXCHANGE";
    await channel.assertExchange(exchangeName, "fanout", { durable: true });

    const assertQueue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(assertQueue.queue, exchangeName, "");

    channel.consume(assertQueue.queue, (message: any) => callback(message), {
      noAck: false,
    });
  }

  async consumerError(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "CANCELLED";

    await this.operation.update(messageAsJSON.transaction, status);
  }

  async consumerSuccess(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "APPROVED";

    await this.operation.update(messageAsJSON.transaction, status);
  }

  async consumerConfirmOrder(message: any) {
    console.log("consumerConfirmOrder", JSON.parse(message.content.toString()));
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = "APPROVED";

    await this.operation.update(messageAsJSON.transaction, status);
  }
}
