import { Banner, BannerData } from '@/interfaces/Banner';
import api from '../utils/api';

export const bannerService = {
  getAllBanners: async (): Promise<Banner[]> => {
    const response = await api.get('/banners');
    return response.data;
  },

  getBannerById: async (id: number): Promise<Banner> => {
    const response = await api.get(`/banners/${id}`);
    return response.data;
  },

  createBanner: async (bannerData: BannerData, image?: File): Promise<Banner> => {
    const formData = new FormData();
    
    // Agregar los datos del banner al FormData
    Object.entries(bannerData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Agregar la imagen si existe
    if (image) {
      formData.append('imagen', image);
    }

    const response = await api.post('/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.banner;
  },

  updateBanner: async (id: number, bannerData: BannerData, image?: File): Promise<Banner> => {
    const formData = new FormData();
    
    // Agregar los datos del banner al FormData
    Object.entries(bannerData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Agregar la imagen si existe
    if (image) {
      formData.append('imagen', image);
    }

    const response = await api.put(`/banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.banner;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await api.delete(`/banners/${id}`);
  }
};
export default bannerService;
