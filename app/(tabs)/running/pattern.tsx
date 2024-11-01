// pattern.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Field from "./field"; // Ensure the import path is correct

const PatternScreen = () => {
  const [R1, setR1] = useState("");
  const [R2, setR2] = useState("");
  const [L1, setL1] = useState("");
  const [L2, setL2] = useState("");
  const [goField, setShowField] = useState(false);

  const handleStart = () => {
    // Ensure at least one count is provided
    const totalCounts =
      (parseInt(R1) || 0) + (parseInt(R2) || 0) + (parseInt(L1) || 0) + (parseInt(L2) || 0);
    if (totalCounts > 0) {
      setShowField(true);
    } else {
      alert("Please enter at least one count to start.");
    }
  };

  if (goField) {
    return <Field R1={R1} R2={R2} L1={L1} L2={L2} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pattern Mode</Text>

      <TextInput
        style={styles.input}
        value={R1}
        onChangeText={(text) => setR1(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
        placeholder="R1"
      />

      <TextInput
        style={styles.input}
        value={R2}
        onChangeText={(text) => setR2(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
        placeholder="R2"
      />

      <TextInput
        style={styles.input}
        value={L1}
        onChangeText={(text) => setL1(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
        placeholder="L1"
      />

      <TextInput
        style={styles.input}
        value={L2}
        onChangeText={(text) => setL2(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
        placeholder="L2"
      />

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E8F5E9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: 150,
    height: 50,
    backgroundColor: "#e0e0e0",
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 18,
  },
  startButton: {
    backgroundColor: "#2f855a",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  startButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PatternScreen;