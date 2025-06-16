// context/ProfessionalContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Modelo
type Profesional = {
  profesionalId: number;
  nombre: string;
  correo: string;
  rut: string;
  rol: string;
  pacienteSeleccionado?: {
    pacienteId: number;
    nombre: string;
    rut: string;
    edad: number;
    telefono: string;
    correo: string;
    genero: string;
    id_profesional: number | null;
  } | null;
};

type ProfessionalContextType = {
  professional: Profesional | null;
  setProfessional: (profesional: Profesional) => void;
  setPacienteSeleccionado: (paciente: Profesional['pacienteSeleccionado']) => void;
};

// Crear el contexto
const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);

// Provider
export const ProfessionalProvider = ({ children }: { children: ReactNode }) => {
  const [professional, setProfessionalState] = useState<Profesional | null>(null);

  // Envolver setProfessional para guardar en AsyncStorage
  const setProfessional = async (profesional: Profesional) => {
    setProfessionalState(profesional);
    try {
      await AsyncStorage.setItem("profesional", JSON.stringify(profesional));
    } catch (error) {
      console.error("Error al guardar profesional en AsyncStorage:", error);
    }
  };

  // Función para actualizar el paciente seleccionado
  const setPacienteSeleccionado = async (paciente: Profesional['pacienteSeleccionado']) => {
    if (professional) {
      const updatedProfessional = {
        ...professional,
        pacienteSeleccionado: paciente
      };
      setProfessionalState(updatedProfessional);
      try {
        await AsyncStorage.setItem("profesional", JSON.stringify(updatedProfessional));
      } catch (error) {
        console.error("Error al guardar paciente seleccionado en AsyncStorage:", error);
      }
    }
  };

  // Restaurar al montar
  useEffect(() => {
    const loadProfessional = async () => {
      try {
        const stored = await AsyncStorage.getItem("profesional");
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log("Profesional restaurado desde AsyncStorage:", parsed);
          setProfessionalState(parsed);
        }
      } catch (error) {
        console.error("Error al cargar profesional desde AsyncStorage:", error);
      }
    };

    loadProfessional();
  }, []);

  return (
    <ProfessionalContext.Provider value={{ professional, setProfessional, setPacienteSeleccionado }}>
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
