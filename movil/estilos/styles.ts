import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#B3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  botonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  boton: {
    backgroundColor: '#A2F5A2',
    borderRadius: 100,
    padding: 15,
    width: 120,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  imagen: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  textoBoton: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles; 