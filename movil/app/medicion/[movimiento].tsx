import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, Button, ActivityIndicator, Image, Alert } from 'react-native';
import { usePatient } from '../../context/paciente';
import { useProfessional } from '../../context/profesional';
import { getMovimientoById } from '../../services/movimiento';
import { createSesionWithMedicion } from '../../services/sesion';
import styles from '../../estilos/styles';

export default function MedicionPage() {
  const { movimiento } = useLocalSearchParams() as { movimiento: string };
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [movimientoData, setMovimientoData] = useState<any>(null);
  const [lado, setLado] = useState<'derecha' | 'izquierda'>('derecha');

  const { patient } = usePatient();
  const { professional } = useProfessional();

  const seleccionarVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const grabarVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado para acceder a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const enviarVideo = async () => {
    if (!videoUri) return Alert.alert('Selecciona un video primero.');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: videoUri,
        name: 'video.mp4',
        type: 'video/mp4',
      } as any);
      formData.append('movimiento', movimientoData?.nombre || '');
      formData.append('lado', lado);

      const res = await fetch('http://192.168.1.19:8000/analizar_video', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await res.json();
      setResultado(data);
    } catch (error) {
      console.error('Error al enviar el video:', error);
      Alert.alert('Error al analizar el video');
    } finally {
      setLoading(false);
    }
  };

  const guardarSesion = async () => {
    if (!resultado || !patient || !professional) {
      return Alert.alert('Faltan datos para guardar la sesión');
    }

    const now = new Date();

    const sesion = {
      PacienteId: patient.pacienteId,
      ProfesionalId: professional.profesionalId,
      fecha: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0],
      notas: '',
      EjercicioId: null,
      MovimientoId: Number(movimiento),
      anguloMin: resultado.min_angle,
      anguloMax: resultado.max_angle,
      lado: resultado.lado,
    };

    try {
      await createSesionWithMedicion(sesion);
      Alert.alert('Sesión guardada correctamente');
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      Alert.alert('No se pudo guardar la sesión');
    }
  };

  useEffect(() => {
    const cargarMovimiento = async () => {
      const data = await getMovimientoById(Number(movimiento));
      setMovimientoData(data);
    };
    cargarMovimiento();
  }, [movimiento]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Medición: {movimientoData?.nombre || '...'}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <Button title="Seleccionar Video" onPress={seleccionarVideo} />
        <Button title="Grabar Video" onPress={grabarVideo} />
      </View>

      {videoUri && (
        <View style={{ marginVertical: 10 }}>
          <Text>Video seleccionado:</Text>
          <Text style={{ fontSize: 12 }}>{videoUri}</Text>
        </View>
      )}

      <Button title="Enviar para análisis" onPress={enviarVideo} disabled={loading} />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {resultado && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.titulo}>Resultado:</Text>
          <Text>Ángulo Mínimo: {resultado.min_angle}°</Text>
          <Text>Ángulo Máximo: {resultado.max_angle}°</Text>
          <Text>Diferencia: {resultado.delta_angle}°</Text>
          {resultado.output && (
            <Image
              source={{ uri: `http://192.168.1.19:8000/${resultado.output}` }}
              style={{ width: 300, height: 200, marginTop: 10 }}
            />
          )}
          <Button title="Guardar Sesión" onPress={guardarSesion} />
        </View>
      )}
    </View>
  );
}
