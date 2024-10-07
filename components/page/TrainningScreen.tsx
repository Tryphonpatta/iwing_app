import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SelectBar from "../navigation/selectbar";
import Footer from "../navigation/Footer";
import RangeSlider from "../rage_slider"; // Ensure this import is correct
import Timer from "../timer"; // Ensure this import is correct
import { TouchableOpacity } from "react-native-gesture-handler";
import Header1 from "../navigation/Header";

const TrainingScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <Header1 title="Training" /> */}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Light Out Section */}
        <View style={styles.section}>
          <View style={styles.topic}>
            <MaterialIcons name="wb-twilight" size={48} color="black" />
            <Text style={styles.headerText}>Light Out</Text>
          </View>
          {/* <SelectBar option1="Hit" option2="Timeout" option3="Hit or Timeout" /> */}
        </View>

        {/* Light Delay Time Section */}
        <View style={styles.section}>
          <View style={styles.topic}>
            <MaterialIcons name="wb-twilight" size={48} color="black" />
            <Text style={styles.headerText}>Light Delay Time</Text>
          </View>
          {/* <SelectBar option1="None" option2="Fixed" option3="Random" /> */}
        </View>

        {/* Time Out Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>Time Out</Text>
          <RangeSlider is_round={false} />
        </View>

        {/* Duration Section */}
        <View style={styles.section}>
          <View style={styles.topic}>
            <Ionicons name="timer-outline" size={24} color="black" />
            <Text style={styles.headerText}>Duration</Text>
          </View>
          {/* <SelectBar option1="Hit" option2="Timeout" option3="Hit or Timeout" /> */}
        </View>

        {/* Hit Count Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>Hit Count</Text>
          <RangeSlider is_round={true} />
        </View>

        {/* Time Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>Time</Text>
          <Timer />
        </View>

        {/* Start Button */}
        <View style={styles.startButton}>
          <TouchableOpacity style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>Start</Text>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  topic: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
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
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});

export default TrainingScreen;
