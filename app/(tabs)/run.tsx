import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import PatternScreen from "./running/pattern";

const { width } = Dimensions.get("window");

const RunScreen = () => {
	return <PatternScreen />;
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
		width: width * 0.8, // Fixed width for consistent layout
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
		backgroundColor: "#2f855a",
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#fff",
		marginLeft: 10,
	},
});

export default RunScreen;
