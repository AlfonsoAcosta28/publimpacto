import api from './index';

export const camisaService = {
  // Camisas
  getAllCamisas: () => api.get('/camisas'),
  getCamisaById: (id) => api.get(`/camisas/${id}`),

  // Tallas
  getAllTallas: () => api.get('/tallas'),
  getTallaById: (id) => api.get(`/tallas/${id}`),

  // Colores
  getAllColores: () => api.get('/colores'),
  getColorById: (id) => api.get(`/colores/${id}`),

  // Inventario de camisas
  getAllInventario: () => api.get('/inventario-camisa'),

  // Rangos de precios
  getAllPreciosCamisaRango: () => api.get('/precios-camisa'),
  getPrecioCamisaRangoById: (id) => api.get(`/precios-camisa/${id}`),
};

export default camisaService;