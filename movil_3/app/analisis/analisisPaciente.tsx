import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';
import { API_CONFIG } from '@/config/api';
import { cerrarSesion } from '@/services/sesion';
import { theme } from '@/estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

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
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color={theme.colors.error} />
        <Text style={styles.errorText}>
          No hay paciente en contexto. Por favor, vuelve a seleccionar uno.
        </Text>
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
        <Icon name="chart-line" size={60} color={theme.colors.primary} />
        <Text style={styles.titulo}>Resultados del análisis</Text>
        <Text style={styles.subtitulo}>Movimiento: {movimiento}</Text>
      </View>

      {resultado ? (
        <View style={styles.resultadosContainer}>
          {movimiento?.toLowerCase() === "pronación y supinación" ? (
            <View style={styles.angulosSection}>
              <View style={styles.resultadoCard}>
                <View style={styles.cardHeader}>
                  <Icon name="rotate-3d-variant" size={24} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>Pronación</Text>
                </View>
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

              <View style={styles.resultadoCard}>
                <View style={styles.cardHeader}>
                  <Icon name="rotate-orbit" size={24} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>Supinación</Text>
                </View>
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
            <View style={styles.resultadoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Ángulos</Text>
              </View>
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
            <View style={styles.videoSection}>
              <View style={styles.cardHeader}>
                <Icon name="video" size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Video procesado</Text>
              </View>
              <Video
                source={{ uri: `${API_CONFIG.BASE_URL}/${resultado.output}` }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                useNativeControls
                style={styles.video}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push({
                  pathname: '/analisis/historialMediciones',
                  params: { movimientoId: params.movimientoId },
                })
              }
            >
              <Icon name="history" size={20} color={theme.colors.buttonText} />
              <Text style={styles.primaryButtonText}>Ver Historial de Mediciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={async () => {
                await cerrarSesion(setPatient, setProfessional, () => router.replace('/paginas'));
              }}
            >
              <Icon name="logout" size={20} color={theme.colors.buttonText} />
              <Text style={styles.dangerButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle-outline" size={80} color={theme.colors.placeholder} />
          <Text style={styles.emptyTitle}>No hay resultados disponibles</Text>
          <Text style={styles.emptySubtitle}>
            No se encontraron resultados para mostrar
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  contentContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 22,
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
  resultadosContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  angulosSection: {
    gap: theme.spacing.lg,
  },
  resultadoCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  anguloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  anguloLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    fontWeight: '500',
  },
  anguloValor: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  videoSection: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  video: {
    width: '100%',
    height: 200,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  primaryButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
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
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    textAlign: 'center',
    lineHeight: 22,
  },
});
