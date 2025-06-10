// import tw from "twrnc"; // Import utility-first styles
// import * as FileSystem from "expo-file-system";
// import React from "react";
// import {
// 	Modal,
// 	View,
// 	Text,
// 	TouchableOpacity,
// 	StyleSheet,
// 	Alert,
// 	Platform,
// } from "react-native";

// const saveToCSV = async (
// 	data: Array<{ description: string; value: string | number }>
// ) => {
// 	const now = new Date();

// 	// Format date with desired pattern
// 	const formattedDateTime = now
// 		.toLocaleString("en-GB", {
// 			second: "2-digit",
// 			minute: "2-digit",
// 			hour: "2-digit",
// 			day: "2-digit",
// 			month: "2-digit",
// 			year: "numeric",
// 			timeZone: "Asia/Bangkok",
// 			hour12: false,
// 		})
// 		.replace(/,/g, "");

// 	// Format filename
// 	const filename = `training_result_${formattedDateTime.replace(
// 		/[/:]/g,
// 		"-"
// 	)}.csv`;

// 	// Add formatted date header
// 	const dataWithHeader = [
// 		{ description: `Date: ${formattedDateTime}`, value: "" },
// 		{ description: "", value: "" }, // Empty line for spacing
// 		...data,
// 	];

// 	try {
// 		let csvContent = dataWithHeader
// 			.map((row) => `${row.description},${row.value}`)
// 			.join("\n");

// 		if (Platform.OS === "web") {
// 			const blob = new Blob([csvContent], { type: "text/csv" });
// 			const url = window.URL.createObjectURL(blob);
// 			const link = document.createElement("a");
// 			link.href = url;
// 			link.download = filename;
// 			link.click();
// 		} else {
// 			let directoryUri = "";

// 			if (Platform.OS === "android") {
// 				// Request directory permissions on Android
// 				const permissions =
// 					await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

// 				if (!permissions.granted) {
// 					Alert.alert(
// 						"Permission Denied",
// 						"Cannot save file without directory permissions."
// 					);
// 					return;
// 				}

// 				directoryUri = permissions.directoryUri;
// 				Alert.alert("Directory Selected", `Saving file to:\n${directoryUri}`);
// 			} else {
// 				// Use default document directory for other platforms
// 				directoryUri = FileSystem.documentDirectory!;
// 			}

// 			// Define the file name
// 			const fileName = `training_details_${Date.now()}.csv`;
// 			let fileUri = "";

// 			if (Platform.OS === "android") {
// 				// Use StorageAccessFramework to save the file on Android
// 				fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
// 					directoryUri,
// 					fileName,
// 					"text/csv"
// 				);

// 				await FileSystem.StorageAccessFramework.writeAsStringAsync(
// 					fileUri,
// 					csvContent,
// 					{
// 						encoding: FileSystem.EncodingType.UTF8,
// 					}
// 				);
// 			} else {
// 				// Write file to standard directory on other platforms
// 				fileUri = `${directoryUri}${fileName}`;
// 				await FileSystem.writeAsStringAsync(fileUri, csvContent, {
// 					encoding: FileSystem.EncodingType.UTF8,
// 				});
// 			}

// 			// Notify the user
// 			Alert.alert("File Saved", `File successfully saved to:\n${fileUri}`);
// 		}
// 	} catch (error) {
// 		Alert.alert("Error", "Failed to export data");
// 		console.error(error);
// 	}
// };

// const FullResult = ({
// 	isHitMode,
// 	isTimeMode,
// 	isHitModeDur,
// 	isTimeModeDur,
// 	onClose,
// 	lightOut,
// 	timeout,
// 	hitCount,
// 	delayTime,
// 	duration,
// 	minDuration,
// 	secDuration,
// 	hitDuration,
// 	playTime,
// 	userHitCount,
// }: {
// 	isHitMode: boolean;
// 	isTimeMode: boolean;
// 	isHitModeDur: boolean;
// 	isTimeModeDur: boolean;
// 	onClose: () => void;
// 	lightOut: string;
// 	timeout: number;
// 	hitCount: number;
// 	delayTime: number;
// 	duration: string;
// 	minDuration: number;
// 	secDuration: number;
// 	hitDuration: number;
// 	playTime: number;
// 	userHitCount: number;
// }) => {
// 	// Helper to handle CSV export
// 	const handleExport = () => {
// 		const data = [
// 			{ description: "Lights Out - Mode", value: lightOut },
// 			...(isTimeMode
// 				? [{ description: "Time Out", value: `${timeout} seconds` }]
// 				: []),
// 			...(isHitMode
// 				? [{ description: "Hit Count", value: `${hitCount.toFixed(2)} times` }]
// 				: []),
// 			{
// 				description: "Light Delay Time",
// 				value: `${delayTime.toFixed(2)} seconds`,
// 			},
// 			{ description: "Duration - Mode", value: duration },
// 			...(isTimeModeDur
// 				? [
// 						{
// 							description: "Duration - Time Out",
// 							value: `${minDuration * 60 + secDuration} seconds`,
// 						},
// 				  ]
// 				: []),
// 			...(isHitModeDur
// 				? [
// 						{
// 							description: "Hit Duration",
// 							value: `${hitDuration.toFixed(2)} times`,
// 						},
// 				  ]
// 				: []),
// 			{
// 				description: "Total Time",
// 				value: `${(playTime / 1000).toFixed(2)} seconds`,
// 			},
// 			{ description: "User Hit Count", value: `${userHitCount} times` },
// 			...(isHitMode && hitDuration > 0
// 				? [
// 						{
// 							description: "Hit Percentage",
// 							value: `${Math.min(
// 								(userHitCount / hitDuration) * 100,
// 								100
// 							).toFixed(2)} %`,
// 						},
// 				  ]
// 				: []),
// 		];

// 		saveToCSV(data);
// 	};

// 	return (
// 		<Modal animationType="slide">
// 			<View style={styles.overlay}>
// 				<View style={styles.detailBox}>
// 					<Text style={styles.sectionTitle}>Training Detail</Text>
// 					<Text style={styles.separator}>---------------</Text>

// 					<View style={styles.col}>
// 						<Text style={styles.label}>Lights Out</Text>
// 						<View style={styles.row}>
// 							<Text style={styles.label}>• Mode </Text>
// 							<Text style={styles.output}>{lightOut}</Text>
// 						</View>
// 						{isTimeMode && (
// 							<View style={styles.row}>
// 								<Text style={styles.label}>• Time out </Text>
// 								<Text style={styles.output}>{timeout}</Text>
// 							</View>
// 						)}
// 						{isHitMode && (
// 							<View style={styles.row}>
// 								<Text style={styles.label}>• Hit count</Text>
// 								<Text style={styles.output}>{hitCount + " times"}</Text>
// 							</View>
// 						)}
// 					</View>

// 					<View style={styles.row}>
// 						<Text style={styles.label}>Light Delay Time</Text>
// 						<Text style={styles.output}>
// 							{delayTime.toFixed(2) + " seconds"}
// 						</Text>
// 					</View>

// 					<View style={styles.col}>
// 						<Text style={styles.label}>Duration</Text>
// 						<View style={styles.row}>
// 							<Text style={styles.label}>• Mode</Text>
// 							<Text style={styles.output}>{duration}</Text>
// 						</View>
// 						{isTimeModeDur && (
// 							<View style={styles.row}>
// 								<Text style={styles.label}>• Time out</Text>
// 								<Text style={styles.output}>
// 									{minDuration * 60 + secDuration + " seconds"}
// 								</Text>
// 							</View>
// 						)}
// 						{isHitModeDur && (
// 							<View style={styles.row}>
// 								<Text style={styles.label}>• Hit count</Text>
// 								<Text style={styles.output}>
// 									{hitDuration.toFixed(2) + " times"}
// 								</Text>
// 							</View>
// 						)}
// 					</View>

// 					<Text style={styles.sectionTitle}>Measurement</Text>
// 					<Text style={styles.separator}>---------------</Text>

// 					<View style={styles.row}>
// 						<Text style={styles.label}>Total time</Text>
// 						<Text style={styles.output}>
// 							{(playTime / 1000).toFixed(2) + " seconds"}
// 						</Text>
// 					</View>
// 					<View style={styles.row}>
// 						<Text style={styles.label}>Hit Count</Text>
// 						<Text style={styles.output}>{userHitCount + " times"}</Text>
// 					</View>

// 					{isHitMode && (
// 						<View style={styles.row}>
// 							<Text style={styles.label}>• Hit Percentage</Text>
// 							<Text style={styles.output}>
// 								{hitDuration > 0
// 									? Math.min((userHitCount / hitDuration) * 100, 100).toFixed(
// 											2
// 									  ) + " %"
// 									: "N/A"}
// 							</Text>
// 						</View>
// 					)}

// 					<TouchableOpacity style={styles.button} onPress={onClose}>
// 						<Text style={styles.buttonText}>Finish</Text>
// 					</TouchableOpacity>
// 					<TouchableOpacity style={styles.button} onPress={handleExport}>
// 						<Text style={styles.buttonText}>Export</Text>
// 					</TouchableOpacity>
// 				</View>
// 			</View>
// 		</Modal>
// 	);
// };

// const styles = StyleSheet.create({
// 	container: { flex: 1, backgroundColor: "#e1f4f3" }, // Container style with background color
// 	header: {
// 		textAlign: "center", // Center align the text
// 		fontSize: 24, // Font size
// 		fontWeight: "bold", // Bold font weight
// 		marginVertical: 20, // Vertical margin
// 	},
// 	iconContainer: { position: "absolute", alignItems: "center" }, // Absolute positioning for icons
// 	playButton: {
// 		backgroundColor: "#2f95dc", // Button background color
// 		paddingVertical: 12, // Vertical padding
// 		paddingHorizontal: 20, // Horizontal padding
// 		borderRadius: 10, // Rounded corners
// 		alignSelf: "center", // Center the button horizontally
// 		marginTop: 20, // Top margin
// 	},
// 	result_container: {
// 		flex: 1,
// 		backgroundColor: "#E6F7F4",
// 		alignItems: "center",
// 		justifyContent: "center",
// 	},
// 	overlay: {
// 		flex: 1,
// 		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
// 		alignItems: "center",
// 		justifyContent: "center",
// 	},
// 	detailBox: {
// 		backgroundColor: "white",
// 		padding: 20,
// 		borderRadius: 16,
// 		width: "80%",
// 		alignItems: "center",
// 	},
// 	sectionTitle: {
// 		fontWeight: "bold",
// 		fontSize: 16,
// 		marginVertical: 8,
// 	},
// 	separator: {
// 		fontSize: 12,
// 		color: "#000000",
// 		marginBottom: 12,
// 	},
// 	col: {
// 		flexDirection: "column",
// 		justifyContent: "space-between",
// 		width: "100%",
// 		paddingVertical: 4,
// 	},
// 	row: {
// 		flexDirection: "row",
// 		justifyContent: "space-between",
// 		width: "100%",
// 		paddingVertical: 4,
// 	},
// 	label: {
// 		fontSize: 14,
// 		color: "#000000",
// 	},
// 	output: {
// 		fontSize: 14,
// 		color: "#2E7D32",
// 	},
// 	buttonText: {
// 		color: "white", // Text color
// 		fontWeight: "bold", // Bold font weight
// 		fontSize: 16, // Font size
// 	},
// 	buttonText2: {
// 		color: "red", // Text color
// 		// marginTop: ,
// 		fontWeight: "bold", // Bold font weight
// 		fontSize: 16, // Font size
// 	},
// 	hitCountContainer: {
// 		marginTop: 30, // Top margin
// 		alignItems: "center", // Center align the hit count
// 	},
// 	hitCountText: {
// 		fontSize: 20, // Font size for hit count
// 		fontWeight: "bold", // Bold font weight
// 		color: "#333", // Text color
// 		marginTop: 5,
// 	},
// 	button: {
// 		backgroundColor: "#4A4A4A",
// 		paddingVertical: 10,
// 		paddingHorizontal: 30,
// 		borderRadius: 20,
// 		marginTop: 10,
// 		alignItems: "center",
// 		width: "70%",
// 	},
// });

// export default FullResult;
import tw from "twrnc"; // Import utility-first styles
import * as FileSystem from "expo-file-system";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";

const saveToCSV = async (
  data: Array<{ description: string; value: string | number }>
) => {
  const now = new Date();

  // Format date with desired pattern
  const formattedDateTime = now
    .toLocaleString("en-GB", {
      second: "2-digit",
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Bangkok",
      hour12: false,
    })
    .replace(/,/g, "");

  // Format filename
  const filename = `training_result_${formattedDateTime.replace(
    /[/:]/g,
    "-"
  )}.csv`;

  // Add formatted date header
  const dataWithHeader = [
    { description: `Date: ${formattedDateTime}`, value: "" },
    { description: "", value: "" }, // Empty line for spacing
    ...data,
  ];

  try {
    let csvContent = dataWithHeader
      .map((row) => `${row.description},${row.value}`)
      .join("\n");

    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    } else {
      let directoryUri = "";

      if (Platform.OS === "android") {
        // Request directory permissions on Android
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
        Alert.alert("Directory Selected", `Saving file to:\n${directoryUri}`);
      } else {
        // Use default document directory for other platforms
        directoryUri = FileSystem.documentDirectory!;
      }

      // Define the file name
      const fileName = `training_details_${Date.now()}.csv`;
      let fileUri = "";

      if (Platform.OS === "android") {
        // Use StorageAccessFramework to save the file on Android
        fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          fileName,
          "text/csv"
        );

        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          fileUri,
          csvContent,
          {
            encoding: FileSystem.EncodingType.UTF8,
          }
        );
      } else {
        // Write file to standard directory on other platforms
        fileUri = `${directoryUri}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      // Notify the user
      Alert.alert("File Saved", `File successfully saved to:\n${fileUri}`);
    }
  } catch (error) {
    Alert.alert("Error", "Failed to export data");
    console.error(error);
  }
};

const FullResult = ({
  isHitMode,
  isTimeMode,
  isHitModeDur,
  isTimeModeDur,
  onClose,
  lightOut,
  timeout,
  hitCount,
  delayTime,
  duration,
  minDuration,
  secDuration,
  hitDuration,
  playTime,
  userHitCount,
  averageReactionTime,
  reaction_time,
}: {
  isHitMode: boolean;
  isTimeMode: boolean;
  isHitModeDur: boolean;
  isTimeModeDur: boolean;
  onClose: () => void;
  lightOut: string;
  timeout: number;
  hitCount: number;
  delayTime: number;
  duration: string;
  minDuration: number;
  secDuration: number;
  hitDuration: number;
  playTime: number;
  userHitCount: number;
  averageReactionTime: number;
  reaction_time: number[];
}) => {
  // Helper to handle CSV export
  function calculateAverageReactionTime(times: number[]): number {
    if (times.length > 0) {
      const sum = times.reduce((acc, val) => acc + val, 0);
      const average = sum / times.length;
      return average; // Convert to seconds
    }
  }
  const handleExport = () => {
    const data = [
      { description: "Lights Out - Mode", value: lightOut },
      ...(isTimeMode
        ? [{ description: "Time Out", value: `${timeout} seconds` }]
        : []),
      ...(isHitMode
        ? [{ description: "Hit Count", value: `${hitCount.toFixed(2)} times` }]
        : []),
      {
        description: "Light Delay Time",
        value: `${delayTime.toFixed(2)} seconds`,
      },
      { description: "Duration - Mode", value: duration },
      ...(isTimeModeDur
        ? [
            {
              description: "Duration - Time Out",
              value: `${minDuration * 60 + secDuration} seconds`,
            },
          ]
        : []),
      ...(isHitModeDur
        ? [
            {
              description: "Hit Duration",
              value: `${hitDuration.toFixed(2)} times`,
            },
          ]
        : []),
      {
        description: "Total Time",
        value: `${(playTime / 1000).toFixed(2)} seconds`,
      },
      //   {
      //     description: "(Avg) Reaction Time",
      //     value: `${averageReactionTime.toFixed(2)} seconds`,
      //   },
      {
        description: "Average Reaction Time",
        value:
          reaction_time && reaction_time.length > 0
            ? `${calculateAverageReactionTime(reaction_time).toFixed(
                2
              )} seconds`
            : "- seconds",
      },
      {
        description: "Reaction Time",
        value:
          reaction_time && reaction_time.length > 0
            ? `${reaction_time} seconds`
            : "- seconds",
      },

      { description: "User Hit Count", value: `${userHitCount} times` },
      ...(isHitMode && hitDuration > 0
        ? [
            {
              description: "Hit Percentage",
              value: `${Math.min(
                (userHitCount / hitDuration) * 100,
                100
              ).toFixed(2)} %`,
            },
          ]
        : []),
    ];

    saveToCSV(data);
  };

  return (
    <Modal animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.detailBox}>
          <Text style={styles.sectionTitle}>Training Detail</Text>
          <Text style={styles.separator}>---------------</Text>

          <View style={styles.col}>
            <Text style={styles.label}>Lights Out</Text>
            <View style={styles.row}>
              <Text style={styles.label}>• Mode </Text>
              <Text style={styles.output}>{lightOut}</Text>
            </View>
            {isTimeMode && (
              <View style={styles.row}>
                <Text style={styles.label}>• Time out </Text>
                <Text style={styles.output}>{timeout}</Text>
              </View>
            )}
            {isHitMode && (
              <View style={styles.row}>
                <Text style={styles.label}>• Hit count</Text>
                <Text style={styles.output}>{hitCount + " times"}</Text>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Light Delay Time</Text>
            <Text style={styles.output}>
              {delayTime.toFixed(2) + " seconds"}
            </Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.row}>
              <Text style={styles.label}>• Mode</Text>
              <Text style={styles.output}>{duration}</Text>
            </View>
            {isTimeModeDur && (
              <View style={styles.row}>
                <Text style={styles.label}>• Time out</Text>
                <Text style={styles.output}>
                  {minDuration * 60 + secDuration + " seconds"}
                </Text>
              </View>
            )}
            {isHitModeDur && (
              <View style={styles.row}>
                <Text style={styles.label}>• Hit count</Text>
                <Text style={styles.output}>
                  {hitDuration.toFixed(2) + " times"}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Measurement</Text>
          <Text style={styles.separator}>---------------</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total time</Text>
            <Text style={styles.output}>
              {(playTime / 1000).toFixed(2) + " seconds"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>(Avg) Reaction Time</Text>
            <Text style={styles.output}>
              {reaction_time.length > 0
                ? calculateAverageReactionTime(reaction_time).toFixed(2) +
                  " seconds"
                : "-" + " seconds"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Hit Count</Text>
            <Text style={styles.output}>{userHitCount + " times"}</Text>
          </View>
          {isHitMode && (
            <View style={styles.row}>
              <Text style={styles.label}>• Hit Percentage</Text>
              <Text style={styles.output}>
                {hitDuration > 0
                  ? Math.min((userHitCount / hitDuration) * 100, 100).toFixed(
                      2
                    ) + " %"
                  : "-"}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleExport}>
            <Text style={styles.buttonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e1f4f3" }, // Container style with background color
  header: {
    textAlign: "center", // Center align the text
    fontSize: 24, // Font size
    fontWeight: "bold", // Bold font weight
    marginVertical: 20, // Vertical margin
  },
  iconContainer: { position: "absolute", alignItems: "center" }, // Absolute positioning for icons
  playButton: {
    backgroundColor: "#2f95dc", // Button background color
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    borderRadius: 10, // Rounded corners
    alignSelf: "center", // Center the button horizontally
    marginTop: 20, // Top margin
  },
  result_container: {
    flex: 1,
    backgroundColor: "#E6F7F4",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    alignItems: "center",
    justifyContent: "center",
  },
  detailBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 8,
  },
  separator: {
    fontSize: 12,
    color: "#000000",
    marginBottom: 12,
  },
  col: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: "#000000",
  },
  output: {
    fontSize: 14,
    color: "#2E7D32",
  },
  buttonText: {
    color: "white", // Text color
    fontWeight: "bold", // Bold font weight
    fontSize: 16, // Font size
  },
  buttonText2: {
    color: "red", // Text color
    // marginTop: ,
    fontWeight: "bold", // Bold font weight
    fontSize: 16, // Font size
  },
  hitCountContainer: {
    marginTop: 30, // Top margin
    alignItems: "center", // Center align the hit count
  },
  hitCountText: {
    fontSize: 20, // Font size for hit count
    fontWeight: "bold", // Bold font weight
    color: "#333", // Text color
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4A4A4A",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
    width: "70%",
  },
});

export default FullResult;