const amqp = require("amqplib");
const args = process.argv.slice(2);

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "exchange-direct";
  await channel.assertExchange(exchangeName, "direct", { durable: true });
  channel.prefetch(1);

  const assertQueue = await channel.assertQueue("", { exclusive: true });
  // node consumidor.js "routing-key"
  const routing = args.length > 0 ? args[0] : "error";
  await channel.bindQueue(assertQueue.queue, exchangeName, routing);

  channel.consume(
    assertQueue.queue,
    (msg) => {
      console.log(`[x] ${msg.content.toString()}`);
      setTimeout(() => {
        console.log("confirmación de procesamiento");
        channel.ack(msg);
      }, 20000);
    },
    { noAck: false }
  );
})();
