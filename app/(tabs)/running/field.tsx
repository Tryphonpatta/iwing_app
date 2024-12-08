import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import ResultScreen from "./result"; // Adjust the import path as needed
import { useBleManager } from "../context/blecontext"; // Use context to access readCharacteristic
import { CHARACTERISTIC } from "@/enum/characteristic";
import { Device } from "react-native-ble-plx";
import { hexToBase64 } from "@/util/encode";

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
  const {
    connectToDevice,
    allDevices,
    connectedDevice,
    requestPermissions,
    scanForPeripherals,
    startStreamingData,
    writeCharacteristic,
    swapConnectedDevice,
    disconnectDevice,
    monitorCharacteristic,
  } = useBleManager();
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

  // References to manage async loops
  const centerActiveRef = useRef(gameState.centerActive);
  const hitActiveRef = useRef(false);
  const stopActiveRef = useRef(false);

  // Update centerActiveRef when gameState.centerActive changes
  useEffect(() => {
    centerActiveRef.current = gameState.centerActive;
    if (gameState.centerActive) {
      isCenter();
    }
  }, [gameState.centerActive]);

  const isCenter = async () => {
    try {
      // console.log("wait for center");
      await connectedDevice[4]?.waitForVibration();
      // while (1) {
      //   console.log("loop");
      //   await new Promise((resolve) => setTimeout(resolve, 100000));
      // }
      // console.log("center detected");
      handleReturnToCenter();
    } catch (error) {
      console.error("Failed to read characteristic:", error);
    }
  };

  // Parse counts
  const R1Count = parseInt(R1) || 0;
  const R2Count = parseInt(R2) || 0;
  const L1Count = parseInt(L1) || 0;
  const L2Count = parseInt(L2) || 0;

  const [circleSequence, setCircleSequence] = useState<CircleKey[]>([]);

  useEffect(() => {
    connectedDevice[4]?.changeMode(0, 0, 0, 2);
    let sequence: CircleKey[] = [];

    if (mode === 1) {
      // Mode ขวา: R1 R2 L2 L1
      const sequenceTemp: CircleKey[] = ["R1", "R2", "L2", "L1"];
      for (let i = 0; i < L1Count; i++) {
        for (let j = 0; j < sequenceTemp.length; j++) {
          sequence.push(sequenceTemp[j]);
        }
      }
    } else if (mode === 2) {
      // Mode ซ้าย: L1 L2 R2 R1
      const sequenceTemp: CircleKey[] = ["L1", "L2", "R2", "R1"];
      for (let i = 0; i < L1Count; i++) {
        for (let j = 0; j < sequenceTemp.length; j++) {
          sequence.push(sequenceTemp[j]);
        }
      }
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

  useEffect(() => {
    if (circleSequence.length === 0) return;
    console.log("change");
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

  // const isCenter = async () => {
  //   if (connectedDevice[4]?.vibration) {
  //     handleReturnToCenter();
  //   }
  // };

  // const checkCenterStatus = async () => {
  //   try {
  //     while (centerActiveRef.current && !stopActiveRef.current) {
  //       const centerStatus = await isCenter();

  //       if (centerStatus.left === 0 && centerStatus.right === 0) {
  //         handleReturnToCenter();
  //         break;
  //       }
  //       await new Promise((resolve) => setTimeout(resolve, 200));
  //     }
  //   } catch (error) {
  //     console.error("Failed to read characteristic:", error);
  //   }
  // };

  const handleCenterPress = () => {
    if (gameState.centerActive) {
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
  };

  useEffect(() => {
    const circle = gameState.currentGreen;
    if (!circle) return;

    const id =
      circle === "R1" ? 1 : circle === "R2" ? 3 : circle === "L1" ? 0 : 2;

    checkHit(id);

    // const device = connectedDevice[id]?.device;

    // if (!device) {
    //   console.error("Device not connected for hit monitoring.");
    //   return;
    // }
    // console.log(`connectDevice ${connectedDevice[id]?.vibration}`);
    // if (connectedDevice[id]?.vibration) {
    //   handleHitDetected();
    // }
  }, [gameState.currentGreen]);

  const checkHit = async (id: number) => {
    // console.log("checkHit", id);
    await connectedDevice[id]?.waitForVibration();
    // console.log("hit detected", id);
    handleHitDetected();
    // try {
    //   const ppp = await connectedDevice[id].yyyy
    //   handleHitDetected();

    //   while (hitActiveRef.current && !stopActiveRef.current) {
    //     if (!connectedDevice[id]) throw new Error("DeviceId is NULL");
    //     const hitStatus = await isHit(id);

    //     if (hitStatus) {
    //       handleHitDetected();
    //       hitActiveRef.current = false;
    //       return;
    //     }
    //     await new Promise((resolve) => setTimeout(resolve, 200));
    //   }
    // } catch (error) {
    //   console.error("Failed to read characteristic:", error);
    //   hitActiveRef.current = false;
    // }
  };

  // const isHit = async (id: number) => {
  //   try {
  //     if (connectedDevice[id] === undefined)
  //       throw new Error("DeviceId is NULL");
  //     if (id == 0) return hitL1 ? hitL1 == 255 : 0;
  //     if (id == 2) return hitL2 ? hitL2 == 255 : 0;
  //     if (id == 1) return hitR1 ? hitR1 == 255 : 0;
  //     if (id == 3) return hitR2 ? hitR2 == 255 : 0;
  //   } catch (e) {
  //     console.error("Error reading hit characteristic:", e);
  //     return false;
  //   }
  // };

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
      setGameState((prevState) => ({ ...prevState, centerActive: true }));
      hitActiveRef.current = false;
    }
  };

  const handleStopAndShowResult = () => {
    // writeCharacteristic(
    //   connectedDevice[0].device,
    //   CHARACTERISTIC.IR_TX,
    //   hexToBase64("00")
    // );
    // writeCharacteristic(
    //   connectedDevice[1].device,
    //   CHARACTERISTIC.IR_TX,
    //   hexToBase64("00")
    // );

    stopActiveRef.current = true; // Stop all async loops
    setGameState((prevState) => ({
      ...prevState,
      centerActive: false, // Ensure centerActive is reset
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
