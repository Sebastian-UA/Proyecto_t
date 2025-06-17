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
      const response = await fetch(`http://192.168.1.19:8000/pacientes/${patient.pacienteId}`, {
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
        edad: parseInt(form.edad),
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
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.1.19:8000/pacientes/${patient?.pacienteId}/cambiar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Error al cambiar contraseña');

      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      Alert.alert('Error', 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text>No hay datos del paciente disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, vista === 'perfil' && styles.activeTab]}
          onPress={() => setVista('perfil')}
        >
          <Text style={[styles.tabText, vista === 'perfil' && styles.activeTabText]}>
            Perfil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, vista === 'movimientos' && styles.activeTab]}
          onPress={() => setVista('movimientos')}
        >
          <Text style={[styles.tabText, vista === 'movimientos' && styles.activeTabText]}>
            Movimientos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, vista === 'analisis' && styles.activeTab]}
          onPress={() => setVista('analisis')}
        >
          <Text style={[styles.tabText, vista === 'analisis' && styles.activeTabText]}>
            Análisis
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {vista === 'perfil' && (
          <>
            <Text style={styles.title}>Perfil del Paciente</Text>

            {isEditing ? (
              <View style={styles.form}>
                <TextInput
                  style={[styles.input, errors.nombre && styles.inputError]}
                  placeholder="Nombre"
                  value={form.nombre}
                  onChangeText={(text) => handleChange('nombre', text)}
                />
                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

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
                  style={styles.input}
                  placeholder="Género"
                  value={form.genero}
                  onChangeText={(text) => handleChange('genero', text)}
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoContainer}>
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
                  <Text style={styles.value}>{patient.edad}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.value}>{patient.telefono}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Género:</Text>
                  <Text style={styles.value}>{patient.genero}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Correo:</Text>
                  <Text style={styles.value}>{patient.correo}</Text>
                </View>

                <View style={styles.buttonContainer}>
                {professional && (
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={styles.buttonText}>Editar Datos</Text>
                    </TouchableOpacity>
                  )}

                  {!professional && (
                    <TouchableOpacity
                      style={[styles.button, styles.passwordButton]}
                      onPress={() => setShowChangePassword(true)}
                    >
                      <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.button, styles.historyButton]}
                    onPress={() => router.push('/analisis/historialMediciones' as any)}
                  >
                    <Text style={styles.buttonText}>Ver Historial de Mediciones</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {vista === 'movimientos' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movimientos</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/movimientos/SelecExt')}
            >
              <Text style={styles.buttonText}>Nuevo Movimiento</Text>
            </TouchableOpacity>
          </View>
        )}

        {vista === 'analisis' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análisis</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/historial' as any)}
            >
              <Text style={styles.buttonText}>Ver Historial de Mediciones</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showChangePassword}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>

            <TextInput
              style={styles.input}
              placeholder="Contraseña actual"
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar nueva contraseña"
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  passwordButton: {
    backgroundColor: '#6c757d',
  },
  historyButton: {
    backgroundColor: '#6c757d',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
});

export default PerfilPacienteScreen; 