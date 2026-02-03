import axios from "axios";

const $host = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/"
})

const $authHost = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/"
})

const authInterceptor = config => {
    config.headers.authorization = `Bearer ${localStorage.getItem('token')}`
    return config
}

$authHost.interceptors.request.use(authInterceptor)

export {
    $host,
    $authHost
}
