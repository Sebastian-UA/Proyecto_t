// app/index.tsx
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();

    // Puedes redirigir a la página de pacientes al hacer clic en un botón
    const handleRedirectToPacientePage = () => {
        router.push("/pacientes"); // Redirige a la página de pacientes
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-6">Bienvenido a la Aplicación de Articulaciones</h1>
            <button
                className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700"
                onClick={handleRedirectToPacientePage}
            >
                Ir a la lista de pacientes
            </button>
        </div>
    );
}
