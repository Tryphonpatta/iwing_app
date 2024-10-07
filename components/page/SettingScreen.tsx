import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Footer from "../navigation/Footer";
import Header1 from "../navigation/Header";

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
          <TouchableOpacity key={device.id}>
            <View style={styles.cardContainer}>
              <View style={styles.batteryIconContainer}>
                <TouchableOpacity>
                  <MaterialIcons name="wb-twilight" size={48} color="black" />
                </TouchableOpacity>
              </View>
              <View style={styles.textContent}>
                <Text style={styles.nameText}>Name: {device.name}</Text>
                <Text
                  style={[
                    styles.disconnectText,
                    { color: device.connected ? "green" : "red" },
                  ]}
                >
                  {device.connected ? "Connected" : "Disconnected"}
                </Text>
                <View style={styles.batteryInfoContainer}>
                  <Text style={styles.batteryText}>
                    Battery: {device.battery}%
                  </Text>
                  {device.battery === 100 ? (
                    <FontAwesome5 name="battery-full" size={24} color="green" />
                  ) : device.battery > 30 ? (
                    <FontAwesome5
                      name="battery-half"
                      size={24}
                      color="orange"
                    />
                  ) : (
                    <FontAwesome5
                      name="battery-quarter"
                      size={24}
                      color="red"
                    />
                  )}
                </View>
                <View style={styles.charginginfocontainer}>
                  <Text style={styles.chargingText}>
                    {device.charging ? "Charging" : "Not Charging"}
                  </Text>

                  {device.charging ? (
                    <MaterialCommunityIcons
                      name="power-plug"
                      size={24}
                      color="black"
                      style={styles.plugIcon}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="power-plug-off"
                      size={24}
                      color="black"
                      style={styles.plugIcon}
                    />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#81C784",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceIcon: {
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deviceStatus: {
    fontSize: 16,
  },
  deviceBattery: {
    fontSize: 16,
  },
  deviceCharging: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    marginBottom: 16,
    height: 110, // Fixed height for the card
    width: 360, // Fixed width for the card
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#81C784",
  },
  cardContainer: {
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row", // Align children in a row
    height: 110, // Fixed height for the card
    width: 360, // Fixed width for the card
    alignItems: "center", // Center items vertically
  },
  batteryIconContainer: {
    marginRight: 15, // Space between icon and text
  },
  textContent: {
    flex: 1, // Take up remaining space
    alignItems: "flex-start", // Align text to the start
    marginLeft: 20,
    rowGap: 3,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  disconnectText: {
    fontSize: 14,
  },
  batteryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2, // Reduced space above battery info
  },
  batteryText: {
    fontSize: 14,
    marginRight: 5, // Space between text and charging icon
  },
  chargingIcon: {
    marginLeft: 5, // Space between battery text and icon
  },
  charginginfocontainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2, // Reduced space above battery info
  },
  chargingText: {
    fontSize: 14,
    marginRight: 5, // Space between text and charging icon
  },
  plugIcon: {
    marginLeft: 5, // Space between battery text and icon
  },
});

export default SettingScreen;
