require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const getDockerHost = require("get-docker-host");
const isInDocker = require("is-in-docker");
let PROTO_PATH = __dirname + "/pb/messages.proto";
let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");
let packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

let OrderProto = grpc.loadPackageDefinition(packageDefinition).order;

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

const checkDocker = () => {
  return new Promise((resolve, reject) => {
    if (isInDocker()) {
      getDockerHost((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });
    } else {
      resolve("127.0.0.1");
    }
  });
};

var client = new OrderProto.OrderService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);

checkDocker().then((addr) => {
  client = new OrderProto.OrderService(
    `${addr}:50051`,
    grpc.credentials.createInsecure()
  );
});

app.post("/order", async (req, res) => {
  const payload = {
    customerId: req.body.customerId,
    productId: req.body.productId,
  };

  client.orderProduct({ orderRequest: payload }, function (err, response) {
      if (err) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order is being processed",
      data: response.orderResponse,
    });
  });
});

app.get("/order/:id", async (req, res) => {
  const { id } = req.params;

  client.findOrderById({ id: id }, function (err, response) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err,
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "SUCCESS",
      data: response.orderResponse,
    });
  });
});

app.get("/order", async (req, res) => {
  client.findAllOrder({ id: "" }, function (err, response) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err,
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "SUCCESS",
      data: response.orderResponse,
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
