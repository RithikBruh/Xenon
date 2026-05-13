export default function PinnedMsgs({ messages }) {
    const pinnedMessages = messages.filter((msg) => msg.pinned);
    return (
        <div className="pinned-msgs">
            <h4 className="pinned-heading">
             -------------- [Pinned] --------------
            </h4>
            <div className="pinned-container">
                {pinnedMessages.length > 0 ? (
                    pinnedMessages.map((msg) => (
                        <p key={msg.id} className="pinned-message">
                            {msg.content}
                        </p>
                    ))
                ) : (
                    <p className="pinned-message">No pinned messages</p>
                )}
            </div>
        </div>
    )
}