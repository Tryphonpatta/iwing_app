import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// Define the props type
type SelectBarProps = {
  option1: string;
  option2: string;
  option3: string;
};

const SelectBar: React.FC<SelectBarProps> = ({ option1, option2, option3 }) => {
  // State to keep track of the selected option
  const [selectedOption, setSelectedOption] = useState<string>(option1); // Default to option1

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          selectedOption === option1 && styles.selectedButton, // Apply selected style if selected
        ]}
        onPress={() => setSelectedOption(option1)}
      >
        <Text
          style={[
            styles.text,
            selectedOption === option1 && styles.selectedText, // Apply selected text color
          ]}
        >
          {option1}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          selectedOption === option2 && styles.selectedButton, // Apply selected style if selected
        ]}
        onPress={() => setSelectedOption(option2)}
      >
        <Text
          style={[
            styles.text,
            selectedOption === option2 && styles.selectedText, // Apply selected text color
          ]}
        >
          {option2}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          selectedOption === option3 && styles.selectedButton, // Apply selected style if selected
        ]}
        onPress={() => setSelectedOption(option3)}
      >
        <Text
          style={[
            styles.text,
            selectedOption === option3 && styles.selectedText, // Apply selected text color
          ]}
        >
          {option3}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f3e393", // Background color similar to the image
    borderRadius: 10, // Rounded corners for the container
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5, // Spacing between buttons
  },
  selectedButton: {
    backgroundColor: "#313233", // Highlight color for selected button
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000", // Default text color
  },
  selectedText: {
    color: "#72b8ff", // Text color for selected button
  },
});

export default SelectBar;
