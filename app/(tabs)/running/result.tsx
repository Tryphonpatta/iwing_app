import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import RunScreen from "../run";

const { width } = Dimensions.get("window");

type Interaction = {
  description: string;
  time: number;
};

type ResultScreenProps = {
  interactionTimes: Interaction[];
  totalTime: number;
};

const ResultScreen = ({ interactionTimes, totalTime }: ResultScreenProps) => {
  const [showRunScreen, setShowRunScreen] = useState(false);
  const [filters, setFilters] = useState({
    all: true,
    even: false,
    odd: false,
  });

  // Calculate Total Hit Time and Total Back Center Time
  const totalHitTime = interactionTimes
    .filter((interaction) => interaction.description.startsWith("Center to"))
    .reduce((acc, interaction) => acc + interaction.time, 0);

  const totalBackCenterTime = interactionTimes
    .filter((interaction) => interaction.description.endsWith("to Center"))
    .reduce((acc, interaction) => acc + interaction.time, 0);

  // Calculate progress as Total Hit Time / Total Time
  const progress = totalTime > 0 ? Math.min(totalHitTime / totalTime, 1) : 0;

  // Circle progress properties
  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  // Function to handle button press
  const handleDonePress = () => {
    setShowRunScreen(true);
  };

  // Function to toggle filter options
  const toggleFilter = (filter: string) => {
    setFilters((prevFilters) => {
      const updatedFilters = {
        all: filter === "all" ? !prevFilters.all : prevFilters.all,
        even: filter === "even" ? !prevFilters.even : prevFilters.even,
        odd: filter === "odd" ? !prevFilters.odd : prevFilters.odd,
      };
      // Ensure at least one filter is selected
      if (!updatedFilters.all && !updatedFilters.even && !updatedFilters.odd) {
        updatedFilters.all = true;
      }
      return updatedFilters;
    });
  };

  // Filter interactions based on selected filters
  const filteredInteractions = interactionTimes.filter((_, index) => {
    if (filters.all) return true;
    if (filters.even && index % 2 === 0) return true;
    if (filters.odd && index % 2 !== 0) return true;
    return false;
  });

  if (showRunScreen) {
    return <RunScreen />;
  }

  return (
    <View style={styles.containerResult}>
      <Text style={styles.title}>Result</Text>

      {/* Circular Progress Indicator */}
      <Svg height={radius * 2} width={radius * 2} style={styles.svgContainer}>
        <Circle
          stroke="#e0e0e0"
          fill="none"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#2f855a"
          fill="none"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        <SvgText
          x={radius}
          y={radius}
          textAnchor="middle"
          dy=".3em"
          fontSize="16"
          fill="#333"
        >
          {`Hit ${(progress * 100).toFixed(2)}%`}
        </SvgText>
      </Svg>

      <ScrollView style={styles.scrollView}>
        {/* Total Time - Displayed Separately */}
        <View style={[styles.row, styles.totalTimeContainer]}>
          <Text style={styles.label}>Total Time:</Text>
          <Text style={styles.value}>{totalTime.toFixed(2)} s</Text>
        </View>

        {/* Checklist for Filters */}
        <View style={styles.filterContainer}>
          {/* All Checkbox */}
          <TouchableOpacity onPress={() => toggleFilter("all")} style={styles.checkboxContainer}>
            <View style={[styles.checkboxSquare, filters.all && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>All</Text>
          </TouchableOpacity>

          {/* CenterTo Checkbox (Even Rows) */}
          <TouchableOpacity onPress={() => toggleFilter("even")} style={styles.checkboxContainer}>
            <View style={[styles.checkboxSquare, filters.even && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>CenterTo</Text>
          </TouchableOpacity>

          {/* ToCenter Checkbox (Odd Rows) */}
          <TouchableOpacity onPress={() => toggleFilter("odd")} style={styles.checkboxContainer}>
            <View style={[styles.checkboxSquare, filters.odd && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>ToCenter</Text>
          </TouchableOpacity>
        </View>

        {/* Interaction Times List */}
        <View style={styles.resultContainer}>
          {filteredInteractions.map((interaction, index) => (
            <View
              style={[
                styles.row,
                { backgroundColor: index % 2 === 0 ? "#ffffff" : "#f0f0f0" , borderRadius: 10},
              ]}
              key={index}
            >
              <Text style={styles.label}>{interaction.description}:</Text>
              <Text style={styles.value}>{interaction.time.toFixed(2)} s</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Finish Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#333",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#2f855a",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },  
  containerResult: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2f855a",
    textAlign: "center",
  },
  svgContainer: {
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  totalTimeContainer: {
    backgroundColor: "#44bd80",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  checkbox: {
    padding: 10,
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  resultContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 20,
    // Shadow (Works for both iOS and Android)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Elevation for Android
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    padding: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    paddingLeft: 15,
  },
  value: {
    fontSize: 18,
    color: "#333",
    textAlign: "right",
    flex: 1,
    paddingRight: 15,
  },
  doneButton: {
    backgroundColor: "#2f855a",
    paddingVertical: 15,
    width: width * 0.6,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  doneButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ResultScreen;
