// context/PatientContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfessional } from './profesional';

// Tipo del paciente
interface Patient {
  pacienteId: number;
  nombre: string;
  rut: string;
  edad: string;
  telefono: string;
  correo: string;
  contrasena: string;
  rol: string;
  genero: string;
  profesionalId?: number | null;
}

// Tipo del contexto
interface PatientContextType {
  patient: Patient | null;
  setPatient: (patient: Patient | null) => void;
  registrarPaciente: (pacienteData: any) => Promise<void>;
}

// Crear el contexto
const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Provider
export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatientState] = useState<Patient | null>(null);
  const { professional } = useProfessional();

  const setPatient = async (patient: Patient | null) => {
    setPatientState(patient);
    try {
      if (patient) {
        await AsyncStorage.setItem('paciente', JSON.stringify(patient));
      } else {
        await AsyncStorage.removeItem('paciente'); // Limpia al cerrar sesión
      }
    } catch (error) {
      console.error('Error al guardar/eliminar paciente en AsyncStorage:', error);
    }
  };

  const registrarPaciente = async (pacienteData: any) => {
    try {
      const pacienteConProfesional = {
        ...pacienteData,
        profesionalId: professional?.profesionalId ?? 1,
      };

      const response = await fetch('http://192.168.1.14:8000/paciente_con_usuario/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pacienteConProfesional),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        console.error('Detalle del error backend:', errorDetail);
        throw new Error('Error al registrar paciente: ' + errorDetail);
      }

      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      throw error;
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
    <PatientContext.Provider value={{ patient, setPatient, registrarPaciente }}>
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
