import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import RunScreen from "../run"; // ตรวจสอบให้แน่ใจว่าที่อยู่ถูกต้อง

const PatternScreen = () => {
  const [R1, setR1] = useState("");
  const [R2, setR2] = useState("");
  const [L1, setL1] = useState("");
  const [L2, setL2] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [showRunScreen, setShowRunScreen] = useState(false); // state สำหรับการแสดงหน้า RunScreen

  const handleStartStop = () => {
    setIsStarted(!isStarted);
  };

  // ถ้า showRunScreen เป็น true ให้แสดงหน้า RunScreen
  if (showRunScreen) {
    return <RunScreen />; // ตรวจสอบให้แน่ใจว่า RunScreen ถูกต้อง
  }

  return (
    <View style={styles.container}>
      {!isStarted && (
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => setShowRunScreen(true)} // เปลี่ยน state เป็น true เพื่อแสดง RunScreen
        >
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>Pattern Mode</Text>

      {/* Input R1 */}
      <TextInput
        style={styles.input}
        value={R1}
        onChangeText={(text) => setR1(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="R1"
      />

      {/* Input R2 */}
      <TextInput
        style={styles.input}
        value={R2}
        onChangeText={(text) => setR2(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="R2"
      />

      {/* Input L1 */}
      <TextInput
        style={styles.input}
        value={L1}
        onChangeText={(text) => setL1(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="L1"
      />

      {/* Input L2 */}
      <TextInput
        style={styles.input}
        value={L2}
        onChangeText={(text) => setL2(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="L2"
      />

      {/* ปุ่ม Start/Stop */}
      <TouchableOpacity
        style={[styles.startButton, isStarted ? styles.stopButton : null]}
        onPress={handleStartStop}
      >
        <Text style={styles.startButtonText}>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 50,
    backgroundColor: "#e0e0e0",
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 18,
  },
  startButton: {
    backgroundColor: "#2f855a", // สีเขียวเมื่อยังไม่ได้เริ่ม
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  stopButton: {
    backgroundColor: "#e53e3e", // สีแดงเมื่อกด Start แล้ว
  },
  startButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
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
});

export default PatternScreen;
