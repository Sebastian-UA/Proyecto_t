const API_URL = "http://localhost:8000";

export const createProfesionalConUsuario = async (data: any) => {
  try {
    const response = await fetch(`${API_URL}/profesional_con_usuario/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear profesional con usuario");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error al crear profesional con usuario:", error);
    throw error;
  }
};


export const createProfesional = async (data: any) => {
  try {
    const response = await fetch(`${API_URL}/profesionales/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear profesional");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error al crear profesional:", error);
    throw error;
  }
};

export const getProfesionales = async () => {
  try {
    const response = await fetch(`${API_URL}/profesionales/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los profesionales");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener profesionales:", error);
    throw error;
  }
};

export const getProfesionalById = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/profesionales/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el profesional");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener el profesional:", error);
    throw error;
  }
};
