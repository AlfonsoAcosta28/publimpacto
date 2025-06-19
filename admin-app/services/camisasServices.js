import api from '../utils/api';

export const camisaService = {
  // Camisas
  getAllCamisas: () => api.get('/camisas'),
  getCamisaById: (id) => api.get(`/camisas/${id}`),
  createCamisa: (data) => api.post('/camisas', data),
  updateCamisa: (id, data) => api.put(`/camisas/${id}`, data),
  deleteCamisa: (id) => api.delete(`/camisas/${id}`),

  // Tallas
  getAllTallas: () => api.get('/tallas'),
  getTallaById: (id) => api.get(`/tallas/${id}`),
  createTalla: (data) => api.post('/tallas', data),
  updateTalla: (id, data) => api.put(`/tallas/${id}`, data),
  deleteTalla: (id) => api.delete(`/tallas/${id}`),

  // Colores
  getAllColores: () => api.get('/colores'),
  getColorById: (id) => api.get(`/colores/${id}`),
  createColor: (data) => api.post('/colores', data),
  updateColor: (id, data) => api.put(`/colores/${id}`, data),
  deleteColor: (id) => api.delete(`/colores/${id}`),

  // Inventario de camisas
  getAllInventario: () => api.get('/inventario-camisa'),
  createInventario: (data) => api.post('/inventario-camisa', data),
  updateInventario: (id, data) => api.put(`/inventario-camisa/${id}`, data),
  deleteInventario: (id) => api.delete(`/inventario-camisa/${id}`),
  entradaStock: (id, cantidad) => api.post(`/inventario-camisa/${id}/entrada`, { cantidad }),
  salidaStock: (id, cantidad) => api.post(`/inventario-camisa/${id}/salida`, { cantidad }),

  // Rangos de precios
  getAllPreciosCamisaRango: () => api.get('/precios-camisa'),
  getPrecioCamisaRangoById: (id) => api.get(`/precios-camisa/${id}`),
  createPrecioCamisaRango: (data) => api.post('/precios-camisa', data),
  updatePrecioCamisaRango: (id, data) => api.put(`/precios-camisa/${id}`, data),
  deletePrecioCamisaRango: (id) => api.delete(`/precios-camisa/${id}`),
};

export default camisaService;