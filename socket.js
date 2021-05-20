const Order = require("./model/Order");
const User = require("./model/User");

var orders = [];
var rooms = [];
var allPartner = [];
var clients = [];

const getAllOrderProcessing = async () => {
  orders = await Order.find({ status: { $nin: ["complete", "cancel"] } });
};
getAllOrderProcessing();

const socket = function (server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
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
      const ods = orders.filter((order) => {
        const deliver = order.deliverId;
        if (deliver) {
          return (
            order.merchantId._id == id ||
            order.deliverId == id ||
            order.userOrderId._id == id
          );
        }
        return order.merchantId._id == id || order.userOrderId._id == id;
      });
      for (od in ods) {
        socket.join(od);
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
      if (order.merchantId === client.customId) {
        order.status = "finding";
      }
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
      console.log("finding partner");
      socket.broadcast.emit("newOrderFinding", order);
    });

    socket.on("approveOrder", async (order_id) => {
      const client = clients.find((client) => client.clientId == socket.id);
      const order = orders.find((order) => {
        return String(order._id) === order_id;
      });
      if (order.merchantId === client.customId) {
        order.status = "picking";
      }
      console.log(order);
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
    });

    socket.on("prepareDone", async (order_id) => {
      const client = clients.find((client) => client.clientId == socket.id);
      const order = orders.find((order) => {
        return String(order._id) === order_id;
      });
      if (order.merchantId === client.customId) {
        order.status = "waitPick";
      }
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
    });

    //users
    socket.on("startOrder", async (data) => {
      let orderData = { ...data };
      delete orderData.userInfo;
      let newOrder = new Order(orderData);
      newOrder = await newOrder.save();
      const orderSaved = await Order.findOne({
        _id: String(newOrder._doc._id),
      }).populate("userOrderId");
      orders.push(orderSaved);
      socket.join(orderSaved._id);
      const merchant = clients.find((client) => {
        return client.customId === String(orderSaved.merchantId);
      });
      if (merchant) merchant.socket.join(orderSaved._id);
      io.in(orderSaved._id).emit("newOrder", orderSaved);
    });

    //partners
    socket.on("chooseOrder", async (order_id) => {
      const client = clients.find((client) => client.clientId === socket.id);
      const order = orders.find((order) => {
        return String(order._id) === order_id;
      });
      if (client.type == "partner" && order.status == "finding") {
        order.status = "waitConfirm";
      }
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
      socket.join(order_id);
      io.in(order_id).emit("findDonePartner", {
        orderId: order_id,
        partner: orderUpdated.deliverId,
      });
    });
    // partner end

    socket.on("storeClientInfo", ({ id, type }) => {
      var clientInfo = new Object();
      clientInfo.customId = id;
      clientInfo.type = type;
      clientInfo.clientId = socket.id;
      clientInfo.socket = socket;
      clients.push(clientInfo);
      let ods = [];
      ods = orders.filter(
        (order) =>
          order.merchantId._id == id ||
          (order.deliverId && order.deliverId._id == id) ||
          order.userOrderId._id == id
      );

      for (od in ods) {
        socket.join(od);
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
  });
};
module.exports = socket;
