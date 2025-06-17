import api from '../utils/api';

export const shippingPriceService = {
  getCurrentPrice: async () => {
    const response = await api.get('/shipping-prices/current');
    return response.data;
  },

  createShippingPrice: async (data: { valorEnvio: number; precioMinimoVenta: number }) => {
    const response = await api.post('/shipping-prices', data);
    return response.data;
  }
};

export default shippingPriceService; 