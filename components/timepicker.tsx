import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const TimePicker = () => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const increment = (type: string) => {
    if (type === "minutes") {
      setMinutes((prev) => (prev + 1) % 60);
    } else {
      setSeconds((prev) => (prev + 1) % 60);
    }
  };

  const decrement = (type: string) => {
    if (type === "minutes") {
      setMinutes((prev) => (prev === 0 ? 59 : prev - 1));
    } else {
      setSeconds((prev) => (prev === 0 ? 59 : prev - 1));
    }
  };

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <TouchableOpacity onPress={() => increment("minutes")}>
            <MaterialIcons name="arrow-drop-up" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.timeText}>{formatNumber(minutes)}</Text>
          <TouchableOpacity onPress={() => decrement("minutes")}>
            <MaterialIcons name="arrow-drop-down" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.unitLabel}>min</Text>
        <View style={styles.timeInput}>
          <TouchableOpacity onPress={() => increment("seconds")}>
            <MaterialIcons name="arrow-drop-up" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.timeText}>{formatNumber(seconds)}</Text>
          <TouchableOpacity onPress={() => decrement("seconds")}>
            <MaterialIcons name="arrow-drop-down" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.unitLabel}>sec</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f7f9",
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 16,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#333",
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  unitLabel: {
    fontSize: 16,
    marginHorizontal: 4,
  },
});

export default TimePicker;
