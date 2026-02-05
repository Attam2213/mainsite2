import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const $host = axios.create({
    baseURL: API_URL
});

const $authHost = axios.create({
    baseURL: API_URL
});

// Интерцептор для авторизованных запросов
const authInterceptor = config => {
    config.headers.authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
};

$authHost.interceptors.request.use(authInterceptor);

// Обработка ошибок
const handleError = (error) => {
    if (error.response) {
        // Сервер ответил с ошибкой
        const message = error.response.data?.message || 'Произошла ошибка';
        throw new Error(message);
    } else if (error.request) {
        // Запрос был отправлен, но ответа нет
        throw new Error('Сервер не отвечает');
    } else {
        // Произошла ошибка при настройке запроса
        throw new Error('Ошибка при отправке запроса');
    }
};

export const registration = async (email, password) => {
    try {
        const response = await $host.post('/user/registration', { email, password });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const login = async (email, password) => {
    try {
        const response = await $host.post('/user/login', { email, password });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const check = async () => {
    try {
        const response = await $authHost.get('/user/auth');
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getProfile = async () => {
    try {
        const response = await $authHost.get('/user/profile');
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await $authHost.put('/user/profile', userData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const topUpBalance = async (amount) => {
    try {
        const response = await $authHost.post('/user/balance/top-up', { amount });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getAllUsers = async () => {
    try {
        const response = await $authHost.get('/user/users');
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const createYooMoneyPayment = async (amount) => {
    try {
        const response = await $authHost.post('/user/payment/yoomoney', { amount });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    registration,
    login,
    check,
    getProfile,
    updateProfile,
    topUpBalance,
    getAllUsers,
    createYooMoneyPayment
};