import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Modal,
} from "react-native";

import { useRouter } from "expo-router";

const FullResult = (props: any, { navigation }: { navigation: any }) => {
	const router = useRouter();
	return (
		<SafeAreaView style={styles.container}>
			<Modal
				animationType="slide"
				transparent={true}
				visible={!props.showResult}
			>
				<View style={styles.overlay}>
					<View style={styles.detailBox}>
						<Text style={styles.sectionTitle}>Training Detail</Text>
						<Text style={styles.separator}>---------------</Text>

						<View style={styles.row}>
							<Text style={styles.label}>Lights Out</Text>
							<Text style={styles.output}>{props.lightsOut || "N/A"}</Text>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Light Delay Time</Text>
							<Text style={styles.output}>{props.lightDelayTime || "N/A"}</Text>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Duration</Text>
							<Text style={styles.output}>{props.duration || "N/A"}</Text>
						</View>

						<Text style={styles.sectionTitle}>Measurement</Text>
						<Text style={styles.separator}>---------------</Text>

						<View style={styles.row}>
							<Text style={styles.label}>Hit Count</Text>
							<Text style={styles.output}>{props.hitCount || "N/A"}</Text>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Total Time</Text>
							<Text style={styles.output}>{props.totalTime || "N/A"}</Text>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Hit %</Text>
							<Text style={styles.output}>{props.userHitCount ?? "N/A"}</Text>
						</View>

						<TouchableOpacity
							style={styles.button}
							onPress={() => router.back()} // กลับไปยังหน้า Start
							onPress={() => {}}
						>
							<Text style={styles.buttonText}>Go Back to Start</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
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
	button: {
		backgroundColor: "#4A4A4A",
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 20,
		marginTop: 10,
		alignItems: "center",
		width: "70%",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
});

export { FullResult };
