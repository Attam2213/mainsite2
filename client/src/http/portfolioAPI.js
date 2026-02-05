import { $authHost } from './index';

export const getAllPortfolios = async () => {
    try {
        const response = await $authHost.get('/portfolio');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось получить портфолио');
    }
};

export const createPortfolio = async (portfolioData) => {
    try {
        const formData = new FormData();
        formData.append('title', portfolioData.title);
        if (portfolioData.description) {
            formData.append('description', portfolioData.description);
        }
        if (portfolioData.link) {
            formData.append('link', portfolioData.link);
        }
        if (portfolioData.image) {
            formData.append('image', portfolioData.image);
        }

        const response = await $authHost.post('/portfolio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось создать работу');
    }
};

export const deletePortfolio = async (id) => {
    try {
        const response = await $authHost.delete(`/portfolio/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Не удалось удалить работу');
    }
};

export default {
    getAllPortfolios,
    createPortfolio,
    deletePortfolio
};