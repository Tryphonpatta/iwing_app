import React from "react";
import { ModuleContextProvider } from "./context/context";
import { BleProvider } from "./context/blecontext";
import { Tabs } from "expo-router";
import { FontAwesome5, FontAwesome, Ionicons } from "@expo/vector-icons";
import { IconPositionProvider } from "./IconPositionContext";

export default function TabLayout() {
  return (
    <BleProvider>
      <IconPositionProvider>
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
                  <FontAwesome name="home" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="training"
              options={{
                tabBarLabel: "training",
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome5 name="running" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="setting"
              options={{
                tabBarLabel: "Settings",
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome5 name="cog" size={size} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="start"
              options={{
                tabBarLabel: "Test Running",
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome
                    name="hourglass-start"
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
          </Tabs>
        </ModuleContextProvider>
      </IconPositionProvider>
    </BleProvider>
  );
}
