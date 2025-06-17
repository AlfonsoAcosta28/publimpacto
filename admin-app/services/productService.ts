import api from '../utils/api';
import { Product, CreateProductData, UpdateProductData } from '../interfaces/Product';

export const productService = {
  // Obtener todos los productos
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Obtener productos por categoría
  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Crear nuevo producto
  createProduct: async (productData: CreateProductData, mainImage: File, secondaryImages: File[] = []): Promise<any> => {
    try {
      const formData = new FormData();
      
      // Agregar datos del producto
      Object.keys(productData).forEach(key => {
        const value = productData[key as keyof CreateProductData];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Agregar imagen principal
      if (mainImage) {
        formData.append('mainImage', mainImage);
      }

      // Agregar imágenes secundarias
      if (secondaryImages && secondaryImages.length > 0) {
        secondaryImages.forEach(image => {
          if (image && image.size > 0) {
            formData.append('secondaryImages', image);
          }
        });
      }

      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Actualizar producto
  updateProduct: async (id: number, productData: UpdateProductData, mainImage: File | null = null, secondaryImages: File[] = []): Promise<any> => {
    try {
      const formData = new FormData();
      
      // Agregar datos del producto
      Object.keys(productData).forEach(key => {
        const value = productData[key as keyof UpdateProductData];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Agregar imagen principal si se proporciona
      if (mainImage && mainImage.size > 0) {
        formData.append('mainImage', mainImage);
      }

      // Agregar imágenes secundarias si se proporcionan
      if (secondaryImages && secondaryImages.length > 0) {
        secondaryImages.forEach(image => {
          if (image && image.size > 0) {
            formData.append('secondaryImages', image);
          }
        });
      }

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Eliminar producto
  deleteProduct: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Obtener productos recientes
  getRecentProducts: async (limit: number = 4): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent products:', error);
      throw error;
    }
  },

  // Obtener productos filtrados
  getFilteredProducts: async (filters: any = {}): Promise<any> => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/products/filter?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      throw error;
    }
  },

  // Obtener productos relacionados
  getRelatedProducts: async (productId: number, categoryId: number, limit: number = 8): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/related/${productId}/${categoryId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  }
};

export default productService; 