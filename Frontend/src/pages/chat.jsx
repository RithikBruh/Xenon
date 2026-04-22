import { useLocation } from "react-router-dom";
import "../styles/chat.css";
import Sidebar from "../components/sidebar";
import ChatContainer from "../components/chatWindow";
import InputBox from "../components/inputBox";
import { useEffect } from "react";
import { useState } from "react";
import {connectSocket,sendMessage} from "../socket";

export default function Chat() {
  const location = useLocation();
  const { username, token } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [activeUsers,setActiveUsers] = useState([]);
  const [showTime , setShowTime] = useState(false);

  const handleMsgClick = (msgId) => {
    console.log("Message clicked:", msgId);
  };


  useEffect(() => {
    console.log(localStorage.getItem("LoggedIn"));
    if (localStorage.getItem("LoggedIn") != "true") {
      return <h1>Please Login</h1>;
    }
  });

  useEffect(() => {
    // Connect socket when chat loads
    // It recives updates from server
    connectSocket(setMessages, setActiveUsers);
  }, []);

  return (
    <div className="window">
      <div className="left-panel">
        <ChatContainer messages={messages} handleMsgClick={handleMsgClick} showTime={showTime} />
        <InputBox
          message={message}
          setMessage={setMessage}
          sendMessage={() => sendMessage(message, setMessage)}
          ToggleShowTime={()=>setShowTime((prev)=>!prev)}
        />
      </div>
      <div className="right-panel">
        <Sidebar activeUsers={activeUsers}/>{" "}
      </div>{" "}
    </div>
  );
}
