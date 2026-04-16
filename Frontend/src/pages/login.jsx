import "./../styles/login_styles/login.css";
import "./../styles/login_styles/login_container_style.css";
import "./../styles/login_styles/login_button_style.css";

import LoginButton from "../components/login_button.jsx";
import LoginContainer from "../components/login_container.jsx";

import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { loginUser } from "../api/auth.api.js";

async function button_handler(username,password,navigate) {
  const response = await loginUser(username,password)
  if (response.status == 200){
    // login sucessfull 
    console.log("suc login");
    localStorage.setItem("LoggedIn", true);
    navigate('/chat');
  }
}

export default function Login() {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [isview, setIsview] = useState(false);
  
  useEffect(() => {
    if (username == "view" && password == "view") {
      setIsview(true);
      setTimeout(() => {
        setIsview(false);
      }, 2000);
    }
  }, [username, password]);

  const navigate = useNavigate();

  return (
    <div>
      <div className="infinite-bg">
        <div className="heading-login-container">
          <LoginButton onClick = {() => button_handler(username,password,navigate)} isview={isview} />
          <h1 className="heading"> Xenon</h1>
          <h6 className="subheading">
            Authentication required — Authorized use only
          </h6>
          <LoginContainer
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
          />
          <a style={{ "text-decoration": "none" }} href="www.google.com">
            <div className="trademark">Xenon™</div>
          </a>
        </div>
      </div>
    </div>
  );
}
