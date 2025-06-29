import { Stack } from 'expo-router';
import { theme } from '@/estilos/themes';

export default function AnalisisLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="historialMediciones"
        options={{
          title: 'Historial de Mediciones',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.buttonText,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="analisisPaciente"
        options={{
          title: 'Análisis del Movimiento',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.buttonText,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
