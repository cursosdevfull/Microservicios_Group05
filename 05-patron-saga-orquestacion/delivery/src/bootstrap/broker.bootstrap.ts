import amqp from "amqplib";
import IBootstrap from "./bootstrap.interface";

let channel: any;

export default class BrokerBootstrap implements IBootstrap {
  async initialize(): Promise<any> {
    const host = process.env.RABBIT_HOST || "localhost:5672";

    const connection = await amqp.connect(`amqp://${host}`);
    channel = await connection.createChannel();

    console.log("Connected to RabbitMQ");
  }

  static getChannel() {
    return channel;
  }
}
