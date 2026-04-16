import api from './api'

export const fetchFiles = async function (){
    const response = await api.get("/files",{
        "withCredentials" : true, // alow backend to set cookies
    })
    console.log("response is ", response.data);
    return response.data
}

export const uploadFile = async function (file){
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/files", formData,{
        "withCredentials" : true, // alow backend to set cookies
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}
