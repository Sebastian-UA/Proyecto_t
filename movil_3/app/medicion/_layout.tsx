// app/medicion/_layout.tsx
import { Stack } from 'expo-router';
import { theme } from '@/estilos/themes';

export default function MedicionLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.buttonText,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="[movimiento]"
        options={{ title: "Medición del Movimiento" }}
      />
    </Stack>
  );
}
