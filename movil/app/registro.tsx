import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaskedTextInput } from 'react-native-mask-text';
import { createProfesionalConUsuario } from '@/services/profesional.api';

const RegistroScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    if (!form.nombre || !form.rut || !form.correo || !form.contrasena || !form.especialidad) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.correo)) {
      Alert.alert('Correo inválido', 'Ingresa un correo válido');
      return;
    }

    const rutLimpio = form.rut.replace(/[.-]/g, '');

    setLoading(true);
    try {
      await createProfesionalConUsuario({
        ...form,
        rut: rutLimpio,
        rol: 'profesional',
      });

      Alert.alert('Registro exitoso', 'Ahora puedes iniciar sesión');
      router.back();
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'No se pudo registrar el profesional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro Profesional</Text>

      <MaskedTextInput
        style={styles.input}
        placeholder="Nombre"
        value={form.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
      />

      <MaskedTextInput
        style={styles.input}
        placeholder="RUT"
        mask="99.999.999-999"
        value={form.rut}
        onChangeText={(text) => handleChange('rut', text)}
        keyboardType="default"
      />

      <MaskedTextInput
        style={styles.input}
        placeholder="Correo"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.correo}
        onChangeText={(text) => handleChange('correo', text)}
      />

      <MaskedTextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={form.contrasena}
        onChangeText={(text) => handleChange('contrasena', text)}
      />

      <MaskedTextInput
        style={styles.input}
        placeholder="Especialidad"
        value={form.especialidad}
        onChangeText={(text) => handleChange('especialidad', text)}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 10 }} />
      ) : (
        <>
          <Button title="Registrar" onPress={handleSubmit} color="#007bff" />
          <View style={{ marginTop: 20 }}>
            <Button title="Volver al Login" onPress={() => router.back()} color="gray" />
          </View>
        </>
      )}
    </View>
  );
};

export default RegistroScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
