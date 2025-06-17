import api from './index';

export const productService = {
  // Obtener productos paginados con filtros
  getPaginatedProducts: async (params) => {
    const response = await api.get('/products/paginated', { params });
    return response.data;
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Obtener productos por categoría
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // Obtener productos relacionados
  getRelatedProducts: async (productId, categoryId) => {
    const response = await api.get(`/products/related/${productId}/${categoryId}`);
    return response.data;
  }
};

export default productService;