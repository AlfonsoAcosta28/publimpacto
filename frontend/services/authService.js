import api from './index';
let verificationInProgress = false;

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      document.cookie = `token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
    }
    return response.data;
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        document.cookie = `token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    localStorage.removeItem('userData');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    // console.log('Respuesta del servidor:', response.data);
    if (response.status === 200) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  verifyEmail: async (token) => {
    if (verificationInProgress) {
      console.log('Ya hay una verificación en progreso, esperando...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: 'Proceso de verificación ya completado' };
    }
    
    try {
      verificationInProgress = true;
      console.log('Verificando correo electrónico con el token:', token);
      
      const response = await api.get(`/auth/verify-email/${token}`);
      
      if (response.data.token) {
        document.cookie = `token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en la verificación del correo:', error);
      throw error;
    } finally {
      verificationInProgress = false;
    }
  },

  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { correo: email });
    return response.data;
  }
};

export default authService;