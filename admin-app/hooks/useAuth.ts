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
  loading: boolean;
  initialized: boolean;
  login: (credentials: { correo: string; password: string }) => Promise<User | null>;
  logout: () => void;
  checkAuth: () => Promise<User | null>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
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
        // console.log('Login successful, user:', user);
        
        // Guardar en el estado de Zustand
        set({ user, loading: false });
        return user;
      }
      
      set({ loading: false });
      return null;
    } catch (error) {
      console.error('Error in login function:', error);
      set({ user: null, loading: false });
      return null;
    }
  },

  logout: () => {
    try {
      authService.logout();
      set({ user: null });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    
    try {
      const user = await authService.getCurrentUser();
      set({ user, initialized: true, loading: false });
      return user;
    } catch (error) {
      set({ user: null, initialized: true, loading: false });
      return null;
    }
  }
}));