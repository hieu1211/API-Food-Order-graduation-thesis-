const Order = require("./model/Order");

var orders = [];
var rooms = [];
var allPartner = [];
var clients = [];

const socket = function (server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.emit("currentOrder", orders);

    //users
    socket.on("startOrder", async (data) => {
      const newOrder = new Order(data);
      newOrder.save();
      orders.push(newOrder);
      socket.join(newOrder._id);
      const merchant = clients.find(
        (client) => client.customId === newOrder.merchant
      );
      if (merchant) merchant.socket.join(newOrder._id);
      io.in.emit("newOrder", newOrder);
    });

    //partners
    socket.on("acceptOrder", async (order_id) => {
      const client = clients.find((client) => client.clientId === socket.id);
      const order = await Order.findOneAndUpdate(
        { _id: order_id },
        {
          $set: {
            deliver: client.customId,
          },
        },
        {
          new: true,
        }
      );
      socket.join(order_id);
    });

    socket.on("storeClientInfo", function (data) {
      var clientInfo = new Object();
      clientInfo.customId = data.customId;
      clientInfo.clientId = socket.id;
      clientInfo.socket = socket;
      clients.push(clientInfo);
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
