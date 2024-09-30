import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from '@expo/vector-icons'; 
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ModuleContextProvider } from "./context/context";
import { BleManagerProvider } from "./context/blecontext";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <BleManagerProvider>
      <ModuleContextProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  name={focused ? "home" : "home-outline"}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  name={focused ? "code-slash" : "code-slash-outline"}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </ModuleContextProvider>
    </BleManagerProvider>
  );
}
import { Tabs } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; // Import icons for better visual design

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff' },
        headerShown: false,  // Hide the header to keep things clean
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          tabBarLabel: 'Running',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="run" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ble"
        options={{
          tabBarLabel: 'BLE',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bluetooth-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
