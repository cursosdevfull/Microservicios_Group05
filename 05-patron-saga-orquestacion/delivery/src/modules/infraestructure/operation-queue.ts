import RepositoryQueue from "../application/repository-queue";
import BrokerBootstrap from "../../bootstrap/broker.bootstrap";
import Repository from "../application/repository";
import { PaymentBuilder, PaymentEntity } from "../domain/payment.entity";
import { EXCHANGE_NAME, QUEUE_NAME, TYPE_MESSAGE, EXCHANGE_TYPE } from "./enum";

export default class OperationQueue implements RepositoryQueue {
  constructor(private operation: Repository) {}

  async sendOrderConfirm(message: any): Promise<void> {
    const exchangeName = EXCHANGE_NAME.ORDER_CONFIRMED_EXCHANGE;
    const channel = BrokerBootstrap.getChannel();
    await channel.assertExchange(exchangeName, EXCHANGE_TYPE.FANOUT, {
      durable: true,
    });
    channel.publish(exchangeName, "", Buffer.from(JSON.stringify(message)));
  }

  async sendMessageError(message: any): Promise<void> {
    console.log("message", JSON.stringify(message));
    const channel = BrokerBootstrap.getChannel();
    const messageAsString = JSON.stringify(message);

    const exchangeName = "FAILED_ERROR_EXCHANGE";
    await channel.assertExchange(exchangeName, "topic", { durable: true });
    channel.publish(
      exchangeName,
      "delivery.order_cancelled.error",
      Buffer.from(messageAsString)
    );
  }

  async sendMessage(message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const queueName = "ORDER_DELIVERIED_EVENT";
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }

  async receiveMessage(): Promise<void> {
    const channel = BrokerBootstrap.getChannel();

    await this.receiveMessageCreated(channel, this.consumerCreated.bind(this));
  }

  async receiveMessageCreated(
    channel: any,
    callback: (message: any, isError: boolean) => void
  ) {
    const queueName = QUEUE_NAME.ORDER_PREPARE_EVENT;

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (message: any) => {
        callback(message, false);
      },
      { noAck: false }
    );
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

    try {
      await this.operation.insert(orderEntity);

      orderEntity.status = "APPROVED";
      const response = await this.operation.update(
        orderEntity.transaction,
        orderEntity.status
      );

      await this.sendOrderConfirm({
        type: TYPE_MESSAGE.ORDER_DELIVERIED,
        payload: orderEntity,
      });
      // await this.sendMessageError(orderEntity);
    } catch (error) {
      await this.sendMessageError(orderEntity);
    }

    const channel = BrokerBootstrap.getChannel();
    channel.ack(message);
  }
}
