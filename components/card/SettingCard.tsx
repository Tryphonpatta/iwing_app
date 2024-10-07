import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const SettingCardComponent = ({
  name,
  isConnected,
  batteryAmount,
  isCharging,
}: {
  name: string;
  isConnected: boolean;
  batteryAmount: number;
  isCharging: boolean;
}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => console.log(`${name} pressed`)} // Example action on press
      accessible={true} // Enable accessibility
      accessibilityLabel={`${name} - ${
        isConnected ? "Connected" : "Disconnected"
      } - Battery ${batteryAmount}% - ${
        isCharging ? "Charging" : "Not Charging"
      }`} // Accessibility label
    >
      <View style={styles.batteryIconContainer}>
        <MaterialIcons name="wb-twilight" size={48} color="black" />
      </View>
      <View style={styles.textContent}>
        <Text style={styles.nameText}>Name: {name}</Text>
        <Text
          style={[
            styles.disconnectText,
            { color: isConnected ? "green" : "red" },
          ]}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Text>
        <View style={styles.batteryInfoContainer}>
          <Text style={styles.batteryText}>Battery: {batteryAmount}%</Text>
          {batteryAmount === 100 ? (
            <FontAwesome5 name="battery-full" size={24} color="green" />
          ) : batteryAmount > 30 ? (
            <FontAwesome5 name="battery-half" size={24} color="orange" />
          ) : (
            <FontAwesome5 name="battery-quarter" size={24} color="red" />
          )}
        </View>
        <View style={styles.charginginfocontainer}>
          <Text style={styles.chargingText}>
            {isCharging ? "Charging" : "Not Charging"}
          </Text>
          {isCharging ? (
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default SettingCardComponent;
