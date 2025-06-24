import api from './index';
export const cupService = {
  // Inventario de tazas
  getAllInventario: () => api.get('/inventario-cup/users'),
  // Rangos de precios
  getAllPreciosCupRango: () => api.get('/precios-cup'),
};

export default cupService;