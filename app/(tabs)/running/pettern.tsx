import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import RunScreen from "../run";
import ResultScreen from "./result";

const PatternScreen = () => {
	const [R1, setR1] = useState("");
	const [R2, setR2] = useState("");
	const [L1, setL1] = useState("");
	const [L2, setL2] = useState("");
	const [isStarted, setIsStarted] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [showRunScreen, setShowRunScreen] = useState(false);

	const handleStartStop = () => {
		if (!isStarted) {
			console.log(`R1: ${R1}, R2: ${R2}, L1: ${L1}, L2: ${L2}`);
		}
		setIsStarted(!isStarted);
	};

	const handleStopAndShowResult = () => {
		setShowResult(true);
	};

	if (showRunScreen) {
		return <RunScreen />;
	}

	if (showResult) {
		return <ResultScreen />;
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.exitButton}
				onPress={() => setShowRunScreen(true)}
			>
				<Text style={styles.exitButtonText}>Exit</Text>
			</TouchableOpacity>

			<Text style={styles.title}>Pattern Mode</Text>

			<TextInput
				style={styles.input}
				value={R1}
				onChangeText={(text) => setR1(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
				keyboardType="numeric"
				placeholder="R1"
			/>

			<TextInput
				style={styles.input}
				value={R2}
				onChangeText={(text) => setR2(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
				keyboardType="numeric"
				placeholder="R2"
			/>

			<TextInput
				style={styles.input}
				value={L1}
				onChangeText={(text) => setL1(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
				keyboardType="numeric"
				placeholder="L1"
			/>

			<TextInput
				style={styles.input}
				value={L2}
				onChangeText={(text) => setL2(text.replace(/[^0-9]/g, ""))} // กรอกได้เฉพาะตัวเลข
				keyboardType="numeric"
				placeholder="L2"
			/>

			<TouchableOpacity
				style={[styles.startButton, isStarted ? styles.stopButton : null]}
				onPress={isStarted ? handleStopAndShowResult : handleStartStop}
			>
				<Text style={styles.startButtonText}>
					{isStarted ? "Stop" : "Start"}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f0f5f0",
		padding: 20,
	},
	exitButton: {
		position: "absolute",
		top: 40,
		left: 20,
		backgroundColor: "#333",
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 20,
	},
	exitButtonText: {
		fontSize: 16,
		color: "#fff",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	input: {
		width: "80%",
		height: 50,
		backgroundColor: "#e0e0e0",
		marginBottom: 20,
		borderRadius: 10,
		paddingHorizontal: 10,
		fontSize: 18,
	},
	startButton: {
		backgroundColor: "#2f855a",
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 25,
	},
	stopButton: {
		backgroundColor: "#e53e3e",
	},
	startButtonText: {
		fontSize: 18,
		color: "#fff",
		fontWeight: "bold",
	},
});

export default PatternScreen;
