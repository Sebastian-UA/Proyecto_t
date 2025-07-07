// app/logout.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';

export default function LogoutScreen() {
  const router = useRouter();
  const { setPatient } = usePatient();
  const { setProfessional } = useProfessional();

  useEffect(() => {
    setPatient(null);
    setProfessional(null);

    // Esperar un poco para evitar conflictos con otros hooks aún activos
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return null; // O puedes mostrar un spinner si prefieres
}
