import { API_CONFIG, apiPost, apiGet } from '@/config/api';

// Obtener todos los movimientos
export const getMovimientos = async () => {
  try {
    const response = await apiGet('/movimientos/');
    
    if (!response.ok) {
      throw new Error('Error al obtener los movimientos');
    }
    
    const movimientos = await response.json();
    return movimientos;
  } catch (error) {
    console.error('❌ Error al traer movimientos:', error);
    throw error;
  }
};

// Obtener un movimiento por su id
export const getMovimientoById = async (movimientoId: number) => {
  try {
    const response = await apiGet(`/movimientos/${movimientoId}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener el movimiento con ID ${movimientoId}`);
    }
    
    const movimiento = await response.json();
    return movimiento;
  } catch (error) {
    console.error(`❌ Error al traer el movimiento con ID ${movimientoId}:`, error);
    throw error;
  }
};

// Obtener movimientos por articulación
export const getMovimientosByArticulacion = async (articulacionId: number) => {
  try {
    const response = await apiGet(`/movimientos/articulacion/${articulacionId}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener los movimientos para la articulación con ID ${articulacionId}`);
    }
    
    const movimientos = await response.json();
    return movimientos;
  } catch (error) {
    console.error(`❌ Error al traer movimientos para la articulación con ID ${articulacionId}:`, error);
    throw error;
  }
};

export const createSesionWithMedicion = async (data: any) => {
  try {
    const response = await apiPost('/sesiones_con_medicion/', data);
    
    if (!response.ok) {
      throw new Error('Error al guardar la sesión con medición');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error en createSesionWithMedicion:', error);
    throw error;
  }
};
