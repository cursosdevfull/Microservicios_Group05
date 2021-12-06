const amqp = require("amqplib");
const args = process.argv.slice(2);

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "exchange-topic";
  await channel.assertExchange(exchangeName, "topic", { durable: true });

  const assertQueue = await channel.assertQueue("", { exclusive: true });
  const routingKeys = args.length > 0 ? args : ["general.error"];

  routingKeys.forEach((routingKey) => {
    channel.bindQueue(assertQueue.queue, exchangeName, routingKey);
  });

  channel.consume(
    assertQueue.queue,
    (msg) => {
      console.log(`[x] ${msg.fields.routingKey}: ${msg.content.toString()}`);
    },
    { noAck: true }
  );
})();
