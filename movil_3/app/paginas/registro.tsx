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
import { theme } from '@/estilos/themes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="doctor" size={60} color={theme.colors.primary} />
          <Text style={styles.title}>Registro de Profesional</Text>
          <Text style={styles.subtitle}>Completa la información del profesional</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="account-outline" 
              size={20} 
              color={errors.nombre ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Nombre completo"
              placeholderTextColor={theme.colors.placeholder}
              value={form.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
            />
          </View>
          {errors.nombre && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.nombre}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="card-account-details-outline" 
              size={20} 
              color={errors.rut ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.rut && styles.inputError]}
              placeholder="RUT (12345678-9)"
              placeholderTextColor={theme.colors.placeholder}
              value={form.rut}
              onChangeText={(text) => handleChange('rut', text)}
              keyboardType="default"
              maxLength={10}
              autoCapitalize="characters"
            />
          </View>
          {errors.rut && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.rut}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              color={errors.correo ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.correo && styles.inputError]}
              placeholder="Correo electrónico"
              placeholderTextColor={theme.colors.placeholder}
              value={form.correo}
              onChangeText={(text) => handleChange('correo', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.correo && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.correo}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={errors.contrasena ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.contrasena && styles.inputError]}
              placeholder="Contraseña"
              placeholderTextColor={theme.colors.placeholder}
              value={form.contrasena}
              onChangeText={(text) => handleChange('contrasena', text)}
              secureTextEntry
            />
          </View>
          {errors.contrasena && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.contrasena}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="medical-bag" 
              size={20} 
              color={errors.especialidad ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.especialidad && styles.inputError]}
              placeholder="Especialidad"
              placeholderTextColor={theme.colors.placeholder}
              value={form.especialidad}
              onChangeText={(text) => handleChange('especialidad', text)}
            />
          </View>
          {errors.especialidad && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.especialidad}</Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Registrando profesional...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Registrar Profesional</Text>
              <MaterialCommunityIcons name="doctor" size={20} color={theme.colors.buttonText} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.error}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.error}30`,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.placeholder,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginRight: theme.spacing.sm,
  },
});

export default RegistroScreen;
