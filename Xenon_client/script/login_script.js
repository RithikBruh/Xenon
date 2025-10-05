const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const bt_text = document.getElementById("login_button");

function login(flag) {

  const username = usernameInput.value;
  const password = passwordInput.value;

  if(username === "view" && password === "view") {
        bt_text.style.color = "red";
            setTimeout(() => {
        bt_text.innerText = "Log";
    }, 3000);
    bt_text.innerText = "";
    } 
    
  else if (flag) {
    // loading screen
    console.log("logging in");
        sessionStorage.setItem("password", password);
        sessionStorage.setItem("username", username);

        // Redirect to chat page
        window.location.href = "chat.html";
        }

    }


// Trigger login when Enter is pressed in password field
passwordInput.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        login(1);
    }
});

// Optional: Enter in username also works
usernameInput.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        login(0);
    }
});
