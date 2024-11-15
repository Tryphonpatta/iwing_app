import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import ResultScreen from "./result";
import RunScreen from "../run";

const { width } = Dimensions.get("window");

const ManualScreen = () => {
  const [showResult, setShowResult] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("red");
  const [isStarted, setIsStarted] = useState(false);
  const [showRunScreen, setShowRunScreen] = useState(false);

  const handleColorChange = (color: string, rgb: number[]) => {
    setSelectedColor(color);
    console.log(`[${rgb.join(", ")}]`);
  };

  const handleButtonPress = (button: string) => {
    console.log(`${button}`);
  };

  const handleStartStop = () => {
    if (isStarted) {
      setShowResult(true);
    } else {
      setIsStarted(true);
    }
  };

  if (showRunScreen) {
    return <RunScreen />;
  }

  if (showResult) {
    return <ResultScreen totalTime={0} interactionTimes={[]} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => setShowRunScreen(true)}
      >
        <Text style={styles.exitButtonText}>Exit</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Manual Mode</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleButtonPress("L1")}
        >
          <Text style={styles.buttonText}>L1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleButtonPress("R1")}
        >
          <Text style={styles.buttonText}>R1</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleButtonPress("L2")}
        >
          <Text style={styles.buttonText}>L2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleButtonPress("R2")}
        >
          <Text style={styles.buttonText}>R2</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Choose Target Color</Text>
      <View style={styles.colorRow}>
        <TouchableOpacity
          style={[
            styles.colorButton,
            selectedColor === "red" && styles.selectedColor,
          ]}
          onPress={() => handleColorChange("red", [255, 0, 0])}
        >
          <Text style={styles.colorText}>Red</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.colorButton,
            selectedColor === "green" && styles.selectedColor,
          ]}
          onPress={() => handleColorChange("green", [0, 255, 0])}
        >
          <Text style={styles.colorText}>Green</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.colorButton,
            selectedColor === "blue" && styles.selectedColor,
          ]}
          onPress={() => handleColorChange("blue", [0, 0, 255])}
        >
          <Text style={styles.colorText}>Blue</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.startStopButton,
          isStarted ? styles.stopButton : styles.startButton,
        ]}
        onPress={handleStartStop}
      >
        <Text style={styles.startStopButtonText}>
          {isStarted ? "Stop" : "Start"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f5f0",
    padding: 20,
  },
  exitButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  exitButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "80%",
  },
  controlButton: {
    backgroundColor: "#2a9d8f",
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  colorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  selectedColor: {
    backgroundColor: "#5d9b8c",
  },
  colorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  startStopButton: {
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 30,
  },
  startButton: {
    backgroundColor: "#2f855a",
  },
  stopButton: {
    backgroundColor: "#e63946",
  },
  startStopButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ManualScreen;
