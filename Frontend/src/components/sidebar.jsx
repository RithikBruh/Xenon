import FileManager from "./fileManager"
import ActiveUsers from "./activeUsers"
export default function Sidebar({activeUsers}) {
    return (
        <div className = "sidebar">
            <FileManager />
            <ActiveUsers activeUsers={activeUsers}/>
            </div>
    )
}