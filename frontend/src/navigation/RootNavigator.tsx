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

function TabIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return <Text style={{ fontSize: 24, color }}>{children}</Text>;
}

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
