// Configuración centralizada de la API
export const API_CONFIG = {
  // URL base de la API
  BASE_URL: 'http://192.168.1.7:8000',
  
  // Endpoints específicos
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/login',
    
    // Usuarios
    USUARIOS: '/usuarios/',
    
    // Profesionales
    PROFESIONALES: '/profesionales/',
    PROFESIONAL_CON_USUARIO: '/profesional_con_usuario/',
    
    // Pacientes
    PACIENTES: '/pacientes/',
    PACIENTE_CON_USUARIO: '/paciente_con_usuario/',
    PACIENTES_DETALLE: '/pacientes/detalle',
    PACIENTE_DETALLE_POR_ID: (id: number) => `/pacientes/detalles/${id}`,

    // Articulaciones
    ARTICULACIONES: '/articulaciones/',
    
    // Movimientos
    MOVIMIENTOS: '/movimientos/',
    
    // Sesiones
    SESIONES: '/sesiones/',
    SESIONES_MEDICION: '/sesiones_con_medicion/',
    
    // Mediciones
    MEDICIONES: '/mediciones/',
    
    // Videos de análisis
    ANALIZAR_VIDEO: '/analizar_video/',
  },
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función helper para hacer requests con configuración por defecto
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  const config: RequestInit = {
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    },
    ...options,
  };
  
  return fetch(url, config);
};

export const fetchArticulaciones = async () => {
  const response = await apiGet(API_CONFIG.ENDPOINTS.ARTICULACIONES);
  if (!response.ok) {
    throw new Error('Error al obtener las articulaciones');
  }
  return response.json(); // devuelve un arreglo con las articulaciones
};

// Función helper para requests GET
export const apiGet = async (endpoint: string): Promise<Response> => {
  return apiRequest(endpoint, { method: 'GET' });
};

// Función helper para requests POST
export const apiPost = async (endpoint: string, data: any): Promise<Response> => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Función para obtener detalle de paciente por ID
export const fetchDetallePacientePorId = async (pacienteId: number) => {
  const response = await apiGet(`${API_CONFIG.ENDPOINTS.PACIENTE_DETALLE_POR_ID(pacienteId)}`);
  if (!response.ok) throw new Error('Error al obtener el detalle del paciente');
  return response.json();
};


// Función helper para requests PUT
export const apiPut = async (endpoint: string, data: any): Promise<Response> => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Función helper para requests DELETE
export const apiDelete = async (endpoint: string): Promise<Response> => {
  return apiRequest(endpoint, { method: 'DELETE' });
}; 