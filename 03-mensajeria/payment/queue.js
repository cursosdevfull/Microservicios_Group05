const amqp = require("amqplib");

const sendMessage = async (message) => {
  const connection = await amqp.connect(
    `amqp://${process.env.HOST_RABBIT || "localhost"}`
  );
  const channel = await connection.createChannel();

  const exchangeName = "EXCHANGE_FANOUT";
  await channel.assertExchange(exchangeName, "fanout", { durable: true });

  channel.publish(exchangeName, "", Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

module.exports = sendMessage;
