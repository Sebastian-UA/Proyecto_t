"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMovimientosByArticulacion } from "@/app/services/movimiento.api";
import { usePatient } from "@/app/context/paciente";

interface Movimiento {
  movimientoId: number;
  nombre: string;
  descripcion: string;
  imagen_path?: string;
  detalles: string;
}

export default function MovimientoPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const { articulacionId } = useParams();
  const { patient } = usePatient();
  const router = useRouter();

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        if (articulacionId) {
          const data = await getMovimientosByArticulacion(Number(articulacionId));
          setMovimientos(data);
        }
      } catch (error) {
        console.error("Error al cargar los movimientos:", error);
      }
    };

    fetchMovimientos();
  }, [articulacionId]);

  if (movimientos.length === 0) {
    return <div className="text-center">Cargando movimientos...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Seleccione un Movimiento</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {movimientos.map((movimiento) => (
          <div
            key={movimiento.movimientoId}
            className="bg-white w-80 h-80 rounded-full shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden transform hover:scale-105 transition-all flex flex-col items-center justify-center p-6"
            onClick={() => router.push(`/pages/camara/${movimiento.movimientoId}`)} // Redirección
          >
            {movimiento.imagen_path && (
              <img
                src={`http://localhost:8000${movimiento.imagen_path}`}
                alt={movimiento.nombre}
                className="w-45 h-45 object-contain scale-140 mx-auto mb-4 rounded-full"
              />
            )}
            <div className="p-4 text-center">
              <h2 className="text-2xl font-semibold mb-4">{movimiento.nombre}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
