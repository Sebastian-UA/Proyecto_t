// app/movimientos/_layout.tsx
import { Stack } from 'expo-router';
import { theme } from '@/estilos/themes';

export default function MovimientosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.buttonText,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="SelecExt" options={{ title: "Selección de Extremidad" }} />
      <Stack.Screen name="SelecMov/[extremidad]" options={{ title: "Selección de Movimiento" }} />
    </Stack>
  );
}
