import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getPacientesInfo } from '@/services/paciente.api';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';

// Funciones de validación
const validarNombre = (nombre: string) => {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
};

const validarRut = (rut: string) => {
  return /^\d{1,8}-[\dkK]$/.test(rut);
};

const validarTelefono = (telefono: string) => {
  return /^\d{9}$/.test(telefono);
};

const validarEdad = (edad: string) => {
  const numEdad = parseInt(edad);
  return !isNaN(numEdad) && numEdad > 0 && numEdad < 120;
};

const PacienteScreen = () => {
  const router = useRouter();
  const { setPatient } = usePatient();
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

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!validarNombre(form.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras';
    }

    if (!validarRut(form.rut)) {
      nuevosErrores.rut = 'El RUT debe tener formato: 12345678-9';
    }

    if (!validarTelefono(form.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos';
    }

    if (!validarEdad(form.edad)) {
      nuevosErrores.edad = 'La edad debe ser un número positivo válido';
    }

    if (!form.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      nuevosErrores.correo = 'Ingrese un correo electrónico válido';
    }

    if (!form.contrasena || form.contrasena.length < 6) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Limpiar el error cuando el usuario comienza a escribir
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    try {
      // Aquí iría la lógica para enviar el formulario al backend
      Alert.alert('Éxito', 'Paciente registrado correctamente');
      router.back();
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      Alert.alert('Error', 'No se pudo registrar el paciente');
    }
  };

  const fetchPacientes = async () => {
    try {
      const data = await getPacientesInfo();
      setPacientes(data);

      // Mostrar alerta si se registró un nuevo paciente
      if (params?.registrado === 'true') {
        Alert.alert('Éxito', 'Paciente registrado correctamente');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
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
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Paciente</Text>

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
        placeholder="Teléfono (9 dígitos)"
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Registrar Paciente</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PacienteScreen;
