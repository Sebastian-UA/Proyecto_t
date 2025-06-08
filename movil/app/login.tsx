// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfessional } from '@/context/profesional';

const LoginScreen = () => {
  const router = useRouter();
  const { setProfessional } = useProfessional();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.19/login', {//cambiar 192.168.1.90 por el ip de tu pc
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();

      setProfessional({
        profesionalId: data.id,
        nombre: data.nombre,
        correo: data.correo,
        rut: data.rut,
        rol: data.rol,
      });

      // Redireccionar a la pantalla de paciente
      router.replace('/paciente');
    } catch (err) {
      setError('Correo o contraseña incorrectos');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Button title="Iniciar sesión" onPress={handleLogin} />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Registrarse"
          onPress={() => router.push('/registro')}
          color="green"
        />
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});
