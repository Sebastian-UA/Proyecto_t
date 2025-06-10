const API_URL = "http://localhost:8000";

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

export const updatePacienteConUsuario = async (pacienteId: number, data: any) => {
  try {
    const response = await fetch(`${API_URL}/paciente_con_usuario/${pacienteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar paciente");
    }

    const updatedData = await response.json();
    return updatedData;
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
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
