import api from './api'

export const loginUser = async function (username,password){
    return await api.post("/login",{username ,password},{
        "withCredentials" : true, // alow backend to set cookies
    }) // JWT will be stored in cookies 
}