import Constants from 'expo-constants';

const API_URL = 'http://192.168.178.29:8000';


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
    const response = await fetch(`${API_URL}/profesional_con_usuario/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear profesional con usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en createProfesionalConUsuario:', error);
    throw error;
  }
};

export const createProfesional = async (data: ProfesionalData) => {
  try {
    const response = await fetch(`${API_URL}/profesionales/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear profesional');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en createProfesional:', error);
    throw error;
  }
};

export const getProfesionales = async () => {
  try {
    const response = await fetch(`${API_URL}/profesionales/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los profesionales');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en getProfesionales:', error);
    throw error;
  }
};

export const getProfesionalById = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/profesionales/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el profesional');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en getProfesionalById:', error);
    throw error;
  }
};

export const createPaciente = async (data: any) => {
  try {
    const response = await fetch(`${API_URL}/paciente_con_usuario/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear paciente");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error al crear paciente:", error);
    throw error;
  }
};

export const getPacientesInfo = async () => {
  try {
    const response = await fetch(`${API_URL}/pacientes/detalle`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los pacientes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    throw error;
  }
};
