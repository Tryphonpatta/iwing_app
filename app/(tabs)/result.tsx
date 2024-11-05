import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";

import tw from "twrnc";

const Result = ({ onClose }) => {
	const handleExit = () => {
		const resultData = {
			hitCount: 100,
			accuracy: "85%",
			reactionTime: "0.5 seconds",
			delay: "1 second",
		};
		onClose(resultData);
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			{/* <Text style={styles.headerText}>Training Results</Text> */}
			<Text
				style={[
					tw`text-center font-bold text-white my-4 mt-3 shadow-lg`,
					{ backgroundColor: "#419E68", fontSize: 36 },
				]}
			>
				Training Results
			</Text>

			<View style={styles.container}>
				<View style={styles.detailBox}>
					<Text style={styles.titleText}>Training Detail</Text>
					<View style={styles.line} />

					<View style={styles.detailSection}>
						<Text style={styles.sectionTitle}>Configuration</Text>
						<Text style={styles.detailText}>• Light-out Mode: Timeout</Text>
						<Text style={styles.detailText}>• Light Delay: Random</Text>
						<Text style={styles.detailText}>• Duration Mode: Hit</Text>
					</View>

					<View style={styles.detailSection}>
						<Text style={styles.sectionTitle}>Performance</Text>
						<Text style={styles.detailText}>• Hit Count: 20 times</Text>
						<Text style={styles.detailText}>• Accuracy: 85%</Text>
						<Text style={styles.detailText}>• Reaction Time: 0.5 seconds</Text>
					</View>

					<View style={styles.detailSection}>
						<Text style={styles.sectionTitle}>Additional Metrics</Text>
						<Text style={styles.detailText}>• Delay: 1 second</Text>
					</View>
				</View>

				<TouchableOpacity style={styles.exitButton} onPress={handleExit}>
					<Text style={styles.exitButtonText}>Exit</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#e1f4f3",
		paddingVertical: 20,
	},
	container: {
		flex: 1,
		backgroundColor: "#e1f4f3",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	header: {
		backgroundColor: "#4CAF50",
		paddingVertical: 20,
		alignItems: "center",
		borderRadius: 15,
		marginBottom: 20,
		marginHorizontal: 20,
	},
	headerText: {
		fontSize: 28,
		color: "white",
		fontWeight: "bold",
	},
	detailBox: {
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderRadius: 15,
		borderColor: "#000000",
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 6,
	},
	titleText: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#000000",
		textAlign: "center",
		marginBottom: 10,
	},
	line: {
		height: 2,
		backgroundColor: "#000000",
		marginVertical: 15,
	},
	detailSection: {
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 5,
	},
	detailText: {
		fontSize: 16,
		color: "#333333",
		marginBottom: 5,
	},
	exitButton: {
		marginTop: 30,
		backgroundColor: "#C62828",
		paddingVertical: 12,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 50,
	},
	exitButtonText: {
		color: "white",
		fontSize: 20,
		fontWeight: "bold",
	},
});

export default Result;
