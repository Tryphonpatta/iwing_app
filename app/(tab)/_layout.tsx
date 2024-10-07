import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2f95dc",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#fff" },
        headerShown: false, // Hide the header to keep things clean
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: "Home", // Accessibility label
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          tabBarLabel: "Running",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="running" size={24} color="black" />
          ),
          tabBarAccessibilityLabel: "Training", // Accessibility label
        }}
      />
      <Tabs.Screen
        name="settings" // Changed from 'setting' to 'settings'
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: "Settings", // Accessibility label
        }}
      />
      <Tabs.Screen
        name="ble"
        options={{
          tabBarLabel: "BLE",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bluetooth-outline" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: "Bluetooth Low Energy", // Accessibility label
        }}
      />
    </Tabs>
  );
}
