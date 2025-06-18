const API_URL = 'http://192.168.1.14:8000';

export const createSesionWithMedicion = async (data: any) => {
  try {
    const response = await fetch(`${API_URL}/sesiones_con_medicion/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al guardar la sesión con medición');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createSesionWithMedicion:', error);
    throw error;
  }
};
