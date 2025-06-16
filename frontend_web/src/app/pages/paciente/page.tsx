"use client";

import { useState, useEffect } from "react";
import { usePatient } from "@/app/context/paciente";
import { useProfessional } from "@/app/context/profesional";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPaciente, getPacientesPorProfesional, updatePacienteConUsuario } from "@/app/services/paciente.api";

export default function PacientePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Nuevo estado para la fila seleccionada
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    rut: "",
    edad: "",
    correo: "",
    contrasena: "",
    genero: "",
    rol: "paciente",
  });
  const [editForm, setEditForm] = useState<Record<string, string>>({
    nombre: "",
    telefono: "",
    rut: "",
    edad: "",
    correo: "",
    contrasena: "",
    genero: "",
    rol: "paciente",
    
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPacienteId, setEditingPacienteId] = useState<number | null>(null);
  const handleEditClick = (paciente: any) => {
    setEditForm(paciente);
    setEditingPacienteId(paciente.pacienteId);
    setIsEditModalOpen(true);
  };

  const router = useRouter();  // Aquí se usa useRouter dentro de un componente cliente
  const { professional } = useProfessional();

  useEffect(() => {
  console.log("useEffect disparado, professional:", professional);
  if (!professional) return;

  const fetchPacientes = async () => {
    try {
      const data = await getPacientesPorProfesional(professional.id);
      console.log("Pacientes recibidos:", data);
      setPacientes(data);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  };

  fetchPacientes();
}, [professional]);
  // <- importante que dependa del professional

  const safeSearchTerm = searchTerm?.toLowerCase() || "";
  const pacientesFiltrados = (pacientes || []).filter(paciente => {
    if (!paciente.nombre) return false;
    return paciente.nombre.toLowerCase().includes(safeSearchTerm);
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case "nombre":
      case "genero":
        if (!/^[a-zA-Z\s]*$/.test(value)) {
          alert("El campo solo debe contener letras");
          return;
        }
        break;

      case "telefono":
        if (!/^\d{0,9}$/.test(value)) {
          alert("El teléfono debe tener solo números y máximo 9 dígitos");
          return;
        }
        break;

      case "edad":
        if (!/^\d*$/.test(value) || (value !== "" && parseInt(value, 10) < 0)) {
          alert("La edad debe ser un número positivo");
          return;
        }
        break;

      case "rut":
        if (!/^[0-9]{0,10}-?[0-9kK]?$/.test(value)) {
          alert("RUT inválido. Use solo números y un guion seguido de un dígito o 'K'");
          return;
        }
        break;
    }

    setForm({ ...form, [name]: value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case "nombre":
      case "genero":
        if (!/^[a-zA-Z\s]*$/.test(value)) {
          alert("El campo solo debe contener letras");
          return;
        }
        break;

      case "telefono":
        if (!/^\d{0,9}$/.test(value)) {
          alert("El teléfono debe tener solo números y máximo 9 dígitos");
          return;
        }
        break;

      case "edad":
        if (!/^\d*$/.test(value) || (value !== "" && parseInt(value, 10) < 0)) {
          alert("La edad debe ser un número positivo");
          return;
        }
        break;

      case "rut":
        if (!/^[0-9]{0,8}-?[0-9kK]?$/.test(value)) {
          alert("RUT inválido. Use solo números y un guion seguido de un dígito o 'K'");
          return;
        }
        break;
    }

    setEditForm({ ...editForm, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const key in form) {
      if (form[key as keyof typeof form].trim() === "") {
        alert(`Por favor, completa el campo ${key}`);
        return;
      }
    }

    try {
      const response = await createPaciente(form);
      console.log("Paciente creado:", response);

      if (!professional) {
        console.error("No hay profesional autenticado");
        return;
      }

      const data = await getPacientesPorProfesional(professional.id); // ✅ PASAR EL ID
      setPacientes(data);

      setIsModalOpen(false);
      setForm({
        nombre: "",
        telefono: "",
        rut: "",
        edad: "",
        correo: "",
        contrasena: "",
        genero: "",
        rol: "paciente",
      });
    } catch (error) {
      console.error("Error al crear paciente:", error);
    }
  };


  const { setPatient } = usePatient();  // Desestructurar setPatient desde el contexto
  useEffect(() => {
    console.log("Professional contextt:", professional);
  }, [professional]);

  if (!professional) {
    return <div>Cargando datos del profesional...</div>;
  }

  const handleRowClick = (index: number) => {
    if (index !== null && pacientes[index]) {
      const pacienteSeleccionado = pacientes[index];
      setPatient(pacienteSeleccionado);  // Guardar en contexto

      // Redirigir inmediatamente a la página de perfil con el ID del paciente
      router.push(`/pages/perfil/${pacienteSeleccionado.pacienteId}`); // O .pacienteId si tu API usa ese nombre
    }
  };



  const handleContinuarClick = () => {
    if (selectedIndex !== null && pacientes[selectedIndex]) {
      const pacienteSeleccionado = pacientes[selectedIndex];
      setPatient(pacienteSeleccionado);  // Almacenar el paciente en el contexto global
      console.log("Paciente ID:", pacienteSeleccionado.pacienteId);

      if (professional) {  // Verifica si professional está disponible
        console.log("Profesional ID:", professional.id);  // Debería mostrar el ID correctamente
        router.push(`/pages/articulacion/${pacienteSeleccionado.pacienteId}`);  // Navegar solo si professional existe
      } else {
        console.error("El contexto del profesional no está disponible. No se puede continuar.");
        // Mostrar un mensaje de error o manejar el flujo de manera diferente
      }
    } else {
      console.log("Por favor, selecciona un paciente");
    }
  };


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Paciente</h1>

      <input
        type="text"
        placeholder="Buscar por nombre o RUT"
        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-3 border-b">Nombre</th>
              <th className="px-6 py-3 border-b">RUT</th>
              <th className="px-6 py-3 border-b">Edad</th>
              <th className="px-6 py-3 border-b">Teléfono</th>
              <th className="px-6 py-3 border-b">Género</th>

            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((paciente, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${selectedIndex === index ? "bg-blue-100" : ""}`}
              >
                <td className="px-6 py-4 border-b cursor-pointer" onClick={() => handleRowClick(index)}>
                  {paciente.nombre}
                </td>
                <td className="px-6 py-4 border-b cursor-pointer" onClick={() => handleRowClick(index)}>
                  {paciente.rut}
                </td>
                <td className="px-6 py-4 border-b cursor-pointer" onClick={() => handleRowClick(index)}>
                  {paciente.edad}
                </td>
                <td className="px-6 py-4 border-b cursor-pointer" onClick={() => handleRowClick(index)}>
                  {paciente.telefono}
                </td>
                <td className="px-6 py-4 border-b cursor-pointer" onClick={() => handleRowClick(index)}>
                  {paciente.genero}
                </td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(paciente);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Registrar
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={handleContinuarClick}
        >
          Continuar
        </button>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updatePacienteConUsuario(editingPacienteId!, editForm);

                  if (!professional) {
                    console.error("No hay profesional autenticado");
                    return;
                  }

                  const data = await getPacientesPorProfesional(professional.id); // ✅ aquí pasas el ID
                  setPacientes(data);
                  setIsEditModalOpen(false);
                } catch (error) {
                  console.error("Error al actualizar paciente:", error);
                }
              }}

            >
              {["nombre", "rut", "edad", "telefono", "correo", "genero"].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === "edad" ? "number" : "text"}
                    name={field}
                    value={editForm[field] || ""}
                    onChange={handleEditInputChange}
                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  />
                </div>
              ))}
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Registro Persona</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
                <input
                  type="text"
                  id="rut"
                  name="rut"
                  value={form.rut}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad</label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={form.edad}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={form.correo}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="genero" className="block text-sm font-medium text-gray-700">Género</label>
                <input
                  type="text"
                  id="genero"
                  name="genero"
                  value={form.genero}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
