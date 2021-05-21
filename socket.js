const Order = require("./model/Order");
const User = require("./model/User");

var orders = [];
var rooms = [];
var allPartner = [];
var clients = [];

const getAllOrderProcessing = async () => {
  orders = await Order.find({ status: { $nin: ["complete", "cancel"] } })
    .populate("userOrderId")
    .populate("merchantId")
    .populate("deliverId");
};

const socket = function (server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  getAllOrderProcessing().then(() =>
    io.on("connection", (socket) => {
      const id = socket.handshake.query.id;
      const type = socket.handshake.query.type;

      if (id != "undefined") {
        console.log("storeClientInfo");
        var clientInfo = new Object();
        clientInfo.customId = id;
        clientInfo.type = type;
        clientInfo.clientId = socket.id;
        clientInfo.socket = socket;
        clients.push(clientInfo);
        console.log(orders);
        const ods = orders.filter((order) => {
          const deliver = order.deliverId;
          if (deliver) {
            return (
              order.merchantId._id == id ||
              order.deliverId._id == id ||
              order.userOrderId._id == id
            );
          }
          return order.merchantId._id == id || order.userOrderId._id == id;
        });
        console.log(ods);
        for (od of ods) {
          console.log(clientInfo.type, od._id);
          socket.join(String(od._id));
        }
      }

      console.log("user connected", socket.id);

      socket.emit("currentOrder", orders);

      //merchant
      socket.on("acceptOrder", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        if (order.merchantId._id == client.customId) {
          order.status = "finding";
          await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                status: "finding",
              },
            },
            {
              new: true,
            }
          );
          console.log("newOrderFinding");
          socket.broadcast.emit("newOrderFinding", order);
        }
      });

      socket.on("approveOrder", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        if (order.merchantId._id == client.customId) {
          order.status = "picking";
          await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                status: "picking",
              },
            },
            {
              new: true,
            }
          );
          io.in(order_id).emit("approveOrder", order_id);
        }
      });

      socket.on("prepareDone", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        if (order.merchantId._id == client.customId) {
          order.status = "waitPick";
          await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                status: "waitPick",
              },
            },
            {
              new: true,
            }
          );
          io.in(order_id).emit("prepareDone", order_id);
        }
      });

      //users

      socket.on("haveOrderProcessing", (id) => {
        const orderProcessing = orders.find((ord) => ord.userOrderId._id == id);
        console.log(orders, id);
        socket.emit("canOrder", orderProcessing);
      });

      socket.on("startOrder", async (data) => {
        let orderData = { ...data };
        delete orderData.userInfo;
        let newOrder = new Order(orderData);
        newOrder = await newOrder.save();
        const orderSaved = await Order.findOne({
          _id: String(newOrder._doc._id),
        })
          .populate("userOrderId")
          .populate("merchantId");
        orders.push(orderSaved);
        socket.join(String(orderSaved._id));
        const merchant = clients.find((client) => {
          return client.customId === String(orderSaved.merchantId._id);
        });
        if (merchant) merchant.socket.join(String(orderSaved._id));
        io.in(String(orderSaved._id)).emit("newOrder", orderSaved);
      });

      //partners
      socket.on("chooseOrder", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        console.log(order.status);
        if (client.type == "partner" && order.status == "finding") {
          order.status = "waitConfirm";
          const orderUpdated = await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                deliverId: client.customId,
                status: order.status,
              },
            },
            {
              new: true,
            }
          )
            .populate("userOrderId")
            .populate("merchantId")
            .populate("deliverId");
          order.deliverId = orderUpdated.deliverId;
          socket.join(String(orderUpdated._id));
          io.in(String(orderUpdated._id)).emit("findDonePartner", {
            orderId: order_id,
            partner: orderUpdated.deliverId,
          });
        }
      });

      socket.on("storeClientInfo", ({ id, type }) => {
        var clientInfo = new Object();
        clientInfo.customId = id;
        clientInfo.type = type;
        clientInfo.clientId = socket.id;
        clientInfo.socket = socket;
        clients.push(clientInfo);
        const ods = orders.filter(
          (order) =>
            order.merchantId._id == id ||
            (order.deliverId && order.deliverId._id == id) ||
            order.userOrderId._id == id
        );
        for (od in ods) {
          socket.join(String(od._id));
        }
      });

      socket.on("disconnect", function (data) {
        for (var i = 0, len = clients.length; i < len; ++i) {
          var c = clients[i];

          if (c.clientId == socket.id) {
            clients.splice(i, 1);
            break;
          }
        }
      });
    })
  );
};
module.exports = socket;
