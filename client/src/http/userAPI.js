import { $host, $authHost } from './index';

// Обработка ошибок теперь в index.js, но оставим обертку для совместимости интерфейса
// или позволим ошибкам всплывать как есть

export const registration = async (email, password) => {
    try {
        const response = await $host.post('/user/registration', { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await $host.post('/user/login', { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const check = async () => {
    try {
        const response = await $authHost.get('/user/auth');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await $authHost.get('/user/profile');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await $authHost.put('/user/profile', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const topUpBalance = async (amount) => {
    try {
        const response = await $authHost.post('/user/balance/top-up', { amount });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await $authHost.get('/user/users');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createYooMoneyPayment = async (amount) => {
    try {
        const response = await $authHost.post('/user/payment/yoomoney', { amount });
        return response.data;
    } catch (error) {
        throw error;
    }
};
