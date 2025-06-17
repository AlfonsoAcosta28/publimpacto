import api from './index';

export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    // console.log(response.data)
    return response.data;
  },
  
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  getRecentProducts: async (limit = 8) => {
    const response = await api.get(`/products/recent?limit=${limit}`);
    return response.data;
  },

  getRelatedProducts: async (productId, categoryId) => {
    const response = await api.get(`/products/related/${productId}/${categoryId}`);
    return response.data;
  },

  getFilteredProducts: async ({
    page = 1,
    limit = 16,
    category = null,
    minPrice = null,
    maxPrice = null,
    sortBy = 'price-low',
    search = null
  }) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(category && { category }),
      ...(minPrice !== null && { minPrice: String(minPrice) }),
      ...(maxPrice !== null && { maxPrice: String(maxPrice) }),
      ...(search && { search }),
      sortBy
    });

    const response = await api.get(`/products/filter?${params}`);
    return response.data;
  },

  createProduct: async (productData, mainImage, secondaryImages = []) => {
    try {
      const formData = new FormData();
      
      // Add main image
      formData.append('mainImage', mainImage);
      
      // Add secondary images
      secondaryImages.forEach(image => {
        formData.append('secondaryImages', image);
      });
      
      // Add other product data
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });
      
      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData, mainImage = null, secondaryImages = null) => {
    const formData = new FormData();
    
    if (mainImage) {
      formData.append('mainImage', mainImage);
    }
    
    if (secondaryImages) {
      secondaryImages.forEach(image => {
        formData.append('secondaryImages', image);
      });
    }
    
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default productService;