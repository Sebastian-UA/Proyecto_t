// Configuración de rutas para Expo Router
export const ROUTES = {
  // Rutas principales
  HOME: '/paginas',
  LOGIN: '/paginas/login',
  REGISTRO: '/paginas/registro',
  
  // Rutas de paciente
  PACIENTE: '/paginas/paciente',
  PERFIL_PACIENTE: '/paginas/perfilPaciente',
  
  // Rutas de movimientos
  SELECCION_EXTREMIDAD: '/movimientos/SelecExt',
  SELECCION_MOVIMIENTO: (extremidad: string) => `/movimientos/SelecMov/${extremidad}`,
  MEDICION: (movimiento: string) => `/medicion/${movimiento}`,
  
  // Rutas de análisis
  ANALISIS_PACIENTE: '/analisis/analisisPaciente',
  HISTORIAL_MEDICIONES: '/analisis/historialMediciones',
} as const;

// Función helper para navegación segura
export const navigateSafely = (router: any, route: string, params?: any) => {
  try {
    if (params) {
      router.push(route as any);
    } else {
      router.push(route as any);
    }
  } catch (error) {
    console.error('❌ Error en navegación:', error);
    // Fallback: intentar con replace
    try {
      router.replace(route as any);
    } catch (fallbackError) {
      console.error('❌ Error en fallback de navegación:', fallbackError);
    }
  }
}; 