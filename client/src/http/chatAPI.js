import { $authHost } from './index';

export const createChat = async (subject) => {
    try {
        const response = await $authHost.post('/chat', { subject });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось создать чат');
    }
};

export const getUserChats = async () => {
    try {
        const response = await $authHost.get('/chat/my');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить чаты');
    }
};

export const getChatMessages = async (chatId) => {
    try {
        const response = await $authHost.get(`/chat/${chatId}/messages`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить сообщения');
    }
};

export const sendMessage = async (chatId, content, files = []) => {
    try {
        const formData = new FormData();
        formData.append('content', content);
        
        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file);
            });
        }

        const response = await $authHost.post(`/chat/${chatId}/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось отправить сообщение');
    }
};

export const closeChat = async (chatId) => {
    try {
        const response = await $authHost.put(`/chat/${chatId}/close`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось закрыть чат');
    }
};

export const getAllChats = async () => {
    try {
        const response = await $authHost.get('/chat/all');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить чаты');
    }
};

export const getUnreadCount = async () => {
    try {
        const response = await $authHost.get('/chat/unread-count');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить количество непрочитанных');
    }
};

export const downloadFile = async (fileId) => {
    try {
        const response = await $authHost.get(`/chat/files/${fileId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось скачать файл');
    }
};