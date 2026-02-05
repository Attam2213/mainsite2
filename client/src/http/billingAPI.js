import { $authHost } from './index';

// Услуги
export const getAllServices = async () => {
    try {
        const response = await $authHost.get('/billing/services');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить услуги');
    }
};

export const createService = async (serviceData) => {
    try {
        const response = await $authHost.post('/billing/services', serviceData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось создать услугу');
    }
};

export const updateService = async (id, serviceData) => {
    try {
        const response = await $authHost.put(`/billing/services/${id}`, serviceData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось обновить услугу');
    }
};

export const deleteService = async (id) => {
    try {
        const response = await $authHost.delete(`/billing/services/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось удалить услугу');
    }
};

// Счета
export const getMyInvoices = async () => {
    try {
        const response = await $authHost.get('/billing/invoices/my');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить счета');
    }
};

export const getAllInvoices = async () => {
    try {
        const response = await $authHost.get('/billing/invoices');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить все счета');
    }
};

export const createInvoice = async (invoiceData) => {
    try {
        const response = await $authHost.post('/billing/invoices', invoiceData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось создать счет');
    }
};

export const payInvoice = async (id) => {
    try {
        const response = await $authHost.post(`/billing/invoices/${id}/pay`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось оплатить счет');
    }
};

export const cancelInvoice = async (id) => {
    try {
        const response = await $authHost.post(`/billing/invoices/${id}/cancel`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось отменить счет');
    }
};

// Статистика
export const getStatistics = async () => {
    try {
        const response = await $authHost.get('/billing/statistics');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить статистику');
    }
};

export default {
    getAllServices,
    createService,
    updateService,
    deleteService,
    getMyInvoices,
    getAllInvoices,
    createInvoice,
    payInvoice,
    cancelInvoice,
    getStatistics
};