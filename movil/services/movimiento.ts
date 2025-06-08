const API_URL = 'http:// 192.168.1.19'; // cambia si usas IP real

export const getMovimientoById = async (movimientoId: number) => {
  try {
    const response = await fetch(`${API_URL}/movimientos/${movimientoId}`);
    if (!response.ok) throw new Error('Error al obtener movimiento');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getMovimientosByArticulacion = async (articulacionId: number) => {
  try {
    const response = await fetch(`${API_URL}/movimientos/articulacion/${articulacionId}`);
    if (!response.ok) throw new Error('Error al obtener movimientos');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
