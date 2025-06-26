import api from '../utils/api';

export const quotesService = {
  getAllquotes: async (page = 1, limit = 50) => {
    const response = await api.get(`/quote-requests?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getquotesById: async (id) => {
    const response = await api.get(`/quote-requests/${id}`);
    return response.data;
  },
  
  updateQuoteStatus: async (id, status) => {
    const response = await api.put(`/quote-requests/${id}/status`, { status });
    return response.data;
  },
  
  cancelquotes: async (id) => {
    const response = await api.put(`/quote-requests/${id}/cancel`);
    return response.data;
  },

  createFinalQuote: async (data) => {
    const response = await api.post(`/final-quotes/`, data);
    return response.data;
  },

  getAllFinalQuotes: async (page = 1, limit = 50) => {
    const response = await api.get(`/final-quotes?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default quotesService;