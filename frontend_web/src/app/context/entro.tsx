import { createContext, useContext, useState, useEffect } from "react";

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rut: string;
  rol: "profesional" | "paciente";
};

interface AuthContextProps {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  cargando: boolean;
}

// ✅ creás el contexto con el tipo completo
const AuthContext = createContext<AuthContextProps>({
  usuario: null,
  setUsuario: () => {}, // esto es necesario para que compile
  cargando: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
    setCargando(false);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook personalizado para acceder al contexto
export const useAuth = () => useContext(AuthContext);
