"use client";  // Asegura que este archivo sea un componente cliente

import { useState } from 'react';
import { useRouter } from 'next/navigation';  // Usamos `useRouter` de Next.js
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createProfesionalConUsuario } from '@/app/services/profesional.api';
import { useProfessional } from "@/app/context/profesional";
import { usePatient } from "@/app/context/paciente";
import { useAuth } from "@/app/context/entro";

const LoginPage = () => {
    const { setProfessional } = useProfessional();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para controlar la apertura del modal
    const [formRegistro, setFormRegistro] = useState({
        nombre: '',
        rut: '',
        correo: '',
        contrasena: '',
        especialidad: ''
    });
    const { setPatient } = usePatient();
    const { setUsuario } = useAuth(); // 👈 usar setUsuario

    const router = useRouter();  // Usamos `useRouter` de Next.js

    const handleCorreoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCorreo(event.target.value);
    };

    const handleContrasenaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContrasena(event.target.value);
    };

    const handleRegistroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormRegistro({ ...formRegistro, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, contrasena }),
            });

            if (!response.ok) {
                throw new Error('Correo o contraseña incorrectos');
            }

            const data = await response.json();
            console.log('Usuario autenticado:', data);

            if (data.rol === 'profesional') {
                const profesionalData = {
                    id: data.id,
                    nombre: data.nombre,
                    correo: data.correo,
                    rut: data.rut,
                    rol: data.rol,
                };

                setUsuario(profesionalData); // 👈 guardarlo en el contexto
                localStorage.setItem("usuario", JSON.stringify(profesionalData));

                setProfessional(profesionalData);
                localStorage.setItem("profesional", JSON.stringify(profesionalData));

                // Limpiar paciente si había alguno
                setPatient(null);
                localStorage.removeItem("paciente");

                router.push('/pages/paciente');

            } else if (data.rol === 'paciente') {
                const pacienteData = {
                    id: data.id,
                    nombre: data.nombre,
                    correo: data.correo,
                    rut: data.rut,
                    edad: data.edad,
                    telefono: data.telefono,
                    rol: data.rol,
                };
                setUsuario(pacienteData); // 👈 guardarlo en el contexto
                localStorage.setItem("usuario", JSON.stringify(pacienteData));

                setPatient(pacienteData);
                localStorage.setItem("paciente", JSON.stringify(pacienteData));

                // Limpiar profesional si había alguno
                setProfessional(null);
                localStorage.removeItem("profesional");

                router.push(`/pages/perfil/${data.id}`);

            } else {
                console.warn("Rol desconocido:", data.rol);
            }

        } catch (err) {
            setError('Error de autenticación, intenta de nuevo');
            console.error(err);
        }
    };

    const handleRegistroSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            await createProfesionalConUsuario({
                nombre: formRegistro.nombre,
                rut: formRegistro.rut,
                correo: formRegistro.correo,
                contrasena: formRegistro.contrasena,
                especialidad: formRegistro.especialidad,
                rol: 'profesional'  // Asegúrate que el backend espera esto
            });

            setIsModalOpen(false);  // Cierra el modal
            setFormRegistro({ nombre: '', rut: '', correo: '', contrasena: '', especialidad: '' }); // Limpia el formulario
        } catch (err) {
            console.error("Error en el registro:", err);
            alert("Error al registrar el profesional");
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="correo" className="block text-sm font-semibold text-gray-700">Correo electrónico</label>
                        <input
                            type="email"
                            id="correo"
                            value={correo}
                            onChange={handleCorreoChange}
                            required
                            className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="contrasena" className="block text-sm font-semibold text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            id="contrasena"
                            value={contrasena}
                            onChange={handleContrasenaChange}
                            required
                            className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200 mb-4"
                    >
                        Iniciar sesión
                    </button>
                </form>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-200"
                >
                    Registrarse
                </button>
            </div>

            {/* Modal de registro */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                        <DialogTitle>Registro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <form onSubmit={handleRegistroSubmit}>
                            <div className="space-y-1">
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formRegistro.nombre}
                                    onChange={handleRegistroInputChange}
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
                                <input
                                    type="text"
                                    id="rut"
                                    name="rut"
                                    value={formRegistro.rut}
                                    onChange={handleRegistroInputChange}
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo</label>
                                <input
                                    type="email"
                                    id="correo"
                                    name="correo"
                                    value={formRegistro.correo}
                                    onChange={handleRegistroInputChange}
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <input
                                    type="password"
                                    id="contrasena"
                                    name="contrasena"
                                    value={formRegistro.contrasena}
                                    onChange={handleRegistroInputChange}
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700">Especialidad</label>
                                <input
                                    type="text"
                                    id="especialidad"
                                    name="especialidad"
                                    value={formRegistro.especialidad}
                                    onChange={handleRegistroInputChange}
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                    required
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                                >
                                    Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LoginPage;
