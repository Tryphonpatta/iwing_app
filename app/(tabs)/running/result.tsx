import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from "react-native";
import RunScreen from "../run";

const { width } = Dimensions.get("window");

const ResultScreen = () => {
	const [showRunScreen, setShowRunScreen] = useState(false);

	const [resultData, setResultData] = useState({
		time: "Loading...",
		averagePace: "Loading...",
		averageSpeed: "Loading...",
		bestPace: "Loading...",
		movingTime: "Loading...",
		idleTime: "Loading...",
	});

	useEffect(() => {
		// const fetchData = async () => {
		//   const querySnapshot = await getDocs(collection(db, "results"));
		//   const data = querySnapshot.docs.map(doc => doc.data());
		//   if (data.length > 0) {
		//     const result = data[0];
		//     setResultData({
		//       time: result.time,
		//       averagePace: result.averagePace,
		//       averageSpeed: result.averageSpeed,
		//       bestPace: result.bestPace,
		//       movingTime: result.movingTime,
		//       idleTime: result.idleTime,
		//     });
		//   }
		// };
		// fetchData();
	}, []);

	if (showRunScreen) {
		return <RunScreen />;
	}

	const handleDonePress = () => {
		setShowRunScreen(true);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Result</Text>

			<View style={styles.resultContainer}>
				<View style={styles.row}>
					<Text style={styles.label}>Time:</Text>
					<Text style={styles.value}>{resultData.time}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>Average pace:</Text>
					<Text style={styles.value}>{resultData.averagePace}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>Average speed:</Text>
					<Text style={styles.value}>{resultData.averageSpeed}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>Best pace:</Text>
					<Text style={styles.value}>{resultData.bestPace}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>Moving time:</Text>
					<Text style={styles.value}>{resultData.movingTime}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>Idle time:</Text>
					<Text style={styles.value}>{resultData.idleTime}</Text>
				</View>
			</View>

			<TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
				<Text style={styles.doneButtonText}>Finish</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f5f0",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 36,
		fontWeight: "bold",
		marginBottom: 30,
		color: "#000",
	},
	resultContainer: {
		alignItems: "flex-start",
		width: "100%",
		paddingHorizontal: 20,
		marginBottom: 40,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginVertical: 8,
	},
	label: {
		fontSize: 20,
		fontWeight: "600",
		color: "#333",
		flex: 1,
	},
	value: {
		fontSize: 20,
		color: "#333",
		textAlign: "right",
		flex: 1,
	},
	doneButton: {
		backgroundColor: "#2f855a",
		paddingVertical: 15,
		width: width * 0.6,
		borderRadius: 30,
		alignItems: "center",
	},
	doneButtonText: {
		fontSize: 20,
		color: "#fff",
		fontWeight: "bold",
	},
});

export default ResultScreen;
