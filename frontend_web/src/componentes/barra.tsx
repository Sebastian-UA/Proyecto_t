import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Medición", path: "/medicion" },
    { name: "Reporte", path: "/reporte" },
    { name: "Historial", path: "/historial" },
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
          to={item.path}
          style={{
            textDecoration: "none",
            color: location.pathname === item.path ? "#007bff" : "#333",
            fontWeight: location.pathname === item.path ? "bold" : "normal",
          }}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
