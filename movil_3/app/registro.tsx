import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
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
  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    correo: '',
    contrasena: '',
    especialidad: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      nuevosErrores.especialidad = 'La especialidad es requerida';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const profesionalData = {
        nombre: form.nombre,
        rut: form.rut.replace(/\./g, ''),
        correo: form.correo,
        contrasena: form.contrasena,
        especialidad: form.especialidad,
        rol: 'profesional',
      };
      
      console.log('Enviando datos de registro:', JSON.stringify(profesionalData, null, 2));

      const response = await createProfesionalConUsuario(profesionalData);

      console.log('Respuesta del servidor:', JSON.stringify(response, null, 2));

      Alert.alert('Registro exitoso', 'Ahora puedes iniciar sesión');
      router.back();
    } catch (error: any) {
      console.error('Error detallado en registro:', error);
      
      // Intentar mostrar más detalles del error si es posible
      if (error.response) {
        console.error('Datos del error:', error.response.data);
        console.error('Status del error:', error.response.status);
        Alert.alert('Error en el registro', `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. Revisa tu conexión de red y la IP del backend.');
      } else {
        console.error('Error al configurar la petición:', error.message);
        Alert.alert('Error', `Ocurrió un error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Registro Profesional</Text>
          <TextInput
            style={[styles.input, errors.nombre && styles.inputError]}
            placeholder="Nombre"
            value={form.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          <TextInput
            style={[styles.input, errors.rut && styles.inputError]}
            placeholder="RUT (12345678-9)"
            value={form.rut}
            onChangeText={(text) => handleChange('rut', text)}
            keyboardType="default"
            maxLength={10}
            autoCapitalize="characters"
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
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Registrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistroScreen;
