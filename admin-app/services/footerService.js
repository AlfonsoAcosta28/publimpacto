import api from '../utils/api';

export const footerService = {
  getFooter: async () => {
    const response = await api.get('/footer');
    return response.data;
  },
  
  updateFooter: async (data) => {
    const response = await api.put('/footer', data);
    return response.data;
  }
};

export default footerService;