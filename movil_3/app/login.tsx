import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfessional } from '@/context/profesional';
import { usePatient } from '@/context/paciente';
import { API_CONFIG, apiPost } from '@/config/api';
import { theme } from '../estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = () => {
  const router = useRouter();
  const { setProfessional } = useProfessional();
  const { setPatient } = usePatient();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validarCorreo = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!validarCorreo(correo)) {
      setError('Correo electrónico no válido');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiPost(API_CONFIG.ENDPOINTS.LOGIN, { correo, contrasena });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();

      // Limpia ambos contextos del almacenamiento
      await AsyncStorage.removeItem('profesional');
      await AsyncStorage.removeItem('paciente');

      if (data.rol === 'profesional') {
        setProfessional({
          profesionalId: data.id,
          nombre: data.nombre,
          correo: data.correo,
          rut: data.rut,
          rol: data.rol,
        });
        console.log("✅ Profesional guardado:", data);
        router.replace('/paciente');
      } else if (data.rol === 'paciente') {
        setPatient({
          pacienteId: data.id,
          nombre: data.nombre,
          correo: data.correo,
          rut: data.rut,
          edad: data.edad,
          telefono: data.telefono,
          contrasena: data.contrasena,
          rol: data.rol,
          genero: data.genero,
          profesionalId: data.profesionalId,
        });
        console.log("Paciente guardado:", data);
        router.replace('/perfilPaciente');
      } else {
        throw new Error('Rol desconocido');
      }
    } catch (err) {
      setError('Correo o contraseña incorrectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Icon name="medical-bag" size={60} color={theme.colors.primary} />
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Accede a tu cuenta médica</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon 
              name="email-outline" 
              size={20} 
              color={theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={theme.colors.placeholder}
              value={correo}
              onChangeText={setCorreo}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon 
              name="lock-outline" 
              size={20} 
              color={theme.colors.placeholder} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={theme.colors.placeholder}
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
            />
          </View>

          {!!error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Iniciando sesión...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                <Icon name="arrow-right" size={20} color={theme.colors.buttonText} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.registerButton} 
                onPress={() => router.push('/registro')}
              >
                <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
    marginBottom: theme.spacing.md,
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
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginRight: theme.spacing.sm,
  },
  registerButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  registerButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.placeholder,
    fontSize: theme.fontSize.sm,
    textDecorationLine: 'underline',
  },
});
