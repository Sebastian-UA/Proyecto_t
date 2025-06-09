const API_URL = "http://192.168.1.19:8000"; // ⚠️ Asegúrate de usar tu IP real aquí

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
      const errorBody = await response.json().catch(() => ({}));
      console.error("🛑 Error desde el backend:", errorBody);
      throw new Error(errorBody.detail || "Error al crear paciente");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error al registrar paciente:", error);
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
