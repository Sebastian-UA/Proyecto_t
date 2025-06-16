"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Modelo
interface Professional {
    id: number;
    nombre: string;
    rut: string;
    correo: string;
    rol: string;
}

// Tipo de contexto
interface ProfessionalContextType {
    professional: Professional | null;
    setProfessional: (professional: Professional | null) => void;
}

// Crear el contexto
const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);

// Provider
export const ProfessionalProvider = ({ children }: { children: ReactNode }) => {
    const [professional, setProfessional] = useState<Professional | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("profesional");
            if (stored) {
                console.log('Datos recuperados de localStorage:', JSON.parse(stored));  // Verifica si se recuperan correctamente
                setProfessional(JSON.parse(stored));
            }
        }
    }, []);

    return (
        <ProfessionalContext.Provider value={{ professional, setProfessional }}>
            {children}
        </ProfessionalContext.Provider>
    );
};

// Hook
export const useProfessional = () => {
    const context = useContext(ProfessionalContext);
    if (!context) {
        throw new Error("useProfessional debe ser usado dentro de un ProfessionalProvider");
    }
    return context;
};
