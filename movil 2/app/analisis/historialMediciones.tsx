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
import { useRouter } from 'expo-router';
import { cerrarSesion } from '@/services/sesion';
import { useNavigation } from '@/hooks/useNavigation';
import { API_CONFIG } from '@/config/api';
import styles from '@/estilos/styles';

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
  const router = useRouter();
  const { navigateToLogin } = useNavigation();
  const { patient, setPatient } = usePatient();
  const { professional, setProfessional } = useProfessional();
  const [loading, setLoading] = useState(true);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Inicializamos vacíos, luego en useEffect los seteamos al primer valor disponible
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<string>('');
  const [ladoSeleccionado, setLadoSeleccionado] = useState<string>('');
  const [movimientosUnicos, setMovimientosUnicos] = useState<string[]>([]);
  const [ladosUnicos, setLadosUnicos] = useState<string[]>([]);

  useEffect(() => {
    cargarMediciones();
  }, []);

  useEffect(() => {
    if (movimientosUnicos.length > 0) {
      setMovimientoSeleccionado(movimientosUnicos[0]);
    }
  }, [movimientosUnicos]);

  useEffect(() => {
    if (ladosUnicos.length > 0) {
      setLadoSeleccionado(ladosUnicos[0]);
    }
  }, [ladosUnicos]);

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
        setMediciones([]);
        return;
      }

      const url = `${API_CONFIG.BASE_URL}/mediciones_completas_paciente/${idPaciente}`;
      const response = await fetch(url);
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
      setMediciones([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarMediciones = () => {
    // Filtro estricto sin 'todos'
    return mediciones.filter(m => m.movimiento.nombre === movimientoSeleccionado && m.lado === ladoSeleccionado);
  };

  const prepararDatosGrafico = () => {
    const filtradas = filtrarMediciones();

    const sanitize = (value: any) =>
      typeof value === 'number' && isFinite(value) ? value : 0;

    return {
      labels: filtradas.map((_, i) => `Análisis ${i + 1}`),
      datasets: [
        {
          data: filtradas.map(m => sanitize(m.movimiento.anguloMaxReal)),
          color: () => '#4CAF50',
          strokeWidth: 2
        },
        {
          data: filtradas.map(m => sanitize(m.movimiento.anguloMinReal)),
          color: () => '#FF9800',
          strokeWidth: 2
        },
        {
          data: filtradas.map(m => sanitize(m.anguloMax)),
          color: () => '#03A9F4',
          strokeWidth: 2
        },
        {
          data: filtradas.map(m => sanitize(m.anguloMin)),
          color: () => '#795548',
          strokeWidth: 2
        }
      ]
    };
  };

  const handleCerrarSesion = async () => {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);
    try {
      await cerrarSesion(setPatient, setProfessional, navigateToLogin);
    } finally {
      setCerrandoSesion(false);
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

    if (data.labels.length === 0 || data.datasets.some(ds => ds.data.length === 0)) {
      return (
        <View style={styles.graficoContainer}>
          <Text style={styles.graficoTitle}>No hay mediciones disponibles para mostrar.</Text>
        </View>
      );
    }

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
    <ScrollView
      style={{ flex: 1, backgroundColor: '#B3F0FF' }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.titulo}>Historial de Mediciones</Text>
      <View style={styles.filtros}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Movimiento:</Text>
          <Picker
            selectedValue={movimientoSeleccionado}
            onValueChange={setMovimientoSeleccionado}
            style={styles.picker}
          >
            {/* Quitamos opción "Todos" */}
            {movimientosUnicos.map(m => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Lado:</Text>
          <Picker
            selectedValue={ladoSeleccionado}
            onValueChange={setLadoSeleccionado}
            style={styles.picker}
          >
            {/* Quitamos opción "Todos" */}
            {ladosUnicos.map(l => (
              <Picker.Item key={l} label={l} value={l} />
            ))}
          </Picker>
        </View>
      </View>

      {renderGrafico()}
      {renderTabla()}

      <View style={{ marginTop: 30, marginBottom: 20 }}>
        <Button
          title={cerrandoSesion ? "Cerrando sesión..." : "Cerrar Sesión"}
          color="#d9534f"
          onPress={handleCerrarSesion}
          disabled={cerrandoSesion}
        />
      </View>
    </ScrollView>
  );
};

export default HistorialMedicionesScreen;
