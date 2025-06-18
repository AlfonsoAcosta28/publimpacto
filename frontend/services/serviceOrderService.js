import api from './index';

export const serviceOrderService = {
  // Crear una nueva orden de servicio
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/service-orders/create', orderData);
      return response.data;
    } catch (error) {
      console.error('Error en createOrder:', error);
      throw error;
    }
  },

  // Obtener órdenes por email del cliente
  getOrdersByEmail: async (email) => {
    try {
      const response = await api.get(`/service-orders/by-email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error en getOrdersByEmail:', error);
      throw error;
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/service-orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error en getOrderById:', error);
      throw error;
    }
  },

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
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/service-orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error en updateOrderStatus:', error);
      throw error;
    }
  }
}; 