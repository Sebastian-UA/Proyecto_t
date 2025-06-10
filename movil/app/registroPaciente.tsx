// app/registroPaciente.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createPaciente } from '@/services/paciente.api';

const RegistroPacienteScreen = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    edad: '',
    telefono: '',
    correo: '',
    contrasena: '',
    rol: 'paciente',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await createPaciente(form);
      Alert.alert('Éxito', 'Paciente registrado correctamente');
      router.back();
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      Alert.alert('Error', 'No se pudo registrar el paciente');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Paciente</Text>

      {(['nombre', 'rut', 'edad', 'telefono', 'correo', 'contrasena'] as const).map((key) => (
        <TextInput
          key={key}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          style={styles.input}
          value={form[key]}
          onChangeText={(text) => handleChange(key, text)}
          secureTextEntry={key === 'contrasena'}
          keyboardType={key === 'edad' ? 'numeric' : 'default'}
        />
      ))}

      <Button title="Registrar" onPress={handleSubmit} />
      <View style={{ marginTop: 16 }}>
        <Button title="Cancelar" onPress={() => router.back()} color="gray" />
      </View>
    </View>
  );
};

export default RegistroPacienteScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 5 },
});
