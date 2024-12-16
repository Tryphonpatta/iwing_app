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
import { List } from "@ui-kitten/components";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

type CircleKey = "R1" | "R2" | "L1" | "L2" | "Center";

type FieldProps = {
  R1: number | undefined;
  R2: number | undefined;
  L1: number | undefined;
  L2: number | undefined;
  mode: number;
  threL1: number;
  threL2: number;
  threR1: number;
  threR2: number;
};

type Interaction = {
  description: string;
  time: number;
};
const sound = new Audio.Sound();
const soundMiss = new Audio.Sound();

const Field = ({ R1, R2, L1, L2, mode, threL1, threL2, threR1 , threR2 }: FieldProps) => {
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
  const [miss, setMiss] = useState(0);
  const isStillMiss = useRef(false);
  const isCenterStillCall = useRef(false);
  const isCheckHitStillCall = useRef(false);
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
    if (!sound._loaded && !sound._loading)
      sound.loadAsync(require("../../../assets/audio/beep-06.mp3"));
    sound.setVolumeAsync(0.7);
    if (!soundMiss._loaded && !soundMiss._loading)
      soundMiss.loadAsync(require("../../../assets/audio/wrong.wav"));
    soundMiss.setVolumeAsync(1);
  }, []);
  useEffect(() => {
    centerActiveRef.current = gameState.centerActive;
    // if (gameState.centerActive && !isCenterStillCall.current) {
    //   isCenterStillCall.current = true;
    //   isCenter();
    //   isCenterStillCall.current = false;
    // }
  }, [gameState.centerActive]);

  // const isCenter = async () => {
  //   try {
  //     // Create an array of promises, each representing the vibration detection for each device
  //     // console.log("connectedDevice", connectedDevice);

  //     console.log("wait center");
  //     // Use Promise.race() to wait for the first device to resolve
  //     const dictCircle = new Map();
  //     dictCircle.set("R1", 1);
  //     dictCircle.set("R2", 3);
  //     dictCircle.set("L1", 0);
  //     dictCircle.set("L2", 2);
  //     const nextId =
  //       currentIndex + 1 >= circleSequence.length
  //         ? -1
  //         : (dictCircle.get(circleSequence[currentIndex + 1]) as number);
  //     console.log("nextId", nextId);
  //     if (nextId !== -1) {
  //       let isCancelled = false;
  //       const vibrationPromises = [
  //         connectedDevice[nextId]?.waitForVibration().then(() => {
  //           if (!isCancelled) {
  //             isCancelled = true; // Cancel further handling of other promises
  //             return nextId;
  //           }
  //         }),
  //         connectedDevice[4]?.waitForVibration().then(() => {
  //           if (!isCancelled) {
  //             isCancelled = true; // Cancel further handling of other promises
  //             return 4;
  //           }
  //         }),
  //       ];
  //       const firstResolveIndex = await Promise.race(vibrationPromises);
  //       console.log("firstResolve", firstResolveIndex);
  //       if (firstResolveIndex === 4) {
  //         handleReturnToCenter();
  //       } else {
  //         console.log("missmissmissmissmissmissmissmiss");
  //         await Promise.all([
  //           connectedDevice[firstResolveIndex as number]?.beep(),
  //           soundMiss.replayAsync(),
  //         ]);
  //         setCurrentIndex((prevIndex) => prevIndex + 1);
  //         handleReturnToCenter(true);
  //       }
  //     } else {
  //       await connectedDevice[4]?.waitForVibration();
  //       isStillMiss.current = false;
  //       handleReturnToCenter();
  //     }
  //     console.log("nextId", nextId);
  //   } catch (error) {
  //     console.error("Failed to read characteristic:", error);
  //   }
  // };

  // Parse counts
  const R1Count = R1 || 0;
  const R2Count = R2 || 0;
  const L1Count = L1 || 0;
  const L2Count = L2 || 0;

  const [circleSequence, setCircleSequence] = useState<CircleKey[]>([]);

  useEffect(() => {
    connectedDevice[4]?.changeMode(0, 0, 0, 2);
    let sequence: number[] = [];
    connectedDevice[0]?.setThreshold(threL1); //L1
    connectedDevice[1]?.setThreshold(threR1); //R1
    connectedDevice[2]?.setThreshold(threL2); //L2
    connectedDevice[3]?.setThreshold(threR2); //R2
    for (let i = 0; i < 4; i++) {
      // connectedDevice[i]?.setThreshold(threshold);
      connectedDevice[i]?.changeMode(0, 0, 0, 0);
    }
    if (mode === 1) {
      // Mode ขวา: R1 R2 L2 L1
      const sequenceTemp: number[] = [1, 3, 2, 0];
      for (let i = 0; i < L1Count; i++) {
        for (let j = 0; j < sequenceTemp.length; j++) {
          sequence.push(sequenceTemp[j]);
        }
      }
    } else if (mode === 2) {
      // Mode ซ้าย: L1 L2 R2 R1
      const sequenceTemp: number[] = [0, 2, 3, 1];
      for (let i = 0; i < L1Count; i++) {
        for (let j = 0; j < sequenceTemp.length; j++) {
          sequence.push(sequenceTemp[j]);
        }
      }
    } else {
      // Default random sequence based on counts for other modes
      for (let i = 0; i < L1Count; i++) sequence.push(0);
      for (let i = 0; i < L2Count; i++) sequence.push(3);
      for (let i = 0; i < R1Count; i++) sequence.push(1);
      for (let i = 0; i < R2Count; i++) sequence.push(3);

      sequence = shuffleArray(sequence);
    }
    console.log(sequence);
    play(sequence);
  }, []);

  const play = async (sequence: number[]) => {
    let lastTimestamp = Date.now();
    let isStillMiss = false;
    let index = 1;
    let pos =
      sequence[0] == 0
        ? "L1"
        : sequence[0] == 1
        ? "R1"
        : sequence[0] == 2
        ? "L2"
        : "R2";
    setCircleColors((prevColors) => {
      return {
        ...prevColors,
        [pos]: "green",
      };
    });
    await connectedDevice[sequence[0]]?.waitForVibration();
    await Promise.all([connectedDevice[0]?.beep(), sound.replayAsync()]);
    setCircleColors((prevColors) => {
      return {
        ...prevColors,
        [pos]: "red",
        Center: "yellow",
      };
    });
    while (index < sequence.length) {
      if (index < sequence.length - 1) {
        const nextId = sequence[index + 1];
        const vibrationPromises = [
          connectedDevice[nextId]?.waitForVibration().then(() => {
            return nextId;
          }),
          connectedDevice[4]?.waitForVibration().then(() => {
            return 4;
          }),
        ];
        const firstResolveIndex = await Promise.race(vibrationPromises);
        const currentTime = Date.now();
        const timeDiff = (currentTime - lastTimestamp) / 1000;
        if (firstResolveIndex === 4) {
          pos =
            nextId == 0 ? "L1" : nextId == 1 ? "R1" : nextId == 2 ? "L2" : "R2";
          setInteractionTimes((prevTimes) => [
            ...prevTimes,
            {
              description: `${pos} to Center`,
              time: timeDiff,
            },
          ]);
          setCircleColors((prevColors) => {
            return {
              ...prevColors,
              [pos]: "green",
              Center: "blue",
            };
          });
          isStillMiss = false;
          await Promise.all([connectedDevice[4]?.beep(), sound.replayAsync()]);
        } else {
          isStillMiss = true;
          index++;
          setCircleColors((prevColors) => {
            return {
              L1: "red",
              R1: "red",
              L2: "red",
              R2: "red",
              Center: "yellow",
            };
          });
          setInteractionTimes((prevTimes) => [
            ...prevTimes,
            {
              description: `Miss ${pos} to Center and Hit ${
                nextId == 0
                  ? "L1"
                  : nextId == 1
                  ? "R1"
                  : nextId == 2
                  ? "L2"
                  : "R2"
              }`,
              time: timeDiff,
            },
          ]);
          await Promise.all([
            connectedDevice[firstResolveIndex as number]?.beep(),
            soundMiss.replayAsync(),
          ]);
        }
      } else {
        await connectedDevice[4]?.waitForVibration();
        isStillMiss = false;
      }
      lastTimestamp = Date.now();
      index++;
    }
    handleStopAndShowResult();
  };

  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // useEffect(() => {
  //   if (circleSequence.length === 0) return;
  //   console.log("change");
  //   if (!gameState.centerActive && currentIndex < circleSequence.length) {
  //     const nextCircle = circleSequence[currentIndex];

  //     if (currentIndex === 0 && lastTimestamp === null) {
  //       setLastTimestamp(Date.now());
  //     }

  //     setCircleColors((prevColors) => ({
  //       ...prevColors,
  //       R1: "red",
  //       R2: "red",
  //       L1: "red",
  //       L2: "red",
  //       [nextCircle]: "green",
  //     }));
  //     setGameState((prevState) => ({
  //       ...prevState,
  //       currentGreen: nextCircle,
  //     }));
  //   } else if (currentIndex >= circleSequence.length) {
  //     handleStopAndShowResult();
  //   }
  // }, [gameState.centerActive, currentIndex, circleSequence]);

  const handleCenterPress = () => {
    if (gameState.centerActive) {
      setGameState((prevState) => ({
        ...prevState,
        centerActive: false,
      }));
      handleReturnToCenter();
    }
  };

  const handleReturnToCenter = (miss = false) => {
    const currentTime = Date.now();
    if (lastTimestamp !== null && gameState.currentGreen !== null) {
      const timeDiff = (currentTime - lastTimestamp) / 1000;
      if (!miss)
        setInteractionTimes((prevTimes) => [
          ...prevTimes,
          {
            description: `${gameState.currentGreen} to Center`,
            time: timeDiff,
          },
        ]);
      else {
        const nextState =
          circleSequence[
            (gameState.currentGreen === "R1"
              ? 1
              : gameState.currentGreen === "R2"
              ? 3
              : gameState.currentGreen === "L1"
              ? 0
              : 2) + 1
          ];
        setInteractionTimes((prevTimes) => [
          ...prevTimes,
          {
            description: `Miss ${gameState.currentGreen} to Center and Hit ${nextState}`,
            time: timeDiff,
          },
        ]);
      }
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

    if (isCheckHitStillCall.current) return;
    isCheckHitStillCall.current = true;
    checkHit(id);
    isCheckHitStillCall.current = false;
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
    if (!isStillMiss.current) {
      await Promise.all([connectedDevice[id]?.beep(), sound.replayAsync()]);
    } else {
      await Promise.all([connectedDevice[id]?.beep(), soundMiss.replayAsync()]);
    }

    // console.log("hit detected", id);
    handleHitDetected();
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
      setGameState((prevState) => ({ ...prevState, centerActive: true }));
      hitActiveRef.current = false;
    }
  };

  const handleStopAndShowResult = () => {
    // stopActiveRef.current = true; // Stop all async loops
    // setGameState((prevState) => ({
    //   ...prevState,
    //   centerActive: false, // Ensure centerActive is reset
    // }));
    setShowResultScreen(true);
  };

  if (showResultScreen) {
    const totalTime = interactionTimes.reduce(
      (acc, interaction) => acc + interaction.time,
      0
    );

    return (
      <ResultScreen
        interactionTimes={interactionTimes}
        totalTime={totalTime}
        onClose={() => setShowResultScreen(false)}
      />
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
