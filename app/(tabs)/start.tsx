import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useIconPosition } from "./IconPositionContext";

const StartGame = () => {
  const { positions } = useIconPosition();
  const [activePadIndex, setActivePadIndex] = useState(-1); // No pad is active initially
  const [isPlaying, setIsPlaying] = useState(false); // To track if the game is active

  // Function to start the game
  const play = (duration: number, interval: number) => {
    setIsPlaying(true);
    const totalPads = positions.length;

    // Function to randomly activate a pad
    const activateRandomPad = () => {
      // Deactivate the current pad
      setActivePadIndex(-1);
      // Randomly select a new pad index
      const randomIndex = Math.floor(Math.random() * totalPads);
      setActivePadIndex(randomIndex);
    };

    // Activate pads at the specified interval
    const intervalId = setInterval(() => {
      activateRandomPad();
    }, interval);

    // Stop the game after the specified duration
    setTimeout(() => {
      clearInterval(intervalId);
      setIsPlaying(false);
      setActivePadIndex(-1); // Deactivate all pads after game ends
    }, duration);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Start Game</Text>
      <View>
        {positions.map((position, index) => (
          <View
            key={index}
            style={[
              styles.iconContainer,
              { left: position.x, top: position.y },
            ]}
          >
            <MaterialIcons
              name="wb-twilight"
              size={60}
              color={activePadIndex === index ? "green" : "black"}
            />
            <Text>Trainer Pad : {index}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => play(10000, 1000)} // Example: play for 10 seconds with an interval of 1 second
        disabled={isPlaying} // Disable button if already playing
      >
        <Text style={styles.buttonText}>
          {isPlaying ? "Playing..." : "Start Game"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e1f4f3" },
  header: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  iconContainer: { position: "absolute", alignItems: "center" },
  playButton: {
    backgroundColor: "#2f95dc",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StartGame;
