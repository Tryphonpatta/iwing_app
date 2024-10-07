import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";

const TimePicker = () => {
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedSeconds, setSelectedSeconds] = useState(0);

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    label: `${i}`,
    value: i,
  }));

  const secondOptions = Array.from({ length: 60 }, (_, i) => ({
    label: `${i}`,
    value: i,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerBox}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedMinutes(value)}
            items={minuteOptions}
            style={pickerSelectStyles}
            placeholder={{ label: "00", value: 0 }}
            value={selectedMinutes}
          />
        </View>

        <Text style={styles.colon}>:</Text>

        <View style={styles.pickerBox}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedSeconds(value)}
            items={secondOptions}
            style={pickerSelectStyles}
            placeholder={{ label: "00", value: 0 }}
            value={selectedSeconds}
          />
        </View>
      </View>
      <Text style={styles.selectedTime}>
        Selected Time: {selectedMinutes} min {selectedSeconds} sec
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickerBox: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    width: 100,
    alignItems: "center",
  },
  colon: {
    fontSize: 48,
    marginHorizontal: 10,
  },
  selectedTime: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 32,
    textAlign: "center",
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: "black",
    borderBottomColor: "black",
  },
  inputAndroid: {
    fontSize: 32,
    textAlign: "center",
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: "black",
  },
});

export default TimePicker;
