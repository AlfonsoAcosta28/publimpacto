import api from './index';

export const orderService = {
  
  getUserOrders: async () => {
    const response = await api.get('/orders/user');
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
};

export default orderService;