import api from './index';

export const shippingpriceService = {
    getCurrentPrice: async () => {
        try {
            const response = await api.get('/shipping-prices/current');

            return {
                valorEnvio: parseFloat(response.data.data.valorEnvio),
                min_order: response.data.data.precioMinimoVenta
            };
        } catch (error) {
            console.error('Error fetching shipping price:', error);
            // Precio por defecto si hay error
            return {
                valorEnvio: 50,
                min_order: 100
            };
        }
    }
}

export default shippingpriceService;