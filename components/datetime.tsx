import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { format } from "date-fns";

const DateTimeDisplay = () => {
	const [currentDateTime, setCurrentDateTime] = useState("");

	useEffect(() => {
		// Format the initial date
		updateDateTime();

		// Update the time every second
		const timer = setInterval(() => {
			updateDateTime();
		}, 1000);

		// Cleanup the interval on component unmount
		return () => clearInterval(timer);
	}, []);

	const updateDateTime = () => {
		const now = new Date();
		const formattedDateTime = format(now, "dd-MM-yyyy - HH:mm:ss");
		setCurrentDateTime(formattedDateTime);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.timeText}>{currentDateTime}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	dateText: {
		fontSize: 20,
		color: "#666",
		marginBottom: 8,
	},
	timeText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
});

export default DateTimeDisplay;
