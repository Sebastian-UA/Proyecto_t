import { Stack } from 'expo-router';
import { ProfessionalProvider } from '@/context/profesional';
import { PatientProvider } from '@/context/paciente';

export default function Layout() {
  return (
    <ProfessionalProvider>
      <PatientProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#007bff' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Inicio" }} />
          <Stack.Screen name="registro" options={{ title: "Registro de Paciente" }} />
          <Stack.Screen name="paciente" options={{ title: "Pacientes" }} />
          <Stack.Screen name="login" options={{ title: "Iniciar Sesión" }} />
          <Stack.Screen name="perfilPaciente" options={{ title: "Perfil del Paciente" }} />
          <Stack.Screen name="movimientos/SelecExt" options={{ title: "Selección de Extremidad" }} />
          <Stack.Screen name="movimientos/SelecMov/[extremidad]" options={{ title: "Selección de Movimiento" }} />
          <Stack.Screen name="medicion/[movimiento]" options={{ title: "Medición del Movimiento" }} />
        </Stack>
      </PatientProvider>
    </ProfessionalProvider>
  );
}
