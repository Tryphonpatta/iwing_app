import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"; // Import necessary components
import Ionicons from "@expo/vector-icons/Ionicons"; // Import Ionicons

const Header1 = (prop: { title: string }) => {
  // Accept title as a prop
  const { title } = prop;

  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text> {/* Use the title prop */}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
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
});

export default Header1;
