"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/entro";
import { useEffect, useState } from "react";
import { getPacientesInfo } from "@/app/services/paciente.api";

// Define el tipo para un paciente
type Paciente = {
  pacienteId: number;
  rut: string;
  nombre: string;
  // puedes agregar más campos si los necesitas
};

const BottomNav = () => {
  const pathname = usePathname();
  const { usuario } = useAuth(); // Obtenemos el usuario logueado
  const [pacienteId, setPacienteId] = useState<number | null>(null);

  // Obtener pacienteId si el usuario es paciente
  useEffect(() => {
    const obtenerPacienteId = async () => {
      if (usuario?.rol === "paciente") {
        try {
          const pacientes: Paciente[] = await getPacientesInfo();
          const pacienteEncontrado = pacientes.find(
            (p: Paciente) => p.rut === usuario.rut
          );
          if (pacienteEncontrado) {
            setPacienteId(pacienteEncontrado.pacienteId);
          }
        } catch (error) {
          console.error("Error al obtener pacientes:", error);
        }
      }
    };

    obtenerPacienteId();
  }, [usuario]);

  // Si no hay usuario, no renderizar la barra
  if (!usuario) return null;

  // Ruta dinámica según el rol
  const rutaInicio =
    usuario.rol === "profesional"
      ? "/pages/paciente"
      : pacienteId
      ? `/pages/perfil/${pacienteId}`
      : "/pages/perfil/";

  const navItems = [
    { name: "Inicio", path: rutaInicio },
    { name: "Cerrar", path: "/pages/login" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: "60px",
        backgroundColor: "#f1f1f1",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: "1px solid #ccc",
      }}
    >
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          style={{
            textDecoration: "none",
            color: pathname === item.path ? "#007bff" : "#333",
            fontWeight: pathname === item.path ? "bold" : "normal",
          }}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
