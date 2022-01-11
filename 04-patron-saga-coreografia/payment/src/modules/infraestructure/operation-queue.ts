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

  async receiveMessage(): Promise<void> {
    const channel = BrokerBootstrap.getChannel();

    await this.receiveMessageCreated(channel, this.consumerCreated.bind(this));
    await this.receiveMessageError(channel, this.consumer);
  }

  async receiveMessageCreated(
    channel: any,
    callback: (message: any, isError: boolean) => void
  ) {
    const queueName = "ORDER_CREATE_EVENT";
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

    const routingKeys = [
      "store.order_cancelled.error",
      "delivery.order_cancelled.error",
    ];
    const assertQueue = await channel.assertQueue("", { exclusive: true });

    for (const routingKey of routingKeys) {
      channel.bindQueue(assertQueue.queue, exchangeName, routingKey);
    }

    channel.consume(
      assertQueue.queue,
      (message: any) => callback(message, true),
      {
        noAck: false,
      }
    );
  }

  async consumer(message: any, isError: boolean) {
    const messageAsJSON = JSON.parse(message.content.toString());
    const status = isError ? "CANCELLED" : "APPROVED";

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

    await this.operation.insert(orderEntity);
    // const channel = BrokerBootstrap.getChannel();
    // channel.ack(message);
  }
}
