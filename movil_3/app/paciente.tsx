import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getPacientesInfo } from '@/services/paciente.api';
import { usePatient } from '@/context/paciente';
import { useProfessional } from '@/context/profesional';
import { theme } from '../estilos/themes';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PacientesScreen = () => {
  const router = useRouter();
  const { setPatient } = usePatient();
  const { professional } = useProfessional();

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchPacientes = async () => {
        if (!professional?.profesionalId) {
          setPacientes([]);
          return;
        }
        try {
          console.log('🔄 Recargando lista de pacientes...');
          const data = await getPacientesInfo(professional.profesionalId);
          console.log('👀 Pacientes recibidos del backend:', data);
          setPacientes(data);
        } catch (error) {
          console.error('Error al cargar pacientes:', error);
          Alert.alert('Error', 'No se pudieron cargar los pacientes');
        }
      };

      fetchPacientes();
    }, [professional])
  );

  const filteredPacientes = pacientes
    .filter(p => p.profesionalId === professional?.profesionalId)
    .filter(
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

  useFocusEffect(
    useCallback(() => {
      if (!professional) {
        Alert.alert('Acceso denegado', 'Debes iniciar sesión como profesional');
        router.replace('/login');
      }
    }, [professional])
  );

  const renderPacienteItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.pacienteCard,
        index === selectedIndex && styles.pacienteCardSelected,
      ]}
      onPress={() => handleSelect(index)}
    >
      <View style={styles.pacienteCardContent}>
        <View style={styles.pacienteInfo}>
          <Icon 
            name="account" 
            size={24} 
            color={index === selectedIndex ? theme.colors.primary : theme.colors.placeholder} 
            style={styles.pacienteIcon}
          />
          <View style={styles.pacienteTextContainer}>
            <Text style={[
              styles.pacienteName,
              index === selectedIndex && styles.pacienteNameSelected
            ]}>
              {item.nombre}
            </Text>
            <Text style={[
              styles.pacienteRut,
              index === selectedIndex && styles.pacienteRutSelected
            ]}>
              {item.rut}
            </Text>
          </View>
        </View>
        <Icon 
          name="chevron-right" 
          size={24} 
          color={index === selectedIndex ? theme.colors.primary : theme.colors.placeholder} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="account-group-outline" size={80} color={theme.colors.placeholder} />
      <Text style={styles.emptyTitle}>No tienes pacientes registrados aún</Text>
      <Text style={styles.emptySubtitle}>
        Comienza registrando tu primer paciente para poder realizar mediciones
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="account-group" size={60} color={theme.colors.primary} />
        <Text style={styles.title}>Mis Pacientes</Text>
        <Text style={styles.subtitle}>Selecciona un paciente para continuar</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.placeholder} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o RUT"
          placeholderTextColor={theme.colors.placeholder}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredPacientes}
        keyExtractor={(item) => item.pacienteId.toString()}
        renderItem={renderPacienteItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.primaryButton,
            selectedIndex === null && styles.buttonDisabled
          ]} 
          onPress={handleContinuar}
          disabled={selectedIndex === null}
        >
          <Text style={styles.buttonText}>Continuar</Text>
          <Icon name="arrow-right" size={20} color={theme.colors.buttonText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/registroPaciente')}
        >
          <Icon name="account-plus" size={20} color={theme.colors.buttonText} />
          <Text style={styles.buttonText}>Registrar nuevo paciente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PacientesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  pacienteCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pacienteCardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },
  pacienteCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  pacienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pacienteIcon: {
    marginRight: theme.spacing.md,
  },
  pacienteTextContainer: {
    flex: 1,
  },
  pacienteName: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pacienteNameSelected: {
    color: theme.colors.primary,
  },
  pacienteRut: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.placeholder,
  },
  pacienteRutSelected: {
    color: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.placeholder,
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginHorizontal: theme.spacing.sm,
  },
});
