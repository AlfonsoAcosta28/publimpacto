import { create } from 'zustand';
import authService from '../services/authService';

interface User {
  id?: string;
  nombre?: string;
  role?: string;
  type?: string;
  [key: string]: any;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (credentials: { correo: string; password: string }) => Promise<User | null>;
  logout: () => void;
  checkAuth: () => Promise<User | null>;
  getToken: () => string | null;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  login: async (credentials) => {
    set({ loading: true });
    
    try {
      const response = await authService.login(credentials);

      //guardar el nombre del usuario en el localStorage
      localStorage.setItem('userData', JSON.stringify(response.user));
      

      if (response && response.user) {
        // Asegurarse de que el usuario tenga los datos necesarios
        const user = response.user;
        const token = response.token;
        // console.log('Login successful, user:', user);
        
        // Guardar en el estado de Zustand
        set({ user, token, loading: false });
        return user;
      }
      
      set({ loading: false });
      return null;
    } catch (error) {
      console.error('Error in login function:', error);
      set({ user: null, token: null, loading: false });
      return null;
    }
  },

  logout: () => {
    try {
      authService.logout();
      set({ user: null, token: null });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    
    try {
      const user = await authService.getCurrentUser();
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || null;
      set({ user, token, initialized: true, loading: false });
      return user;
    } catch (error) {
      set({ user: null, token: null, initialized: true, loading: false });
      return null;
    }
  },

  getToken: () => {
    const { token } = get();
    if (token) return token;
    
    // Si no hay token en el estado, intentar obtenerlo de las cookies
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (cookieToken) {
      set({ token: cookieToken });
      return cookieToken;
    }
    
    return null;
  }
}));