import api from '../utils/api';

export const serviceOrderService = {
  // Obtener todas las órdenes (para admin)
  getAllOrders: async () => {
    try {
      const response = await api.get('/service-orders');
      return response.data;
    } catch (error) {
      console.error('Error en getAllOrders:', error);
      throw error;
    }
  },

  // Actualizar estado de una orden (para admin)
  updateOrderStatus: async (orderId: number, status: string) => {
    try {
      const response = await api.put(`/service-orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error en updateOrderStatus:', error);
      throw error;
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId: number) => {
    try {
      const response = await api.get(`/service-orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error en getOrderById:', error);
      throw error;
    }
  }
}; 