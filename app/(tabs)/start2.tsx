import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Circle } from "react-native-svg";
import ShowPad from "@/app/running";
import { TouchableOpacity } from "react-native";

export default function ResultScreen() {
	const [total_hits, setTotalHits] = useState(0);
	const [total_misses, setTotalMisses] = useState(0);
	const [total_combo, setTotalCombo] = useState(0);
	const [selected_mode, setSelectedMode] = useState("Hit");
	const [connected_devices, setConnectedDevices] = useState(0);
	const [duration, setDuration] = useState("0:00");
	const [activePadIndex, setActivePadIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);

	const calculate_percentage = () => {
		const total_attempts = total_hits + total_misses;
		return total_attempts > 0
			? Math.round((total_hits / total_attempts) * 100)
			: 0;
	};

	const format_duration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remaining_seconds = seconds % 60;
		return `${minutes.toString().padStart(1, "0")}:${remaining_seconds
			.toString()
			.padStart(2, "0")}`;
	};

	// zone set value

	const START = () => {
		setIsPlaying(true);
	};

	const STOP = () => {
		setIsPlaying(false);
	};

	const togglePlay = () => {
		if (isPlaying) {
			STOP();
		} else {
			START();
		}
	};
	return (
		<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
			<View style={styles.container}>
				<Text style={styles.header}>Training</Text>

				<View style={styles.resultBlock}>
					<Text style={styles.resultHeader}>Countdown</Text>
					<View style={styles.circularProgressContainer}>
						<AnimatedCircularProgress
							size={180}
							width={5}
							fill={70} // value
							tintColor="#00e0ff"
							backgroundColor="#3d5875"
							padding={10}
							arcSweepAngle={180}
							rotation={-90}
							renderCap={({ center }) => (
								<Circle cx={center.x} cy={center.y} r="10" fill="blue" />
							)}
						>
							{(fill: number) => (
								<View style={styles.circularContent}>
									<Text style={styles.percentageText}>1:23</Text>
								</View>
							)}
						</AnimatedCircularProgress>
					</View>
					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.resultText}>{total_hits}</Text>
							<Text style={styles.labelText}>Hit</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.resultText}>{total_misses}</Text>
							<Text style={styles.labelText}>Miss</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.resultText}>{total_combo}</Text>
							<Text style={styles.labelText}>Combo</Text>
						</View>
					</View>
					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.resultText}>Speed</Text>
							<Text style={styles.labelText}>Mode</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.resultText}>{connected_devices}</Text>
							<Text style={styles.labelText}>Devices</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.resultText}>{duration}</Text>
							<Text style={styles.labelText}>Duration</Text>
						</View>
					</View>
				</View>
				<View style={styles.padContainer}>
					<ShowPad activePadIndex={activePadIndex} isPlaying={isPlaying} />
				</View>
				<TouchableOpacity
					style={[
						styles.buttonContainer,
						isPlaying ? styles.activeButton : styles.inactiveButton,
					]}
					onPress={togglePlay}
				>
					<Text style={styles.buttonText}>{isPlaying ? "Stop" : "Start"}</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
		backgroundColor: "#eaf7ff",
	},
	container: {
		flex: 1,
		paddingHorizontal: 25,
		paddingTop: 35,
	},
	header: {
		textAlign: "center",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	circularTitle: {
		fontSize: 16,
		fontWeight: "bold",
	},
	backgroundCARD: {
		backgroundColor: "#ffffff",
		padding: 20,
		marginBottom: 20,
		shadowRadius: 10,
		width: "100%",
	},
	resultDetails: {
		width: "100%",
	},
	resultText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#000",
		marginBottom: 2,
	},
	labelText: {
		fontSize: 14,
		color: "#555",
	},
	detailBlock: {
		backgroundColor: "#ffffff",
		borderRadius: 10,
		padding: 20,
		width: "100%",
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 5 },
		shadowRadius: 10,
		elevation: 5,
	},
	detailHeader: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 10,
	},
	detailContent: {
		backgroundColor: "#f9f9f9",
		padding: 10,
		borderRadius: 5,
		width: "100%",
		alignItems: "center",
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
		width: "100%",
	},
	col: {
		flex: 1,
		alignItems: "center",
		paddingHorizontal: 10,
	},
	clickableBox: {
		width: "100%",
		height: 266,
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		marginBottom: 10,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	detailText: {
		fontSize: 14,
		color: "#555",
		textAlign: "center",
	},
	circularContent: {
		alignItems: "center",
		justifyContent: "center",
	},
	percentageText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	accuracyText: {
		fontSize: 14,
		color: "#333",
	},
	circularProgressContainer: {
		alignItems: "center",
		marginVertical: 0,
		marginBottom: "-25%",
	},

	resultBlock: {
		backgroundColor: "#ffffff",
		borderRadius: 10,
		padding: 20,
		paddingBottom: 10,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 5 },
		shadowRadius: 10,
		elevation: 5,
		width: "100%",
	},

	infoContainer: {
		marginTop: 0,
	},

	resultHeader: {
		justifyContent: "center",
		textAlign: "center",
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 5,
		color: "#333",
	},
	padContainer: {
		flex: 1,
		backgroundColor: "#ffffff",
		borderRadius: 8,
		padding: 20,
		marginTop: 0,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 5 },
		shadowRadius: 10,
		elevation: 5,
		width: "100%",
		minHeight: 300,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 20,
		paddingHorizontal: 20,
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		marginBottom: 20,
		borderWidth: 3,
		borderColor: "#000000",
	},

	button: {
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 25,
		minWidth: 120,
		alignItems: "center",
	},

	activeButton: {
		backgroundColor: "#FFFFFF",
		opacity: 1,
	},

	inactiveButton: {
		backgroundColor: "#FFFFFF",
		opacity: 1,
	},

	buttonText: {
		color: "#000000",
		fontSize: 16,
		fontWeight: "bold",
	},
});
