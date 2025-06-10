import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function AnalisisPage() {
  const params = useLocalSearchParams();
  const resultado = params.resultado ? JSON.parse(params.resultado as string) : null;
  const movimiento = params.movimiento;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Análisis de {movimiento}</Text>
      {resultado ? (
        <View style={styles.caja}>
          <Text style={styles.subtitulo}>Ángulos:</Text>
          <Text>Mínimo: {resultado.min_angle?.toFixed(2)}°</Text>
          <Text>Máximo: {resultado.max_angle?.toFixed(2)}°</Text>
          {resultado.pronacion && (
            <>
              <Text style={styles.subtitulo}>Pronación:</Text>
              <Text>Mínimo: {resultado.pronacion.min_angle?.toFixed(2)}°</Text>
              <Text>Máximo: {resultado.pronacion.max_angle?.toFixed(2)}°</Text>
            </>
          )}
          {resultado.supinacion && (
            <>
              <Text style={styles.subtitulo}>Supinación:</Text>
              <Text>Mínimo: {resultado.supinacion.min_angle?.toFixed(2)}°</Text>
              <Text>Máximo: {resultado.supinacion.max_angle?.toFixed(2)}°</Text>
            </>
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