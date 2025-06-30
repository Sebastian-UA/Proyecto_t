import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../estilos/themes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SeleccionExtremidades() {
  const router = useRouter();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="human-male" size={60} color={theme.colors.primary} />
        <Text style={styles.titulo}>Selección de Extremidades</Text>
        <Text style={styles.subtitulo}>Elige la extremidad a evaluar</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Selecciona la extremidad que deseas evaluar. Cada extremidad tiene diferentes movimientos disponibles para análisis.
          </Text>
        </View>

        <View style={styles.botonesContainer}>
          {/* Botón: Codo */}
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              router.push({
                pathname: '/movimientos/SelecMov/[extremidad]',
                params: { extremidad: 'Codo' },
              })
            }
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="arm-flex" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.textoBoton}>Codo</Text>
            <Text style={styles.descripcionBoton}>Flexión, pronación y supinación</Text>
          </TouchableOpacity>

          {/* Botón: Hombro */}
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              router.push({
                pathname: '/movimientos/SelecMov/[extremidad]',
                params: { extremidad: 'Hombro' },
              })
            }
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="human-male" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.textoBoton}>Hombro</Text>
            <Text style={styles.descripcionBoton}>Abducción</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color={theme.colors.placeholder} />
          <Text style={styles.helpText}>
            Tip: Asegúrate de que el paciente esté en una posición cómoda antes de comenzar la evaluación.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
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
  formContainer: {
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  botonesContainer: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  boton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  textoBoton: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  descripcionBoton: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.placeholder,
    textAlign: 'center',
    lineHeight: 18,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.placeholder}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.placeholder}30`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  helpText: {
    color: theme.colors.placeholder,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});
