import api from './index';

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  getCategoryWithProducts: async (id) => {
    const response = await api.get(`/categories/${id}/products`);
    return response.data;
  },
  
  getRecentCategories: async (limit = 3) => {
    const response = await api.get(`/categories/recent?limit=${limit}`);
    return response.data;
  },
};

export default categoryService;