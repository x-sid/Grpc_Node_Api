const amqp = require("amqplib");

exports.sendMessage = async (QUEUE, message) => {
  console.log("======== SENDING Message =======");
  let isSend = false;
  try {
    // Step 1: Create Connection
    const connect = await amqp.connect(process.env.MQ_URL, "heartbeat=60");
    // Step 2: Create Channel
    const channel = await connect.createChannel();
    // Step 3: Assert Queue
    await channel.assertQueue(QUEUE, { durable: true });
    // Step 4: Send Messages to QUEUE
    isSend = channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)));
    setTimeout(function () {
      channel.close();
      connect.close();
    }, 500);
    return isSend;
  } catch (err) {
    return isSend;
  }
};
