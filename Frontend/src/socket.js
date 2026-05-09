import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: false
});

export function connectSocket(setMessages, setActiveUsers) {
  socket.connect();

    console.log("Connecting socket...");

    socket.on("welcome",(data)=>{
      console.log(data.messages);
      setMessages(data.messages);
      console.log("Socket connected, welcome message received.", data.messages);
    })
    
    socket.on("active-users",(data)=>{
      console.log("Active users:", data);
      setActiveUsers(data);
    })

    // Listen for incoming messages
    socket.on("receive-message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          sender : data.username,
          content: data.payload.message,
          id : data.payload.id,
          timestamp: data.payload.timestamp,
          pinned : data.payload.pinned
        },
      ]);
      console.log("Received message:", data.paylod.timestamp);
    });

    socket.on("refresh-messages", (data) => { 
      setMessages(data.messages);
      console.log("Messages refreshed:", data.messages);
    });
    // Handle auth errors
    socket.on("connect_error", (err) => {
      console.log("Socket error:", err.message);
    });

    // Cleanup
    return () => {
      socket.off("receive-message");
      socket.disconnect();
    };
}


export function sendMessage(message, setMessage) {
    if (!message.trim()) return;
    const payload = {
      message: message.trim(),
    };
    socket.emit("send-message", payload);

    setMessage("");
    // console.log(messages);
  };



