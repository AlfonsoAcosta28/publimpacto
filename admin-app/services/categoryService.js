import api from '../utils/api';

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    console.log(response.data);
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
  
  createCategory: async (categoryData, image) => {
    const formData = new FormData();
    if (image) {
      formData.append('image', image);
    }
    
    Object.keys(categoryData).forEach(key => {
      formData.append(key, categoryData[key]);
    });
    
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updateCategory: async (id, categoryData, image = null) => {
    const formData = new FormData();
    
    if (image) {
      formData.append('image', image);
    }
    
    Object.keys(categoryData).forEach(key => {
      formData.append(key, categoryData[key]);
    });
    
    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;