import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import * as FileSystem from "expo-file-system";
import PatternScreen from "./pattern";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type Interaction = {
  description: string;
  time: number;
};

type ResultScreenProps = {
  interactionTimes?: Interaction[];
  totalTime?: number;
  onClose: () => void;
  miss: number;
};

const ResultScreen = ({
  interactionTimes = [],
  totalTime = 0,
  miss,
}: ResultScreenProps) => {
  const [showRunScreen, setShowRunScreen] = useState(false);
  const [filters, setFilters] = useState({
    centerTo: true,
    toCenter: true,
  });

  const totalHitTime = interactionTimes
    .filter((interaction) => interaction.description.startsWith("Center to"))
    .reduce((acc, interaction) => acc + interaction.time, 0);

  const totalBackCenterTime = interactionTimes
    .filter((interaction) => interaction.description.endsWith("to Center"))
    .reduce((acc, interaction) => acc + interaction.time, 0);

  const progress = totalTime > 0 ? Math.min(totalHitTime / totalTime, 1) : 0;

  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  console.log("result", interactionTimes);
  const handleDonePress = () => {
    setShowRunScreen(true);
  };

  const toggleFilter = (filter: "centerTo" | "toCenter") => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [filter]: !prevFilters[filter] };
      // Ensure at least one filter is selected
      if (!updatedFilters.centerTo && !updatedFilters.toCenter) {
        updatedFilters.centerTo = true;
        updatedFilters.toCenter = true;
      }
      return updatedFilters;
    });
  };

  const filteredInteractions = interactionTimes.filter((interaction) => {
    const isCenterTo = interaction.description.startsWith("");
    const isToCenter = interaction.description.endsWith("");

    if (filters.centerTo && isCenterTo) return true;
    if (filters.toCenter && isToCenter) return true;

    return false;
  });

  const saveToCSV = async () => {
    try {
      let directoryUri = "";

      if (Platform.OS === "android") {
        // Request directory permissions using StorageAccessFramework
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          Alert.alert(
            "Permission Denied",
            "Cannot save file without directory permissions."
          );
          return;
        }

        directoryUri = permissions.directoryUri;
      } else {
        // For iOS or other platforms, use the default Documents directory
        directoryUri = FileSystem.documentDirectory!;
      }

      // Prepare CSV content
      const csvHeader = "Description,Time (s)\n";
      const csvRows = interactionTimes
        .map(
          (interaction) =>
            `${interaction.description},${interaction.time.toFixed(2)}`
        )
        .join("\n");
      const csvContent = `${csvHeader}${csvRows}\nTotal Time,${totalTime.toFixed(
        2
      )}`;

      // Define the file name
      const fileName = "interaction_times.csv";

      let fileUri = "";

      if (Platform.OS === "android") {
        // Use StorageAccessFramework to create the file in the selected directory
        fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          fileName,
          "text/csv"
        );

        // Write the CSV content to the file
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          fileUri,
          csvContent,
          {
            encoding: FileSystem.EncodingType.UTF8,
          }
        );
      } else {
        // For iOS or other platforms, use the standard FileSystem.writeAsStringAsync
        fileUri = `${directoryUri}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      // Notify the user
      Alert.alert("File Saved", `File successfully saved to:\n${fileUri}`);
    } catch (error) {
      console.error("Error saving CSV:", error);
      Alert.alert("Error", "An error occurred while saving the CSV file.");
    }
  };

  if (showRunScreen) {
    return <PatternScreen />;
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Result</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          width: "97%",
          marginVertical: 10,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 10,
          }}
          onPress={saveToCSV}
        >
          <Ionicons name="save-outline" size={28} color="#2f855a" />
          <Text style={{ fontSize: 16, color: "#2f855a", marginLeft: 5 }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.containerResult}>
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

        <View style={[styles.row, styles.totalTimeContainer]}>
          <Text style={styles.label}>Total Time:</Text>
          <Text style={styles.value}>{totalTime.toFixed(2)} s</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => toggleFilter("centerTo")}
            style={styles.checkboxContainer}
          >
            <View
              style={[
                styles.checkboxSquare,
                filters.centerTo && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.checkboxLabel}>CenterTo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleFilter("toCenter")}
            style={styles.checkboxContainer}
          >
            <View
              style={[
                styles.checkboxSquare,
                filters.toCenter && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.checkboxLabel}>ToCenter</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.resultContainer}>
            {filteredInteractions.map((interaction, index) => (
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor:
                      index % 2 === 0 ? "transparent" : "#f0f0f0",
                  },
                ]}
                key={index}
              >
                <Text style={styles.label}>{interaction.description}:</Text>
                <Text style={styles.value}>
                  {interaction.time.toFixed(2)} s
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
          <Text style={styles.doneButtonText}>Finish</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.doneButton} onPress={saveToCSV}>
          <Text style={styles.doneButtonText}>Save to CSV</Text>
        </TouchableOpacity> */}
      </View>
    </>
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
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  svgContainer: {
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    width: "100%",
    marginBottom: 10,
  },
  totalTimeContainer: {
    backgroundColor: "#44bd80",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginBottom: 10,
  },
  resultContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
    width: "100%",
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
  },
  doneButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
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
});

export default ResultScreen;
