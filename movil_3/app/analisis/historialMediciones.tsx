import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { cerrarSesion } from '@/services/sesion';
import { useNavigation } from '@/hooks/useNavigation';
import { API_CONFIG } from '@/config/api';
import { theme } from '@/estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
      <View style={styles.tablaContainer}>
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
    );
  };

  const renderGrafico = () => {
    const data = prepararDatosGrafico();

    if (data.labels.length === 0 || data.datasets.some(ds => ds.data.length === 0)) {
      return (
        <View style={styles.graficoContainer}>
          <Icon name="chart-line" size={60} color={theme.colors.placeholder} />
          <Text style={styles.graficoTitle}>No hay mediciones disponibles para mostrar</Text>
          <Text style={styles.graficoSubtitle}>
            Selecciona un movimiento y lado para ver el historial
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.graficoContainer}>
        <View style={styles.graficoHeader}>
          <Icon name="chart-line" size={24} color={theme.colors.primary} />
          <Text style={styles.graficoTitle}>Evolución de Ángulos</Text>
        </View>
        <LineChart
          data={data}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.background,
            backgroundGradientFrom: theme.colors.background,
            backgroundGradientTo: theme.colors.background,
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
              <Text style={styles.leyendaText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Icon name="history" size={60} color={theme.colors.primary} />
        <Text style={styles.titulo}>Historial de Mediciones</Text>
        <Text style={styles.subtitulo}>Seguimiento de la evolución del paciente</Text>
      </View>

      <View style={styles.filtrosContainer}>
        <View style={styles.filtros}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerLabelContainer}>
              <Icon name="arm-flex" size={16} color={theme.colors.primary} />
              <Text style={styles.pickerLabel}>Movimiento:</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={movimientoSeleccionado}
                onValueChange={setMovimientoSeleccionado}
                style={styles.picker}
              >
                {movimientosUnicos.map(m => (
                  <Picker.Item key={m} label={m} value={m} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerLabelContainer}>
              <Icon name="human-male" size={16} color={theme.colors.primary} />
              <Text style={styles.pickerLabel}>Lado:</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={ladoSeleccionado}
                onValueChange={setLadoSeleccionado}
                style={styles.picker}
              >
                {ladosUnicos.map(l => (
                  <Picker.Item key={l} label={l} value={l} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {renderGrafico()}
      {renderTabla()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleCerrarSesion}
          disabled={cerrandoSesion}
        >
          <Icon name="logout" size={20} color={theme.colors.buttonText} />
          <Text style={styles.dangerButtonText}>
            {cerrandoSesion ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HistorialMedicionesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  contentContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
  },
  loadingText: {
    color: theme.colors.placeholder,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  titulo: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  filtrosContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  pickerLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  pickerWrapper: {
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  graficoContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  graficoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  graficoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    textAlign: 'center',
  },
  graficoSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  grafico: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leyendaColor: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: theme.spacing.sm,
  },
  leyendaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  tablaContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.sm,
  },
  tablaRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  dangerButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
});
