import { useRef ,useEffect} from "react";
export default function ChatContainer({ messages,handleMsgClick ,showMore}) {
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  });

  return (
    <div className="chat-container" >
      <h4 className="chat-heading">
        ------------------------------------------------------------ [Chat]
        -----------------------------------------------------------
      </h4>
      <div className="chat" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <a className="message" onClick={()=>{handleMsgClick(msg.id)}} href="#">
              {showMore && <span>{"<"+msg.id+"> "}</span>}<strong>{msg.sender}:</strong> {showMore && <span className="time">[{msg.timestamp}]</span>} {msg.content}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
