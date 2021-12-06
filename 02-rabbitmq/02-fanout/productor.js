const amqp = require("amqplib");
const args = process.argv.slice(2);

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const nameExchange = "pubsub";
  await channel.assertExchange(nameExchange, "fanout", { durable: true });

  const message = args.length > 0 ? args[0] : "message fanout";
  channel.publish(nameExchange, "", Buffer.from(message));
  console.log(" [x] Sent %s", message);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
})();
