import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
} from "react-native";

const Result = (props: any) => {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.detailBox}>
				<Text style={styles.sectionTitle}>Training Detail</Text>
				<Text style={styles.separator}>---------------</Text>

				<View style={styles.row}>
					<Text style={styles.label}>Lights Out</Text>
					<Text style={styles.output}>useroutput</Text>
				</View>

				<View style={styles.row}>
					<Text style={styles.label}>Light Delay time</Text>
					<Text style={styles.output}>useroutput</Text>
				</View>

				<View style={styles.row}>
					<Text style={styles.label}>Duration</Text>
					<Text style={styles.output}>useroutput</Text>
				</View>

				<Text style={styles.sectionTitle}>Measurement</Text>
				<Text style={styles.separator}>---------------</Text>

				<View style={styles.row}>
					<Text style={styles.label}>Hit count</Text>
					<Text style={styles.output}>useroutput</Text>
				</View>

				<View style={styles.row}>
					<Text style={styles.label}>Total time</Text>
					<Text style={styles.output}>useroutput</Text>
				</View>

				<View style={styles.row}>
					<Text style={styles.label}>Hit %</Text>
					<Text style={styles.output}>{props.userHitCount}</Text>
				</View>
			</View>

			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Train</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Finish</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#E6F7F4", // Light background color
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
	},
	detailBox: {
		backgroundColor: "white",
		padding: 16,
		borderRadius: 16,
		width: "90%",
		alignItems: "center",
		marginBottom: 20,
	},
	sectionTitle: {
		fontWeight: "bold",
		fontSize: 16,
		marginVertical: 4,
	},
	separator: {
		fontSize: 12,
		color: "#000000",
		marginBottom: 10,
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
		color: "#2E7D32", // Green text color
	},
	button: {
		backgroundColor: "#4A4A4A",
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 20,
		marginVertical: 5,
		alignItems: "center",
		width: "50%",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
});

export { Result };
