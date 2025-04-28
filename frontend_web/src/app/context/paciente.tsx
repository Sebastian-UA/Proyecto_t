// src/context/PatientContext.tsx
"use client"
import React, { createContext, useContext, useState, ReactNode } from "react";

// Definir el tipo del paciente (puedes ajustarlo según tu modelo)
interface Patient {
    pacienteId: number;  // <- no 'id', sino 'pacienteId' como lo usas en tu página
    nombre: string;
    rut: string;
    edad: number;
    telefono: string;
    correo: string;
    contrasena: string;
    rol: string;
}  

// Definir el contexto con un valor inicial
interface PatientContextType {
  patient: Patient | null;
  setPatient: (patient: Patient) => void;
}

// Crear el contexto con un valor por defecto
const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Crear el Provider para envolver la aplicación y proporcionar el contexto
export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatient] = useState<Patient | null>(null);

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

// Crear un hook para usar el contexto en otros componentes
export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient debe ser usado dentro de un PatientProvider");
  }
  return context;
};
