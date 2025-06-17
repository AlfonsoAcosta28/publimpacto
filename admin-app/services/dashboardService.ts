import api from '../utils/api';

export const dashboardService = {
  // Obtener estadísticas generales
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Obtener datos de ventas por mes
  getSalesData: async (period: string = 'month') => {
    const response = await api.get(`/dashboard/sales?period=${period}`);
    return response.data;
  },

  // Obtener datos de visitas
  getVisitsData: async (period: string = 'month') => {
    const response = await api.get(`/dashboard/visits?period=${period}`);
    return response.data;
  },

  // Obtener ventas por categoría
  getCategoryData: async (period: string = 'month') => {
    const response = await api.get(`/dashboard/categories?period=${period}`);
    return response.data;
  },

  // Obtener pedidos recientes
  getRecentOrders: async (limit: number = 4) => {
    const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
    return response.data;
  },

  // Obtener productos recientes
  getRecentProducts: async (limit: number = 3) => {
    const response = await api.get(`/dashboard/recent-products?limit=${limit}`);
    return response.data;
  },

  // Obtener usuarios recientes
  getRecentUsers: async (limit: number = 3) => {
    const response = await api.get(`/dashboard/recent-users?limit=${limit}`);
    return response.data;
  }
}; 