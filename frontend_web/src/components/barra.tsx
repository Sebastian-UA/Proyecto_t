"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Medición", path: "/pages/medicion_p" },  // Ruta para 'medicion_p'
    { name: "Reporte", path: "/pages/reporte" },      // Ruta para 'reporte'
    { name: "Historial", path: "/pages/historial" },  // Ruta para 'historial'
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
          href={item.path} // Aquí usamos las rutas absolutas correctas
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
