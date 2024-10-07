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

  // Render a button for each option
  const renderButton = (option: string) => (
    <TouchableOpacity
      style={[
        styles.button,
        selectedOption === option ? styles.selectedButton : null, // Apply selected style if selected
      ]}
      onPress={() => setSelectedOption(option)}
    >
      <Text
        style={[
          styles.text,
          selectedOption === option ? styles.selectedText : null, // Apply selected text color
        ]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderButton(option1)}
      {renderButton(option2)}
      {renderButton(option3)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f3e393", // Background color
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
