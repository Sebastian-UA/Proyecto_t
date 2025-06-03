import { Stack } from "expo-router";

export default function Layout() {
  return (
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
  );
}
