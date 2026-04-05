import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

// === SCREENS ===
import { LoginScreen } from '../screens/LoginScreen';
import { ServeurScreenPlaceholder, CuisinierScreen } from '../screens/Placeholders';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const ServeurTabs = createBottomTabNavigator();

// === NAVIGATEUR DES SERVEURS (BOTTOM TABS) ===
const ServeurNavigator = () => {
  return (
    <ServeurTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'restaurant';
          if (route.name === 'TablePlan') iconName = focused ? 'grid' : 'grid-outline';
          if (route.name === 'Menu') iconName = focused ? 'restaurant' : 'restaurant-outline';
          if (route.name === 'Commandes') iconName = focused ? 'receipt' : 'receipt-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#006e2f',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <ServeurTabs.Screen name="TablePlan" options={{ title: 'Plan des Tables' }}>
        {() => <ServeurScreenPlaceholder title="Plan des Tables" />}
      </ServeurTabs.Screen>
      <ServeurTabs.Screen name="Menu" options={{ title: 'Menu' }}>
        {() => <ServeurScreenPlaceholder title="Menu de Prise de Commande" />}
      </ServeurTabs.Screen>
      <ServeurTabs.Screen name="Commandes" options={{ title: 'Commandes' }}>
        {() => <ServeurScreenPlaceholder title="Liste des Commandes Actives" />}
      </ServeurTabs.Screen>
    </ServeurTabs.Navigator>
  );
};

// === NAVIGATEUR PRINCIPAL ===
export const AppNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      {/* Redirection Automatique basée sur l'état Zustand */}
      {!isAuthenticated ? (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      ) : (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
           {user?.role === 'cuisinier' ? (
            <AppStack.Screen name="CuisineApp" component={CuisinierScreen} />
          ) : (
            <AppStack.Screen name="ServeurApp" component={ServeurNavigator} />
          )}
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
};