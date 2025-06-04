import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Inicio" }}
      />
<Stack.Screen
 name="sesion/login"
  options={{ title: "Iniciar Sesión" }}
      />
<Stack.Screen
 name="sesion/registro" 
  options={{ title: "Registro" }} />
    
      <Stack.Screen
       name="medicion/medicion" 
       options={{ title: "Medición" }} />
      <Stack.Screen
       name="reporte/reporte"
       options={{ title: "Reporte" }} />
      <Stack.Screen
       name="historial/historial"
       options={{ title: "Historial" }} />
    </Stack>
  );
}
