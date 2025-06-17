import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';

// Funciones de validación
const validarNombre = (nombre: string) => {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
};

const validarTelefono = (telefono: string) => {
  return /^\d{9}$/.test(telefono);
};

const validarEdad = (edad: string) => {
  const numEdad = parseInt(edad);
  return !isNaN(numEdad) && numEdad > 0 && numEdad < 120;
};

const PerfilPacienteScreen = () => {
  const router = useRouter();
  const { patient, setPatient } = usePatient();
  const { professional } = useProfessional();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [vista, setVista] = useState<'perfil' | 'movimientos' | 'analisis'>('perfil');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nombre: patient?.nombre || '',
    edad: patient?.edad?.toString() || '',
    telefono: patient?.telefono || '',
    genero: patient?.genero || '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!validarNombre(form.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras';
    }

    if (!validarTelefono(form.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos';
    }

    if (!validarEdad(form.edad)) {
      nuevosErrores.edad = 'La edad debe ser un número positivo válido';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSave = async () => {
    if (!validarFormulario()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    if (!patient) return;

    setLoading(true);
    try {
      const response = await fetch(`http://172.20.10.2:8000/pacientes/${patient.pacienteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          edad: parseInt(form.edad),
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar datos');

      const updatedPatient = {
        ...patient,
        ...form,
        edad: form.edad,
      };

      setPatient(updatedPatient);
      setIsEditing(false);
      Alert.alert('Éxito', 'Datos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudieron actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  return null;
};

export default PerfilPacienteScreen;
