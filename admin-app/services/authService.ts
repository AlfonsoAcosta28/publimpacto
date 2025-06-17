import api from '../utils/api';

interface User {
  id?: string;
  nombre?: string;
  role?: string;
  type?: string;
  [key: string]: any;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Servicios de autenticación
export const authService = {
  login: async (credentials: { correo: string; password: string } | { correo: string; password: string }): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/loginAdmin', credentials);
      const data = response.data;
      
      if (data && data.token) {
        // Guardar token en cookie con seguridad
        document.cookie = `token=${data.token}; path=/; max-age=86400; secure; samesite=strict`;
      }
      
      // Verificar tipo de usuario
      // if (data.user && (!data.user.type || (data.user.type !== 'admin' && data.user.role !== 'admin'))) {
      //   throw new Error('Acceso denegado: se requiere permisos de administrador');
      // }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: (): void => {
    // Eliminar token
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    // Redirigir a login
    window.location.href = '/login';
  },
  
  getCurrentUser: async (): Promise<User> => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Verificar que el token sea válido
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Verificar si es administrador
        if (payload.type !== 'admin' && payload.role !== 'admin') {
          authService.logout();
          throw new Error('Acceso denegado: se requiere permisos de administrador');
        }
      } catch (err) {
        authService.logout();
        throw new Error('Token inválido');
      }
      
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  // Verificar si el usuario es administrador
  requireAdmin: (): boolean => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return false;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.type === 'admin' || payload.role === 'admin';
    } catch (error) {
      return false;
    }
  }
};

export default authService;