import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TrainingScreen from "@/components/page/TrainningScreen";
import SettingScreen from "@/components/page/SettingScreen";
import Footer from "@/components/navigation/Footer";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Training">
        <Stack.Screen name="Training" component={TrainingScreen} />
        <Stack.Screen name="Setting" component={SettingScreen} />
      </Stack.Navigator>
      <Footer />
    </NavigationContainer>
  );
}
