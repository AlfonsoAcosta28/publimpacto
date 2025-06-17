import api from '../utils/api';

export const addressService = {
  getAddressById: async (id: number) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  getAllAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },

  updateAddress: async (id: number, addressData: any) => {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  deleteAddress: async (id: number) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id: number) => {
    const response = await api.patch(`/addresses/${id}/set-default`);
    return response.data;
  }
};

export default addressService; 