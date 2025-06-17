import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, Button, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import { usePatient } from '../../context/paciente';
import { useProfessional } from '../../context/profesional';
import { getMovimientoById } from '../../services/movimiento';
import { createSesionWithMedicion } from '../../services/sesion';
import styles from '../../estilos/styles';

// Función para solicitar permisos
const requestPermissions = async () => {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
    Alert.alert(
      'Permisos necesarios',
      'Se requieren permisos de cámara y galería para usar esta función.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

export default function MedicionPage() {
  const { movimiento } = useLocalSearchParams() as { movimiento: string };
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [movimientoData, setMovimientoData] = useState<any>(null);
  const [lado, setLado] = useState<'derecha' | 'izquierda'>('derecha');

  const { patient } = usePatient();
  const { professional } = useProfessional();
  const router = useRouter();

  useEffect(() => {
    requestPermissions();
  }, []);

  const seleccionarVideo = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 30,
        videoExportPreset: ImagePicker.VideoExportPreset.LowQuality,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!result.canceled && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar video:', error);
      Alert.alert('Error', 'No se pudo seleccionar el video');
    }
  };

  const grabarVideo = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 30,
        videoExportPreset: ImagePicker.VideoExportPreset.LowQuality,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!result.canceled && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al grabar video:', error);
      Alert.alert('Error', 'No se pudo grabar el video');
    }
  };

  const guardarSesion = async (resultado: any) => {
    if (!resultado) {
      return Alert.alert('Faltan datos para guardar la sesión');
    }

    try {
      const now = new Date();
      let sesiones = [];

      if (movimientoData.nombre.toLowerCase() === "pronación y supinación") {
        sesiones = [
          {
            PacienteId: patient?.pacienteId || professional?.pacienteSeleccionado?.pacienteId,
            ProfesionalId: professional?.profesionalId || patient?.id_profesional,
            fecha: now.toISOString().split('T')[0],
            hora: now.toTimeString().split(' ')[0],
            notas: '',
            EjercicioId: null,
            MovimientoId: Number(movimiento),
            anguloMin: resultado.pronacion?.min_angle || 0,
            anguloMax: resultado.pronacion?.max_angle || 0,
            lado: `${lado} - pronación`,
          },
          {
            PacienteId: patient?.pacienteId || professional?.pacienteSeleccionado?.pacienteId,
            ProfesionalId: professional?.profesionalId || patient?.id_profesional,
            fecha: now.toISOString().split('T')[0],
            hora: now.toTimeString().split(' ')[0],
            notas: '',
            EjercicioId: null,
            MovimientoId: Number(movimiento),
            anguloMin: resultado.supinacion?.min_angle || 0,
            anguloMax: resultado.supinacion?.max_angle || 0,
            lado: `${lado} - supinación`,
          }
        ];
      } else {
        sesiones = [{
          PacienteId: patient?.pacienteId || professional?.pacienteSeleccionado?.pacienteId,
          ProfesionalId: professional?.profesionalId || patient?.id_profesional,
          fecha: now.toISOString().split('T')[0],
          hora: now.toTimeString().split(' ')[0],
          notas: '',
          EjercicioId: null,
          MovimientoId: Number(movimiento),
          anguloMin: resultado.min_angle || 0,
          anguloMax: resultado.max_angle || 0,
          lado: lado,
        }];
      }

      for (const sesion of sesiones) {
        if (!sesion.PacienteId) throw new Error('No se pudo determinar el ID del paciente');
        await createSesionWithMedicion(sesion);
      }

      Alert.alert('Éxito', 'Sesión guardada correctamente');
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      Alert.alert('Error', 'No se pudo guardar la sesión');
    }
  };

  const enviarVideo = async () => {
    if (!videoUri) return Alert.alert('Selecciona un video primero.');
    if (!movimientoData?.nombre) return Alert.alert('Error', 'No se ha cargado la información del movimiento');

    try {
      setLoading(true);
      const formData = new FormData();

      const extension = videoUri.split('.').pop()?.toLowerCase() || 'mp4';
      const mimeType = `video/${extension}`;

      formData.append('file', {
        uri: videoUri,
        name: `video.${extension}`,
        type: mimeType,
      } as any);

      formData.append('movimiento', movimientoData.nombre);
      formData.append('lado', lado);

      const res = await fetch('http:// 172.20.10.2:8000/analizar_video/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Error en el servidor: ${res.status} - ${errorData}`);
      }

      const data = await res.json();

      if (!data.output) throw new Error('Respuesta incompleta del servidor');

      await guardarSesion(data); // ✅ GUARDAR SESIÓN ANTES DE REDIRIGIR

      router.push({
        pathname: '/analisis/analisisPaciente',
        params: {
          resultado: JSON.stringify(data),
          movimiento: movimientoData.nombre,
        },
      } as any);

      setVideoUri(null);
      Alert.alert('Éxito', 'Video enviado y analizado correctamente');
    } catch (error) {
      console.error('Error al enviar el video:', error);
      Alert.alert('Error', 'No se pudo analizar el video. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
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
      style={{ flex: 1, backgroundColor: '#B3F0FF' }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.titulo}>Medición: {movimientoData?.nombre || '...'}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <Button title="Seleccionar Video" onPress={seleccionarVideo} disabled={loading} />
        <Button title="Grabar Video" onPress={grabarVideo} disabled={loading} />
      </View>

      {videoUri && (
        <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 10 }}>
          <Text style={styles.subtitulo}>Video seleccionado:</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>{videoUri}</Text>
        </View>
      )}

      <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 10 }}>
        <Text style={styles.subtitulo}>Selecciona el lado a analizar:</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
          <Button title="Derecha" onPress={() => setLado('derecha')} color={lado === 'derecha' ? '#4CAF50' : undefined} />
          <Button title="Izquierda" onPress={() => setLado('izquierda')} color={lado === 'izquierda' ? '#4CAF50' : undefined} />
        </View>
      </View>

      <Button title="Enviar para análisis" onPress={enviarVideo} disabled={loading || !videoUri} />

      {loading && (
        <View style={{ marginVertical: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>Analizando video...</Text>
        </View>
      )}
    </ScrollView>
  );
}
