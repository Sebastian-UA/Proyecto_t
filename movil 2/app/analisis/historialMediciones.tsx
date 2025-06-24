import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Button,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Medicion {
  medicionId: number;
  sesion: {
    fecha: string;
  };
  movimiento: {
    nombre: string;
    anguloMaxReal: number;
    anguloMinReal: number;
  };
  lado: string;
  anguloMax: number;
  anguloMin: number;
}

const HistorialMedicionesScreen = () => {
  const { patient, setPatient } = usePatient();
  const { professional, setProfessional } = useProfessional();
  const [loading, setLoading] = useState(true);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<string>('todos');
  const [ladoSeleccionado, setLadoSeleccionado] = useState<string>('todos');
  const [movimientosUnicos, setMovimientosUnicos] = useState<string[]>([]);
  const [ladosUnicos, setLadosUnicos] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    cargarMediciones();
  }, []);

  const normalizarLado = (lado: string) => {
    if (lado.toLowerCase().includes('izquierda')) return 'izquierda';
    if (lado.toLowerCase().includes('derecha')) return 'derecha';
    return lado;
  };

  const cargarMediciones = async () => {
    setLoading(true);
    try {
      const idPaciente = patient?.pacienteId || professional?.pacienteSeleccionado?.pacienteId;

      if (!idPaciente) {
        console.error("No se encontró un ID válido del paciente");
        setMediciones([]);
        return;
      }

      const response = await fetch(`http://192.168.1.93:8000/mediciones_completas_paciente/${idPaciente}`);
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error('Respuesta inválida del servidor');

      const normalizadas = data.map((m: Medicion) => ({
        ...m,
        lado: normalizarLado(m.lado),
        movimiento: {
          ...m.movimiento,
          nombre: m.movimiento.nombre === 'Pronación y Supinación' ? 'Pronación/Supinación' : m.movimiento.nombre,
        },
      }));

      setMediciones(normalizadas);

      const movimientos = Array.from(new Set(normalizadas.map((m: Medicion) => m.movimiento.nombre)));
      setMovimientosUnicos(movimientos);

      const lados = Array.from(new Set(normalizadas.map((m: Medicion) => m.lado)));
      setLadosUnicos(lados);

    } catch (error) {
      console.error('Error al cargar mediciones:', error);
      setMediciones([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarMediciones = () => {
    return mediciones.filter(m => {
      const cumpleMov = movimientoSeleccionado === 'todos' || m.movimiento.nombre === movimientoSeleccionado;
      const cumpleLado = ladoSeleccionado === 'todos' || m.lado === ladoSeleccionado;
      return cumpleMov && cumpleLado;
    });
  };

  const prepararDatosGrafico = () => {
    const filtradas = filtrarMediciones();
    return {
      labels: filtradas.map((_, i) => `Análisis ${i + 1}`),
      datasets: [
        { data: filtradas.map(m => m.movimiento.anguloMaxReal), color: () => '#4CAF50', strokeWidth: 2 },
        { data: filtradas.map(m => m.movimiento.anguloMinReal), color: () => '#FF9800', strokeWidth: 2 },
        { data: filtradas.map(m => m.anguloMax), color: () => '#03A9F4', strokeWidth: 2 },
        { data: filtradas.map(m => m.anguloMin), color: () => '#795548', strokeWidth: 2 },
      ],
    };
  };

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('paciente');
      await AsyncStorage.removeItem('profesional');
      setPatient(null);
      setProfessional(null);
      router.replace('/');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const renderTabla = () => {
    const filtradas = filtrarMediciones();
    return (
      <ScrollView horizontal style={styles.tablaContainer}>
        <View>
          <View style={styles.tablaHeader}>
            {['Fecha', 'Movimiento', 'Lado', 'Ángulo Máx.', 'Ángulo Mín.', 'Máx. Esperado', 'Mín. Esperado'].map(t => (
              <Text key={t} style={styles.headerCell}>{t}</Text>
            ))}
          </View>
          <ScrollView>
            {filtradas.map(m => (
              <View key={m.medicionId} style={styles.tablaRow}>
                <Text style={styles.cell}>{m.sesion.fecha}</Text>
                <Text style={styles.cell}>{m.movimiento.nombre}</Text>
                <Text style={styles.cell}>{m.lado}</Text>
                <Text style={styles.cell}>{m.anguloMax}°</Text>
                <Text style={styles.cell}>{m.anguloMin}°</Text>
                <Text style={styles.cell}>{m.movimiento.anguloMaxReal}°</Text>
                <Text style={styles.cell}>{m.movimiento.anguloMinReal}°</Text>
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
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={styles.grafico}
        />
        <View style={styles.leyenda}>
          {[
            { color: '#4CAF50', label: 'Máx. Esperado' },
            { color: '#FF9800', label: 'Mín. Esperado' },
            { color: '#03A9F4', label: 'Máx. Obtenido' },
            { color: '#795548', label: 'Mín. Obtenido' },
          ].map((item) => (
            <View key={item.label} style={styles.leyendaItem}>
              <View style={[styles.leyendaColor, { backgroundColor: item.color }]} />
              <Text>{item.label}</Text>
            </View>
          ))}
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
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Movimiento:</Text>
          <Picker selectedValue={movimientoSeleccionado} onValueChange={setMovimientoSeleccionado} style={styles.picker}>
            <Picker.Item label="Todos" value="todos" />
            {movimientosUnicos.map(m => <Picker.Item key={m} label={m} value={m} />)}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Lado:</Text>
          <Picker selectedValue={ladoSeleccionado} onValueChange={setLadoSeleccionado} style={styles.picker}>
            <Picker.Item label="Todos" value="todos" />
            {ladosUnicos.map(l => <Picker.Item key={l} label={l} value={l} />)}
          </Picker>
        </View>
      </View>
      {renderGrafico()}
      {renderTabla()}

      <View style={{ marginTop: 30, marginBottom: 20 }}>
        <Button title="Cerrar Sesión" color="#d9534f" onPress={cerrarSesion} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f9fc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  filtros: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  pickerContainer: { flex: 1, marginHorizontal: 5 },
  pickerLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  picker: { height: 40, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 5 },
  graficoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  graficoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  grafico: { marginVertical: 8, borderRadius: 16 },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginVertical: 5 },
  leyendaColor: { width: 15, height: 15, borderRadius: 3, marginRight: 5 },
  tablaContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: { width: 120, fontWeight: 'bold', textAlign: 'center' },
  tablaRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: { width: 120, textAlign: 'center' },
});

export default HistorialMedicionesScreen;
