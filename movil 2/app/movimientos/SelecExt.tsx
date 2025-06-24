import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../../estilos/styles';

export default function SeleccionExtremidades() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selección de Extremidades</Text>

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
          <Image
            source={require('@/assets/images/codo.png')}
            style={styles.imagen}
          />
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
          <Image
            source={require('@/assets/images/hombro.png')}
            style={styles.imagen}
          />
          <Text style={styles.textoBoton}>Hombro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
