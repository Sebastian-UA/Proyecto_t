"use client"
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BottomNav from "@/componentes/barra";
import Medicion from "./pages/medicion_p";
import Reporte from "./pages/reporte";
import Historial from "./pages/historial";

function App() {
  return (
    <Router>
      <div style={{ paddingBottom: "60px" }}>
        <Routes>
          <Route path="/medicion" element={<Medicion />} />
          <Route path="/reporte" element={<Reporte />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
