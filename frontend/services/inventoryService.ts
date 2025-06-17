import api from './index';

export interface InventoryItem {
  id: number;
  product_id: number;
  stock_quantity: number;
  reserved_quantity: number;
  min_stock_level: number;
  cost_per_unit: number;
  status: string;
  notes?: string;
  last_movement_date: string;
  product: {
    id: number;
    title: string;
    price: number;
    category_id: number;
  };
}

export interface InventoryResponse {
  success: boolean;
  data: InventoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const inventoryService = {
  reserveStock: async (productId: string, quantity: number) => {
    const response = await api.patch(`/inventory/${productId}/reserve`, {
      quantity
    });
    return response.data;
  },

  releaseStock: async (productId: string, quantity: number) => {
    const response = await api.patch(`/inventory/${productId}/release`, {
      quantity
    });
    return response.data;
  }
};

export default inventoryService; 