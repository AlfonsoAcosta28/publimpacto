import { deleteCookie } from './cookies';

export const logout = () => {
    // Delete the token cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    // Redirect to login
    window.location.href = '/login';
};

export const getUserData = () => {
    try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Para la app de usuario, permitimos tokens de tipo 'user'
            // No es estrictamente necesario verificar aquí, pero añade una capa extra de seguridad
            if (payload.type !== 'user') {
                console.error('Token no válido para la aplicación de usuario');
                logout();
                return null;
            }
            
            return payload;
        }
        return null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
        return null;
    }
};

// Middleware para páginas protegidas
export const requireAuth = () => {
    const userData = getUserData();
    if (!userData) {
        logout();
        return false;
    }
    return true;
};