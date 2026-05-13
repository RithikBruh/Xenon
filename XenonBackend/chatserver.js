let activeUsers = [];

import { saveMessage, getMessages } from "./models/messageModel.js";
import { AdminCommandHandler } from "./controllers/chatController.js";

function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.username);

    activeUsers.push(socket.user.username);

    // Join a room specific to the user for private messages
    socket.join(socket.user.username);
    // Fetch messages from database and send privately to user
    getMessages().then((messages) => {
      io.to(socket.user.username).emit("welcome", {
        messages: messages,
      });
    });

    io.emit("active-users", activeUsers);

    socket.on("send-message", (payload) => {
      // console.log(payload);

      // Save message to database and then emit to all clients
      saveMessage(socket.user.username, payload.message)
        .then(({ id, timestamp }) => {
          payload.id = id;
          payload.timestamp = timestamp;
          io.emit("receive-message", {
            username: socket.user.username,
            payload,
          });
          console.log("Message saved and emitted:", payload);
        })
        .then(() => {
          //Check for admin commands
          AdminCommandHandler(payload.message, io);
        });
    });

    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((u) => u !== socket.user.username);

      io.emit("active-users", activeUsers);
      console.log("User disconnected");
    });
  });
}

export default chatSocket;
