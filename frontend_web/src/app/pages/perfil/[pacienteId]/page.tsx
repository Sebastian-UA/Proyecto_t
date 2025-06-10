"use client";
import { Line } from "react-chartjs-2";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getArticulaciones } from "@/app/services/articulacion.api";
import { getMovimientos } from "@/app/services/movimiento.api";
import { getPacientesInfo } from "@/app/services/paciente.api";
import { getMedicionesCompletasPorPaciente } from "@/app/services/sesion.api";
import type { ScriptableContext } from "chart.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  telefono: string;
  genero: string;
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

  // Opciones para lado cuando NO es pron/sup
  const opcionesLadoSimple = [
    { value: "derecha", label: "Derecha" },
    { value: "izquierda", label: "Izquierda" },
  ];


  // Opciones para lado cuando SÍ es pron/sup
  const opcionesLadoPronSup = [
    { value: "derecha - pronación", label: "Derecha - Pronación" },
    { value: "derecha - supinación", label: "Derecha - Supinación" },
    { value: "izquierda - pronación", label: "Izquierda - Pronación" },
    { value: "izquierda - supinación", label: "Izquierda - Supinación" },
  ];


  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<string>("");
  const esPronacionSupinacion = movimientoSeleccionado === "Pronación y Supinación";

  const opcionesLadoActual = esPronacionSupinacion ? opcionesLadoPronSup : opcionesLadoSimple;


  const [ladoSeleccionado, setLadoSeleccionado] = useState<string>(opcionesLadoActual[0].value);
  const movimientosUnicos = Array.from(
    new Map(
      medicionesCompletas
        .filter((med) => med.movimiento && med.movimiento.nombre && med.movimiento?.artnombre)
        .map((med) => [
          med.movimiento.nombre,
          {
            value: med.movimiento.nombre,
            label: `${med.movimiento.artnombre} - ${med.movimiento.nombre}`,
          },
        ])
    ).values()
  );



  useEffect(() => {
    const opcionesLadoActual = movimientoSeleccionado === "Pronación y Supinación" ? opcionesLadoPronSup : opcionesLadoSimple;
    setLadoSeleccionado(opcionesLadoActual[0].value);
  }, [movimientoSeleccionado]);

  useEffect(() => {
    if (movimientosUnicos.length > 0 && movimientoSeleccionado === "") {
      setMovimientoSeleccionado(movimientosUnicos[0].value);
    }
  }, [movimientosUnicos, movimientoSeleccionado]);

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

  const medicionesFiltradas = medicionesCompletas.filter((med) => {
    const movimientoNombre = med.movimiento?.nombre?.toLowerCase().trim();
    const coincideMovimiento =
      movimientoNombre === movimientoSeleccionado.toLowerCase().trim();

    let coincideLado = false;

    if (!esPronacionSupinacion) {
      coincideLado =
        ladoSeleccionado === "todos" ||
        med.lado?.toLowerCase().trim() === ladoSeleccionado.toLowerCase().trim();
    } else {
      if (ladoSeleccionado === "todos") {
        coincideLado = true;
      } else {
        coincideLado =
          med.lado?.toLowerCase().trim() === ladoSeleccionado.toLowerCase().trim();
      }
    }

    return coincideMovimiento && coincideLado;
  });

  // Ordenar mediciones por fecha ascendente para mostrar en el gráfico
  const medicionesOrdenadas = [...medicionesFiltradas].sort((a, b) => {
    const fechaA = a.sesion?.fecha ? new Date(a.sesion.fecha).getTime() : 0;
    const fechaB = b.sesion?.fecha ? new Date(b.sesion.fecha).getTime() : 0;
    return fechaA - fechaB;
  });


  // Preparar datos para el gráfico
  const labels = medicionesOrdenadas.map((_, index) => `Análisis ${index + 1}`);
  // Todos los valores del ángulo mínimo en un solo array
  const anguloMinData = medicionesOrdenadas.map(med =>
    med.anguloMin ?? null
  );

  // Colores de cada punto (para los círculos)
  const coloresPuntos = medicionesOrdenadas.map(med =>
    med.profesional?.profesionalId
      ? "rgba(75,192,192,1)"        // azul cuando hay profesional
      : "rgba(255,165,0,1)"         // naranja cuando no hay profesional
  );


  const anguloMaxData = medicionesOrdenadas.map((med) =>
    med.anguloMax !== null && med.anguloMax !== undefined ? med.anguloMax : 0
  );

  // PARA EL GRAFICO
  const data = {
    labels,
    datasets: [
      {
        label: "Ángulo Mínimo",
        data: medicionesOrdenadas.map((med) => med.anguloMin ?? null),
        spanGaps: true,
        borderWidth: 3,
        backgroundColor: "transparent",
        tension: 0.3,
        pointBackgroundColor: medicionesOrdenadas.map((med) =>
          med.profesional?.profesionalId
            ? "rgba(75,192,192,1)"
            : "rgba(255,165,0,1)"
        ),
        segment: {
          borderColor: (ctx: any) => {
            const med = medicionesOrdenadas[ctx.p0DataIndex];
            return med.profesional?.profesionalId
              ? "rgba(75,192,192,1)"
              : "rgba(255,165,0,1)";
          }
        }
      },
      {
        label: "Ángulo Máximo",
        data: anguloMaxData,
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // TITULO GRAFICO
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text:
          movimientoSeleccionado === "todos"
            ? "Evolución Ángulos Mínimo y Máximo"
            : `Evolución Ángulos para ${movimientoSeleccionado}`,
      },
    },
  };


  return (
    <div className="p-6 space-y-8">
      {/* Info del Paciente */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Perfil del Paciente</h2>
        <p>
          <strong>Nombre:</strong> {paciente.nombre}
        </p>
        <p>
          <strong>Edad:</strong> {paciente.edad} años
        </p>
        <p>
          <strong>RUT:</strong> {paciente.rut}
        </p>
        <p>
          <strong>Telefono:</strong> {paciente.telefono}
        </p>
        <p>
          <strong>Género:</strong> {paciente.genero}
        </p>
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
                const data = await getMedicionesCompletasPorPaciente(
                  parseInt(pacienteId as string)
                );
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
          <div
            key={grupo.id}
            className="bg-gray-100 rounded-2xl p-4 shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4">{grupo.nombre}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {grupo.movimientos.map((mov) => (
                <div
                  key={mov.movimientoId}
                  onClick={() =>
                    router.push(`/pages/camara/${mov.movimientoId}`)
                  }
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
          <div className="mb-4 flex items-center gap-4">
            <div>
              <label className="mr-2 font-medium">Filtrar por movimiento:</label>
              <select
                value={movimientoSeleccionado}
                onChange={(e) => setMovimientoSeleccionado(e.target.value)}
                className="p-2 border rounded-md"
              >
                {movimientosUnicos.map((mov) => (
                  <option key={mov.value} value={mov.value}>
                    {mov.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Lado:</label>
              {(esPronacionSupinacion ? opcionesLadoPronSup : opcionesLadoSimple)
                .slice()
                .map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1">
                    <input
                      type="radio"
                      value={opt.value}
                      checked={ladoSeleccionado === opt.value}
                      onChange={() => setLadoSeleccionado(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
            </div>
          </div>


          <h2 className="text-xl font-bold mb-4">Análisis</h2>
          {medicionesCompletas.length > 0 ? (
            <>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Movimiento</th>
                    <th className="p-2 border">Ángulo Máximo</th>
                    <th className="p-2 border">Ángulo Minimo</th>
                    <th className="p-2 border">Ángulo Máximo Esperado</th>
                    <th className="p-2 border">Ángulo Minimo Esperado</th>
                    <th className="p-2 border">Fecha</th>
                    <th className="p-2 border">Paciente</th>
                    <th className="p-2 border">Profesional</th>
                  </tr>
                </thead>
                <tbody>
                  {medicionesFiltradas.map((med) => (
                    <tr key={med.medicionId}>
                      <td className="p-2 border">{med.movimiento?.nombre}</td>
                      <td className="p-2 border">{med.anguloMax ?? "N/A"}</td>
                      <td className="p-2 border">{med.anguloMin ?? "N/A"}</td>
                      <td className="p-2 border">
                        {med.movimiento.anguloMaxReal ?? "N/A"}
                      </td>
                      <td className="p-2 border">
                        {med.movimiento.anguloMinReal ?? "N/A"}
                      </td>
                      <td className="p-2 border">{med.sesion?.fecha ?? "N/A"}</td>
                      <td className="p-2 border">{med.paciente?.nombre ?? "N/A"}</td>
                      <td className="p-2 border">{med.lado ?? "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Gráfico línea con evolución de ángulo mínimo */}
              <div className="mt-6">
                <Line data={data} options={options} />
              </div>
            </>
          ) : (
            <p>No hay mediciones registradas para este paciente.</p>
          )}
        </div>
      )}
    </div>
  );
}
