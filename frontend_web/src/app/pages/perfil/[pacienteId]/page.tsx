"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getArticulaciones } from "@/app/services/articulacion.api";
import { getMovimientos } from "@/app/services/movimiento.api";
import { getPacientesInfo } from "@/app/services/paciente.api";

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
  sexo: string;
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
        <p><strong>Sexo:</strong> {paciente.sexo}</p>
      </div>

      {/* Movimientos agrupados por articulación */}
      {datosAgrupados.map((grupo) => (
        <div key={grupo.id} className="bg-gray-100 rounded-2xl p-4 shadow-md">
          <h3 className="text-xl font-semibold mb-4">{grupo.nombre}</h3>

          <div className="flex flex-wrap gap-4">
            {grupo.movimientos.map((mov) => (
              <div
                key={mov.movimientoId}
                onClick={() => router.push(`/camara/${mov.movimientoId}`)}
                className="w-24 h-24 rounded-full bg-white shadow hover:bg-blue-100 transition cursor-pointer flex items-center justify-center text-center text-sm font-medium p-2"
              >
                <div>
                  <div className="text-2xl mb-1">{mov.imagen_path || "🎯"}</div>
                  <span>{mov.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
