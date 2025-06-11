import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMovimientosByArticulacion } from '@/services/movimiento';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import styles from '@/estilos/styles';

interface Movimiento {
  movimientoId: number;
  nombre: string;
  descripcion: string;
  imagen_path?: string;
}

const articulacionMap: Record<string, number> = {
  codo: 1,
  hombro: 2,
};

export default function SeleccionMovimientos() {
  const { extremidad } = useLocalSearchParams() as { extremidad: string };
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const id = articulacionMap[extremidad.toLowerCase()];
        if (!id) return;

        const data = await getMovimientosByArticulacion(id);
        setMovimientos(data);
      } catch (error) {
        console.error('Error al obtener movimientos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimientos();
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
                source={{ uri: `http://192.168.1.19:8000${mov.imagen_path}` }}
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
