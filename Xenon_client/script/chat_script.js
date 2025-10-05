
  const password = sessionStorage.getItem("password");
  const username = sessionStorage.getItem("username");
  console.log("User:", username);
  console.log("Password:", password);
  // const SERVER = "ws://127.0.0.1:8000/ws";
  const SERVER = "ws://100.115.241.16:8000/ws"; 
  // User info (for simplicity, hardcoding here; could ask via prompt)

  let token = null;

  // Connect to WebSocket server
  const ws = new WebSocket(SERVER);

  ws.onopen = () => {
      console.log("Connected to server");

      // Send login packet
      const loginPayload = {
          type: "login",
          username: username,
          password: password
      };
      ws.send(JSON.stringify(loginPayload));
  };

  ws.onmessage = (event) => {
      let data;
      try {
          data = JSON.parse(event.data);
      } catch {
          console.log("raw:", event.data);
          return;
      }

      if (data.type === "login_failed") {
          alert("Login failed: " + data.message);
        window.location.href = "client.html";

      } else if (data.type === "login_success") {
          token = data.token;
          appendLine("✅ Login successful!");
      } else if (data.type === "history") {
          appendLine("--- Chat History ---");
          (data.messages || []).forEach(m => appendLine(`[${m.timestamp}] ${m.sender}: ${m.message} [${m.status}]`));
          appendLine("-------------------");
      } else if (data.type === "message") {
          appendLine(`${data.sender}: ${data.message} [${data.status}]`);
      } else {
          console.log("Unknown data:", data);
      }
  };

  ws.onclose = () => {
      console.log("Disconnected from server");
  };

  ws.onerror = (err) => {
      console.error("WebSocket error:", err);
  };




const output = document.getElementById('output');
const inputBox = document.getElementById('input-box');

appendLine('---------------------------------------------------- [Xenon] ----------------------------------------------------                                             \n\n');

inputBox.addEventListener('input', resizeInput);

inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(inputBox.value);
    inputBox.value = '';
    resizeInput();
  }
});







 


function resizeInput() {
    inputBox.style.height = 'auto';
    inputBox.style.height = inputBox.scrollHeight + 'px';
  }
function toggleFolder(id) {
  const el = document.getElementById(id);
  el.classList.toggle('hidden');
}

const logs = document.getElementById('logs');


function addLog(msg) {
  const div = document.createElement('div');
  div.textContent = msg;
  logs.appendChild(div);
  logs.scrollTop = logs.scrollHeight;
}

      // setInterval(() => {
      //   const now = new Date().toLocaleTimeString();
      //   const messages = [
      //     "Server running smoothly...",
      //     "Connection established with client.",
      //     "Request processed successfully.",
      //     "Heartbeat OK.",
      //     "No errors detected.",
      //     "Warning: High memory usage detected!",
      //     "New SSH login from 192.168.1.50"
      //   ];
      //   const msg = messages[Math.floor(Math.random() * messages.length)];
      //   addLog(`[${now}] ${msg}`);
      // }, 3000);


   function unlockFileManager() {
    const password = prompt("Enter password to unlock File Manager:");
    if (password === "admin") {
      document.getElementById('file-lock-icon').classList.add('hidden');
      document.getElementById('file-content').classList.remove('hidden');
    } else if (password !== null) {
      alert("Incorrect password!");
    }
  }



  function getTimestamp() {
      return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

function sendMessage(text) {
    if (!text || !token) return; // Don't send empty or before login

    const payload = {
        sender: username,
        recipient: null, // Can be customized
        message: text,
        status : "unread",
        token: token,
        timestamp: getTimestamp()
    };

    ws.send(JSON.stringify(payload));

}

function appendLine(text) {
  const div = document.createElement('div');
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}