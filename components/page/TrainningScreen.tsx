import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import Header1 from "../navigation/Header";
import SelectBar from "../navigation/selectbar";
import Footer from "../navigation/Footer";
import { MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import RangeSlider from "../rage_slider";
import TimePicker from "../timer";
import { TouchableOpacity } from "react-native-gesture-handler";
import Timer from "../timer";

const TrainingScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Header1 title="Training" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Light Out Section */}
        <View style={styles.section}>
          <View style={styles.topic}>
            <MaterialIcons name="wb-twilight" size={48} color="black" />
            <Text style={styles.headerText}>Light Out</Text>
          </View>
          <SelectBar option1="Hit" option2="Timeout" option3="Hit or Timeout" />
        </View>

        {/* Light Delay Time Section */}
        <View style={styles.section}>
          <View style={styles.topic}>
            <MaterialIcons name="wb-twilight" size={48} color="black" />
            <Text style={styles.headerText}>Light Delay Time</Text>
          </View>
          <SelectBar option1="None" option2="Fixed" option3="Random" />
        </View>

        <View style={styles.section}>
          <Text style={styles.headerText}>Time Out</Text>
          <RangeSlider is_round={false}></RangeSlider>
        </View>

        {/* Duration Section */}
        <View style={styles.section}>
          <View style={styles.topic}>
            <Entypo name="back-in-time" size={24} color="black" />
            <Text style={styles.headerText}>Duration</Text>
          </View>
          <SelectBar option1="Hit" option2="Timeout" option3="Hit or Timeout" />
        </View>

        <View style={styles.section}>
          <Text style={styles.headerText}>Hit Count</Text>
          <RangeSlider is_round={true}></RangeSlider>
        </View>

        <View style={styles.section}>
          <Text style={styles.headerText}>Time</Text>
          <Timer></Timer>
        </View>

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
    marginBottom: 24, // Space between each section (icon, text, and select bar)
  },
  topic: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // Space between the icon-text row and the SelectBar
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold", // Bold style for the text
    marginLeft: 10, // Space between the icon and the text
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
  startButtonText: {
    fontSize: 18,
    marginRight: 16,
  },
});

export default TrainingScreen;
