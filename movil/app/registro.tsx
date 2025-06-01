import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function RegisterScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [rut, setRUT] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");

  const handleRegister = () => {
    if (!nombre || !rut || !edad || !telefono) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    // Aquí podrías guardar en backend o AsyncStorage
    console.log({ nombre, rut, edad, telefono });

    Alert.alert("Registro exitoso", `Paciente ${nombre} registrado.`);
    router.push("/home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Paciente</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="RUT"
        value={rut}
        onChangeText={setRUT}
      />

      <TextInput
        style={styles.input}
        placeholder="Edad"
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <Button title="Registrar Paciente" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
});
