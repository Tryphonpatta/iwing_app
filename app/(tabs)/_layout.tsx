import React from "react";
import { ModuleContextProvider } from "./context/context";
import { BleManagerProvider } from "./context/blecontext";
import { Tabs } from "expo-router";
import { FontAwesome5, FontAwesome, Ionicons } from "@expo/vector-icons";
import { IconPositionProvider } from "./IconPositionContext";

export default function TabLayout() {
  return (
    <BleManagerProvider>
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
              name="Training"
              options={{
                tabBarLabel: "Training",
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
              name="running"
              options={{
                tabBarLabel: "set pad",
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome5 name="bluetooth-b" size={size} color={color} />
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
    </BleManagerProvider>
  );
}
