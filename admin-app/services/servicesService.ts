import { Service } from '@/interfaces/Service';
import api from '../utils/api';


export const servicesService = {
  // Obtener todos los servicios
  getAllServices: async (): Promise<Service[]> => {
    try {
      console.log('Frontend: Obteniendo servicios...');
      const response = await api.get('/services');
      console.log('Frontend: Respuesta de servicios:', response.data);
      return response.data;
    } catch (error) {
      console.error('Frontend: Error al obtener servicios:', error);
      throw error;
    }
  },

  // Obtener un servicio por ID
  getServiceById: async (id: number): Promise<Service> => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Frontend: Error al obtener servicio por ID:', error);
      throw error;
    }
  },

  // Crear un nuevo servicio
  createService: async (serviceData: Service, mainImage: File, secondaryImages?: File[]): Promise<Service> => {
    try {
      console.log('Frontend: Creando servicio...', serviceData);
      const formData = new FormData();
      
      // Agregar datos básicos del servicio
      formData.append('name', serviceData.name);
      formData.append('description', serviceData.description);
      formData.append('base_price', serviceData.base_price.toString());
      formData.append('short_description', serviceData.short_description.toString());
      if (serviceData.features) {
        formData.append('features', JSON.stringify(serviceData.features));
      }
      if (serviceData.applications) {
        formData.append('applications', JSON.stringify(serviceData.applications));
      }
      
      // Agregar imagen principal
      formData.append('mainImage', mainImage);
      
      // Agregar imágenes secundarias si existen
      if (secondaryImages && secondaryImages.length > 0) {
        secondaryImages.forEach(image => {
          formData.append('secondaryImages', image);
        });
      }

      console.log('Frontend: Enviando FormData...');
      const response = await api.post('/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Frontend: Servicio creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Frontend: Error al crear servicio:', error);
      throw error;
    }
  },

  // Actualizar un servicio
  updateService: async (
    id: number, 
    serviceData: Service, 
    mainImage?: File, 
    secondaryImages?: File[]
  ): Promise<Service> => {
    try {
      const formData = new FormData();
      
      // Agregar datos básicos del servicio
      formData.append('name', serviceData.name);
      formData.append('description', serviceData.description);
      formData.append('base_price', serviceData.base_price.toString());
      formData.append('short_description', serviceData.short_description.toString());
      if (serviceData.features) {
        formData.append('features', JSON.stringify(serviceData.features));
      }
      if (serviceData.applications) {
        formData.append('applications', JSON.stringify(serviceData.applications));
      }
      
      // Agregar imagen principal si se proporciona
      if (mainImage) {
        formData.append('mainImage', mainImage);
      }
      
      // Agregar imágenes secundarias si se proporcionan
      if (secondaryImages && secondaryImages.length > 0) {
        secondaryImages.forEach(image => {
          formData.append('secondaryImages', image);
        });
      }

      const response = await api.put(`/services/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Frontend: Error al actualizar servicio:', error);
      throw error;
    }
  },

  // Eliminar un servicio
  deleteService: async (id: number): Promise<void> => {
    try {
      await api.delete(`/services/${id}`);
    } catch (error) {
      console.error('Frontend: Error al eliminar servicio:', error);
      throw error;
    }
  },
};

export default servicesService; 