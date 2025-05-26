// src/context/PatientContext.tsx
"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

  // Envolver setPatient para guardar en localStorage
  const setPatient = (patient: Patient) => {
    setPatientState(patient);
    if (typeof window !== "undefined") {
      localStorage.setItem("paciente", JSON.stringify(patient));
    }
  };

  // Restaurar desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("paciente");
      if (stored) {
        console.log("Paciente restaurado desde localStorage:", JSON.parse(stored));
        setPatientState(JSON.parse(stored));
      }
    }
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
    throw new Error("usePatient debe ser usado dentro de un PatientProvider");
  }
  return context;
};
