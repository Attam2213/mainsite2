import axios from "axios";

const $host = axios.create({
    baseURL: "/api/"
})

const $authHost = axios.create({
    baseURL: "/api/"
})

const authInterceptor = config => {
    const token = localStorage.getItem('token');
    console.log('Интерцептор авторизации, токен:', token ? 'есть' : 'отсутствует');
    if (token) {
        config.headers.authorization = `Bearer ${token}`
    }
    return config
}

$authHost.interceptors.request.use(authInterceptor)

// Добавим обработку ошибок
$host.interceptors.response.use(
    response => response,
    error => {
        console.error('Ошибка в $host:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

$authHost.interceptors.response.use(
    response => response,
    error => {
        console.error('Ошибка в $authHost:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('Ошибка 401 - удаление токена');
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export {
    $host,
    $authHost
}
