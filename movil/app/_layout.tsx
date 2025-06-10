// app/_layout.tsx
import { Stack } from 'expo-router';
import { ProfessionalProvider } from '@/context/profesional';
import { PatientProvider } from '@/context/paciente';

export default function Layout() {
  return (
    <ProfessionalProvider>
      <PatientProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: "Inicio" }}
          />
          <Stack.Screen
            name="registro"
            options={{ title: "Registro de Paciente" }}
          />
          <Stack.Screen
            name="login"
            options={{ title: "Iniciar Sesión" }}
          />
        </Stack>
      </PatientProvider>
    </ProfessionalProvider>
  );
}

