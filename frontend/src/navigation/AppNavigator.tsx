import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../stores';

// === SCREENS ===
import { LoginScreen } from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import TablesPlanScreen from '../screens/TablesPlanScreen';
import TableDetailsScreen from '../screens/TableDetailsScreen';
import KitchenScreen from '../screens/KitchenScreen';
import CommandesScreen from '../screens/CommandesScreen';
import FacturationScreen from '../screens/FacturationScreen';
import CartScreen from '../screens/CartScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const ServeurTabs = createBottomTabNavigator();
const TableStack = createNativeStackNavigator();
const CommandesStack = createNativeStackNavigator();

const TablePlanNavigator = () => {
  return (
    <TableStack.Navigator screenOptions={{ headerShown: false }}>
      <TableStack.Screen name="TablesPlanHome" component={TablesPlanScreen} />
      <TableStack.Screen name="TableDetails" component={TableDetailsScreen} />
      <TableStack.Screen name="MenuFromTable" component={MenuScreen} />
      <TableStack.Screen name="Cart" component={CartScreen} />
    </TableStack.Navigator>
  );
};

// Commandes stack: list → facturation
const CommandesNavigator = () => {
  return (
    <CommandesStack.Navigator screenOptions={{ headerShown: false }}>
      <CommandesStack.Screen name="CommandesList" component={CommandesScreen} />
      <CommandesStack.Screen name="Facturation" component={FacturationScreen} />
    </CommandesStack.Navigator>
  );
};

// === NAVIGATEUR DES SERVEURS (BOTTOM TABS) ===
const getTabBarStyle = (insets: any, hide: boolean = false) => {
  if (hide) {
    return { display: 'none' as const };
  }
  return {
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom || 10,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  };
};

const ServeurNavigator = () => {
  const insets = useSafeAreaInsets();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <ServeurTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'restaurant';
          if (route.name === 'TablePlan') iconName = focused ? 'grid' : 'grid-outline';
          if (route.name === 'Menu') iconName = focused ? 'restaurant' : 'restaurant-outline';
          if (route.name === 'Commandes') iconName = focused ? 'receipt' : 'receipt-outline';

          if (route.name === 'Menu') {
            return (
              <View style={styles.menuIconContainer}>
                <Ionicons name={iconName} size={24} color={color} />
                {itemCount > 0 && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{itemCount}</Text>
                  </View>
                )}
              </View>
            );
          } 

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: getTabBarStyle(insets),
      })}
    >
      <ServeurTabs.Screen
        name="TablePlan"
        component={TablePlanNavigator}
        options={({ route }) => {
          const nestedRoute = getFocusedRouteNameFromRoute(route) ?? 'TablesPlanHome';
          const hideTabBar = nestedRoute === 'TableDetails' || nestedRoute === 'MenuFromTable';

          return {
            title: 'Tables',
            headerShown: false,
            tabBarStyle: getTabBarStyle(insets, hideTabBar),
          };
        }}
      />
      <ServeurTabs.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu', headerShown: false }} />
      <ServeurTabs.Screen name="Commandes" component={CommandesNavigator} options={{ title: 'Commandes' }} />
    </ServeurTabs.Navigator>
  );
};

const styles = StyleSheet.create({
  menuIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBadge: {
    position: 'absolute',
    top: -6,
    right: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
});

// === NAVIGATEUR PRINCIPAL ===
export const AppNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      ) : (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
           {user?.role === 'cuisinier' ? (
            <AppStack.Screen name="CuisineApp" component={KitchenScreen} />
          ) : (
            <AppStack.Screen name="ServeurApp" component={ServeurNavigator} />
          )}
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
};
