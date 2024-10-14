// Field.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import ResultScreen from "./result"; // Adjust the import path as needed

const { width, height } = Dimensions.get("window");

type CircleKey = "R1" | "R2" | "L1" | "L2" | "Center";

type FieldProps = {
  R1: string;
  R2: string;
  L1: string;
  L2: string;
};

type Interaction = {
  description: string;
  time: number; // in seconds
};

const Field = ({ R1, R2, L1, L2 }: FieldProps) => {
  const [circleColors, setCircleColors] = useState<{
    R1: string;
    R2: string;
    L1: string;
    L2: string;
    Center: string;
  }>({
    R1: "red",
    R2: "red",
    L1: "red",
    L2: "red",
    Center: "blue",
  });

  const [showResultScreen, setShowResultScreen] = useState(false);

  const [gameState, setGameState] = useState({
    currentGreen: null as CircleKey | null,
    centerActive: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Parse counts
  const R1Count = parseInt(R1) || 0;
  const R2Count = parseInt(R2) || 0;
  const L1Count = parseInt(L1) || 0;
  const L2Count = parseInt(L2) || 0;

  const [circleSequence, setCircleSequence] = useState<CircleKey[]>([]);

  // **Add state variables to track time and interactions**
  const [interactionTimes, setInteractionTimes] = useState<Interaction[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  useEffect(() => {
    let sequence: CircleKey[] = [];

    for (let i = 0; i < L1Count; i++) {
      sequence.push("L1");
    }
    for (let i = 0; i < L2Count; i++) {
      sequence.push("L2");
    }
    for (let i = 0; i < R1Count; i++) {
      sequence.push("R1");
    }
    for (let i = 0; i < R2Count; i++) {
      sequence.push("R2");
    }

    // Shuffle the sequence
    sequence = shuffleArray(sequence);

    setCircleSequence(sequence);
  }, []);

  const shuffleArray = (array: CircleKey[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    // Wait until circleSequence is initialized
    if (circleSequence.length === 0) {
      return;
    }

    if (!gameState.centerActive && currentIndex < circleSequence.length) {
      const nextCircle = circleSequence[currentIndex];

      // Start the timer when the first circle is activated
      if (currentIndex === 0 && lastTimestamp === null) {
        setLastTimestamp(Date.now());
      }

      // Reset all circle colors to red except the center
      setCircleColors((prevColors) => ({
        ...prevColors,
        R1: "red",
        R2: "red",
        L1: "red",
        L2: "red",
        [nextCircle]: "green",
      }));
      setGameState((prevState) => ({
        ...prevState,
        currentGreen: nextCircle,
      }));
    } else if (currentIndex >= circleSequence.length && !gameState.centerActive) {
      // All circles have been processed and center is not active
      setShowResultScreen(true);
    }
  }, [gameState.centerActive, currentIndex, circleSequence]);

  const handleCirclePress = (circle: CircleKey) => {
    if (circleColors[circle] === "green") {
      // Record the time taken from last interaction
      const currentTime = Date.now();
      if (lastTimestamp !== null) {
        const timeDiff = (currentTime - lastTimestamp) / 1000; // in seconds
        const interactionDescription = `Center to ${circle}`;
        setInteractionTimes((prevTimes) => [
          ...prevTimes,
          { description: interactionDescription, time: timeDiff },
        ]);
      }
      setLastTimestamp(currentTime);

      setCircleColors((prevColors) => ({
        ...prevColors,
        [circle]: "red",
        Center: "yellow",
      }));
      setGameState((prevState) => ({
        ...prevState,
        centerActive: true,
      }));
      // Do not increment currentIndex here
    }
  };

  const handleCenterPress = () => {
    if (gameState.centerActive) {
      // Record the time taken from last interaction
      const currentTime = Date.now();
      if (lastTimestamp !== null && gameState.currentGreen !== null) {
        const timeDiff = (currentTime - lastTimestamp) / 1000; // in seconds
        const interactionDescription = `${gameState.currentGreen} to Center`;
        setInteractionTimes((prevTimes) => [
          ...prevTimes,
          { description: interactionDescription, time: timeDiff },
        ]);
      }
      setLastTimestamp(currentTime);

      setCircleColors((prevColors) => ({
        ...prevColors,
        Center: "blue",
      }));
      setGameState((prevState) => ({
        ...prevState,
        centerActive: false,
      }));
      // Increment currentIndex after pressing the center
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleStopAndShowResult = () => {
    // Record end time when the user manually stops the game
    // We can decide how to handle this case
    setShowResultScreen(true);
  };

  if (showResultScreen) {
    // Calculate total time
    const totalTime = interactionTimes.reduce(
      (accumulator, interaction) => accumulator + interaction.time,
      0
    );
    return (
      <ResultScreen
        interactionTimes={interactionTimes}
        totalTime={totalTime}
      />
    );
  }

  return (
    <View style={styles.containerField}>
      <View style={styles.circleContainer}>
        {/* L1 */}
        <TouchableOpacity
          style={[
            styles.circle,
            { top: 20, left: 20, backgroundColor: circleColors.L1 },
          ]}
          onPress={() => handleCirclePress("L1")}
        >
          <Text style={styles.text}>L1</Text>
        </TouchableOpacity>

        {/* R1 */}
        <TouchableOpacity
          style={[
            styles.circle,
            { top: 20, right: 20, backgroundColor: circleColors.R1 },
          ]}
          onPress={() => handleCirclePress("R1")}
        >
          <Text style={styles.text}>R1</Text>
        </TouchableOpacity>

        {/* L2 */}
        <TouchableOpacity
          style={[
            styles.circle,
            { bottom: 20, left: 20, backgroundColor: circleColors.L2 },
          ]}
          onPress={() => handleCirclePress("L2")}
        >
          <Text style={styles.text}>L2</Text>
        </TouchableOpacity>

        {/* R2 */}
        <TouchableOpacity
          style={[
            styles.circle,
            { bottom: 20, right: 20, backgroundColor: circleColors.R2 },
          ]}
          onPress={() => handleCirclePress("R2")}
        >
          <Text style={styles.text}>R2</Text>
        </TouchableOpacity>

        {/* Center */}
        <TouchableOpacity
          style={[styles.circle, { backgroundColor: circleColors.Center }]}
          onPress={handleCenterPress}
        >
          <Text style={styles.text}>Center</Text>
        </TouchableOpacity>
      </View>

      {/* Stop Button */}
      <TouchableOpacity style={styles.stopButton} onPress={handleStopAndShowResult}>
        <Text style={styles.stopButtonText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    containerField: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#E8F5E9",
      width: width,
      height: height,
    },
    circleContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      width: width * 0.8,
      height: width * 0.8,
    },
    circle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
    },
    text: {
      color: "white",
      fontWeight: "bold",
      fontSize: 20,
    },
    stopButton: {
      backgroundColor: "#e53e3e",
      padding: 20,
      borderRadius: 10,
      marginTop: 20,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    stopButtonText: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "bold",
    },
  });

export default Field;
