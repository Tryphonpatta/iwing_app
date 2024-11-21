import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  FlatList,
  Modal
} from "react-native";
import Field from "./field";
import RunScreen from "../run";
import InputSpinner from "react-native-input-spinner";
import { Ionicons } from "@expo/vector-icons";

const modes = [
  { id: 1, icon: "dice", description: "Random: The pattern is selected randomly each time." },
  { id: 2, icon: "walk", description: "Sequence: The pattern follows a fixed sequence (R1 → L1 → L2 → R2)." },
  { id: 3, icon: "stop-circle", description: "Stop Mode 1: Nothing." },
  { id: 4, icon: "stop-circle", description: "Stop Mode 2: Nothing." },
];

const PatternScreen = () => {
  const [R1, setR1] = useState(0);
  const [R2, setR2] = useState(0);
  const [L1, setL1] = useState(0);
  const [L2, setL2] = useState(0);
  const [goField, setShowField] = useState(false);
  const [showRunScreen, setShowRunScreen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(modes[0].id);
  const [showInfoModal, setShowInfoModal] = useState(false);

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
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: selectedMode === item.id ? "#2f855a" : "#777",
          marginTop: 5,
        }}
      >
        {item.description.split(":")[0]}
      </Text>
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
      
        {/* Info Button */}
        <View style={{ alignItems: "flex-end", width: "97%", marginVertical: 10 }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => setShowInfoModal(true)}
          >
            <Ionicons name="information-circle-outline" size={28} color="#2f855a" />
            <Text style={{ fontSize: 16, color: "#2f855a" }}>Info</Text>
          </TouchableOpacity>
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

        {/* Info Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showInfoModal}
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mode Explanations</Text>
              {modes.map((mode) => (
                <Text key={mode.id} style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>{mode.description.split(":")[0]}: </Text>
                  {mode.description.split(":")[1]}
                </Text>
              ))}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    color: "#2f855a",
    marginBottom: 10,
  },
  modeSelector: {
    borderWidth: 2,
    borderColor: "#2f855a",
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    width: "80%",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#2f855a",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default PatternScreen;
