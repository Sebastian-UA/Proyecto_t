import { createContext, useContext, useState, ReactNode } from "react";

type Profesional = {
  profesionalId: number;
  nombre: string;
  correo: string;
  rut: string;
  rol: string;
};

type ProfessionalContextType = {
  professional: Profesional | null;
  setProfessional: (profesional: Profesional | null) => void;
};

const ProfessionalContext = createContext<ProfessionalContextType>({
  professional: null,
  setProfessional: () => {},
});

export const ProfessionalProvider = ({ children }: { children: ReactNode }) => {
  const [professional, setProfessional] = useState<Profesional | null>(null);

  return (
    <ProfessionalContext.Provider value={{ professional, setProfessional }}>
      {children}
    </ProfessionalContext.Provider>
  );
};

export const useProfessional = () => useContext(ProfessionalContext);
export { ProfessionalContext };
