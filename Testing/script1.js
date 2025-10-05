// client.js
const WebSocket = require('ws');  // WebSocket client library for Node.js
const readline = require('readline'); // For reading input from terminal

// Server address: change to your server or Tailscale IP
const SERVER = "ws://127.0.0.1:8000/ws"; 
 SERVER = "ws://100.100.154.45:8000/ws"; // Tailscale server

let token = null; // Will store token received after login
const input = document.getElementById("input-box");

// Function to get current timestamp in YYYY-MM-DD HH:MM:SS format
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
}

// Setup readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisified version of readline.question for async/await
function questionAsync(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Main async function
async function main() {
    // Ask user for username and password
    const username = await questionAsync("Username: ");
    const password = await questionAsync("Password: ");

    // Connect to the WebSocket server
    const ws = new WebSocket(SERVER);

    // When connection is open, send login packet
    ws.on('open', () => {
        const loginPayload = {
            type: "login",
            username: username,
            password: password
        };
        ws.send(JSON.stringify(loginPayload)); // Send login JSON to server
    });

    // Handle incoming messages from server
    ws.on('message', async (msg) => {
        let data;
        try {
            data = JSON.parse(msg); // Try to parse JSON
        } catch {
            console.log("raw:", msg.toString()); // If not JSON, just print raw
            return;
        }

        const t = data.type; // Message type

        if (t === "login_failed") {
            console.log("❌ Login failed:", data.message);
            process.exit(); // Stop program if login failed
        } else if (t === "login_success") {
            console.log("✅ Login successful!");
            token = data.token; // Save token for sending messages
            senderLoop(ws, username); // Start sending messages
        } else if (t === "history") {
            console.log("--- Chat history ---");
            (data.messages || []).forEach(m => {
                console.log(`[${m.timestamp}] ${m.sender}: ${m.message}`);
            });
            console.log("--------------------");
        } else if (t === "message") {
            // Normal chat message
            console.log(`\n${data.sender}: ${data.message}`);
        } else {
            console.log("unknown envelope:", data);
        }
    });

    // Handle server close
    ws.on('close', () => {
        console.log("Disconnected from server");
        process.exit();
    });

    // Handle errors
    ws.on('error', (err) => {
        console.error("WebSocket error:", err);
    });
}

// Async loop to continuously read user input and send messages
async function senderLoop(ws, username) {
    for await (const line of rl) {
        if (!line.trim()) continue; // Ignore empty lines
        const payload = {
            sender: username,
            recipient: null, // TODO: implement custom recipient later
            message: line,
            token: token,
            timestamp: getTimestamp()
        };
        ws.send(JSON.stringify(payload)); // Send chat message to server
    }
}


// Also send message when pressing Enter
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
// Run the main function
main();
