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
