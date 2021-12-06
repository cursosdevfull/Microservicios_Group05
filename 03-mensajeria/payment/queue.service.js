const amqp = require("amqplib");

const sentMessage = async (message) => {
  const connection = await amqp.connect(process.env.AMQP_URL);
  const channel = await connection.createChannel();
  const exchangeName = "payment-exchange";
  await channel.assertExchange(exchangeName, "fanout", { durable: true });

  channel.publish(exchangeName, "", Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

module.exports = sentMessage;
