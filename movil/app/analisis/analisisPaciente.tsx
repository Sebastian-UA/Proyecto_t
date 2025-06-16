import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';

export default function AnalisisPacientePage() {
  const params = useLocalSearchParams();
  const resultado = params.resultado ? JSON.parse(params.resultado as string) : null;
  // Asegurarse de que movimiento sea string
  const movimiento = Array.isArray(params.movimiento) ? params.movimiento[0] : params.movimiento;

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
              <Image
                source={{ uri: `http://192.168.1.19:8000/${resultado.output}` }}
                style={{ width: '100%', height: 200, marginVertical: 10 }}
                resizeMode="contain"
              />
            </View>
          )}
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