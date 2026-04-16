import { useLocation } from "react-router-dom";
import "../styles/chat.css";
import Sidebar from "../components/sidebar";
import ChatContainer from "../components/chatWindow";
import InputBox from "../components/inputBox";
import { useEffect } from "react";
import { useState } from "react";
import socket from "../socket";

export default function Chat() {
  const location = useLocation();
  const { username, token } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [activeUsers,setActiveUsers] = useState([]);

  useEffect(() => {
    console.log(localStorage.getItem("LoggedIn"));
    if (localStorage.getItem("LoggedIn") != "true") {
      return <h1>Please Login</h1>;
    }
  });

  useEffect(() => {
    // Connect socket when chat loads
    socket.connect();

    console.log("Connecting socket...");

    socket.on("welcome",(data)=>{
      console.log(data.messages);
      setMessages(data.messages);
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
          timestamp: data.payload.timestamp,
          pinned : data.payload.pinned
        },
      ]);
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
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    const payload = {
      message: message.trim(),
    };
    socket.emit("send-message", payload);

    setMessage("");
    // console.log(messages);
  };

  return (
    <div className="window">
      <div className="left-panel">
        <ChatContainer messages={messages} />
        <InputBox
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      <div className="right-panel">
        <Sidebar activeUsers={activeUsers}/>{" "}
      </div>{" "}
    </div>
  );
}
