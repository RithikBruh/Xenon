

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const bt_text = document.getElementById("login_button");

function login(flag) {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if(username === "view" && password === "view") {
        bt_text.style.color = "red";
            setTimeout(() => {
        bt_text.style.color = "transparent";
    }, 3000);
    } 

    else if (username === "admin" && password === "admin") {
        if (flag)
        alert("Admin login successful!");
        // Redirect to admin dashboard or perform admin-specific actions
    }
    
}

// Trigger login when Enter is pressed in password field
passwordInput.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        login(0);
    }
});

// Optional: Enter in username also works
usernameInput.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        login(0);
    }
});