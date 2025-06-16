import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';

interface Medicion {
  id: number;
  fecha: string;
  movimiento: string;
  lado: string;
  anguloMaximo: number;
  anguloMinimo: number;
  anguloMaximoEsperado: number;
  anguloMinimoEsperado: number;
}

const HistorialMedicionesScreen = () => {
  const router = useRouter();
  const { patient } = usePatient();
  const { professional } = useProfessional();
  const [loading, setLoading] = useState(true);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<string>('todos');
  const [ladoSeleccionado, setLadoSeleccionado] = useState<string>('todos');

  useEffect(() => {
    cargarMediciones();
  }, [movimientoSeleccionado, ladoSeleccionado]);

  const cargarMediciones = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.1.19:8000/mediciones/${patient?.pacienteId}?movimiento=${movimientoSeleccionado}&lado=${ladoSeleccionado}`
      );
      const data = await response.json();
      setMediciones(data);
    } catch (error) {
      console.error('Error al cargar mediciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarMediciones = () => {
    return mediciones.filter(medicion => {
      const cumpleMovimiento = movimientoSeleccionado === 'todos' || medicion.movimiento === movimientoSeleccionado;
      const cumpleLado = ladoSeleccionado === 'todos' || medicion.lado === ladoSeleccionado;
      return cumpleMovimiento && cumpleLado;
    });
  };

  const prepararDatosGrafico = () => {
    const medicionesFiltradas = filtrarMediciones();
    return {
      labels: medicionesFiltradas.map((_, index) => `Análisis ${index + 1}`),
      datasets: [
        {
          data: medicionesFiltradas.map(m => m.anguloMaximoEsperado),
          color: () => '#4CAF50', // Verde
          strokeWidth: 2,
        },
        {
          data: medicionesFiltradas.map(m => m.anguloMinimoEsperado),
          color: () => '#FF9800', // Naranja
          strokeWidth: 2,
        },
        {
          data: medicionesFiltradas.map(m => m.anguloMaximo),
          color: () => '#03A9F4', // Celeste
          strokeWidth: 2,
        },
        {
          data: medicionesFiltradas.map(m => m.anguloMinimo),
          color: () => '#795548', // Café
          strokeWidth: 2,
        },
      ],
    };
  };

  const renderTabla = () => {
    const medicionesFiltradas = filtrarMediciones();
    return (
      <ScrollView horizontal style={styles.tablaContainer}>
        <View>
          <View style={styles.tablaHeader}>
            <Text style={styles.headerCell}>Fecha</Text>
            <Text style={styles.headerCell}>Movimiento</Text>
            <Text style={styles.headerCell}>Lado</Text>
            <Text style={styles.headerCell}>Ángulo Máx.</Text>
            <Text style={styles.headerCell}>Ángulo Mín.</Text>
            <Text style={styles.headerCell}>Máx. Esperado</Text>
            <Text style={styles.headerCell}>Mín. Esperado</Text>
          </View>
          <ScrollView>
            {medicionesFiltradas.map((medicion, index) => (
              <View key={medicion.id} style={styles.tablaRow}>
                <Text style={styles.cell}>{medicion.fecha}</Text>
                <Text style={styles.cell}>{medicion.movimiento}</Text>
                <Text style={styles.cell}>{medicion.lado}</Text>
                <Text style={styles.cell}>{medicion.anguloMaximo}°</Text>
                <Text style={styles.cell}>{medicion.anguloMinimo}°</Text>
                <Text style={styles.cell}>{medicion.anguloMaximoEsperado}°</Text>
                <Text style={styles.cell}>{medicion.anguloMinimoEsperado}°</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  const renderGrafico = () => {
    const data = prepararDatosGrafico();
    return (
      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitle}>Evolución de Ángulos</Text>
        <LineChart
          data={data}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.grafico}
        />
        <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: '#4CAF50' }]} />
            <Text>Máx. Esperado</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: '#FF9800' }]} />
            <Text>Mín. Esperado</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: '#03A9F4' }]} />
            <Text>Máx. Obtenido</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: '#795548' }]} />
            <Text>Mín. Obtenido</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historial de Mediciones</Text>

      <View style={styles.filtros}>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            movimientoSeleccionado === 'todos' && styles.filtroButtonActive,
          ]}
          onPress={() => setMovimientoSeleccionado('todos')}
        >
          <Text style={styles.filtroButtonText}>Todos los Movimientos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            ladoSeleccionado === 'todos' && styles.filtroButtonActive,
          ]}
          onPress={() => setLadoSeleccionado('todos')}
        >
          <Text style={styles.filtroButtonText}>Ambos Lados</Text>
        </TouchableOpacity>
      </View>

      {renderGrafico()}
      {renderTabla()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filtroButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  filtroButtonActive: {
    backgroundColor: '#007bff',
  },
  filtroButtonText: {
    color: '#333',
  },
  graficoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  graficoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  grafico: {
    marginVertical: 8,
    borderRadius: 16,
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  leyendaColor: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 5,
  },
  tablaContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    width: 120,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tablaRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    width: 120,
    textAlign: 'center',
  },
});

export default HistorialMedicionesScreen; 