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

    await this.receiveMessageSuccess(channel, this.consumer);
    await this.receiveMessageError(channel, this.consumer);
  }

  async receiveMessageSuccess(
    channel: any,
    callback: (message: any, isError: boolean) => void
  ) {
    const queueName = "ORDER_DELIVERIED_EVENT";
    channel.consume(
      queueName,
      (message: any) => {
        callback(message, false);
      },
      { noAck: false }
    );
  }

  async receiveMessageError(
    channel: any,
    callback: (message: any, isError: boolean) => void
  ) {
    const exchangeName = "FAILED_ERROR_EXCHANGE";
    await channel.assertExchange(exchangeName, "topic", { durable: true });

    const routingKey = "*.order_cancelled.error";
    const assertQueue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

    channel.consume(assertQueue, (message: any) => callback(message, true), {
      noAck: false,
    });
  }

  async consumer(message: any, isError: boolean) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = isError ? "CANCELLED" : "APPROVED";

    await this.operation.update(messageAsJSON.transaction, status);
  }
}
