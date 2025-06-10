import { View, Text, Button, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goniotrack</Text>


      <Image
        source={require("../assets/images/goniometro.png")} 
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.buttonContainer}>
        <Button title="Registrarse" onPress={() => router.push("/registro")} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Iniciar Sesión" onPress={() => router.push("/login")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 8,
  },
});
