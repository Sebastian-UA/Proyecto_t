import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

      if (params?.registrado === 'true') {
        Alert.alert('✅ Éxito', 'Paciente registrado correctamente');
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Seleccionar Paciente</Text>

      <TextInput
        placeholder="Buscar por nombre o RUT"
        placeholderTextColor="#888"
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.input}
      />

      <FlatList
        data={filteredPacientes}
        keyExtractor={(item) => item.pacienteId.toString()}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.card,
              selectedIndex === index && styles.cardSelected,
            ]}
            onPress={() => handleSelect(index)}
          >
            <Text style={styles.cardName}>{item.nombre}</Text>
            <Text style={styles.cardRut}>{item.rut}</Text>
            <Text style={styles.cardDetail}>Edad: {item.edad} | Tel: {item.telefono}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.secondary]}
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
    </KeyboardAvoidingView>
  );
};

export default PacienteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  cardRut: {
    fontSize: 15,
    color: '#555',
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#007bff',
  },
  secondary: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
