import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

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

  // Estados para Movimiento y Lado (DropDownPicker)
  const [movimiento, setMovimiento] = useState<string>('Todos');
  const [openMovimiento, setOpenMovimiento] = useState(false);
  const [itemsMovimiento, setItemsMovimiento] = useState([
    { label: 'Todos', value: 'Todos' },
    { label: 'Abducción', value: 'Abducción' },
    { label: 'Flexión', value: 'Flexión' },
    { label: 'Pronación y Supinación', value: 'Pronación y Supinación' },
  ]);

  const [lado, setLado] = useState<string>('Todos');
  const [openLado, setOpenLado] = useState(false);
  const [itemsLado, setItemsLado] = useState([
    { label: 'Todos', value: 'Todos' },
    { label: 'Derecha', value: 'derecha' },
    { label: 'Izquierda', value: 'izquierda' },
  ]);

  // Estados para filtros
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const [movimientoFiltrado, setMovimientoFiltrado] = useState<string>('Todos');
  const [ladoFiltrado, setLadoFiltrado] = useState<string>('Todos');

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
          nombre: m.movimiento.nombre === 'Pronación y Supinación' ? 'Pronación y Supinación' : m.movimiento.nombre,
        },
      }));

      setMediciones(normalizadas);

    } catch (error) {
      setMediciones([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarMediciones = () => {
    let filtradas = mediciones;
    if (movimientoFiltrado !== 'Todos') {
      filtradas = filtradas.filter(m => m.movimiento.nombre === movimientoFiltrado);
    }
    if (ladoFiltrado !== 'Todos') {
      filtradas = filtradas.filter(m => m.lado === ladoFiltrado);
    }
    return filtradas;
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
    const screenWidth = Dimensions.get('window').width;
    const cellWidth = Math.max(120, screenWidth / 7);
    return (
      <View style={styles.tablaContainer}>
        <Text style={styles.tablaTitle}>Detalle de Mediciones</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
          <View style={{ minWidth: cellWidth * 7 }}>
            <View style={styles.tablaHeader}>
              {['Fecha', 'Movimiento', 'Lado', 'Ángulo Máx.', 'Ángulo Mín.', 'Máx. Esperado', 'Mín. Esperado'].map(t => (
                <Text key={t} style={[styles.headerCell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{t}</Text>
              ))}
            </View>
            <View>
              {filtradas.map(m => (
                <View key={m.medicionId} style={styles.tablaRow}>
                  <Text style={[styles.cell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{m.sesion.fecha}</Text>
                  <Text style={[styles.cell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{m.movimiento.nombre}</Text>
                  <Text style={[styles.cell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{m.lado}</Text>
                  <Text style={[styles.cell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{m.anguloMax}°</Text>
                  <Text style={[styles.cell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{m.anguloMin}°</Text>
                  <Text style={[styles.cell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{m.movimiento.anguloMaxReal}°</Text>
                  <Text style={[styles.cell, { width: cellWidth, textAlign: 'center', paddingHorizontal: 8 }]}>{m.movimiento.anguloMinReal}°</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderGrafico = () => {
    const data = prepararDatosGrafico();

    if (data.labels.length === 0 || data.datasets.some(ds => ds.data.length === 0)) {
      return (
        <View style={styles.graficoContainer}>
          <MaterialCommunityIcons name="chart-line" size={60} color={theme.colors.placeholder} />
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
          <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.primary} />
          <Text style={styles.graficoTitle}>Evolución de Ángulos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={data}
            width={Math.max(Dimensions.get('window').width - 40, data.labels.length * 90)}
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
        </ScrollView>
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
    <FlatList
      data={[{ key: 'main' }]}
      renderItem={null}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <MaterialCommunityIcons name="history" size={60} color={theme.colors.primary} />
            <Text style={styles.titulo}>Historial de Mediciones</Text>
            <Text style={styles.subtitulo}>Seguimiento de la evolución del paciente</Text>
          </View>

          <View style={styles.filtrosContainer}>
            <Text style={styles.filtrosTitle}>Filtros</Text>
            <View style={styles.filtrosDropdowns}>
              <View style={{ zIndex: 1000, flex: 1, marginRight: 8 }}>
                <DropDownPicker
                  open={openMovimiento}
                  value={movimiento}
                  items={itemsMovimiento}
                  setOpen={setOpenMovimiento}
                  setValue={setMovimiento}
                  setItems={setItemsMovimiento}
                  placeholder="Selecciona un movimiento"
                  style={{ borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, minHeight: 44 }}
                  dropDownContainerStyle={{ borderColor: theme.colors.border, borderRadius: theme.borderRadius.md }}
                  textStyle={{ color: theme.colors.text }}
                  placeholderStyle={{ color: theme.colors.placeholder }}
                  listItemLabelStyle={{ color: theme.colors.text }}
                  zIndex={1000}
                />
              </View>
              <View style={{ zIndex: 999, flex: 1, marginLeft: 8 }}>
                <DropDownPicker
                  open={openLado}
                  value={lado}
                  items={itemsLado}
                  setOpen={setOpenLado}
                  setValue={setLado}
                  setItems={setItemsLado}
                  placeholder="Selecciona el lado"
                  style={{ borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, minHeight: 44 }}
                  dropDownContainerStyle={{ borderColor: theme.colors.border, borderRadius: theme.borderRadius.md }}
                  textStyle={{ color: theme.colors.text }}
                  placeholderStyle={{ color: theme.colors.placeholder }}
                  listItemLabelStyle={{ color: theme.colors.text }}
                  zIndex={999}
                />
              </View>
            </View>
            <View style={styles.filtrosButtons}>
              <TouchableOpacity
                style={styles.aplicarButton}
                onPress={() => {
                  setMovimientoFiltrado(movimiento);
                  setLadoFiltrado(lado);
                  setFiltrosAplicados(true);
                }}
              >
                <MaterialCommunityIcons name="filter-check" size={20} color={theme.colors.buttonText} />
                <Text style={styles.aplicarButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setMovimiento('Todos');
                  setLado('Todos');
                  setMovimientoFiltrado('Todos');
                  setLadoFiltrado('Todos');
                  setFiltrosAplicados(false);
                }}
              >
                <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.primary} />
                <Text style={styles.resetButtonText}>Restablecer</Text>
              </TouchableOpacity>
            </View>
            {filtrosAplicados && (
              <View style={styles.filtrosInfo}>
                <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.filtrosInfoText}>
                  Filtros aplicados: {movimientoFiltrado} - {ladoFiltrado}
                </Text>
              </View>
            )}
          </View>

          {renderGrafico()}
          {renderTabla()}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleCerrarSesion}
              disabled={cerrandoSesion}
            >
              <MaterialCommunityIcons name="logout" size={20} color={theme.colors.buttonText} />
              <Text style={styles.dangerButtonText}>
                {cerrandoSesion ? "Cerrando sesión..." : "Cerrar Sesión"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      }
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
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
  filtrosTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  filtrosDropdowns: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    zIndex: 1000,
  },
  filtrosButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
  },
  aplicarButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.45,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  aplicarButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  resetButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.45,
  },
  resetButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  filtrosInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  filtrosInfoText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.sm,
    flex: 1,
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
  tablaTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
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
