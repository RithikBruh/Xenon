import FileManager from "./fileManager"
import ActiveUsers from "./activeUsers"
import PinnedMsgs from "./pinnedMsgs"

export default function Sidebar({activeUsers}) {
    return (
        <div className = "sidebar">
            <FileManager />
            <ActiveUsers activeUsers={activeUsers}/>
            <PinnedMsgs />
            </div>
    )
}