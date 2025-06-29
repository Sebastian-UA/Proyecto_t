import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SeleccionExtremidades() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="human-male" size={60} color={theme.colors.primary} />
        <Text style={styles.titulo}>Selección de Extremidades</Text>
        <Text style={styles.subtitulo}>Elige la extremidad a evaluar</Text>
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
            <Icon name="arm-flex" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.textoBoton}>Codo</Text>
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
            <Icon name="arm" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.textoBoton}>Hombro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
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
  botonesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  boton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: 140,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  textoBoton: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
