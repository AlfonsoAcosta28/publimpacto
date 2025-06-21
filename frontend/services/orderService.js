import api from './index';

export const orderService = {
  
  getUserOrders: async (page = 1, limit = 4) => {
    const response = await api.get(`/orders/user?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
};

export default orderService;