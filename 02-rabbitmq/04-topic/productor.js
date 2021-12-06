const amqp = require("amqplib");
const args = process.argv.slice(2);

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "exchange-topic";
  await channel.assertExchange(exchangeName, "topic", { durable: true });

  const routing = args.length > 0 ? args[0] : "anonymous.info";
  const message = args.length > 1 ? args[1] : "message 04";

  channel.publish(exchangeName, routing, Buffer.from(message));
  console.log(" [x] Sent %s: '%s'", routing, message);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
})();
