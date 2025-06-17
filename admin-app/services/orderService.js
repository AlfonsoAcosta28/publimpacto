import api from '../utils/api';

export const orderService = {
  getAllOrders: async () => {
    const response = await api.get('/orders');
    console.log(response.data)
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  getUserOrders: async () => {
    const response = await api.get('/orders/user');
    return response.data;
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default orderService;