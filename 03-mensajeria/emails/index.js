const amqp = require("amqplib");

(async () => {
  const consumer = (message) => {
    console.log(`Email send: ${message.content.toString()}`);
    setTimeout(() => {
      channel.ack(message);
    }, 5000);
  };

  const connection = await amqp.connect(
    `amqp://${process.env.HOST_RABBIT || "localhost"}`
  );
  const channel = await connection.createChannel();

  const exchangeName = "EXCHANGE_FANOUT";
  await channel.assertExchange(exchangeName, "fanout", { durable: true });
  channel.prefetch(1);

  const assertQueue = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(assertQueue.queue, exchangeName, "");

  console.log("Waiting form messages...");

  channel.consume(assertQueue.queue, consumer, { noAck: false });
})();
