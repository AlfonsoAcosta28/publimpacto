import api from './index';

export const footerService = {
  getFooter: async () => {
    const response = await api.get('/footer');
    return response.data;
  },
  getAboutUs: async () => {
    const response = await api.get('/about-us');
    return response.data;
  },
  
};


export default footerService;