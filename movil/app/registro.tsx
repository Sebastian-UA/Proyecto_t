import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaskedTextInput } from 'react-native-mask-text';
import { createProfesionalConUsuario } from '@/services/profesional.api';

// Funciones de validación
const validarNombre = (nombre: string) => {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
};

const validarRut = (rut: string) => {
  return /^\d{1,8}-[\dkK]$/.test(rut);
};

const validarCorreo = (correo: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

const validarContrasena = (contrasena: string) => {
  return contrasena.length >= 6;
};

const RegistroScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    correo: '',
    contrasena: '',
    especialidad: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!validarNombre(form.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras';
    }

    if (!validarRut(form.rut)) {
      nuevosErrores.rut = 'El RUT debe tener formato: 12345678-9';
    }

    if (!validarCorreo(form.correo)) {
      nuevosErrores.correo = 'Ingrese un correo electrónico válido';
    }

    if (!validarContrasena(form.contrasena)) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!form.especialidad) {
      nuevosErrores.especialidad = 'La especialidad es obligatoria';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      await createProfesionalConUsuario({
        ...form,
        rut: form.rut.replace(/[.-]/g, ''),
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

      <TextInput
        style={[styles.input, errors.nombre && styles.inputError]}
        placeholder="Nombre"
        value={form.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
      />
      {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

      <MaskedTextInput
        style={[styles.input, errors.rut && styles.inputError]}
        placeholder="RUT (12345678-9)"
        mask="99999999-9"
        value={form.rut}
        onChangeText={(text) => handleChange('rut', text)}
        keyboardType="numeric"
      />
      {errors.rut && <Text style={styles.errorText}>{errors.rut}</Text>}

      <TextInput
        style={[styles.input, errors.correo && styles.inputError]}
        placeholder="Correo electrónico"
        value={form.correo}
        onChangeText={(text) => handleChange('correo', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

      <TextInput
        style={[styles.input, errors.contrasena && styles.inputError]}
        placeholder="Contraseña"
        value={form.contrasena}
        onChangeText={(text) => handleChange('contrasena', text)}
        secureTextEntry
      />
      {errors.contrasena && <Text style={styles.errorText}>{errors.contrasena}</Text>}

      <TextInput
        style={[styles.input, errors.especialidad && styles.inputError]}
        placeholder="Especialidad"
        value={form.especialidad}
        onChangeText={(text) => handleChange('especialidad', text)}
      />
      {errors.especialidad && <Text style={styles.errorText}>{errors.especialidad}</Text>}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default RegistroScreen;
