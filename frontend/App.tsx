import "./global.css";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuScreen } from "./src/screens/MenuScreen";
import { TableDetailsScreen } from "./src/screens/TableDetailsScreen";
import { TablesPlanScreen } from "./src/screens/TablesPlanScreen";

export type RootStackParamList = {
  TablesPlan: undefined;
  TableDetails: { tableId: number };
  Menu: { tableId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="TablesPlan"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: "#f9f9ff" },
          }}
        >
          <Stack.Screen name="TablesPlan" component={TablesPlanScreen} />
          <Stack.Screen name="TableDetails" component={TableDetailsScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
