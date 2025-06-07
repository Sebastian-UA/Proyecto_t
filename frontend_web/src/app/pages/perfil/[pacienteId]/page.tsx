"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getArticulaciones } from "@/app/services/articulacion.api";
import { getMovimientos } from "@/app/services/movimiento.api";
import { getPacientesInfo } from "@/app/services/paciente.api";
import { getMedicionesCompletasPorPaciente } from "@/app/services/sesion.api";

interface Movimiento {
  movimientoId: number;
  nombre: string;
  descripcion: string;
  imagen_path?: string;
  detalles: string;
  ArticulacionId: number;
}

interface Articulacion {
  articulacionId: number;
  nombre: string;
}

interface Paciente {
  pacienteId: number;
  nombre: string;
  edad: number;
  rut: string;
}

interface ArticulacionConMovimientos {
  id: number;
  nombre: string;
  movimientos: Movimiento[];
}

export default function PerfilPaciente() {
  const router = useRouter();
  const params = useParams();
  const pacienteId = params.pacienteId;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [datosAgrupados, setDatosAgrupados] = useState<ArticulacionConMovimientos[]>([]);
  const [vista, setVista] = useState<"movimientos" | "analisis">("movimientos");
  const [medicionesCompletas, setMedicionesCompletas] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articulaciones, movimientos, pacientes] = await Promise.all([
          getArticulaciones(),
          getMovimientos(),
          getPacientesInfo(),
        ]);

        const pacienteEncontrado = pacientes.find(
          (p: Paciente) => p.pacienteId === parseInt(pacienteId as string)
        );
        setPaciente(pacienteEncontrado);

        const agrupado = articulaciones
          .map((art: Articulacion) => ({
            id: art.articulacionId,
            nombre: art.nombre,
            movimientos: movimientos.filter(
              (mov: Movimiento) => mov.ArticulacionId === art.articulacionId
            ),
          }))
          .filter((grupo: ArticulacionConMovimientos) => grupo.movimientos.length > 0);

        setDatosAgrupados(agrupado);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    if (pacienteId) {
      fetchData();
    }
  }, [pacienteId]);

  if (!paciente) return <div className="p-4">Cargando perfil...</div>;

  return (
    <div className="p-6 space-y-8">
      {/* Info del Paciente */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Perfil del Paciente</h2>
        <p><strong>Nombre:</strong> {paciente.nombre}</p>
        <p><strong>Edad:</strong> {paciente.edad} años</p>
        <p><strong>RUT:</strong> {paciente.rut}</p>
      </div>

      {/* Botones de navegación */}
      <div className="flex space-x-4">
        <button
          onClick={() => setVista("movimientos")}
          className={`px-4 py-2 rounded-xl font-medium ${vista === "movimientos" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
        >
          Movimientos
        </button>
        <button
          onClick={async () => {
            setVista("analisis");
            if (medicionesCompletas.length === 0) {
              try {
                const data = await getMedicionesCompletasPorPaciente(parseInt(pacienteId as string));
                setMedicionesCompletas(data);
              } catch (err) {
                console.error("Error cargando análisis:", err);
              }
            }
          }}
          className={`px-4 py-2 rounded-xl font-medium ${vista === "analisis" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
        >
          Análisis
        </button>
      </div>

      {/* Vista de movimientos */}
      {vista === "movimientos" ? (
        datosAgrupados.map((grupo) => (
          <div key={grupo.id} className="bg-gray-100 rounded-2xl p-4 shadow-md">
            <h3 className="text-xl font-semibold mb-4">{grupo.nombre}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {grupo.movimientos.map((mov) => (
                <div
                  key={mov.movimientoId}
                  onClick={() => router.push(`/pages/camara/${mov.movimientoId}`)}
                  className="w-32 h-32 rounded-full bg-white shadow-md hover:bg-blue-100 transition cursor-pointer flex flex-col items-center justify-center text-center p-3"
                >
                  {mov.imagen_path ? (
                    <img
                      src={`http://localhost:8000${mov.imagen_path}`}
                      alt={mov.nombre}
                      className="w-20 h-20 object-cover rounded-full mb-2"
                    />
                  ) : (
                    <span className="text-3xl mb-2">🎯</span>
                  )}
                  <span className="text-sm font-medium">{mov.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        // Vista de análisis
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-xl font-bold mb-4">Análisis</h2>
          {medicionesCompletas.length > 0 ? (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Movimiento</th>
                  <th className="p-2 border">Ángulo Máximo</th>
                  <th className="p-2 border">Fecha</th>
                  <th className="p-2 border">Paciente</th>
                  <th className="p-2 border">Profesional</th>
                </tr>
              </thead>
              <tbody>
                {medicionesCompletas.map((med) => (
                  <tr key={med.medicionId}>
                    <td className="p-2 border">{med.movimiento?.nombre}</td>
                    <td className="p-2 border">{med.anguloMax ?? "N/A"}</td>
                    <td className="p-2 border">{med.sesion?.fecha ?? "N/A"}</td>
                    <td className="p-2 border">{med.paciente?.nombre ?? "N/A"}</td>
                    <td className="p-2 border">{med.profesional?.nombre ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>


            </table>
          ) : (
            <p>No hay mediciones registradas para este paciente.</p>
          )}
        </div>
      )}
    </div>
  );
}
