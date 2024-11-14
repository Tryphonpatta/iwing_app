import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  FlatList,
} from "react-native";
import Field from "./field";
import RunScreen from "../run";
import InputSpinner from "react-native-input-spinner";
import { Ionicons } from "@expo/vector-icons";

const modes = [
  { id: 1, icon: "walk" }, // Walk icon (default behavior)
  { id: 2, icon: "bicycle" }, // Bicycle icon (new behavior)
  { id: 3, icon: "car" },
  { id: 4, icon: "train" },
];

const PatternScreen = () => {
  const [R1, setR1] = useState(0);
  const [R2, setR2] = useState(0);
  const [L1, setL1] = useState(0);
  const [L2, setL2] = useState(0);
  const [goField, setShowField] = useState(false);
  const [showRunScreen, setShowRunScreen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(modes[0].id);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const handleStart = () => {
    const totalCounts = R1 + R2 + L1 + L2;
    if (totalCounts > 0) {
      setShowField(true);
    } else {
      alert("Please enter at least one count to start.");
    }
  };

  const [isBicycleMode, setIsBicycleMode] = useState(false);

  const setModeValues = (modeId : number) => {
    if (modeId === 2) {
      // Bicycle mode: set all values to 1 and enable Bicycle mode sequence
      setR1(1);
      setR2(1);
      setL1(1);
      setL2(1);
      setIsBicycleMode(true);
    } else {
      // Reset values for other modes and disable Bicycle mode sequence
      setR1(0);
      setR2(0);
      setL1(0);
      setL2(0);
      setIsBicycleMode(false);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 5,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -5,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (showRunScreen) {
    return <RunScreen />;
  }

  if (goField) {
    return <Field R1={R1} R2={R2} L1={L1} L2={L2} mode={selectedMode} />;
  }

  const renderModeIcon = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.iconContainer,
        selectedMode === item.id && styles.selectedIconContainer,
      ]}
      onPress={() => {
        setSelectedMode(item.id);
        setModeValues(item.id);
      }}
    >
      <Ionicons
        name={item.icon}
        size={80}
        color={selectedMode === item.id ? "#2f855a" : "#ccc"}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Header with Back Icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowRunScreen(true)}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Pattern Mode</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.selectText}>SELECT</Text>
        <View style={styles.modeSelector}>
          <FlatList
            data={modes}
            renderItem={renderModeIcon}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
          />
        </View>

        {/* Input Spinners */}
        <InputSpinner
          max={100}
          min={0}
          step={1}
          value={R1}
          onChange={(num) => setR1(num)}
          style={styles.spinner}
          skin="clean"
          color="#2f855a"
          placeholder="R1"
          editable={selectedMode !== 2}
        />
        <InputSpinner
          max={100}
          min={0}
          step={1}
          value={R2}
          onChange={(num) => setR2(num)}
          style={styles.spinner}
          skin="clean"
          color="#2f855a"
          placeholder="R2"
          editable={selectedMode !== 2}
        />
        <InputSpinner
          max={100}
          min={0}
          step={1}
          value={L1}
          onChange={(num) => setL1(num)}
          style={styles.spinner}
          skin="clean"
          color="#2f855a"
          placeholder="L1"
          editable={selectedMode !== 2}
        />
        <InputSpinner
          max={100}
          min={0}
          step={1}
          value={L2}
          onChange={(num) => setL2(num)}
          style={styles.spinner}
          skin="clean"
          color="#2f855a"
          placeholder="L2"
          editable={selectedMode !== 2}
        />

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#419E68",
    marginTop: 30,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  selectText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "red",
    marginBottom: 10,
  },
  modeSelector: {
    borderWidth: 2,
    borderColor: "red",
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    width: "80%",
    height: 120,
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  selectedIconContainer: {
    backgroundColor: "#d9f7be",
    borderRadius: 50,
  },
  spinner: {
    width: "90%",
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  startButton: {
    backgroundColor: "#2f855a",
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PatternScreen;
