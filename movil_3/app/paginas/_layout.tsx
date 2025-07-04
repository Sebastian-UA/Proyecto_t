import { Stack } from 'expo-router';
import { ProfessionalProvider } from '@/context/profesional';
import { PatientProvider } from '@/context/paciente';
import { theme } from '@/estilos/themes';

export default function RootLayout() {
    return (
        <ProfessionalProvider>
            <PatientProvider>
                <Stack
                    screenOptions={{
                        headerStyle: { backgroundColor: theme.colors.primary },
                        headerTintColor: theme.colors.buttonText,
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                >
                    {/* Páginas con stack y headers personalizados */}
                    <Stack.Screen name="index" options={{ title: "Inicio" }} />
                    <Stack.Screen name="login" options={{ title: "Iniciar Sesión" }} />
                    <Stack.Screen name="paciente" options={{ title: "Pacientes" }} />
                    <Stack.Screen name="perfilPaciente" options={{ title: "Perfil del Paciente" }} />
                    <Stack.Screen name="registro" options={{ title: "Registro de Profesional" }} />
                    <Stack.Screen name="registroPaciente" options={{ title: "Registro de Paciente" }} />

                    {/* Para que otras páginas se rendericen sin stack acá, se puede usar Slot */}
                    <Stack.Screen name="(otros)" options={{ headerShown: false }} />
                </Stack>
            </PatientProvider>
        </ProfessionalProvider>
    );
}
