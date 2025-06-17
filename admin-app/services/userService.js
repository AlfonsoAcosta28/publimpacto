import api from '../utils/api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getUserOrders: async (userId) => {
    const response = await api.get(`/orders/users/${userId}/orders`);
    return response.data;
  }
};

export default userService;