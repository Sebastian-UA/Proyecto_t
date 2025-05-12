"use client";  // Esta línea debe seguir aquí para el cliente

import "./globals.css";
import BottomNav from "@/components/barra";
import { PatientProvider } from "@/app/context/paciente";
import { ProfessionalProvider } from "@/app/context/profesional";
import type { ReactNode } from "react";

// Mueve `metadata` fuera de este componente, en un archivo de servidor
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ProfessionalProvider>
          <PatientProvider>
            <div style={{ paddingBottom: "60px" }}>
              {children}
            </div>
          </PatientProvider>
        </ProfessionalProvider>
        <BottomNav />
      </body>
    </html>
  );
}
