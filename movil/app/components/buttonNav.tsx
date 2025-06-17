import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname, RelativePathString } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type NavItem = {
  name: string;
  path: RelativePathString;
  icon: keyof typeof Ionicons.glyphMap;
};

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { 
      name: "Pacientes", 
      path: "/registroPaciente" as RelativePathString,
      icon: "people"
    },
    { 
      name: "Mediciones", 
      path: "/medicion" as RelativePathString,
      icon: "analytics"
    },
    { 
      name: "Perfil", 
      path: "/perfilProfesional" as RelativePathString,
      icon: "person"
    },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.path}
          style={styles.navItem}
          onPress={() => router.replace(item.path)}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={pathname === item.path ? '#007bff' : '#333'}
          />
          <Text
            style={[
              styles.navText,
              pathname === item.path && styles.activeText
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#f1f1f1',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  activeText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default BottomNav; 