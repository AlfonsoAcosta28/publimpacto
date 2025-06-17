import api from '../utils/api';

// Servicios para el Footer
export const footerService = {
  getFooter: async () => {
    const response = await api.get('/footer');
    return response.data;
  },
  
  updateFooter: async (footerData) => {
    const response = await api.put('/footer', footerData);
    return response.data;
  },
};

// Servicios para About Us
export const aboutUsService = {
  getAboutUs: async () => {
    const response = await api.get('/about-us');
    return response.data;
  },
  
  updateAboutUs: async (aboutUsData) => {
    const response = await api.put('/about-us', aboutUsData);
    return response.data;
  },
};

export { footerService, aboutUsService };