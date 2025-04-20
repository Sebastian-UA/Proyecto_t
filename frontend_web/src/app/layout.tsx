// app/layout.tsx
import "./globals.css";
import BottomNav from "@/components/barra";
import type { ReactNode } from "react";

export const metadata = {
  title: "Mi App",
  description: "App con Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div style={{ paddingBottom: "60px" }}>{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
