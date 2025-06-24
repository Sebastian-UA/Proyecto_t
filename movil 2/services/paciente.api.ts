import { API_CONFIG, apiPost, apiGet, apiPut, buildApiUrl } from '@/config/api';

interface PacienteData {
  nombre: string;
  rut: string;
  edad: string;
  telefono: string;
  correo: string;
  contrasena: string;
  genero: string;
  profesionalId: number;
}

export const createPaciente = async (data: PacienteData) => {
  try {
    const response = await apiPost(API_CONFIG.ENDPOINTS.PACIENTE_CON_USUARIO, data);

    if (!response.ok) {
      throw new Error("Error al crear paciente");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("❌ Error al crear paciente:", error);
    throw error;
  }
};

export const getPacientesInfo = async (profesionalId?: number) => {
  try {
    console.log('🔍 Buscando pacientes para profesionalId:', profesionalId);
    
    const response = await apiGet(API_CONFIG.ENDPOINTS.PACIENTES_DETALLE);

    if (!response.ok) {
      throw new Error("Error al obtener los pacientes");
    }

    const data = await response.json();
    console.log('📋 Todos los pacientes recibidos:', data);
    
    // Si se proporciona un profesionalId, filtrar los pacientes
    if (profesionalId) {
      const pacientesFiltrados = data.filter((paciente: any) => {
        console.log('🔍 Comparando paciente:', paciente.nombre, 'profesionalId:', paciente.profesionalId, 'con:', profesionalId);
        return paciente.profesionalId === profesionalId;
      });
      console.log('✅ Pacientes filtrados para profesionalId', profesionalId, ':', pacientesFiltrados);
      return pacientesFiltrados;
    }
    
    return data;
  } catch (error) {
    console.error("❌ Error al obtener pacientes:", error);
    throw error;
  }
};
