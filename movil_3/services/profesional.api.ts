import { API_CONFIG, apiPost, apiGet, apiPut, buildApiUrl } from '@/config/api';

interface ProfesionalData {
  nombre: string;
  rut: string;
  correo: string;
  contrasena: string;
  especialidad?: string;
  rol?: string;
}

export const createProfesionalConUsuario = async (data: ProfesionalData) => {
  try {
    const response = await apiPost(API_CONFIG.ENDPOINTS.PROFESIONAL_CON_USUARIO, data);

    if (!response.ok) {
      throw new Error('Error al crear profesional con usuario');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('❌ Error en createProfesionalConUsuario:', error);
    throw error;
  }
};

export const createProfesional = async (data: ProfesionalData) => {
  try {
    const response = await apiPost(API_CONFIG.ENDPOINTS.PROFESIONALES, data);

    if (!response.ok) {
      throw new Error('Error al crear profesional');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('❌ Error en createProfesional:', error);
    throw error;
  }
};

export const getProfesionales = async () => {
  try {
    const response = await apiGet(API_CONFIG.ENDPOINTS.PROFESIONALES);

    if (!response.ok) {
      throw new Error('Error al obtener los profesionales');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en getProfesionales:', error);
    throw error;
  }
};

export const getProfesionalById = async (id: number) => {
  try {
    const response = await apiGet(`${API_CONFIG.ENDPOINTS.PROFESIONALES}${id}`);

    if (!response.ok) {
      throw new Error('Error al obtener el profesional');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en getProfesionalById:', error);
    throw error;
  }
};
