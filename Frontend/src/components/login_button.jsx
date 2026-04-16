
export default function LoginButton({isview,onClick}) {
    return <button onClick = {onClick} className={isview ? "login-button-view login-button" : "login-button"}> </button>; 
}