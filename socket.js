const Order = require("./model/Order");
const Partner = require("./model/Partner");
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
        var clientInfo = new Object();
        clientInfo.customId = id;
        clientInfo.type = type;
        clientInfo.clientId = socket.id;
        clientInfo.socket = socket;
        clients.push(clientInfo);
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
        for (od of ods) {
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
          socket.broadcast.emit("newOrderFinding", order);
          io.in(order_id).emit("changeStatus", {
            order: order,
            orderId: order_id,
            status: "finding",
          });
        }
      });

      socket.on("approveOrder", async ({ order_id, timePartnerGetFood }) => {
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
                timePartnerGetFood: timePartnerGetFood,
              },
            },
            {
              new: true,
            }
          );
          io.in(order_id).emit("changeStatus", {
            order: order,
            orderId: order_id,
            status: "picking",
          });
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
          io.in(order_id).emit("changeStatus", {
            order: order,
            orderId: order_id,
            status: "waitPick",
          });
        }
      });

      socket.on("merchantCancelOrder", async (data) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const idx = orders.findIndex((order) => {
          return String(order._id) === data.order_id;
        });
        if (idx > -1) {
          orders.splice(idx, 1);
        }
        console.log(data.reasons);
        await Order.findOneAndUpdate(
          { _id: data.order_id },
          {
            $set: {
              status: "cancel",
              timeDeliverDone: 0,
              reasonCancel: data.reasons,
            },
          },
          {
            new: true,
          }
        );
        io.in(String(data.order_id)).emit("merchantCancelOrder", order_id);
      });

      //users

      socket.on("haveOrderProcessing", (id) => {
        const orderProcessing = orders.find((ord) => ord.userOrderId._id == id);
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
        let order_id = String(orderSaved._id);
        socket.join(order_id);
        const merchant = clients.find((client) => {
          return client.customId === String(orderSaved.merchantId._id);
        });
        if (merchant) merchant.socket.join(order_id);
        io.in(order_id).emit("newOrder", orderSaved);

        setTimeout(async () => {
          console.log("startRemove", order_id);
          const order = orders.find((order) => {
            return String(order._id) === order_id;
          });
          const idx = orders.findIndex((order) => {
            return String(order._id) === order_id;
          });
          if (idx > -1) {
            if (order.status !== "complete" || order.status !== "cancel") {
              await Order.findOneAndUpdate(
                { _id: order_id },
                {
                  $set: {
                    status: "cancel",
                    timeDeliverDone: 0,
                  },
                },
                {
                  new: true,
                }
              );
            }
            orders.splice(idx, 1);
          }
          // io.sockets.adapter.rooms[order_id].forEach(function (s) {
          //   s.leave(order_id);
          // });
        }, 8000000);
      });

      socket.on("userCancelOrder", async (order_id) => {
        console.log("call");
        const client = clients.find((client) => client.clientId == socket.id);
        const idx = orders.findIndex((order) => {
          return String(order._id) === order_id;
        });
        if (idx > -1) {
          orders.splice(idx, 1);
        }
        await Order.findOneAndUpdate(
          { _id: order_id },
          {
            $set: {
              status: "cancel",
              timeDeliverDone: 0,
            },
          },
          {
            new: true,
          }
        );
        io.in(String(order_id)).emit("userCancelOrder", order_id);
      });

      //partners
      socket.on("chooseOrder", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        if (client.type == "partner") {
          if (order.status == "finding") order.status = "waitConfirm";
          const orderUpdated = await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                deliverId: client.customId,
                status: order.status,
                timePartnerReceive: Date.now(),
                chat: [
                  {
                    type: 0,
                    content:
                      "Mình đã nhận đơn và sẽ giao cho bạn sớm nhất có thể, hãy an tâm ở nhà và đợi mình nhé!",
                  },
                ],
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
          order.chat = orderUpdated.chat;
          socket.join(String(orderUpdated._id));
          io.in(String(orderUpdated._id)).emit("findDonePartner", {
            orderId: order_id,
            partner: orderUpdated.deliverId,
          });
        }
      });

      socket.on("DeliveringOrder", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        if (client.type == "partner") {
          order.status = "delivering";
          await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                status: order.status,
              },
            },
            {
              new: true,
            }
          );
          io.in(order_id).emit("DeliveringOrder", order_id);
        }
      });

      socket.on("cancelOrder", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        if (
          client.customId == order.deliverId._id &&
          (order.status === "waitConfirm" ||
            order.status === "waitPick" ||
            order.status === "picking")
        ) {
          order.deliverId = null;
          await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                deliverId: null,
              },
            },
            {
              new: true,
            }
          );
          await Partner.findOneAndUpdate(
            { _id: client.customId },
            {
              $push: {
                cancelOrder: { _id: order_id },
              },
            },
            {
              new: true,
            }
          );
          socket.leave(order_id);
          io.in(order_id).emit("partnerCancelOrder", order_id);
        }
      });

      socket.on("completeOrder", async (order_id) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const order = orders.find((order) => {
          return String(order._id) === order_id;
        });
        order.status = "complete";
        io.in(order_id).emit("changeStatus", {
          order: order,
          orderId: order_id,
          status: "complete",
        });
        const idx = orders.findIndex((order) => {
          return String(order._id) === order_id;
        });
        if (idx > -1) {
          orders.splice(idx, 1);
        }
        if (client.type == "partner") {
          await Order.findOneAndUpdate(
            { _id: order_id },
            {
              $set: {
                status: "complete",
                timeDeliverDone: Date.now(),
              },
            },
            {
              new: true,
            }
          );
        }
      });

      socket.on("orderDelivering", (partner_id) => {
        const orderDelivering = orders.find((order) => {
          if (order.deliverId && !["complete", "cancel"].includes(order.status))
            return String(order.deliverId._id) === String(partner_id);
          return false;
        });
        socket.emit("orderDelivering", orderDelivering);
      });

      socket.on("sendGeo", (geo) => {
        const client = clients.find((client) => client.clientId == socket.id);
        const orderDelivering = orders.find((order) => {
          if (order.deliverId && !["complete", "cancel"].includes(order.status))
            return String(order.deliverId._id) === String(client.customId);
          return false;
        });
        if (orderDelivering)
          io.in(String(orderDelivering._id)).emit("sendGeo", geo);
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

        for (od of ods) {
          socket.join(String(od._id));
          console.log(od);
        }
      });

      //all: Chat
      socket.on("chatAction", async (data) => {
        const order = orders.find((order) => {
          return String(order._id) === data.order_id;
        });
        console.log(data);
        const newMessage = { type: data.type, content: data.message };
        order.chat.push(newMessage);
        await Order.findOneAndUpdate(
          { _id: data.order_id },
          {
            $set: {
              chat: order.chat,
            },
          },
          {
            new: true,
          }
        );
        io.in(String(data.order_id)).emit("chatAction", newMessage);
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
