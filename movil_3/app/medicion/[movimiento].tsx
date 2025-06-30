import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Button,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, CameraType } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';
import { getMovimientoById } from '@/services/movimiento';
import { createSesionWithMedicion } from '@/services/sesion';
import { API_CONFIG } from '@/config/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/estilos/themes';

const requestPermissions = async () => {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
    Alert.alert('Permisos necesarios', 'Se requieren permisos de cámara y galería para usar esta función.');
    return false;
  }
  return true;
};

export default function MedicionPage() {
  const { movimiento } = useLocalSearchParams() as { movimiento: string };
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [movimientoData, setMovimientoData] = useState<any>(null);
  const [lado, setLado] = useState<'derecha' | 'izquierda'>('derecha');
  const { patient } = usePatient();
  const { professional } = useProfessional();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>
          No hay paciente seleccionado. Por favor, vuelve a la lista y selecciona un paciente.
        </Text>
      </View>
    );
  }

  useEffect(() => {
    requestPermissions();
  }, []);

  const seleccionarVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.7,
      videoMaxDuration: 30,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setTimeout(() => {
        setVideoUri(uri);
      }, 300);
    }
  };

  const grabarVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.7,
      videoMaxDuration: 30,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setTimeout(() => {
        setVideoUri(uri);
      }, 300);
    }
  };

  const normalizarNombreMovimiento = (nombre: string): string => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('abducción')) return 'Abducción';
    if (nombreLower.includes('flexión')) return 'Flexión';
    if (nombreLower.includes('pronación') || nombreLower.includes('supinación')) return 'Pronación y Supinación';
    return nombre;
  };

  const guardarSesion = async (resultado: any) => {
    if (!resultado) return Alert.alert('Faltan datos para guardar la sesión');

    try {
      let sesiones = [];

      const pacienteId = patient?.pacienteId || professional?.pacienteSeleccionado?.pacienteId;
      const profesionalId = professional?.profesionalId || patient?.profesionalId;

      if (!pacienteId) {
        throw new Error('Falta información del paciente');
      }

      const now = new Date();
      const nombreNormalizado = normalizarNombreMovimiento(movimientoData?.nombre || '');

      const sesionBase = {
        pacienteId: pacienteId,
        profesionalId: profesionalId ?? null, // Esto lo hace opcional
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().split(' ')[0],
        notas: '',
        ejercicioId: null,
        movimientoId: Number(movimiento),
      };

      if (nombreNormalizado === "Pronación y Supinación") {
        sesiones = [
          {
            ...sesionBase,
            anguloMin: resultado.pronacion?.min_angle || 0,
            anguloMax: resultado.pronacion?.max_angle || 0,
            lado: `${lado} - pronación`,
          },
          {
            ...sesionBase,
            anguloMin: resultado.supinacion?.min_angle || 0,
            anguloMax: resultado.supinacion?.max_angle || 0,
            lado: `${lado} - supinación`,
          },
        ];
      } else {
        sesiones = [
          {
            ...sesionBase,
            anguloMin: resultado.min_angle || 0,
            anguloMax: resultado.max_angle || 0,
            lado: lado,
          },
        ];
      }

      console.log('✅ Datos que se van a guardar:', sesiones);

      for (const sesion of sesiones) {
        await createSesionWithMedicion(sesion);
      }

      Alert.alert('Éxito', 'Sesión guardada correctamente');
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      Alert.alert('Error', 'No se pudo guardar la sesión');
    }
  };

  const enviarVideo = async () => {
    if (!videoUri) {
      Alert.alert('Error', 'No hay video para enviar');
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);
      formData.append('movimiento', movimientoData?.nombre || '');
      formData.append('lado', lado);

      const urlAnalisis = `${API_CONFIG.BASE_URL}/analizar_video/`;
      const res = await fetch(urlAnalisis, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error del backend (analizar_video):', res.status, errorText);
        throw new Error('Error al analizar el video');
      }

      const resultado = await res.json();
      console.log('Resultado del análisis:', resultado);

      if (resultado) {
        await guardarSesion(resultado);
      }

      router.push({
        pathname: '/analisis/analisisPaciente',
        params: {
          resultado: JSON.stringify(resultado),
          movimiento: movimientoData?.nombre || 'Movimiento',
          movimientoId: String(movimiento),
        },
      });
    } catch (error) {
      console.error('Error enviando video:', error);
      Alert.alert('Error', 'No se pudo analizar el video');
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    const cargarMovimiento = async () => {
      try {
        const data = await getMovimientoById(Number(movimiento));
        setMovimientoData(data);
      } catch (error) {
        console.error('Error al cargar movimiento:', error);
        Alert.alert('Error', 'No se pudo cargar la información del movimiento');
      }
    };
    cargarMovimiento();
  }, [movimiento]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="video-plus" size={60} color={theme.colors.primary} />
        <Text style={styles.titulo}>Medición: {movimientoData?.nombre || '...'}</Text>
        <Text style={styles.subtitulo}>Selecciona o graba un video para analizar</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.buttonDisabled]} 
            onPress={seleccionarVideo} 
            disabled={loading}
          >
            <MaterialCommunityIcons name="file-video" size={24} color={theme.colors.buttonText} />
            <Text style={styles.buttonText}>Seleccionar Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.buttonDisabled]} 
            onPress={grabarVideo} 
            disabled={loading}
          >
            <MaterialCommunityIcons name="video" size={24} color={theme.colors.buttonText} />
            <Text style={styles.buttonText}>Grabar Video</Text>
          </TouchableOpacity>
        </View>

        {!videoUri && (
          <View style={styles.previewPlaceholder}>
            <MaterialCommunityIcons
              name="video-outline"
              size={80}
              color={theme.colors.placeholder}
              style={{ marginBottom: theme.spacing.lg }}
            />
            <Text style={styles.previewText}>
              Video aún no seleccionado
            </Text>
          </View>
        )}

        {videoUri && (
          <View style={styles.videoContainer}>
            <Text style={styles.sectionTitle}>Video seleccionado:</Text>
            <Video
              key={videoUri}
              source={{ uri: videoUri }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
            <TouchableOpacity 
              style={styles.repeatButton} 
              onPress={() => setVideoUri(null)}
            >
              <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.error} />
              <Text style={styles.repeatButtonText}>Repetir video</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sideSelectionContainer}>
          <Text style={styles.sectionTitle}>Selecciona el lado a analizar:</Text>
          <View style={styles.sideButtonsContainer}>
            <TouchableOpacity 
              style={[styles.sideButton, lado === 'derecha' && styles.sideButtonActive]} 
              onPress={() => setLado('derecha')}
            >
              <MaterialCommunityIcons 
                name="hand-pointing-right" 
                size={24} 
                color={lado === 'derecha' ? theme.colors.buttonText : theme.colors.primary} 
              />
              <Text style={[styles.sideButtonText, lado === 'derecha' && styles.sideButtonTextActive]}>
                Derecha
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sideButton, lado === 'izquierda' && styles.sideButtonActive]} 
              onPress={() => setLado('izquierda')}
            >
              <MaterialCommunityIcons 
                name="hand-pointing-left" 
                size={24} 
                color={lado === 'izquierda' ? theme.colors.buttonText : theme.colors.primary} 
              />
              <Text style={[styles.sideButtonText, lado === 'izquierda' && styles.sideButtonTextActive]}>
                Izquierda
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!videoUri && (
          <View style={styles.helpContainer}>
            <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.placeholder} />
            <Text style={styles.helpText}>
              Selecciona o graba un video para habilitar el análisis
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton, 
            (loading || !videoUri || enviando) && styles.submitButtonDisabled
          ]}
          onPress={enviarVideo}
          disabled={loading || !videoUri || enviando}
        >
          <MaterialCommunityIcons name="send" size={20} color={theme.colors.buttonText} />
          <Text style={styles.submitButtonText}>Enviar para análisis</Text>
        </TouchableOpacity>

        {(loading || enviando) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              {enviando ? 'Enviando video para análisis...' : 'Analizando video...'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  titulo: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitulo: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.45,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.placeholder,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.placeholder,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    marginVertical: theme.spacing.lg,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    textAlign: 'center',
    fontWeight: '500',
  },
  videoContainer: {
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  repeatButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  sideSelectionContainer: {
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sideButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  sideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    flex: 0.45,
  },
  sideButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sideButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  sideButtonTextActive: {
    color: theme.colors.buttonText,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  helpText: {
    color: theme.colors.placeholder,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.sm,
    flex: 1,
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
  submitButtonDisabled: {
    backgroundColor: theme.colors.placeholder,
  },
  submitButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.placeholder,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
