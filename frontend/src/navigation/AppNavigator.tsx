import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

// === SCREENS ===
import { LoginScreen } from '../screens/LoginScreen';
import { ServeurScreenPlaceholder, CuisinierScreen } from '../screens/Placeholders';
import MenuScreen from '../screens/MenuScreen';
import TablesPlanScreen from '../screens/TablesPlanScreen';
import TableDetailsScreen from '../screens/TableDetailsScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const ServeurTabs = createBottomTabNavigator();
const TableStack = createNativeStackNavigator();

const TablePlanNavigator = () => {
  return (
    <TableStack.Navigator screenOptions={{ headerShown: false }}>
      <TableStack.Screen name="TablesPlanHome" component={TablesPlanScreen} />
      <TableStack.Screen name="TableDetails" component={TableDetailsScreen} />
      <TableStack.Screen name="MenuFromTable" component={MenuScreen} />
    </TableStack.Navigator>
  );
};

// === NAVIGATEUR DES SERVEURS (BOTTOM TABS) ===
const ServeurNavigator = () => {
  const insets = useSafeAreaInsets();

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
        tabBarStyle: {
          paddingBottom: 5 + insets.bottom,
          height: 60 + insets.bottom,
        },
      })}
    >
      <ServeurTabs.Screen
        name="TablePlan"
        component={TablePlanNavigator}
        options={({ route }) => {
          const nestedRoute = getFocusedRouteNameFromRoute(route) ?? 'TablesPlanHome';
          const hideTabBar = nestedRoute === 'TableDetails';

          return {
            title: 'Plan des Tables',
            headerShown: false,
            tabBarStyle: hideTabBar
              ? { display: 'none' }
              : {
                  paddingBottom: 5 + insets.bottom,
                  height: 60 + insets.bottom,
                },
          };
        }}
      />
      <ServeurTabs.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu', headerShown: false }} />
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