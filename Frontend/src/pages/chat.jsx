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
  const [showMore , setshowMore] = useState(false);

  const handleMsgClick = (msgId) => {
    // const m = message
    setMessage(message + ` [${msgId}] `);
    console.log("Message clicked:", msgId);
  };

  const handleDelete = () => {
    setMessage("\\delete "+message);
  }

  const handleDeleteR = () => {
    setMessage("\\deleteRange "+message);
  }

  const handlePin = () => {
    setMessage("\\pin "+message);
  }

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
        <ChatContainer messages={messages} handleMsgClick={handleMsgClick} showMore={showMore} />
        <InputBox
          message={message}
          setMessage={setMessage}
          sendMessage={() => sendMessage(message, setMessage)}
          ToggleshowMore={()=>setshowMore((prev)=>!prev)}
          handleDelete={handleDelete}
          handleDeleteR={handleDeleteR}
          handlePin={handlePin}
        />
      </div>
      <div className="right-panel">
        <Sidebar activeUsers={activeUsers}/>{" "}
      </div>{" "}
    </div>
  );
}
