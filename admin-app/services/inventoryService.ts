import api from '../utils/api';

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
  // Obtener todo el inventario
  getAllInventory: async (page = 1, limit = 10, status?: string, lowStock?: boolean, product_id?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(lowStock && { lowStock: 'true' }),
      ...(product_id && { product_id: product_id.toString() })
    });
    const response = await api.get(`/inventory?${params}`);
    return response.data;
  },

  // Obtener inventario por ID
  getInventoryById: async (id: number) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  // Crear nuevo registro de inventario
  createInventory: async (inventoryData: Partial<InventoryItem>) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },

  // Actualizar inventario
  updateInventory: async (id: number, inventoryData: Partial<InventoryItem>) => {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    return response.data;
  },

  // Ajustar stock
  adjustStock: async (id: number, quantity: number, type: 'in' | 'out', notes?: string) => {
    const response = await api.patch(`/inventory/${id}/adjust`, {
      quantity,
      type,
      notes
    });
    return response.data;
  },

  // Reservar stock
  reserveStock: async (id: number, quantity: number) => {
    const response = await api.patch(`/inventory/${id}/reserve`, {
      quantity
    });
    return response.data;
  },

  // Obtener productos con stock bajo
  getLowStockItems: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  // Eliminar registro de inventario
  deleteInventory: async (id: number) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  // Cambiar estado del inventario
  changeInventoryStatus: async (id: number, status: 'active' | 'inactive' | 'discontinued') => {
    const response = await api.patch(`/inventory/${id}/status`, { status });
    return response.data;
  }
};

export default inventoryService; 