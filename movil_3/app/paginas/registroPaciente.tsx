import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getPacientesInfo } from '@/services/paciente.api';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';
import { theme } from '../../estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Funciones de validación
const validarNombre = (nombre: string) => {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
};

const validarRut = (rut: string) => {
  return /^\d{1,8}-[\dkK]$/.test(rut);
};

const validarTelefono = (telefono: string) => {
  return /^9\d{8}$/.test(telefono);
};

const validarEdad = (edad: string) => {
  const numEdad = parseInt(edad);
  return !isNaN(numEdad) && numEdad >= 0 && numEdad <= 120;
};

const validarCorreo = (correo: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

const validarContrasena = (contrasena: string) => {
  return contrasena.length >= 6;
};

const PacienteScreen = () => {
  const router = useRouter();
  const { setPatient, registrarPaciente } = usePatient();
  const { professional } = useProfessional();
  const params = useLocalSearchParams();

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    edad: '',
    telefono: '',
    correo: '',
    contrasena: '',
    genero: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!validarNombre(form.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras';
    }

    if (!validarRut(form.rut)) {
      nuevosErrores.rut = 'El RUT debe tener formato: 12345678-9';
    }

    if (!validarTelefono(form.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe comenzar con 9 y tener 9 dígitos';
    }

    if (!validarEdad(form.edad)) {
      nuevosErrores.edad = 'La edad debe ser un número entre 0 y 120';
    }

    if (!validarCorreo(form.correo)) {
      nuevosErrores.correo = 'Ingrese un correo electrónico válido';
    }

    if (!validarContrasena(form.contrasena)) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres';
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

    if (!professional) {
      Alert.alert('Error', 'No hay un profesional autenticado');
      return;
    }

    try {
      setLoading(true);
      const pacienteData = {
        ...form,
        profesionalId: professional?.profesionalId,
        rol: 'paciente'
      };
      await registrarPaciente(pacienteData as any);
      Alert.alert('Éxito', 'Paciente registrado correctamente');
      // Volver a la pantalla de pacientes y forzar recarga
      router.replace({ pathname: '/paginas/paciente', params: { actualizado: Date.now() } });
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      Alert.alert('Error', 'No se pudo registrar el paciente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPacientes = async () => {
      // Solo cargar si hay un profesional logueado
      if (!professional?.profesionalId) {
        setPacientes([]);
        return;
      }
      try {
        const data = await getPacientesInfo(professional.profesionalId);
        setPacientes(data);
      } catch (error) {
        console.error('❌ Error al cargar pacientes:', error);
      }
    };
    fetchPacientes();
  }, [professional]); // Depender solo de professional

  const filteredPacientes = pacientes
    .filter(p => p.profesionalId === professional?.profesionalId)
    .filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.rut.includes(searchTerm)
    );

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleContinuar = () => {
    if (selectedIndex === null) {
      Alert.alert('Selecciona un paciente');
      return;
    }

    const paciente = filteredPacientes[selectedIndex];
    setPatient(paciente);
    console.log('✅ Paciente seleccionado:', paciente);

    if (!professional) {
      Alert.alert('Error', 'Profesional no autenticado');
      return;
    }

    router.push('/movimientos/SelecExt');
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
          <Icon name="account-plus" size={60} color={theme.colors.primary} />
          <Text style={styles.title}>Registro de Paciente</Text>
          <Text style={styles.subtitle}>Completa la información del paciente</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon 
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
              <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.nombre}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon 
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
              <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.rut}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon 
              name="calendar-outline" 
              size={20} 
              color={errors.edad ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.edad && styles.inputError]}
              placeholder="Edad"
              placeholderTextColor={theme.colors.placeholder}
              value={form.edad}
              onChangeText={(text) => handleChange('edad', text)}
              keyboardType="numeric"
            />
          </View>
          {errors.edad && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.edad}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon 
              name="phone-outline" 
              size={20} 
              color={errors.telefono ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.telefono && styles.inputError]}
              placeholder="Teléfono"
              placeholderTextColor={theme.colors.placeholder}
              value={form.telefono}
              onChangeText={(text) => handleChange('telefono', text)}
              keyboardType="phone-pad"
              maxLength={9}
            />
          </View>
          {errors.telefono && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.telefono}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon 
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
              <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.correo}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon 
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
              <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.contrasena}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon 
              name="gender-male-female" 
              size={20} 
              color={errors.genero ? theme.colors.error : theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, errors.genero && styles.inputError]}
              placeholder="Género"
              placeholderTextColor={theme.colors.placeholder}
              value={form.genero}
              onChangeText={(text) => handleChange('genero', text)}
            />
          </View>
          {errors.genero && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
              <Text style={styles.errorText}>{errors.genero}</Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Registrando paciente...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Registrar Paciente</Text>
              <Icon name="account-plus" size={20} color={theme.colors.buttonText} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PacienteScreen;

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

