import { View, Text, StyleSheet } from "react-native";

export default function Medicion() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Medición</Text>
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
