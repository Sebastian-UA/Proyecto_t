import { Stack } from 'expo-router';

export default function AnalisisLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="historialMediciones"
        options={{
          title: 'Historial de Mediciones',
          headerStyle: {
            backgroundColor: '#007bff',
          },
          headerTintColor: '#fff',
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
            backgroundColor: '#007bff',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
