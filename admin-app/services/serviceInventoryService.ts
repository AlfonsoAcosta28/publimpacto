import api from '../utils/api';
import { ServiceInventory } from '@/interfaces/Service';

export const serviceInventoryService = {
  // Obtener inventario de un servicio
  getServiceInventory: async (serviceId: number): Promise<ServiceInventory[]> => {
    try {
      const response = await api.get(`/service-inventory/service/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener inventario del servicio:', error);
      throw error;
    }
  },

  // Agregar item al inventario
  addInventoryItem: async (serviceId: number, item: {
    variant_name: string;
    quantity: number;
    price_modifier?: number;
  }): Promise<ServiceInventory> => {
    try {
      const response = await api.post(`/service-inventory/service/${serviceId}`, item);
      return response.data;
    } catch (error) {
      console.error('Error al agregar item al inventario:', error);
      throw error;
    }
  },

  // Actualizar item del inventario
  updateInventoryItem: async (itemId: number, item: {
    variant_name?: string;
    quantity?: number;
    price_modifier?: number;
    is_active?: boolean;
  }): Promise<ServiceInventory> => {
    try {
      const response = await api.put(`/service-inventory/item/${itemId}`, item);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar item del inventario:', error);
      throw error;
    }
  },

  // Eliminar item del inventario
  deleteInventoryItem: async (itemId: number): Promise<void> => {
    try {
      await api.delete(`/service-inventory/item/${itemId}`);
    } catch (error) {
      console.error('Error al eliminar item del inventario:', error);
      throw error;
    }
  },

  // Obtener todos los inventarios
  getAllInventories: async (): Promise<ServiceInventory[]> => {
    try {
      const response = await api.get('/service-inventory/all');
      return response.data;
    } catch (error) {
      console.error('Error al obtener todos los inventarios:', error);
      throw error;
    }
  }
};

export default serviceInventoryService; 