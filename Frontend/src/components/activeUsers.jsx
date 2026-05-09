export default function ActiveUsers({activeUsers}) {
    return (<div className="active-users">
        <h4 className = "active-users-heading" >---------- [Active Users] ---------- </h4>
        <div className="users">
            {activeUsers.length > 0 ? (
                <ul>
                    {activeUsers.map((user, index) => (
                        <li key={index}>{user}</li>
                    ))}
                </ul>
            ) : (
                <p>No active users.</p>
            )}
        </div>
    </div>)
}