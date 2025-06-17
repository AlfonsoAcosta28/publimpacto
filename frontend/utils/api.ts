import { getUserData, logout } from './auth';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tipos para errores API
interface ApiError {
  message: string;
  status: number;
}

const getAuthToken = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) {
    throw new Error('No se encontró el token de autenticación');
  }
  
  // Verificar que sea un token de usuario
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.type !== 'user') {
      console.error('Token no válido para la aplicación de usuario');
      logout();
      throw new Error('Token no válido para esta aplicación');
    }
  } catch (error) {
    logout();
    throw new Error('Token inválido');
  }
  
  return token;
};

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  try {
    const token = getAuthToken();
    
    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Manejar errores de autenticación
      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Sesión expirada o acceso denegado');
      }
      
      const error = await response.json();
      throw new Error(error.message || 'Ha ocurrido un error');
    }

    return response;
  } catch (error) {
    // Si es un error relacionado con la autenticación, manejar el cierre de sesión
    if (error.message.includes('token') || 
        error.message.includes('acceso') || 
        error.message.includes('Sesión')) {
      logout();
    }
    throw error;
  }
}

// Función para realizar solicitudes sin verificación de tipo de token
// Útil para endpoints como login que no requieren autenticación previa
export async function fetchWithoutAuth(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ha ocurrido un error');
  }

  return response;
}