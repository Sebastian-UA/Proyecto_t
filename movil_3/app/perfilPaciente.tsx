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
import { theme } from '../estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="account-circle" size={80} color={theme.colors.buttonText} />
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Paciente</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.sectionHeader}>
          <Icon name="account-details" size={24} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Información Personal</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Icon name="account-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.label}>Nombre:</Text>
          </View>
          <Text style={styles.value}>{patient.nombre}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Icon name="card-account-details-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.label}>RUT:</Text>
          </View>
          <Text style={styles.value}>{patient.rut}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Icon name="calendar-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.label}>Edad:</Text>
          </View>
          <Text style={styles.value}>{detallePaciente?.edad} años</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Icon name="phone-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.label}>Teléfono:</Text>
          </View>
          <Text style={styles.value}>{detallePaciente?.telefono}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Icon name="email-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.label}>Correo:</Text>
          </View>
          <Text style={styles.value}>{patient.correo}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Icon name="gender-male-female" size={16} color={theme.colors.placeholder} />
            <Text style={styles.label}>Género:</Text>
          </View>
          <Text style={styles.value}>{detallePaciente?.genero}</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowChangePassword(true)}
        >
          <Icon name="lock-reset" size={20} color={theme.colors.primary} />
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
          <Icon name="chart-line" size={20} color={theme.colors.buttonText} />
          <Text style={styles.analisisButtonText}>Ver Mis Resultados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleCerrarSesion}
          disabled={cerrandoSesion}
        >
          <Icon name="logout" size={20} color={theme.colors.buttonText} />
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
            <View style={styles.modalHeader}>
              <Icon name="lock-reset" size={32} color={theme.colors.primary} />
              <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            </View>

            <View style={styles.inputContainer}>
              <Icon 
                name="lock-outline" 
                size={20} 
                color={errors.currentPassword ? theme.colors.error : theme.colors.placeholder} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.modalInput, errors.currentPassword && styles.inputError]}
                placeholder="Contraseña actual"
                placeholderTextColor={theme.colors.placeholder}
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
                secureTextEntry
              />
            </View>
            {errors.currentPassword && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Icon 
                name="lock-plus-outline" 
                size={20} 
                color={errors.newPassword ? theme.colors.error : theme.colors.placeholder} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.modalInput, errors.newPassword && styles.inputError]}
                placeholder="Nueva contraseña"
                placeholderTextColor={theme.colors.placeholder}
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
                secureTextEntry
              />
            </View>
            {errors.newPassword && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Icon 
                name="lock-check-outline" 
                size={20} 
                color={errors.confirmPassword ? theme.colors.error : theme.colors.placeholder} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.modalInput, errors.confirmPassword && styles.inputError]}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor={theme.colors.placeholder}
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry
              />
            </View>
            {errors.confirmPassword && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={14} color={theme.colors.error} />
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              </View>
            )}

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
                  <ActivityIndicator size="small" color={theme.colors.buttonText} />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                    <Icon name="check" size={16} color={theme.colors.buttonText} />
                  </>
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
    backgroundColor: theme.colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
  },
  loadingText: {
    color: theme.colors.placeholder,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.buttonText,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.buttonText,
    opacity: 0.9,
  },
  profileSection: {
    backgroundColor: theme.colors.background,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  value: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  actionsSection: {
    margin: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.buttonText,
    marginLeft: theme.spacing.sm,
  },
  analisisButton: {
    backgroundColor: '#17a2b8',
  },
  analisisButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.buttonText,
    marginLeft: theme.spacing.sm,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
  },
  logoutButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.buttonText,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text,
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
  modalInput: {
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.placeholder,
  },
  cancelButtonText: {
    color: theme.colors.buttonText,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: theme.colors.buttonText,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
});

export default PerfilPacienteScreen; 