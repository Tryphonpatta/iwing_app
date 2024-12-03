import React from "react";
import { ModuleContextProvider } from "./context/context";
import { BleProvider } from "./context/blecontext";
import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BottomNavigationElement } from "@ui-kitten/components";
export default function TabLayout() {
  return (
    <BleProvider>
      <ModuleContextProvider>
        <Tabs
          screenOptions={({ route }) => {
            // Hide certain tabs by route name (e.g., "ble")
            const showedTabs = ["run", "setting", "home"];
            const isShowed = showedTabs.includes(route.name);

            return {
              tabBarActiveTintColor: "#2f95dc",
              tabBarInactiveTintColor: "gray",
              tabBarStyle: { backgroundColor: "#fff" },
              headerShown: false,
              tabBarItemStyle: {
                display: isShowed ? "flex" : "none", // Dynamically control tab visibility
              },
            };
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              tabBarLabel: "Home",

              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="run"
            options={{
              tabBarLabel: "Running",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="menu" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="setting"
            options={{
              tabBarLabel: "Settings",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" color={color} size={size} />
              ),
            }}
          />
          {/* <Tabs.Screen
        name="ble"
        options={{
          
          tabBarLabel: 'BLE',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bluetooth-outline" color={color} size={size} />
          ),
        }}
      /> */}
        </Tabs>
      </ModuleContextProvider>
    </BleProvider>
  );
}
