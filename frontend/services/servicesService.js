import api from './index';

export const servicesService = {
  // Obtener todos los servicios
  getAllServices: async () => {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error) {
      console.error('Error en getAllServices:', error);
      throw error;
    }
  },

  // Obtener un servicio específico por ID
  getServiceById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getServiceById:', error);
      throw error;
    }
  },

  // Obtener inventario de un servicio específico
  getServiceInventory: async (serviceId) => {
    try {
      const response = await api.get(`/service-inventory/service/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error en getServiceInventory:', error);
      throw error;
    }
  }
}; 