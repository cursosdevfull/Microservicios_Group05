const amqp = require("amqplib");

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const nameQueue = "queue 01";
  await channel.assertQueue(nameQueue, { durable: false });

  channel.consume(
    nameQueue,
    (msg) => {
      console.log(msg.content.toString());
    },
    { noAck: true }
  );
})();
