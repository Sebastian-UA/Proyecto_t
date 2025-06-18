import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';

export default function AnalisisPacientePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const resultado = params.resultado ? JSON.parse(params.resultado as string) : null;
  const movimiento = Array.isArray(params.movimiento) ? params.movimiento[0] : params.movimiento;

  const { setPatient } = usePatient();
  const { setProfessional } = useProfessional();

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('paciente');
      await AsyncStorage.removeItem('profesional');
      setPatient(null);
      setProfessional(null);
      router.replace('/'); // Redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resultados del análisis</Text>
      <Text style={styles.subtitulo}>Movimiento: {movimiento}</Text>
      {resultado ? (
        <View style={styles.caja}>
          {movimiento?.toLowerCase() === "pronación y supinación" ? (
            <View style={{ marginVertical: 10 }}>
              <View style={styles.resultadoContainer}>
                <Text style={styles.subtitulo}>Pronación:</Text>
                <View style={styles.anguloContainer}>
                  <Text style={styles.anguloLabel}>Mínimo:</Text>
                  <Text style={styles.anguloValor}>{resultado.pronacion?.min_angle?.toFixed(2)}°</Text>
                </View>
                <View style={styles.anguloContainer}>
                  <Text style={styles.anguloLabel}>Máximo:</Text>
                  <Text style={styles.anguloValor}>{resultado.pronacion?.max_angle?.toFixed(2)}°</Text>
                </View>
                {resultado.pronacion?.delta_angle && (
                  <View style={styles.anguloContainer}>
                    <Text style={styles.anguloLabel}>Diferencia:</Text>
                    <Text style={styles.anguloValor}>{resultado.pronacion.delta_angle.toFixed(2)}°</Text>
                  </View>
                )}
              </View>

              <View style={[styles.resultadoContainer, { marginTop: 20 }]}>
                <Text style={styles.subtitulo}>Supinación:</Text>
                <View style={styles.anguloContainer}>
                  <Text style={styles.anguloLabel}>Mínimo:</Text>
                  <Text style={styles.anguloValor}>{resultado.supinacion?.min_angle?.toFixed(2)}°</Text>
                </View>
                <View style={styles.anguloContainer}>
                  <Text style={styles.anguloLabel}>Máximo:</Text>
                  <Text style={styles.anguloValor}>{resultado.supinacion?.max_angle?.toFixed(2)}°</Text>
                </View>
                {resultado.supinacion?.delta_angle && (
                  <View style={styles.anguloContainer}>
                    <Text style={styles.anguloLabel}>Diferencia:</Text>
                    <Text style={styles.anguloValor}>{resultado.supinacion.delta_angle.toFixed(2)}°</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.resultadoContainer}>
              <Text style={styles.subtitulo}>Ángulos:</Text>
              <View style={styles.anguloContainer}>
                <Text style={styles.anguloLabel}>Mínimo:</Text>
                <Text style={styles.anguloValor}>{resultado.min_angle?.toFixed(2)}°</Text>
              </View>
              <View style={styles.anguloContainer}>
                <Text style={styles.anguloLabel}>Máximo:</Text>
                <Text style={styles.anguloValor}>{resultado.max_angle?.toFixed(2)}°</Text>
              </View>
              {resultado.delta_angle && (
                <View style={styles.anguloContainer}>
                  <Text style={styles.anguloLabel}>Diferencia:</Text>
                  <Text style={styles.anguloValor}>{resultado.delta_angle.toFixed(2)}°</Text>
                </View>
              )}
            </View>
          )}

          {resultado.output && (
            <View style={{ marginVertical: 10 }}>
              <Text style={styles.subtitulo}>Video procesado:</Text>
              <Video
                source={{ uri: `http://192.168.1.14:8000/${resultado.output}` }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                useNativeControls
                style={{ width: '100%', height: 200, marginVertical: 10 }}
              />
            </View>
          )}

          <Button
            title="Ver Historial de Mediciones"
            onPress={() => router.push('/analisis/historialMediciones')}
            color="#007bff"
          />

          <TouchableOpacity
            onPress={cerrarSesion}
            style={{
              backgroundColor: '#d9534f',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 20,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.error}>No hay resultados disponibles</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#B3F0FF',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  caja: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  resultadoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  anguloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  anguloLabel: {
    fontSize: 16,
    color: '#666',
  },
  anguloValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  error: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
