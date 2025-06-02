// app/registro.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createProfesionalConUsuario } from '@/services/profesional.api';

const RegistroScreen = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    correo: '',
    contrasena: '',
    especialidad: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await createProfesionalConUsuario({
        ...form,
        rol: 'profesional',
      });

      Alert.alert('Registro exitoso', 'Ahora puedes iniciar sesión');
      router.back(); // Vuelve al login
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'No se pudo registrar el profesional');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro Profesional</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={form.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="RUT"
        value={form.rut}
        onChangeText={(text) => handleChange('rut', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={form.correo}
        onChangeText={(text) => handleChange('correo', text)}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={form.contrasena}
        onChangeText={(text) => handleChange('contrasena', text)}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Especialidad"
        value={form.especialidad}
        onChangeText={(text) => handleChange('especialidad', text)}
      />

      <Button title="Registrar" onPress={handleSubmit} />
      <View style={{ marginTop: 20 }}>
        <Button title="Volver al Login" onPress={() => router.back()} />
      </View>
    </View>
  );
};

export default RegistroScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
});
