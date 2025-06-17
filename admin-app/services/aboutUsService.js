import api from '../utils/api';
export const aboutUsService = {
  getAboutUs: async () => {
    const response = await api.get('/about-us');
    return response.data;
  },
  
  updateAboutUs: async (data) => {
    const response = await api.put('/about-us', data);
    return response.data;
  }
};

export default aboutUsService;