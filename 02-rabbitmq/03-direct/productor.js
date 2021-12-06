const amqp = require("amqplib");
const args = process.argv.slice(2);

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "exchange-direct";
  await channel.assertExchange(exchangeName, "direct", { durable: true });

  // node productor.js sendEmail pagoProcesado
  const routing = args.length > 0 ? args[0] : "error";
  const message = args.length > 1 ? args[1] : "message 03";

  channel.publish(exchangeName, routing, Buffer.from(message), {
    persistent: true,
  });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
})();
