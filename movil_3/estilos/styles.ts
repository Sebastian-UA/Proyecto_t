import { StyleSheet } from 'react-native';
import { theme } from './themes';

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
  caja: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  resultadoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  anguloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  anguloLabel: {
    fontSize: 16,
    color: '#666',
  },
  anguloValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  error: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  // Estilos para historial de mediciones
  tablaContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    width: 120,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tablaRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    width: 120,
    textAlign: 'center',
  },
  graficoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  graficoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  grafico: {
    marginVertical: 8,
    borderRadius: 16,
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  leyendaColor: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  picker: {
    height: 40,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    marginVertical: 10,
  },
  previewText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default styles; 