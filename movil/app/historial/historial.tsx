import { View, Text, StyleSheet } from "react-native";

export default function Historial() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Historial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
