import api from './index';

export const aboutUsService = {
  getAboutUs: async () => {
    const response = await api.get('/about-us');
    return response.data;
  },
};

export default aboutUsService;