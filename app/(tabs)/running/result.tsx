// ResultScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import RunScreen from "../run";

const { width } = Dimensions.get("window");

type Interaction = {
  description: string;
  time: number;
};

type ResultScreenProps = {
  interactionTimes: Interaction[];
  totalTime: number;
};

const ResultScreen = ({ interactionTimes, totalTime }: ResultScreenProps) => {
  const [showRunScreen, setShowRunScreen] = useState(false);

  if (showRunScreen) {
    return <RunScreen />;
  }

  const handleDonePress = () => {
    // Code to save result data to the database
    // saveToDatabase(interactionTimes);
    setShowRunScreen(true);
  };

  return (
    <View style={styles.containerResult}>
      <Text style={styles.title}>Result</Text>

      <ScrollView style={styles.scrollView}>
        <View style={styles.resultContainer}>
          {interactionTimes.map((interaction, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.label}>{interaction.description}:</Text>
              <Text style={styles.value}>{interaction.time.toFixed(2)} s</Text>
            </View>
          ))}

          {/* Total Time */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Time:</Text>
            <Text style={styles.value}>{totalTime.toFixed(2)} s</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerResult: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2f855a",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  resultContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  value: {
    fontSize: 18,
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  doneButton: {
    backgroundColor: "#2f855a",
    paddingVertical: 15,
    width: width * 0.6,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  doneButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ResultScreen;
