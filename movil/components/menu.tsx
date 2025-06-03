import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function MenuSuperior() {
  const router = useRouter();

  return (
    <View style={styles.menu}>
      <TouchableOpacity onPress={() => router.push("/medicion/medicion")}>
        <Text style={styles.link}>Medición</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/reporte/reporte")}>
        <Text style={styles.link}>Reporte</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/historial/historial")}>
        <Text style={styles.link}>Historial</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#2e7d32",
  },
  link: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
