const API_URL = "http://localhost:8000";

export const createSesionWithMedicion = async (data: any) => {
  try {
    const response = await fetch(`${API_URL}/sesiones_con_medicion/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear sesión con medición");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error al crear sesión con medición:", error);
    throw error;
  }
};

export const getMedicionCompleta = async (medicionId: number) => {
  try {
    const response = await fetch(`${API_URL}/medicion_completa/${medicionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // aunque para GET no es estrictamente necesario
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener la medición completa");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener la medición completa:", error);
    throw error;
  }
};

export const getMedicionesCompletasPorPaciente = async (pacienteId: number) => {
  try {
    const response = await fetch(`${API_URL}/mediciones_completas_paciente/${pacienteId}`);
    if (!response.ok) {
      // Aquí puedes leer el error que envía el backend para dar info más precisa
      const errorInfo = await response.json();
      throw new Error(errorInfo.detail || "Error al obtener las mediciones del paciente");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener las mediciones del paciente:", error);
    throw error;
  }
};
