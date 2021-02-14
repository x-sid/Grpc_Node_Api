const amqp = require("amqplib");

exports.recieveMessage = async (QUEUE) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Create Connection
      const connect = await amqp.connect(process.env.MQ_URL, "heartbeat=60");
      const channel = await connect.createChannel();

      await connect.createChannel();
      // Step 3: Assert Queue
      await channel.assertQueue(QUEUE, { durable: true });
      // Step 4: Receive Messages
      await channel.consume(
        QUEUE,
        (msg) => {
          resolve({ err: null, msg: msg.content });
          channel.ack(msg);
          channel.cancel("myconsumer");
        },
        { consumerTag: "myconsumer" }
      );
      setTimeout(function () {
        channel.close();
        connect.close();
      }, 500);
    } catch (err) {
      reject({ err, msg: null });
    }
  });
};
