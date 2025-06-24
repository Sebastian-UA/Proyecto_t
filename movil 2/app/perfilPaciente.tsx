import React, { useState, useEffect } from 'react';
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
import { cerrarSesion } from '@/services/sesion';
import { useNavigation } from '@/hooks/useNavigation';
import { API_CONFIG, apiPut } from '@/config/api';
import { fetchDetallePacientePorId } from '@/config/api';

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

const validarContrasena = (contrasena: string) => {
  return contrasena.length >= 6;
};

const PerfilPacienteScreen = () => {
  const router = useRouter();
  const { navigateToLogin } = useNavigation();
  const { patient, setPatient } = usePatient();
  const { setProfessional } = useProfessional();
  const [isEditing, setIsEditing] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(false); // <- nuevo loading para cargar datos paciente
  const [detallePaciente, setDetallePaciente] = useState<any | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
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

  // Actualizar formulario cuando cambie el paciente
  useEffect(() => {
    if (patient) {
      setForm({
        nombre: patient.nombre || '',
        edad: patient.edad?.toString() || '',
        telefono: patient.telefono || '',
        genero: patient.genero || '',
      });
    }
  }, [patient]);

  useEffect(() => {
    console.log('Paciente ID desde contexto:', patient?.pacienteId);
    const obtenerDetalle = async () => {
      if (patient?.pacienteId) {
        setLoadingDetalle(true);
        try {
          const data = await fetchDetallePacientePorId(patient.pacienteId);
          setDetallePaciente(data);
        } catch (error) {
          console.error('Error al cargar detalle del paciente', error);
        } finally {
          setLoadingDetalle(false);
        }
      }
    };

    obtenerDetalle();
  }, [patient?.pacienteId]);

  // Redirigir si no hay paciente autenticado
  useEffect(() => {
    if (!patient) {
      router.replace('/login');
    }
  }, [patient, router]);

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

  const validarFormularioContrasena = () => {
    const nuevosErrores: Record<string, string> = {};

    if (passwordForm.currentPassword !== patient?.contrasena) {
      nuevosErrores.currentPassword = 'La contraseña actual es incorrecta';
    }

    if (!validarContrasena(passwordForm.newPassword)) {
      nuevosErrores.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
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
      const response = await apiPut(`${API_CONFIG.ENDPOINTS.PACIENTES}${patient.pacienteId}`, {
        ...form,
        edad: parseInt(form.edad),
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

  const handleChangePassword = async () => {
    if (!validarFormularioContrasena()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    if (!patient) return;

    setLoading(true);
    try {
      const response = await apiPut(`${API_CONFIG.ENDPOINTS.PACIENTES}${patient.pacienteId}`, {
        contrasena: passwordForm.newPassword,
      });

      if (!response.ok) throw new Error('Error al actualizar contraseña');

      const updatedPatient = {
        ...patient,
        contrasena: passwordForm.newPassword,
      };

      setPatient(updatedPatient);
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = async () => {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);
    try {
      await cerrarSesion(setPatient, setProfessional, navigateToLogin);
    } catch (error) {
      // El error ya se maneja en el servicio
    } finally {
      setCerrandoSesion(false);
    }
  };

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Paciente</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{patient.nombre}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>RUT:</Text>
          <Text style={styles.value}>{patient.rut}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>{detallePaciente?.edad} años</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{detallePaciente?.telefono}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Correo:</Text>
          <Text style={styles.value}>{patient.correo}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Género:</Text>
          <Text style={styles.value}>{detallePaciente?.genero}</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowChangePassword(true)}
        >
          <Text style={styles.actionButtonText}>Cambiar Contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => router.push('/movimientos/SelecExt')}
        >
          <Text style={styles.primaryButtonText}>Medir Movimientos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.analisisButton]}
          onPress={() => router.push('/analisis/historialMediciones')}
        >
          <Text style={styles.analisisButtonText}>Ver Mis Resultados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleCerrarSesion}
          disabled={cerrandoSesion}
        >
          <Text style={styles.logoutButtonText}>
            {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>

            <TextInput
              style={[styles.modalInput, errors.currentPassword && styles.inputError]}
              placeholder="Contraseña actual"
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
              secureTextEntry
            />
            {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}

            <TextInput
              style={[styles.modalInput, errors.newPassword && styles.inputError]}
              placeholder="Nueva contraseña"
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
              secureTextEntry
            />
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

            <TextInput
              style={[styles.modalInput, errors.confirmPassword && styles.inputError]}
              placeholder="Confirmar nueva contraseña"
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setErrors({});
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  profileSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  actionsSection: {
    margin: 15,
    gap: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  primaryButton: {
    backgroundColor: '#28a745',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  analisisButton: {
    backgroundColor: '#17a2b8',
  },
  analisisButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PerfilPacienteScreen; 