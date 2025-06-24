import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, Button, TouchableOpacity, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';
import styles from '@/estilos/styles';
import { API_CONFIG } from '@/config/api';
import { cerrarSesion } from '@/services/sesion'; // ← ya debe estar importado

export default function AnalisisPacientePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const resultado = params.resultado ? JSON.parse(params.resultado as string) : null;
  const movimiento = Array.isArray(params.movimiento) ? params.movimiento[0] : params.movimiento;

  const { setPatient, patient } = usePatient();
  const { setProfessional, professional } = useProfessional();

  useEffect(() => {
    console.log('📦 Params recibidos en /analisisPaciente:', params);
  }, []);


  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>
          No hay paciente en contexto. Por favor, vuelve a seleccionar uno.
        </Text>
      </View>
    );
  }


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
                source={{ uri: `${API_CONFIG.BASE_URL}/${resultado.output}` }}
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
            onPress={() =>
              router.push({
                pathname: '/analisis/historialMediciones',
                params: { movimientoId: params.movimientoId },
              })
            }
            color="#007bff"
          />


          <TouchableOpacity
            onPress={async () => {
              await cerrarSesion(setPatient, setProfessional, () => router.replace('/'));
            }}
            style={{
              backgroundColor: '#dc3545',
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
