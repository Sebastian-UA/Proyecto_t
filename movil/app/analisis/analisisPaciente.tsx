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
              <Text style={styles.subtitulo}>Pronación:</Text>
              <Text>Mínimo: {resultado.pronacion?.min_angle?.toFixed(2)}°</Text>
              <Text>Máximo: {resultado.pronacion?.max_angle?.toFixed(2)}°</Text>
              <Text style={[styles.subtitulo, { marginTop: 10 }]}>Supinación:</Text>
              <Text>Mínimo: {resultado.supinacion?.min_angle?.toFixed(2)}°</Text>
              <Text>Máximo: {resultado.supinacion?.max_angle?.toFixed(2)}°</Text>
            </View>
          ) : (
            <View style={{ marginVertical: 10 }}>
              <Text style={styles.subtitulo}>Ángulos:</Text>
              <Text>Mínimo: {resultado.min_angle?.toFixed(2)}°</Text>
              <Text>Máximo: {resultado.max_angle?.toFixed(2)}°</Text>
              {resultado.delta_angle && (
                <Text>Diferencia: {resultado.delta_angle.toFixed(2)}°</Text>
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
        <Text>No hay resultados para mostrar.</Text>
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
}); 