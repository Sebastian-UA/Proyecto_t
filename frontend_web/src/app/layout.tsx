// app/layout.tsx
import "./globals.css";
import BottomNav from "@/components/barra";
import { PatientProvider } from "@/app/context/paciente";  // Importa el PatientProvider
import type { ReactNode } from "react";

export const metadata = {
  title: "Mi App",
  description: "App con Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Envuelve el contenido con el PatientProvider */}
        <PatientProvider>
          <div style={{ paddingBottom: "60px" }}>
            {children}
          </div>
        </PatientProvider>
        <BottomNav />
      </body>
    </html>
  );
}
