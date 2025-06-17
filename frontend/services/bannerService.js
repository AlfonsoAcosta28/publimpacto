import api from './index';

export const bannerService = {
  getAllBanners: async () => {
    try {
      const response = await api.get('/banners');
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  },
  
  getBannerById: async (id) => {
    try {
      const response = await api.get(`/banners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching banner:', error);
      return null;
    }
  }
};

export default bannerService;