import loginRouter from "./routes/loginRoute.js";
import fileRouter from "./routes/fileRoute.js";

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import socketAuth from "./middleware/socketMiddleware.js";
import chatSocket from "./chatserver.js";

console.log("Connecting to DB...")
// import pool from "./config/db.js";

const app = express();
const port = 3000;



app.use(cors({
  origin : true, // TODO : update in production
  credentials : true,
})); 

app.get("/", (req, res) => {
  res.send("Welcome to our api");
});

app.use("/login", loginRouter);
//  TODO: protectect routes
app.use("/files", fileRouter);

// --------------- Websocket setup
// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// Apply middleware 
io.use(socketAuth);

// Load socket handlers
chatSocket(io);




// Listen for connections (Http and websocket)
server.listen(port, () => {
  console.log("Server running on port 3000");
});


//TODO : use cookies for remebering user settings ig
