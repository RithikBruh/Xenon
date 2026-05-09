import { get } from "mongoose";
import { deleteMessage, deleteRange } from "../models/messageModel.js";
import { getMessages } from "../models/messageModel.js";

export function AdminCommandHandler(message,io) {
  if (message.startsWith("\\deleteRange ")) {
    console.log("del R Admin command detected: " + message);

    message = message.replace(/[\[\]]/g, ""); // Remove square brackets if present
    const parts = message.split(" ");

    const idStart = parseInt(parts[1]);
    const idEnd = parseInt(parts[2]);

    
    deleteRange(idStart, idEnd)
    .then((deletedCount) => {
        ids = [];for(let i=idStart;i<=idEnd;i++) ids.push(i);
        getMessages(ids).then(messages => io.emit("refresh-messages",messages)) 
  })
  }
  
  else if (message.startsWith("\\delete")) {
    console.log("del Admin command detected: " + message);
    // Handle delete command
    message = message.replace(/[\[\]]/g, ""); // Remove square brackets if present
    const parts = message.split(" ");

    const idsToDelete = parts
      .slice(1)
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    deleteMessage(idsToDelete)
      .then((deletedCount) => {
        getMessages(idsToDelete).then(messages => io.emit("refresh-messages",messages))
      })
    } 
  else if (message.startsWith("\\pin")) {
    console.log("Pin Admin command detected: " + message);
    message = message.replace(/[\[\]]/g, ""); // Remove square brackets if present
    const parts = message.split(" ");

    const idsToPin = parts
      .slice(1)
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    pinMessages(idsToPin)
      .then(() => {
        getPinnedMessages().then(messages => io.emit("pinned-messages", messages));
      })
}
}