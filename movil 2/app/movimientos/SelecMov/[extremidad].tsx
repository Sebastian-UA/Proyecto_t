import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMovimientosByArticulacion } from '@/services/movimiento';
import { fetchArticulaciones } from '@/config/api';  // IMPORTA esta función
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import styles from '@/estilos/styles';

interface Movimiento {
  movimientoId: number;
  nombre: string;
  descripcion: string;
  imagen_path?: string;
}

interface Articulacion {
  articulacionId: number; // o "id" según la API, ajústalo aquí
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
        const articulacionId = articulacion.articulacionId || (articulacion as any).id; // Ajusta según API

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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 20 }}>Cargando movimientos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Movimientos para: {extremidad}</Text>

      <View style={styles.botonesContainer}>
        {movimientos.map((mov) => (
          <TouchableOpacity
            key={mov.movimientoId}
            style={styles.boton}
            onPress={() => router.push(`/medicion/${mov.movimientoId}` as const)}
          >
            {mov.imagen_path && (
              <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.93:8000'}${mov.imagen_path}`}}
                style={styles.imagen}
              />
            )}
            <Text style={styles.textoBoton}>{mov.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
