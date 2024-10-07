import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingCardComponent from "../card/SettingCard"; // Make sure this path is correct
import Header1 from "../navigation/Header"; // Ensure this is also correctly imported

const SettingScreen = () => {
  // Mockup data for devices
  const devices = [
    { id: "1", name: "xxxxx1", connected: false, battery: 20, charging: true },
    { id: "2", name: "xxxxx3", connected: false, battery: 50, charging: false },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header1 title="Setting" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Device List */}
        {devices.map((device) => (
          <SettingCardComponent
            key={device.id} // Add key for list rendering
            name={device.name}
            isConnected={device.connected}
            batteryAmount={device.battery}
            isCharging={device.charging}
          />
        ))}

        {/* Add More Device Button */}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="black" />
          <Text style={styles.addButtonText}>Add more device</Text>
        </TouchableOpacity>

        {/* Test Button */}
        <View style={styles.testButton}>
          <Text style={styles.testButtonText}>Test button</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>on</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
  },
  content: {
    flexGrow: 1, // Allows ScrollView to fill available space
    justifyContent: "center", // Center contents vertically
    alignItems: "center", // Center contents horizontally
    padding: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    marginBottom: 16,
    height: 110, // Height for the button
    width: 360,
  },
  addButtonText: {
    fontSize: 18,
    marginLeft: 8,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  testButtonText: {
    fontSize: 18,
    marginRight: 16,
  },
  toggleButton: {
    backgroundColor: "yellow",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
export default SettingScreen;
