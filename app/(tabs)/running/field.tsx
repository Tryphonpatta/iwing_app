import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import ResultScreen from "./result"; // Adjust the import path as needed
import { useBleManager } from "../context/blecontext"; // Use context to access devices
import { CHARACTERISTIC } from "@/enum/characteristic";
import { hexToBase64, base64toDec } from "@/util/encode";
import {
  Device,
  Subscription,
  BleError,
  Characteristic,
} from "react-native-ble-plx"; // Import necessary types

const { width, height } = Dimensions.get("window");

type CircleKey = "R1" | "R2" | "L1" | "L2" | "Center";

type FieldProps = {
  R1: string;
  R2: string;
  L1: string;
  L2: string;
  mode: number;
};

type Interaction = {
  description: string;
  time: number; // in seconds
};

const Field = ({ R1, R2, L1, L2, mode }: FieldProps) => {
  const { connectedDevice, writeCharacteristic, readCharacteristic } = useBleManager();
  const [circleColors, setCircleColors] = useState({
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
  const [interactionTimes, setInteractionTimes] = useState<Interaction[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  // New state to hold characteristic value
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  // References to manage subscriptions
  const centerSubscriptionRef = useRef<Subscription | null>(null);
  const hitSubscriptionRef = useRef<Subscription | null>(null);

  // Parse counts
  const R1Count = parseInt(R1) || 0;
  const R2Count = parseInt(R2) || 0;
  const L1Count = parseInt(L1) || 0;
  const L2Count = parseInt(L2) || 0;

  const [circleSequence, setCircleSequence] = useState<CircleKey[]>([]);

  useEffect(() => {
    let sequence: CircleKey[] = [];

    if (mode === 1) {
      // Mode ขวา: R1 R2 L2 L1
      sequence = ["R1", "R2", "L2", "L1"];
    }
    else if (mode === 2){
      // Mode ซ้าย: L1 L2 R2 R1
      sequence = ["L1", "L2", "R2", "R1"];
    } else {
      // Default random sequence based on counts for other modes
      for (let i = 0; i < L1Count; i++) sequence.push("L1");
      for (let i = 0; i < L2Count; i++) sequence.push("L2");
      for (let i = 0; i < R1Count; i++) sequence.push("R1");
      for (let i = 0; i < R2Count; i++) sequence.push("R2");

      sequence = shuffleArray(sequence);
    }

    setCircleSequence(sequence);
  }, [mode, L1Count, L2Count, R1Count, R2Count]);

  const shuffleArray = (array: CircleKey[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Use readCharacteristic when component mounts to read battery level
  useEffect(() => {
    const fetchBatteryLevel = async () => {
      if (connectedDevice[0]) {
        const level = await readCharacteristic(
          connectedDevice[0],
          CHARACTERISTIC.BATT_VOLTAGE // Replace with actual UUID for battery level
        );
        setBatteryLevel(level);
      }
    };
    fetchBatteryLevel();
  }, [connectedDevice]);

  // Start center monitoring when centerActive changes
  useEffect(() => {
    if (gameState.centerActive) {
      startCenterMonitoring();
    } else {
      stopCenterMonitoring();
    }
  }, [gameState.centerActive]);

  // Start hit monitoring when currentGreen changes
  useEffect(() => {
    if (gameState.currentGreen) {
      startHitMonitoring();
    } else {
      stopHitMonitoring();
    }
  }, [gameState.currentGreen]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      stopCenterMonitoring();
      stopHitMonitoring();
    };
  }, []);

  const startCenterMonitoring = () => {
    const leftDevice = connectedDevice[2];
    const rightDevice = connectedDevice[3];

    if (!leftDevice || !rightDevice) {
      console.error("Left or right device not connected.");
      return;
    }

    // Subscribe to left device
    const leftSubscription = leftDevice.monitorCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_RX,
      (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
          console.error("Left device monitoring error:", error);
          return;
        }
        const value = base64toDec(characteristic?.value ?? "");
        if (value === 0) {
          handleReturnToCenter();
        }
      }
    );

    // Subscribe to right device
    const rightSubscription = rightDevice.monitorCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_RX,
      (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
          console.error("Right device monitoring error:", error);
          return;
        }
        const value = base64toDec(characteristic?.value ?? "");
        if (value === 0) {
          handleReturnToCenter();
        }
      }
    );

    // Combine subscriptions
    centerSubscriptionRef.current = {
      remove: () => {
        leftSubscription?.remove();
        rightSubscription?.remove();
      },
    } as Subscription;
  };

  const stopCenterMonitoring = () => {
    centerSubscriptionRef.current?.remove();
    centerSubscriptionRef.current = null;
  };

  const startHitMonitoring = () => {
    const circle = gameState.currentGreen;
    if (!circle) return;

    const id =
      circle === "R1"
        ? 1
        : circle === "R2"
        ? 3
        : circle === "L1"
        ? 0
        : 2;

    const device = connectedDevice[id];

    if (!device) {
      console.error("Device not connected for hit monitoring.");
      return;
    }

    hitSubscriptionRef.current = device.monitorCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.VIBRATION,
      (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
          console.error("Hit monitoring error:", error);
          return;
        }
        const value = base64toDec(characteristic?.value ?? "");
        if (value === 255) {
          handleHitDetected();
        }
      }
    );
  };

  const stopHitMonitoring = () => {
    hitSubscriptionRef.current?.remove();
    hitSubscriptionRef.current = null;
  };

  useEffect(() => {
    if (circleSequence.length === 0) return;

    // if (!connectedDevice[0] || !connectedDevice[1]) {
    //   console.error("Devices not connected.");
    //   return;
    // }

    writeCharacteristic(
      connectedDevice[0],
      CHARACTERISTIC.IR_TX,
      hexToBase64("01")
    );
    writeCharacteristic(
      connectedDevice[1],
      CHARACTERISTIC.IR_TX,
      hexToBase64("01")
    );

    if (!gameState.centerActive && currentIndex < circleSequence.length) {
      const nextCircle = circleSequence[currentIndex];

      if (currentIndex === 0 && lastTimestamp === null) {
        setLastTimestamp(Date.now());
      }

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
    } else if (currentIndex >= circleSequence.length) {
      handleStopAndShowResult();
    }
  }, [gameState.centerActive, currentIndex, circleSequence]);

  const handleCenterPress = async () => {
    if (gameState.centerActive) {
      // Example of using readCharacteristic on center press
      if (connectedDevice[0]) {
        const value = await readCharacteristic(
          connectedDevice[0],
          CHARACTERISTIC.IR_RX
        );
        console.log("IR_RX Value on Center Press:", value);
      }

      setGameState((prevState) => ({
        ...prevState,
        centerActive: false,
      }));
      handleReturnToCenter();
    }
  };

  const handleReturnToCenter = () => {
    const currentTime = Date.now();
    if (lastTimestamp !== null && gameState.currentGreen !== null) {
      const timeDiff = (currentTime - lastTimestamp) / 1000;
      setInteractionTimes((prevTimes) => [
        ...prevTimes,
        { description: `${gameState.currentGreen} to Center`, time: timeDiff },
      ]);
    }
    setLastTimestamp(currentTime);
    setCircleColors((prevColors) => ({ ...prevColors, Center: "blue" }));
    setGameState((prevState) => ({
      ...prevState,
      centerActive: false,
    }));
    setCurrentIndex((prevIndex) => prevIndex + 1);
    setGameState((prevState) => ({ ...prevState, currentGreen: null }));
  };

  const handleHitDetected = () => {
    if (gameState.currentGreen) {
      handleCirclePress(gameState.currentGreen);
    }
  };

  const handleCirclePress = (circle: CircleKey) => {
    if (circleColors[circle] === "green") {
      const currentTime = Date.now();
      if (lastTimestamp !== null) {
        const timeDiff = (currentTime - lastTimestamp) / 1000;
        setInteractionTimes((prevTimes) => [
          ...prevTimes,
          { description: `Center to ${circle}`, time: timeDiff },
        ]);
      }
      setLastTimestamp(currentTime);
      setCircleColors((prevColors) => ({
        ...prevColors,
        [circle]: "red",
        Center: "yellow",
      }));

      // Only set `centerActive` to true if it's not the last circle
      if (currentIndex < circleSequence.length - 1) {
        setGameState((prevState) => ({ ...prevState, centerActive: true }));
      } else {
        setGameState((prevState) => ({ ...prevState, centerActive: false }));
        handleStopAndShowResult();
      }
      // Stop hit monitoring
      stopHitMonitoring();
    }
  };

  const handleStopAndShowResult = () => {
    // if (!connectedDevice[0] || !connectedDevice[1]) {
    //   console.error("Devices not connected.");
    //   return;
    // }

    writeCharacteristic(
      connectedDevice[0],
      CHARACTERISTIC.IR_TX,
      hexToBase64("00")
    );
    writeCharacteristic(
      connectedDevice[1],
      CHARACTERISTIC.IR_TX,
      hexToBase64("00")
    );

    // Stop all subscriptions
    stopCenterMonitoring();
    stopHitMonitoring();

    setGameState((prevState) => ({
      ...prevState,
      centerActive: false, // Ensure centerActive is reset
      currentGreen: null,
    }));
    setShowResultScreen(true);
  };

  if (showResultScreen) {
    const totalTime = interactionTimes.reduce(
      (acc, interaction) => acc + interaction.time,
      0
    );
    return (
      <ResultScreen interactionTimes={interactionTimes} totalTime={totalTime} />
    );
  }

  return (
    <View style={styles.containerField}>
      {/* Display battery level */}
      {batteryLevel !== null && (
        <Text style={styles.batteryText}>Battery Level: {batteryLevel}</Text>
      )}
      <View style={styles.circleContainer}>
        <TouchableOpacity
          style={[
            styles.circle,
            { top: 20, left: 20, backgroundColor: circleColors.L1 },
          ]}
          onPress={() => handleCirclePress("L1")}
        >
          <Text style={styles.text}>L1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circle,
            { top: 20, right: 20, backgroundColor: circleColors.R1 },
          ]}
          onPress={() => handleCirclePress("R1")}
        >
          <Text style={styles.text}>R1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circle,
            { bottom: 20, left: 20, backgroundColor: circleColors.L2 },
          ]}
          onPress={() => handleCirclePress("L2")}
        >
          <Text style={styles.text}>L2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circle,
            { bottom: 20, right: 20, backgroundColor: circleColors.R2 },
          ]}
          onPress={() => handleCirclePress("R2")}
        >
          <Text style={styles.text}>R2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.circle, { backgroundColor: circleColors.Center }]}
          onPress={handleCenterPress}
        >
          <Text style={styles.text}>Center</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={handleStopAndShowResult}
      >
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
  batteryText: {
    fontSize: 16,
    marginBottom: 10,
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
