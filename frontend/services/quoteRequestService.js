import api from './index';
export const quoteRequestService = {
  createQuoteRequest: async (data) => {
    const response = await api.post('/quote-requests', data);
    return response.data;
  },
  getUserQuotes: async () => {
    const response = await api.get('/quote-requests/my');
    return response.data;
  },
  getUserQuoteById: async (id) => {
    const response = await api.get(`/quote-requests/my/${id}`);
    return response.data;
  }
};

export default quoteRequestService;