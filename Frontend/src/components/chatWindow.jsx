export default function ChatContainer({ messages }) {
    return (<div className="chat-container">
        <h4 className = "chat-heading">------------------------------------------------------------ [Chat] -----------------------------------------------------------</h4>
        <div className="chat">
            {messages.map((msg, index) => (
                <div key={index} className="message">
                    <strong>{msg.sender}:</strong> {msg.content}
                </div>
            ))}
        </div>
    </div>)
}