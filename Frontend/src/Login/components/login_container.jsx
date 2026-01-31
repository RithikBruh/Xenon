import {useEffect, useState} from 'react' ;

export default function LoginContainer({username,setUsername,password,setPassword}) {

    return (
        <div className="login-container">
            <div  className="username-text">Username</div>
            <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className="username-input"></input>
            <div  className="password-text">Password : {password}</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)}type="password" className="password-input"></input>
            
          </div>
    );
}