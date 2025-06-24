import api from '../utils/api';

export const cupService = {
  // tazas
  getAllCups: () => api.get('/cup'),
  getCupById: (id) => api.get(`/cup/${id}`),
  createCup: (data) => api.post('/cup', data),
  updateCup: (id, data) => api.put(`/cup/${id}`, data),
  deleteCup: (id) => api.delete(`/cup/${id}`),


  // Inventario de tazas
  getAllInventario: () => api.get('/inventario-cup'),
  createInventario: (data) => api.post('/inventario-cup', data),
  updateInventario: (id, data) => api.put(`/inventario-cup/${id}`, data),
  deleteInventario: (id) => api.delete(`/inventario-cup/${id}`),
  entradaStock: (id, cantidad) => api.post(`/inventario-cup/${id}/entrada`, { cantidad }),
  salidaStock: (id, cantidad) => api.post(`/inventario-cup/${id}/salida`, { cantidad }),

  // Rangos de precios
  getAllPreciosCupRango: () => api.get('/precios-cup'),
  getPrecioCupRangoById: (id) => api.get(`/precios-cup/${id}`),
  createPrecioCupRango: (data) => api.post('/precios-cup', data),
  updatePrecioCupRango: (id, data) => api.put(`/precios-cup/${id}`, data),
  deletePrecioCupRango: (id) => api.delete(`/precios-cup/${id}`),
};

export default cupService;