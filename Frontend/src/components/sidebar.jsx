import FileManager from "./fileManager"
import ActiveUsers from "./activeUsers"
import PinnedMsgs from "./pinnedMsgs"

export default function Sidebar({activeUsers,messages}) {
    return (
        <div className = "sidebar">
            <FileManager />
            <ActiveUsers activeUsers={activeUsers}/>
            <PinnedMsgs messages={messages} />
            </div>
    )
}