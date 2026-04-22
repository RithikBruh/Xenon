export default function ChatContainer({ messages,handleMsgClick ,showTime}) {
  return (
    <div className="chat-container">
      <h4 className="chat-heading">
        ------------------------------------------------------------ [Chat]
        -----------------------------------------------------------
      </h4>
      <div className="chat">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <a className="message" onClick={()=>{handleMsgClick(msg.id)}} href="#">
              <strong>{msg.sender}:</strong> {showTime && <span className="time">[{msg.timestamp}]</span>} {msg.content}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
