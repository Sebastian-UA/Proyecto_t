import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
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
import { MaskedTextInput } from 'react-native-mask-text';

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
        id_profesional: professional?.profesionalId,
        rol: 'paciente'
      };
      await registrarPaciente(pacienteData as any);
      Alert.alert('Éxito', 'Paciente registrado correctamente');
      router.push('/');
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      Alert.alert('Error', 'No se pudo registrar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
      if (!professional) {
        console.error('❌ No hay profesional autenticado');
        return;
      }

      const data = await getPacientesInfo(professional.profesionalId);
      setPacientes(data);

      // Mostrar alerta si se registró un nuevo paciente
      if (params?.registrado === 'true') {
        Alert.alert('Éxito', 'Paciente registrado correctamente');
      }
    } catch (error) {
      console.error('❌ Error al cargar pacientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPacientes();
    }, [params])
  );

  const filteredPacientes = pacientes.filter(
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Registro de Paciente</Text>
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
            onChangeText={(text: string) => handleChange('rut', text)}
            keyboardType="numeric"
          />
          {errors.rut && <Text style={styles.errorText}>{errors.rut}</Text>}
          <TextInput
            style={[styles.input, errors.edad && styles.inputError]}
            placeholder="Edad"
            value={form.edad}
            onChangeText={(text) => handleChange('edad', text)}
            keyboardType="numeric"
          />
          {errors.edad && <Text style={styles.errorText}>{errors.edad}</Text>}
          <TextInput
            style={[styles.input, errors.telefono && styles.inputError]}
            placeholder="Teléfono"
            value={form.telefono}
            onChangeText={(text) => handleChange('telefono', text)}
            keyboardType="phone-pad"
            maxLength={9}
          />
          {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
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
            style={[styles.input, errors.genero && styles.inputError]}
            placeholder="Género"
            value={form.genero}
            onChangeText={(text) => handleChange('genero', text)}
          />
          {errors.genero && <Text style={styles.errorText}>{errors.genero}</Text>}
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
    backgroundColor: '#007bff',
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

export default PacienteScreen;
