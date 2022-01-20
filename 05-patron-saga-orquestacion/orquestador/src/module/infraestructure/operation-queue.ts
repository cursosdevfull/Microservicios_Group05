import RepositoryQueue from "../application/repository-queue";
import BrokerBootstrap from "../../bootstrap/broker.bootstrap";

export default class OperationQueue implements RepositoryQueue {
  constructor() {}

  async sendMessage(message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const queueName = "ORDER_PREPARE_EVENT";
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
      "store.order_cancelled.error",
      Buffer.from(messageAsString)
    );
  }

  async receiveMessage(): Promise<void> {
    const channel = BrokerBootstrap.getChannel();

    await this.receiveMessageOrchestator(
      channel,
      this.consumerOrchestator.bind(this)
    );
    /*  await this.receiveMessageError(channel, this.consumerError.bind(this));
    await this.receiveMessageConfirmOrder(
      channel,
      this.consumerConfirmOrder.bind(this)
    ); */
  }

  async receiveMessageOrchestator(
    channel: any,
    callback: (message: any, isError: boolean) => void
  ) {
    const queueName = "ORCHESTATOR_QUEUE";

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (message: any) => {
        callback(message, false);
      },
      { noAck: false }
    );
  }

  async consumerOrchestator(message: any) {
    const messageAsJSON = JSON.parse(message.content.toString()); // {type: ... , payload: ...}
    let newMessage;

    switch (messageAsJSON.type) {
      case "ORDER_CREATED":
        newMessage = {
          type: "ORDER_CREATED",
          payload: messageAsJSON.payload,
        };
        break;
      case "ORDER_BILLED":
        newMessage = {
          type: "ORDER_BILLED",
          payload: messageAsJSON.payload,
        };
        break;
      case "ORDER_PREPARED":
        newMessage = {
          type: "ORDER_PREPARED",
          payload: messageAsJSON.payload,
        };
        break;
      case "ORDER_DELIVERIED":
        newMessage = {
          type: "ORDER_DELIVERIED",
          payload: messageAsJSON.payload,
        };
        break;
      case "PAYMENT_ERROR":
        newMessage = {
          type: "ERROR",
          payload: messageAsJSON.payload,
        };
        break;
      case "STORE_ERROR":
        newMessage = {
          type: "ERROR",
          payload: messageAsJSON.payload,
        };
        break;
      case "DELIVERY_ERROR":
        newMessage = {
          type: "ERROR",
          payload: messageAsJSON.payload,
        };
        break;
    }

    const channel = BrokerBootstrap.getChannel();
    channel.ack(message);
  }
}
