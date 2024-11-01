import React from "react";
import { ModuleContextProvider } from "./context/context";
import { BleManagerProvider } from "./context/blecontext";
import { Tabs } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons"; // Import icons for better visual design
import FontAwesome from "@expo/vector-icons/FontAwesome";
export default function TabLayout() {
  return (
    <BleManagerProvider>
      <ModuleContextProvider>
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
                <FontAwesome name="home" color="black" size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="run"
            options={{
              tabBarLabel: "Training",
              tabBarIcon: ({ color, size }) => (
                <FontAwesome6 name="person-running" size={size} color="black" />
              ),
            }}
          />
          <Tabs.Screen
            name="setting"
            options={{
              tabBarLabel: "Settings",
              tabBarIcon: ({ color, size }) => (
                <FontAwesome6 name="gear" color="black" size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="ble"
            options={{
              tabBarLabel: "BLE",
              tabBarIcon: ({ color, size }) => (
                <FontAwesome6 name="bluetooth-b" size={size} color="black" />
              ),
            }}
          />
        </Tabs>
      </ModuleContextProvider>
    </BleManagerProvider>
  );
}
