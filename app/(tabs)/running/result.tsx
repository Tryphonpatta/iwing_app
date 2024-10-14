import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	ActivityIndicator,
} from "react-native";
import RunScreen from "../run";

const { width } = Dimensions.get("window");

const ResultScreen = () => {
	const [showRunScreen, setShowRunScreen] = useState(false);
	const [loading, setLoading] = useState(true);

	const [resultData, setResultData] = useState({
		time: "Loading...",
		averagePace: "Loading...",
		averageSpeed: "Loading...",
		bestPace: "Loading...",
		movingTime: "Loading...",
		idleTime: "Loading...",
	});

	useEffect(() => {
		// API call for fetching result data (mockup for now)
		// fetchData();
		setTimeout(() => {
			// Fake data for now (replace with API data)
			setResultData({
				time: "45:30",
				averagePace: "5:30 / km",
				averageSpeed: "10.8 km/h",
				bestPace: "4:50 / km",
				movingTime: "40:00",
				idleTime: "5:30",
			});
			setLoading(false);
		}, 500);

		// Uncomment this block to make an actual API call
		// const fetchData = async () => {
		//   try {
		//     const response = await fetch("https://api.yourdatabase.com/results"); // Replace with your API URL
		//     const data = await response.json();
		//     setResultData({
		//       time: data.time,
		//       averagePace: data.averagePace,
		//       averageSpeed: data.averageSpeed,
		//       bestPace: data.bestPace,
		//       movingTime: data.movingTime,
		//       idleTime: data.idleTime,
		//     });
		//     setLoading(false);
		//   } catch (error) {
		//     console.error("Error fetching result data:", error);
		//     setLoading(false);
		//   }
		// };
	}, []);

	if (showRunScreen) {
		return <RunScreen />;
	}

	const handleDonePress = () => {
		// Code to save result data to the database
		// saveToDatabase(resultData);
		setShowRunScreen(true);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Result</Text>

			{loading ? (
				<ActivityIndicator size="large" color="#2f855a" />
			) : (
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
			)}

			<TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
				<Text style={styles.doneButtonText}>Finish</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 36,
		fontWeight: "bold",
		marginBottom: 30,
		color: "#2f855a",
	},
	resultContainer: {
		alignItems: "flex-start",
		width: "100%",
		paddingHorizontal: 20,
		marginBottom: 40,
		backgroundColor: "#ffffff",
		borderRadius: 20,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginVertical: 10,
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
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 5,
	},
	doneButtonText: {
		fontSize: 20,
		color: "#fff",
		fontWeight: "bold",
	},
});

export default ResultScreen;
