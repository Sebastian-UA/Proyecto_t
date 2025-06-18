import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getPacientesInfo } from '@/services/paciente.api';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';

const PacientesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setPatient } = usePatient();
  const { professional } = useProfessional();

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fetchPacientes = async () => {
    try {
      if (!professional) {
        Alert.alert('Error', 'Profesional no autenticado');
        return;
      }

      const data = await getPacientesInfo(professional.profesionalId);
      setPacientes(data);

      if (params?.registrado === 'true') {
        Alert.alert('Éxito', 'Paciente registrado correctamente');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
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
    router.push('/movimientos/SelecExt');
  };
useEffect(() => {
  if (!professional) {
    Alert.alert('Acceso denegado', 'Debes iniciar sesión como profesional');
    router.replace('/login');
  }
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pacientes</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o RUT"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <FlatList
        data={filteredPacientes}
        keyExtractor={(item) => item.pacienteId.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.pacienteItem,
              index === selectedIndex && styles.pacienteItemSelected,
            ]}
            onPress={() => handleSelect(index)}
          >
            <Text style={styles.pacienteText}>{item.nombre} - {item.rut}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No se encontraron pacientes</Text>}
      />

      <TouchableOpacity style={styles.button} onPress={handleContinuar}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/registroPaciente')}
      >
        <Text style={styles.buttonText}>Registrar nuevo paciente</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  pacienteItem: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  pacienteItemSelected: {
    backgroundColor: '#b3d4fc',
  },
  pacienteText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PacientesScreen;
