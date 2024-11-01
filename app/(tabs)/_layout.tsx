import React from "react";
import { ModuleContextProvider } from "./context/context";
import { BleManagerProvider } from "./context/blecontext";
import { Tabs } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
export default function TabLayout() {

  return (
    <BleManagerProvider>
      <ModuleContextProvider>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff' },
        headerShown: false,
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
            <Ionicons name="menu" color={color} size={size} />
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
      </ModuleContextProvider>
    </BleManagerProvider>
  );
}
