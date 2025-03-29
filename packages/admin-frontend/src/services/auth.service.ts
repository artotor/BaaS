import axios from 'axios';

// Usar URL relativa por defecto, con fallback a absoluta si es necesario
const API_URL = '/api';
const BACKEND_URL = 'http://localhost:6868'; // URL absoluta como fallback

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

// Función para intentar con URL relativa primero, luego con absoluta
const tryRequest = async (relativeUrl: string, requestFn: (url: string) => Promise<any>) => {
  try {
    // Intenta primero con la URL relativa (depende del proxy)
    return await requestFn(`${API_URL}${relativeUrl}`);
  } catch (error) {
    console.log('Falló petición con URL relativa, intentando con absoluta');
    // Si falla, intenta con la URL absoluta
    return await requestFn(`${BACKEND_URL}${relativeUrl}`);
  }
};

export const login = async (credentials: LoginCredentials): Promise<string> => {
  try {
    console.log('Intentando login con:', credentials);
    
    const makeRequest = (url: string) => axios.post<LoginResponse>(
      url,
      credentials
    );
    
    const response = await tryRequest('/auth/login', makeRequest);
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.error('Error en login:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error during login');
  }
};

export const register = async (credentials: RegisterCredentials): Promise<string> => {
  try {
    console.log('Intentando registro con:', credentials);
    
    const makeRequest = (url: string) => axios.post<RegisterResponse>(
      url,
      credentials
    );
    
    const response = await tryRequest('/auth/register', makeRequest);
    return response.data.message;
  } catch (error) {
    console.error('Error en registro:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Network error during registration');
  }
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const logout = (): void => {
  localStorage.removeItem('token');
}; 