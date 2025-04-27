const API_URL = "http://localhost:8000";

export const getArticulaciones = async () => {
  try {
    const response = await fetch(`${API_URL}/articulaciones/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las articulaciones");
    }

    const articulaciones = await response.json();
    return articulaciones;
  } catch (error) {
    console.error("Error al traer articulaciones:", error);
    throw error;
  }
};
