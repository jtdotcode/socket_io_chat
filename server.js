const express = require("express");
var path = require("path");
var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

// serving static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send(res.sendFile("index.html"));
});

user = {};

io.on("connection", (socket) => {
  socket.on("user name", (userName) => {
    user[socket.id] = userName;

    io.emit("user name", user);
    io.emit("chat message connection", `${user[socket.id]} has connected`);
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
  socket.on("pm chat message", (msg) => {
    const message = msg["message"];
    const users = msg["users"];
    console.log("message is", message);
    var joinKey = "room";

    users.forEach(function (element, index) {
      if (index === 0) {
        joinKey = element;
      }

      socket.join(joinKey);

      io.to(element).emit("pm chat message", message);
    });
  });

  socket.on("disconnect", (msg) => {
    console.log(`${user[socket.id]} has disconnected`, socket.id);
    io.emit("chat message connection", `${user[socket.id]} has disconnected`);
    delete user[socket.id];
    io.emit("user name", user);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
