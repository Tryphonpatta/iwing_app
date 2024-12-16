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
  threshold: number;
};

type Interaction = {
  description: string;
  time: number; // in seconds
};
const sound = new Audio.Sound();
const soundMiss = new Audio.Sound();

const Field = ({ R1, R2, L1, L2, mode, threshold }: FieldProps) => {
  const { connectedDevice } = useBleManager();
  const [circleColors, setCircleColors] = useState({
    R1: "red",
    R2: "red",
    L1: "red",
    L2: "red",
    Center: "blue",
  });
  const [showResultScreen, setShowResultScreen] = useState(false);
  const interactionTimes = useRef<Interaction[]>([]);
  const Miss = useRef(0 as number);

  // Update centerActiveRef when gameState.centerActive changes
  useEffect(() => {
    if (!sound._loaded && !sound._loading)
      sound.loadAsync(require("../../../assets/audio/beep-06.mp3"));
    sound.setVolumeAsync(0.7);
    if (!soundMiss._loaded && !soundMiss._loading)
      soundMiss.loadAsync(require("../../../assets/audio/wrong.wav"));
    soundMiss.setVolumeAsync(1);
  }, []);

  const R1Count = R1 || 0;
  const R2Count = R2 || 0;
  const L1Count = L1 || 0;
  const L2Count = L2 || 0;

  const [circleSequence, setCircleSequence] = useState<CircleKey[]>([]);

  useEffect(() => {
    connectedDevice[4]?.changeMode(0, 0, 0, 2);
    Miss.current = 0;
    let sequence: number[] = [];
    for (let i = 0; i < 4; i++) {
      connectedDevice[i]?.setThreshold(threshold);
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
    console.log("sequence", sequence);
    let lastTimestamp = Date.now();
    let isStillMiss = false;
    let index = 0;
    let pos =
      sequence[0] == 0
        ? "L1"
        : sequence[0] == 1
        ? "R1"
        : sequence[0] == 2
        ? "L2"
        : "R2";
    let isNeedToHit = true;
    while (index < sequence.length) {
      lastTimestamp = Date.now();
      if (isNeedToHit) {
        pos =
          sequence[index] == 0
            ? "L1"
            : sequence[index] == 1
            ? "R1"
            : sequence[index] == 2
            ? "L2"
            : "R2";
        setCircleColors((prevColors) => ({
          ...prevColors,
          [pos]: "green",
        }));
        await connectedDevice[sequence[index]]?.waitForVibration();
        let timeDiff = (Date.now() - lastTimestamp) / 1000;
        console.log("timeDiff", timeDiff);
        interactionTimes.current.push({
          description: `Hit ${pos}`,
          time: timeDiff,
        });
        await Promise.all([
          connectedDevice[sequence[index]]?.beep(),
          sound.replayAsync(),
        ]);
        isNeedToHit = false;
        setCircleColors((prevColors) => ({
          ...prevColors,
          [pos]: "red",
          Center: "yellow",
        }));
        index++;
      } else {
        const nextId = sequence[index];
        const nextPos =
          nextId == 0 ? "L1" : nextId == 1 ? "R1" : nextId == 2 ? "L2" : "R2";
        const vibrationPromises = [
          connectedDevice[nextId]?.waitForVibration().then(() => {
            return nextId;
          }),
          connectedDevice[4]?.waitForVibration().then(() => {
            return 4;
          }),
        ];
        const firstResolveIndex = await Promise.race(vibrationPromises);
        if (firstResolveIndex == 4) {
          let timeDiff = (Date.now() - lastTimestamp) / 1000;
          Promise.all([connectedDevice[4]?.beep(), sound.replayAsync()]);
          pos =
            sequence[index] == 0
              ? "L1"
              : sequence[index] == 1
              ? "R1"
              : sequence[index] == 2
              ? "L2"
              : "R2";
          setCircleColors((prevColors) => ({
            ...prevColors,
            [pos]: "green",
            Center: "blue",
          }));
          isNeedToHit = true;
          interactionTimes.current.push({
            description: `To Center`,
            time: timeDiff,
          });
        } else {
          let timeDiff = (Date.now() - lastTimestamp) / 1000;
          Promise.all([
            connectedDevice[firstResolveIndex as number]?.beep(),
            soundMiss.replayAsync(),
          ]);
          isNeedToHit = false;
          interactionTimes.current.push({
            description: `Miss Center and Hit ${nextPos}`,
            time: timeDiff,
          });
          Miss.current++;
          index++;
        }
      }
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

  const handleStopAndShowResult = () => {
    console.log("interactionTimes", interactionTimes.current);
    setShowResultScreen(true);
  };

  return !showResultScreen ? (
    <View style={styles.containerField}>
      <View style={styles.circleContainer}>
        <TouchableOpacity
          style={[
            styles.circle,
            { top: 20, left: 20, backgroundColor: circleColors.L1 },
          ]}
          onPress={() => {
            connectedDevice[0]?.forceVibration();
          }}
        >
          <Text style={styles.text}>L1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circle,
            { top: 20, right: 20, backgroundColor: circleColors.R1 },
          ]}
          onPress={() => {
            connectedDevice[1]?.forceVibration();
          }}
        >
          <Text style={styles.text}>R1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circle,
            { bottom: 20, left: 20, backgroundColor: circleColors.L2 },
          ]}
          onPress={() => {
            connectedDevice[2]?.forceVibration();
          }}
        >
          <Text style={styles.text}>L2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circle,
            { bottom: 20, right: 20, backgroundColor: circleColors.R2 },
          ]}
          onPress={() => {
            connectedDevice[3]?.forceVibration();
          }}
        >
          <Text style={styles.text}>R2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.circle, { backgroundColor: circleColors.Center }]}
          onPress={() => {
            connectedDevice[4]?.forceVibration();
          }}
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
  ) : (
    <ResultScreen
      interactionTimes={interactionTimes.current}
      totalTime={50}
      miss={Miss.current}
      onClose={() => setShowResultScreen(false)}
    />
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
