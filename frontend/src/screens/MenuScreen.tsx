import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Menu">;

export function MenuScreen({ route }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-[#f9f9ff] px-6">
      <Text className="text-2xl font-extrabold text-[#111c2d]">Menu</Text>
      <Text className="mt-2 text-center text-slate-600">
        Ecran menu cible. tableId recu: {route.params.tableId}
      </Text>
    </View>
  );
}
