const API_URL = "http://localhost:8000"; // Asegúrate de que esta URL sea la correcta

// Obtener todos los movimientos
export const getMovimientos = async () => {
  try {
    const response = await fetch(`${API_URL}/movimientos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los movimientos");
    }

    const movimientos = await response.json();
    return movimientos;
  } catch (error) {
    console.error("Error al traer movimientos:", error);
    throw error;
  }
};

// Obtener movimientos por articulación
export const getMovimientosByArticulacion = async (articulacionId: number) => {
    try {
      const response = await fetch(`${API_URL}/movimientos/articulacion/${articulacionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error al obtener los movimientos para la articulación con ID ${articulacionId}`);
      }
  
      const movimientos = await response.json();
      return movimientos;
    } catch (error) {
      console.error(`Error al traer movimientos para la articulación con ID ${articulacionId}:`, error);
      throw error;
    }
  };
  