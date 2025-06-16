"use client";

import "./globals.css";
import BottomNav from "@/components/barra";
import { PatientProvider } from "@/app/context/paciente";
import { ProfessionalProvider } from "@/app/context/profesional";
import { AuthProvider, useAuth } from "@/app/context/entro";
import { usePathname } from "next/navigation"; // <-- importante
import type { ReactNode } from "react";

function LayoutWithAuth({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();
  const pathname = usePathname();

  if (cargando) return null;

  const rutasSinBottomNav = ["/pages/login"]; // puedes agregar más si quieres

  const mostrarBottomNav = usuario && !rutasSinBottomNav.includes(pathname);

  return (
    <>
      <ProfessionalProvider>
        <PatientProvider>
          <div style={{ paddingBottom: "60px" }}>{children}</div>
        </PatientProvider>
      </ProfessionalProvider>

      {mostrarBottomNav && <BottomNav />}
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <LayoutWithAuth>{children}</LayoutWithAuth>
        </AuthProvider>
      </body>
    </html>
  );
}
