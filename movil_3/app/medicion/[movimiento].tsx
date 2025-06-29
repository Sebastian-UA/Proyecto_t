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
import styles from '@/estilos/styles';
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
    <ScrollView style={{ flex: 1, backgroundColor: '#B3F0FF' }} contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Medición: {movimientoData?.nombre || '...'}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <Button title="Seleccionar Video" onPress={seleccionarVideo} disabled={loading} />
        <Button title="Grabar Video" onPress={grabarVideo} disabled={loading} />
      </View>

      {!videoUri && (
        <View style={styles.previewPlaceholder}>
          <MaterialCommunityIcons
            name="video-outline"
            size={40}
            color={theme.colors.primary}
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.previewText}>
            El video se cargará aquí cuando selecciones o grabes uno.
          </Text>
        </View>
      )}

      {videoUri && (
        <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 10 }}>
          <Text style={styles.subtitulo}>Video seleccionado:</Text>
          <Video
            key={videoUri}
            source={{ uri: videoUri }}
            style={{ width: '100%', height: 200, marginVertical: 10 }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
          <Button title="Repetir video" onPress={() => setVideoUri(null)} color="#FF5252" />
        </View>
      )}

      <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 10 }}>
        <Text style={styles.subtitulo}>Selecciona el lado a analizar:</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
          <Button title="Derecha" onPress={() => setLado('derecha')} color={lado === 'derecha' ? '#4CAF50' : undefined} />
          <Button title="Izquierda" onPress={() => setLado('izquierda')} color={lado === 'izquierda' ? '#4CAF50' : undefined} />
        </View>
      </View>

      <Button title="Enviar para análisis" onPress={enviarVideo} disabled={loading || !videoUri || enviando} />

      {(loading || enviando) && (
        <View style={{ marginVertical: 20 }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            {enviando ? 'Enviando video para análisis...' : 'Analizando video...'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
