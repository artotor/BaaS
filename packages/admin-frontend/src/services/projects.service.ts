import axios from 'axios';
import { getToken } from './auth.service';

// Usar URL relativa por defecto, con fallback a absoluta si es necesario
const API_URL = '/api';
const BACKEND_URL = 'http://localhost:6868'; // URL absoluta como fallback

export interface Project {
  id: number;
  name: string;
  dbName: string;
}

export interface CreateProjectRequest {
  name: string;
}

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

export const createProject = async (project: CreateProjectRequest): Promise<Project> => {
  try {
    console.log('Creando proyecto:', project);
    
    const makeRequest = (url: string) => axios.post<Project>(
      url,
      project,
      { headers: getAuthHeader() }
    );
    
    const response = await tryRequest('/projects', makeRequest);
    return response.data;
  } catch (error) {
    console.error('Error creando proyecto:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to create project');
    }
    throw new Error('Network error while creating project');
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    console.log('Solicitando lista de proyectos');
    
    const makeRequest = (url: string) => axios.get<Project[]>(
      url,
      { headers: getAuthHeader() }
    );
    
    const response = await tryRequest('/projects', makeRequest);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch projects');
    }
    throw new Error('Network error while fetching projects');
  }
};

export const fetchProjectById = async (id: number): Promise<Project> => {
  try {
    console.log('Solicitando proyecto con ID:', id);
    
    const makeRequest = (url: string) => axios.get<Project>(
      url,
      { headers: getAuthHeader() }
    );
    
    const response = await tryRequest(`/projects/${id}`, makeRequest);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch project');
    }
    throw new Error('Network error while fetching project');
  }
}; 