const Order = require("./model/Order");
const User = require("./model/User");

var orders = [];
var rooms = [];
var allPartner = [];
var clients = [];

const getCurrentOrdersByMerchant = (merchantId) => {
  return orders.filter((item) => String(item.merchantId) === merchantId);
};

const socket = function (server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    const data = socket.handshake.query.data;
    console.log(data);

    if (data) socket.emit("ordersMerchant", getCurrentOrdersByMerchant(data));

    console.log("user connected", socket.id);

    socket.emit("currentOrder", orders);

    //merchant

    //users
    socket.on("startOrder", async (data) => {
      let orderData = { ...data };
      delete orderData.userInfo;
      const newOrder = new Order(orderData);
      newOrder.save();
      dataSend = { ...newOrder._doc, userInfo: data.userInfo };
      orders.push(dataSend);
      socket.join(newOrder._id);
      console.log(orders, clients);
      const merchant = clients.find((client) => {
        return client.customId === String(newOrder.merchantId);
      });
      if (merchant) merchant.socket.join(newOrder._id);
      io.in(newOrder._id).emit("newOrder", dataSend);
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
      console.log("storeClientInfo");
      var clientInfo = new Object();
      clientInfo.customId = data;
      clientInfo.clientId = socket.id;
      clientInfo.socket = socket;
      clients.push(clientInfo);
      socket.emit("ordersMerchant", getCurrentOrdersByMerchant(data));
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
