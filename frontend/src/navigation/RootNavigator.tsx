import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuth } from '../hooks/useAuth';

import { LoginScreen } from '../screens/LoginScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { CarritoScreen } from '../screens/CarritoScreen';
import { VentasScreen } from '../screens/VentasScreen';
import { GastosScreen } from '../screens/GastosScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AdminUsuariosScreen } from '../screens/AdminUsuariosScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Pila mostrada a usuarios sin sesión: solo el login.
 *
 * @returns Navegador de pila con la pantalla de inicio de sesión.
 */
function LoginNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

/**
 * Pestañas del cajero y del resto de usuarios no administradores.
 *
 * @returns Navegador de pestañas con menú, carrito, venta, gastos y perfil.
 */
function UserNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Menú',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>🍽️</TabIcon>,
          title: 'Menú',
        }}
      />
      <Tab.Screen
        name="Carrito"
        component={CarritoScreen}
        options={{
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>🛒</TabIcon>,
          title: 'Carrito',
        }}
      />
      <Tab.Screen
        name="Ventas"
        component={VentasScreen}
        options={{
          tabBarLabel: 'Ventas',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>💰</TabIcon>,
          title: 'Nueva Venta',
        }}
      />
      <Tab.Screen
        name="Gastos"
        component={GastosScreen}
        options={{
          tabBarLabel: 'Gastos',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>💸</TabIcon>,
          title: 'Registrar Gasto',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>👤</TabIcon>,
          title: 'Mi Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Pestañas del administrador: sustituyen a gastos por gestión y omiten el
 * carrito, que no es un flujo relevante en ese rol.
 *
 * @returns Navegador de pestañas del administrador.
 */
function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#5856D6',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>📊</TabIcon>,
          title: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="AdminUsuarios"
        component={AdminUsuariosScreen}
        options={{
          tabBarLabel: 'Usuarios',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>�</TabIcon>,
          title: 'Gestión de Usuarios',
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Menú',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>🍽️</TabIcon>,
          title: 'Menú',
        }}
      />
      <Tab.Screen
        name="Ventas"
        component={VentasScreen}
        options={{
          tabBarLabel: 'Ventas',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>💰</TabIcon>,
          title: 'Nueva Venta',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }: { color: string }) => <TabIcon color={color}>👤</TabIcon>,
          title: 'Mi Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Envuelve los iconos de pestaña para aplicarles color y tamaño.
 *
 * @param props.color Color que aporta el navegador de pestañas.
 * @param props.children Emoji o glifo a renderizar.
 * @returns El texto con el estilo del icono.
 */
function TabIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return <Text style={{ fontSize: 24, color }}>{children}</Text>;
}

/**
 * Navegador raíz: decide qué árbol de pantallas se muestra según la sesión.
 *
 * Espera a que `checkAuth` termine antes de decidir, para no montar la pantalla
 * de login y expulsar a un usuario que sí tenía una sesión guardada.
 *
 * @returns El `NavigationContainer` con el navegador correspondiente al rol.
 */
export function RootNavigator() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <LoginNavigator />
      ) : isAdmin ? (
        <AdminNavigator />
      ) : (
        <UserNavigator />
      )}
    </NavigationContainer>
  );
}
