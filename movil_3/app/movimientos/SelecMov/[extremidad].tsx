import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMovimientosByArticulacion } from '@/services/movimiento';
import { fetchArticulaciones } from '@/config/api';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { theme } from '@/estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Movimiento {
  movimientoId: number;
  nombre: string;
  descripcion: string;
  imagen_path?: string;
}

interface Articulacion {
  articulacionId: number;
  nombre: string;
}

export default function SeleccionMovimientos() {
  const { extremidad } = useLocalSearchParams() as { extremidad: string };
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        setLoading(true);

        // 1. Obtener articulaciones desde la API
        const articulaciones: Articulacion[] = await fetchArticulaciones();

        // 2. Buscar la articulación que coincida con el parámetro extremidad (ignore case)
        const articulacion = articulaciones.find(
          (a) => a.nombre.toLowerCase() === extremidad.toLowerCase()
        );

        if (!articulacion) {
          console.warn(`No se encontró articulación para: ${extremidad}`);
          setMovimientos([]);
          return;
        }

        // 3. Usar el id real que devuelve la API para pedir movimientos
        const articulacionId = articulacion.articulacionId || (articulacion as any).id;

        // 4. Pedir movimientos de esa articulación
        const data = await getMovimientosByArticulacion(articulacionId);
        setMovimientos(data);
      } catch (error) {
        console.error('Error al obtener movimientos:', error);
        setMovimientos([]);
      } finally {
        setLoading(false);
      }
    };

    if (extremidad) {
      fetchMovimientos();
    }
  }, [extremidad]);

  const getIconForMovement = (movementName: string) => {
    const name = movementName.toLowerCase();
    
    if (name.includes('flexión') || name.includes('flexion')) {
      return 'run';
    } else if (name.includes('abducción') || name.includes('abduccion')) {
      return 'arrow-expand';
    } else if (name.includes('pronación') || name.includes('pronacion') || 
               name.includes('supinación') || name.includes('supinacion')) {
      return 'rotate-3d-variant';
    } else if (name.includes('extensión') || name.includes('extension')) {
      return 'arrow-collapse';
    } else if (name.includes('rotación') || name.includes('rotacion')) {
      return 'rotate-orbit';
    } else {
      return 'arm-flex'; // ícono por defecto
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando movimientos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="arm-flex" size={60} color={theme.colors.primary} />
        <Text style={styles.titulo}>Movimientos para: {extremidad}</Text>
        <Text style={styles.subtitulo}>Selecciona el movimiento a evaluar</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.movimientosContainer}>
          {movimientos.map((mov) => (
            <TouchableOpacity
              key={mov.movimientoId}
              style={styles.movimientoCard}
              onPress={() => router.push(`/medicion/${mov.movimientoId}` as const)}
            >
              <View style={styles.iconContainer}>
                <Icon 
                  name={getIconForMovement(mov.nombre)} 
                  size={48} 
                  color={theme.colors.primary} 
                />
              </View>
              <Text style={styles.movimientoNombre}>{mov.nombre}</Text>
              {mov.descripcion && (
                <Text style={styles.movimientoDescripcion}>{mov.descripcion}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {movimientos.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Icon name="arm-flex-outline" size={80} color={theme.colors.placeholder} />
            <Text style={styles.emptyTitle}>No hay movimientos disponibles</Text>
            <Text style={styles.emptySubtitle}>
              No se encontraron movimientos para {extremidad}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
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
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  movimientosContainer: {
    gap: theme.spacing.md,
  },
  movimientoCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
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
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  movimientoNombre: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  movimientoDescripcion: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.placeholder,
    textAlign: 'center',
    lineHeight: 18,
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
