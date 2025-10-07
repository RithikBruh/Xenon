function username_click(event) {
  const buttonId = event.target.id;
  alert("Button ID: " + buttonId);
  // You can use buttonId as needed
}


const password = sessionStorage.getItem("password");
const username = sessionStorage.getItem("username");

// const SERVER = "ws://127.0.0.1:8000/ws";
const SERVER = "ws://100.115.241.16:8000/ws"; 

let token = null;
// --------------- Connect to WebSocket server
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
        appendLine("\t\t\t\t\t\t⚠️ Login failed!\n\n\n\n");

      window.location.href = "client.html";

    } else if (data.type === "login_success") {
        token = data.token;
        appendLine("\t\t\t\t\t\t✅ Login successful!\n\n\n\n");
    } else if (data.type === "history") {
        // appendLine("--- Chat History ---");
        (data.messages || []).forEach(m => appendLine(`: ${m.message} \n\n`,m.id,m.sender,m.status));
    } else if (data.type === "message") {
        appendLine(` : ${data.message} `,data.id,data.sender,data.status);
    } 
    // data type is edit 
    //TODO : dont change anything if msg is empty
    else if (data.type == "edit"){

    }
    else {
        console.log("Unknown data:", data);
    }
};


ws.onclose = () => {
    console.log("Disconnected from server");
    if (!token) {
        appendLine("\t\t\t\t\t\t⚠️ Login failed!\n\nIncorrect Cred or Server issue.");

    }
};

ws.onerror = (err) => {
    console.error("WebSocket error:", err);
};


// -------- WS Code END  -----------

const output = document.getElementById('output');
const inputBox = document.getElementById('input-box');

appendLine('---------------------------------------------------- [Xenon] ----------------------------------------------------                                             \n');

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

function appendLine(text, sender_id=0, sender="",status_value="unread") {
  const div = document.createElement('div');
  
  if (sender_id != 0){
    // status
    const status = document.createElement('span');
    status.innerText = "[·]";
    if (status_value === "read") {
        status.className = "status-read";
    } else if (status_value === "unread") {
        status.className = "status-unread";
    }
    div.appendChild(status);

    // sender button
    const sender_link = document.createElement('button');
    sender_link.id = sender_id;
    sender_link.className = "username-button";
    sender_link.textContent =  sender + "> ";
    sender_link.onclick = username_click; // <-- Add this line
    // OR: sender_link.addEventListener('click', username_click);
    div.appendChild(sender_link);
  }

  div.appendChild(document.createTextNode(text));
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}