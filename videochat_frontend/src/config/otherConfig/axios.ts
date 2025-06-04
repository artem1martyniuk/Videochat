import axios from "axios";

//local 'http://localhost:4000/auth_service'
//docker 'http://auth_backend/auth_service'

const instance = axios.create({
    baseURL: 'http://localhost:4000/auth_service',
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export default instance;
