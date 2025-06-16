import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfessional } from '@/context/profesional';

const LoginScreen = () => {
  const router = useRouter();
  const { setProfessional } = useProfessional();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validarCorreo = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!validarCorreo(correo)) {
      setError('Correo electrónico no válido');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://192.168.178.29:8000/login', {
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

      router.replace('/paciente');
    } catch (err) {
      setError('Correo o contraseña incorrectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
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

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 15 }} />
      ) : (
        <>
          <Button title="Iniciar sesión" onPress={handleLogin} color="#007bff" />

          <View style={{ marginTop: 16 }}>
            <Button
              title="Registrarse"
              onPress={() => router.push('/registro')}
              color="#28a745"
            />
          </View>
        </>
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
