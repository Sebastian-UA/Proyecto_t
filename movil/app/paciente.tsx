// context/PatientContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  id_profesional?: number | null;
}

// Tipo del contexto
interface PatientContextType {
  patient: Patient | null;
  setPatient: (patient: Patient) => void;
  registrarPaciente: (pacienteData: Omit<Patient, 'pacienteId'>) => Promise<void>;
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

  const registrarPaciente = async (pacienteData: Omit<Patient, 'pacienteId'>) => {
    try {
      const response = await fetch('http://192.168.1.19:8000/paciente_con_usuario/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pacienteData),
      });

      if (!response.ok) {
        throw new Error('Error al registrar paciente');
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
