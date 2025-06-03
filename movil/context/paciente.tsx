// context/PatientContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipo del paciente
interface Patient {
  pacienteId: number;
  nombre: string;
  rut: string;
  edad: number;
  telefono: string;
  correo: string;
  contrasena: string;
  rol: string;
}

// Tipo del contexto
interface PatientContextType {
  patient: Patient | null;
  setPatient: (patient: Patient) => void;
}

// Crear el contexto
const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Provider
export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatientState] = useState<Patient | null>(null);

  const setPatient = async (patient: Patient) => {
    setPatientState(patient);
    try {
      await AsyncStorage.setItem('paciente', JSON.stringify(patient));
    } catch (error) {
      console.error('Error al guardar paciente en AsyncStorage:', error);
    }
  };

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const stored = await AsyncStorage.getItem('paciente');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Paciente restaurado desde AsyncStorage:', parsed);
          setPatientState(parsed);
        }
      } catch (error) {
        console.error('Error al cargar paciente desde AsyncStorage:', error);
      }
    };

    loadPatient();
  }, []);

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

// Hook para usar el contexto
export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient debe ser usado dentro de un PatientProvider');
  }
  return context;
};
