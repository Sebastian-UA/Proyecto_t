import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getPacientesInfo } from '@/services/paciente.api';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';

const PacienteScreen = () => {
  const router = useRouter();
  const { setPatient } = usePatient();
  const { professional } = useProfessional();
  const params = useLocalSearchParams();

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fetchPacientes = async () => {
    try {
      const data = await getPacientesInfo();
      setPacientes(data);

      // Mostrar alerta si se registró un nuevo paciente
      if (params?.registrado === 'true') {
        Alert.alert('Éxito', 'Paciente registrado correctamente');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPacientes();
    }, [params])
  );

  const filteredPacientes = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rut.includes(searchTerm)
  );

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleContinuar = () => {
    if (selectedIndex === null) {
      Alert.alert('Selecciona un paciente');
      return;
    }

    const paciente = filteredPacientes[selectedIndex];
    setPatient(paciente);
    console.log('✅ Paciente seleccionado:', paciente);

    if (!professional) {
      Alert.alert('Error', 'Profesional no autenticado');
      return;
    }

    router.push('/movimientos/SelecExt');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pacientes</Text>

      <TextInput
        placeholder="Buscar por nombre o RUT"
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.input}
      />

      <FlatList
        data={filteredPacientes}
        keyExtractor={(item) => item.pacienteId.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedIndex === index && styles.itemSelected,
            ]}
            onPress={() => handleSelect(index)}
          >
            <Text>{item.nombre} - {item.rut}</Text>
            <Text>Edad: {item.edad} | Tel: {item.telefono}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#28a745' }]}
          onPress={() => router.push('/registroPaciente')}
        >
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primary]}
          onPress={handleContinuar}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PacienteScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 15 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemSelected: { backgroundColor: '#e0f0ff' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { padding: 12, backgroundColor: '#ccc', borderRadius: 6 },
  primary: { backgroundColor: '#007bff' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
