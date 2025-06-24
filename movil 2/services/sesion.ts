import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_CONFIG, apiPost, apiGet } from '@/config/api';

export const login = async (correo: string, contrasena: string) => {
  try {
    const response = await apiPost(API_CONFIG.ENDPOINTS.LOGIN, { correo, contrasena });
    
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
};

export const cerrarSesion = async (
  setPatient: (patient: any) => void,
  setProfessional: (professional: any) => void,
  navigateToLogin: () => void
) => {
  try {
    // Limpiar AsyncStorage de manera paralela
    await Promise.all([
      AsyncStorage.removeItem('paciente'),
      AsyncStorage.removeItem('profesional')
    ]);
    
    // Limpiar contextos
    setPatient(null);
    setProfessional(null);
    
    console.log('✅ Sesión cerrada exitosamente');
    
    // Redirigir al login usando la función de navegación
    navigateToLogin();
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    Alert.alert(
      'Error',
      'Hubo un problema al cerrar la sesión. Inténtalo de nuevo.',
      [{ text: 'OK' }]
    );
    throw error;
  }
};

export const limpiarDatosSesion = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem('paciente'),
      AsyncStorage.removeItem('profesional')
    ]);
    console.log('✅ Datos de sesión limpiados');
  } catch (error) {
    console.error('❌ Error al limpiar datos de sesión:', error);
    throw error;
  }
};

export const createSesionWithMedicion = async (data: any) => {
  try {
    const response = await apiPost('/sesiones_con_medicion/', data);
    
    if (!response.ok) {
      throw new Error('Error al crear sesión con medición');
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('❌ Error al crear sesión con medición:', error);
    throw error;
  }
};
