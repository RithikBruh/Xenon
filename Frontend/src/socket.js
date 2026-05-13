import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: false,
});

export function connectSocket(setMessages, setActiveUsers) {
  socket.connect();

  console.log("Connecting socket...");

  const onWelcome = (data) => {
    setMessages(data.messages);
    console.log("Socket connected.", data.messages);
  };

  const onActiveUsers = (data) => {
    setActiveUsers(data);
  };

  const onReceiveMessage = (data) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: data.username,
        content: data.payload.message,
        id: data.payload.id,
        timestamp: data.payload.timestamp,
        pinned: data.payload.pinned,
      },
    ]);
  };

  const onRefreshMessages = (data) => {
    setMessages(data.messages);
  };

  const onRefreshPinned = (data) => {
    const ids = data.ids;

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        ids.includes(msg.id)
          ? { ...msg, pinned: true }
          : msg
      )
    );
  };

  socket.on("welcome", onWelcome);
  socket.on("active-users", onActiveUsers);
  socket.on("receive-message", onReceiveMessage);
  socket.on("refresh-messages", onRefreshMessages);
  socket.on("refresh-pinned", onRefreshPinned);

  return () => {
    console.log("Cleaning socket listeners...");

    socket.off("welcome", onWelcome);
    socket.off("active-users", onActiveUsers);
    socket.off("receive-message", onReceiveMessage);
    socket.off("refresh-messages", onRefreshMessages);
    socket.off("refresh-pinned", onRefreshPinned);

    socket.disconnect();
  };
}


export function sendMessage(message, setMessage) {
  console.log("Sending message:", message);
  if (!message.trim()) return;
  const payload = {
    message: message.trim(),
  };
  socket.emit("send-message", payload);

  setMessage("");
  // console.log(messages);
}
