"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPaciente, getPacientesInfo } from "@/app/services/paciente.api"; // 🆕 importar getPacientesInfo

export default function PacientePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]); // 🆕 pacientes reales
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    rut: "",
    edad: "",
    correo: "",
    contrasena: "",
    rol: "",
  });

  // 🆕 cargar pacientes desde el backend
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await getPacientesInfo();
        setPacientes(data);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };
    fetchPacientes();
  }, []);

  const filteredPacientes = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rut.includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createPaciente(form);
      console.log("Paciente creado:", response);

      // 🆕 volver a cargar la lista
      const data = await getPacientesInfo();
      setPacientes(data);

      setIsModalOpen(false);
      setForm({
        nombre: "",
        telefono: "",
        rut: "",
        edad: "",
        correo: "",
        contrasena: "",
        rol: "",
      });
    } catch (error) {
      console.error("Error al crear paciente:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Paciente</h1>

      {/* filtro */}
      <input
        type="text"
        placeholder="Buscar por nombre o RUT"
        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-3 border-b">Nombre</th>
              <th className="px-6 py-3 border-b">RUT</th>
              <th className="px-6 py-3 border-b">Edad</th>
              <th className="px-6 py-3 border-b">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {filteredPacientes.map((paciente, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{paciente.nombre}</td>
                <td className="px-6 py-4 border-b">{paciente.rut}</td>
                <td className="px-6 py-4 border-b">{paciente.edad}</td>
                <td className="px-6 py-4 border-b">{paciente.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botones */}
      <div className="mt-6 flex justify-between">
        <button
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Registrar
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md">
          Continuar
        </button>
      </div>

      {/* Modal */}
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
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol</label>
                <input
                  type="text"
                  id="rol"
                  name="rol"
                  value={form.rol}
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
