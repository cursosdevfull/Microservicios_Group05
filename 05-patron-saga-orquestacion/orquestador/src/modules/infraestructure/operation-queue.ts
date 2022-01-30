import RepositoryQueue from "../application/repository-queue";
import BrokerBootstrap from "../../bootstrap/broker.bootstrap";
import {
  EXCHANGE_NAME,
  QUEUE_NAME,
  ROUTING_KEY_ERROR,
  TYPE_EXCHANGE,
  TYPE_MESSAGE,
} from "./enums";

export default class OperationQueue implements RepositoryQueue {
  constructor() {}

  async sendMessage(queueName: string, message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }

  async sendMessageError(routingKey: string, message: any): Promise<void> {
    const channel = BrokerBootstrap.getChannel();
    const messageAsString = JSON.stringify(message);

    const exchangeName = EXCHANGE_NAME.FAILED_ERROR_EXCHANGE;
    await channel.assertExchange(exchangeName, TYPE_EXCHANGE.TOPIC, {
      durable: true,
    });
    channel.publish(exchangeName, routingKey, Buffer.from(messageAsString));
  }

  async receiveMessage(): Promise<void> {
    const channel = BrokerBootstrap.getChannel();

    await this.receiveMessageOrchestator(
      channel,
      this.consumerOrchestator.bind(this)
    );
  }

  async receiveMessageOrchestator(
    channel: any,
    callback: (message: any) => void
  ) {
    const queueName = QUEUE_NAME.ORCHESTATOR_EVENT;

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (message: any) => {
        callback(message);
      },
      { noAck: false }
    );
  }

  getMessageToSent(messageAsJSON: any) {
    let newMessage;
    let queueName = "";
    let routingKey = "";

    switch (messageAsJSON.type) {
      case TYPE_MESSAGE.ORDER_CREATED:
        newMessage = {
          type: TYPE_MESSAGE.ORDER_CREATED,
          payload: messageAsJSON.payload,
        };
        queueName = QUEUE_NAME.ORDER_CREATE_EVENT;
        break;
      case TYPE_MESSAGE.ORDER_BILLED:
        newMessage = {
          type: TYPE_MESSAGE.ORDER_BILLED,
          payload: messageAsJSON.payload,
        };
        queueName = QUEUE_NAME.BILLED_ORDER_EVENT;
        break;
      case TYPE_MESSAGE.ORDER_PREPARED:
        newMessage = {
          type: TYPE_MESSAGE.ORDER_PREPARED,
          payload: messageAsJSON.payload,
        };
        queueName = QUEUE_NAME.ORDER_PREPARE_EVENT;
        break;
      case TYPE_MESSAGE.ORDER_DELIVERIED:
        newMessage = {
          type: TYPE_MESSAGE.ORDER_DELIVERIED,
          payload: messageAsJSON.payload,
        };
        queueName = QUEUE_NAME.ORDER_DELIVERIED_EVENT;
        break;
      case TYPE_MESSAGE.PAYMENT_ERROR:
        newMessage = {
          type: TYPE_MESSAGE.ERROR,
          payload: messageAsJSON.payload,
        };
        routingKey = ROUTING_KEY_ERROR.PAYMENT;
        break;
      case TYPE_MESSAGE.STORE_ERROR:
        newMessage = {
          type: TYPE_MESSAGE.ERROR,
          payload: messageAsJSON.payload,
        };
        routingKey = ROUTING_KEY_ERROR.STORE;
        break;
      case TYPE_MESSAGE.DELIVERY_ERROR:
        newMessage = {
          type: TYPE_MESSAGE.ERROR,
          payload: messageAsJSON.payload,
        };
        routingKey = ROUTING_KEY_ERROR.DELIVERY;
        break;
    }

    return { newMessage, queueName, routingKey };
  }

  async consumerOrchestator(message: any) {
    console.log("message", message.content.toString());
    const messageAsJSON = JSON.parse(message.content.toString()); // {type: ... , payload: ...}

    const { newMessage, queueName, routingKey } =
      this.getMessageToSent(messageAsJSON);

    if (queueName) {
      this.sendMessage(queueName, newMessage);
    } else {
      this.sendMessageError(routingKey, newMessage);
    }

    const channel = BrokerBootstrap.getChannel();
    channel.ack(message);
  }
}
