"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getArticulaciones } from "@/app/services/articulacion.api";
import { usePatient } from "@/app/context/paciente"; // importa el contexto


interface Articulacion {
    articulacionId: number;
    nombre: string;
    imagen_path?: string;
}

export default function ArticulacionPage() {
    const [articulaciones, setArticulaciones] = useState<Articulacion[]>([]);
    const { pacienteId } = useParams(); // Obtienes el pacienteId desde la URL
    const { patient } = usePatient(); // Obtienes el paciente desde el contexto
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getArticulaciones();
                setArticulaciones(data);
            } catch (error) {
                console.error("Error al cargar articulaciones:", error);
            }
        };

        fetchData();
    }, []);

    const handleSelectArticulacion = (articulacion: Articulacion) => {
        console.log(`Paciente ID desde Contexto: ${patient?.pacienteId}`);
        console.log(`Articulación seleccionada: ${articulacion.nombre}`);
        router.push(`/pages/movimientos/articulacion/${articulacion.articulacionId}`);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Selecciona una Articulación</h1>

            {/* Mostrar los IDs */}
            <div className="text-center mb-6">
                <p className="text-lg">Paciente ID desde Contexto: {patient?.pacienteId ?? "No disponible"}</p>
            </div>

            {articulaciones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articulaciones.map((articulacion) => (
                        <div
                            key={articulacion.articulacionId}
                            className="bg-white w-80 h-80 rounded-full shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden transform hover:scale-105 transition-all flex flex-col items-center justify-center p-6"
                            onClick={() => handleSelectArticulacion(articulacion)}
                        >
                            {articulacion.imagen_path && (
                                <img
                                    src={`http://localhost:8000${articulacion.imagen_path}`}
                                    alt={articulacion.nombre}
                                    className="w-45 h-45 object-contain scale-140 mx-auto mb-4 rounded-full"
                                />
                            )}
                            <div className="p-4 text-center">
                                <h2 className="text-xl font-semibold">{articulacion.nombre}</h2>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">Cargando articulaciones...</p>
            )}
        </div>
    );
}
