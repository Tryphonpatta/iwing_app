// เหลือเรื่องของ icon นะครับ

import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	Dimensions,
} from "react-native";
import ManualScreen from "./running/manual";
import PatternScreen from "./running/pettern";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const RunScreen = () => {
	const [selectedMode, setSelectedMode] = useState<string | null>(null);

	if (selectedMode === "manual") {
		return <ManualScreen />;
	}

	if (selectedMode === "pattern") {
		return <PatternScreen />;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Choose Your Mode</Text>

			<View style={styles.imageContainer}>
				<Image
					source={{ uri: "https://yourimageurl.com/modern-image.jpg" }}
					style={styles.backgroundImage}
				/>
			</View>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={[
						styles.modeButton,
						selectedMode === "pattern" ? styles.selected : styles.unselected,
					]}
					onPress={() => setSelectedMode("pattern")}
				>
					<Ionicons name="md-grid" size={24} color="#fff" />
					<Text style={styles.buttonText}>Pattern Mode</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.modeButton,
						selectedMode === "manual" ? styles.selected : styles.unselected,
					]}
					onPress={() => setSelectedMode("manual")}
				>
					<Ionicons name="md-hand-left" size={24} color="#fff" />
					<Text style={styles.buttonText}>Manual Mode</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		padding: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#333",
		textAlign: "center",
	},
	imageContainer: {
		marginBottom: 30,
		width: width * 0.8,
		height: width * 0.5,
		borderRadius: 20,
		overflow: "hidden",
	},
	backgroundImage: {
		width: "100%",
		height: "100%",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginBottom: 40,
	},
	modeButton: {
		flex: 1,
		marginHorizontal: 10,
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#2a9d8f",
		flexDirection: "row",
	},
	selected: {
		backgroundColor: "#264653",
	},
	unselected: {
		backgroundColor: "#e76f51",
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#fff",
		marginLeft: 10,
	},
});

export default RunScreen;
