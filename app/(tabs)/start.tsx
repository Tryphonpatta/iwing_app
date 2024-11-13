import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	LayoutAnimation,
	UIManager,
	Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useIconPosition } from "./IconPositionContext";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useBleManager } from "./context/blecontext";
import { CHARACTERISTIC } from "@/enum/characteristic";

// Enable LayoutAnimation for Android
if (
	Platform.OS === "android" &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLOR_BLUE = "blue";
const COLOR_RED = "red";

const StartGame = () => {
	const { positions } = useIconPosition();
	const [activePadIndex, setActivePadIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const { connectedDevices, turnOn_light, turnOff_light, readCharacteristic } =
		useBleManager();

	// State for debug information
	const [debugInfo, setDebugInfo] = useState("");

	// State for toggling debug view visibility
	const [isDebugVisible, setIsDebugVisible] = useState(false);

	// Declare refs for intervals
	const intervalIdRef = useRef(null);
	const hitDetectionIntervalIdRef = useRef(null);
	const gameTimeoutRef = useRef(null);
	const gameTimerIntervalRef = useRef(null); // New ref for logging time every second
	const alternatingLightsIntervalIdRef = useRef(null);
	const alternatingLightsTimeoutRef = useRef(null);
	const debugIntervalRef = useRef(null); // Ref for debug interval

	// Receive settings from the training screen
	type StartScreenParams = {
		lightOut: string;
		hitCount: number;
		timeout: number;
		lightDelay: string;
		delaytime: number;
		duration: string;
		hitduration: number;
		minDuration: number;
		secDuration: number;
	};

	const route = useRoute<RouteProp<{ start: StartScreenParams }, "start">>();
	const {
		lightOut = "",
		hitCount = 0,
		timeout = 1,
		lightDelay = "",
		delaytime = 0,
		duration = "",
		hitduration = 0,
		minDuration = 0,
		secDuration = 0,
	} = route.params || {};

	// Clear all intervals and timeouts
	const clearAllIntervalsAndTimeouts = () => {
		if (intervalIdRef.current) {
			clearInterval(intervalIdRef.current);
			intervalIdRef.current = null;
		}
		if (hitDetectionIntervalIdRef.current) {
			clearInterval(hitDetectionIntervalIdRef.current);
			hitDetectionIntervalIdRef.current = null;
		}
		if (gameTimeoutRef.current) {
			clearTimeout(gameTimeoutRef.current);
			gameTimeoutRef.current = null;
		}
		if (gameTimerIntervalRef.current) {
			clearInterval(gameTimerIntervalRef.current);
			gameTimerIntervalRef.current = null;
		}
		if (alternatingLightsIntervalIdRef.current) {
			clearInterval(alternatingLightsIntervalIdRef.current);
			alternatingLightsIntervalIdRef.current = null;
		}
		if (alternatingLightsTimeoutRef.current) {
			clearTimeout(alternatingLightsTimeoutRef.current);
			alternatingLightsTimeoutRef.current = null;
		}
		if (debugIntervalRef.current) {
			clearInterval(debugIntervalRef.current);
			debugIntervalRef.current = null;
		}
	};

	const startAlternatingLights = (lightOutTimeout: number) => {
		try {
			let isRed = true;
			alternatingLightsIntervalIdRef.current = setInterval(() => {
				console.log(`Toggling lights to ${isRed ? "RED" : "BLUE"}`);
				connectedDevices.forEach(async (device) => {
					if (device) {
						try {
							const color = isRed ? COLOR_RED : COLOR_BLUE;
							await turnOn_light(device, 0, color);
						} catch (error) {
							console.error(
								`Error toggling light for device ${device.deviceId}:`,
								error
							);
						}
					}
				});
				isRed = !isRed;
			}, 1000);

			alternatingLightsTimeoutRef.current = setTimeout(() => {
				if (alternatingLightsIntervalIdRef.current) {
					clearInterval(alternatingLightsIntervalIdRef.current);
					alternatingLightsIntervalIdRef.current = null;
				}
				connectedDevices.forEach(async (device) => {
					if (device) {
						try {
							await turnOff_light(device);
						} catch (error) {
							console.error(
								`Error turning off light for device ${device.deviceId}:`,
								error
							);
						}
					}
				});
			}, lightOutTimeout); // ใช้พารามิเตอร์ lightOutTimeout
		} catch (error) {
			console.error("Error in startAlternatingLights:", error);
		}
	};

	const stopGame = () => {
		try {
			setIsPlaying(false);
			setActivePadIndex(-1);
			clearAllIntervalsAndTimeouts();

			// Turn off all lights
			connectedDevices.forEach(async (device) => {
				if (device) {
					try {
						await turnOff_light(device);
					} catch (error) {
						console.error(
							`Error turning off light for device ${device.deviceId}:`,
							error
						);
					}
				}
			});

			console.log("Game stopped");

			// Start alternating lights
			startAlternatingLights();
		} catch (error) {
			console.error("Error in stopGame:", error);
		}
	};

	const play = async (
		duration: number,
		interval: number,
		delay: number,
		initialHitCount: number
	) => {
		try {
			// Clear any existing intervals and timeouts
			clearAllIntervalsAndTimeouts();

			setIsPlaying(true);
			const totalPads = positions.length;
			let currentHitCount = initialHitCount;

			// Ensure interval and duration have valid values
			if (interval <= 0) {
				interval = 1000;
			}
			if (duration <= 0 && initialHitCount === 0) {
				// If both duration and hit count are zero, set a default duration
				duration = 60000; // Default to 1 minute
			}

			const activateRandomPad = async () => {
				try {
					const randomIndex = Math.floor(Math.random() * totalPads);
					setActivePadIndex(randomIndex);
					const device = connectedDevices[randomIndex];
					if (device) {
						const startTime = new Date().toLocaleTimeString();
						console.log(
							`Pad number ${randomIndex} is turned on at ${startTime}`
						);

						await turnOn_light(device, 0, COLOR_BLUE);
					}
				} catch (error) {
					console.error("Error in activateRandomPad:", error);
				}
			};

			const detectHits = () => {
				try {
					hitDetectionIntervalIdRef.current = setInterval(async () => {
						if (connectedDevices.length === 0) return;

						for (let i = 0; i < connectedDevices.length; i++) {
							const device = connectedDevices[i];
							if (!device) continue;
							try {
								const press = await readCharacteristic(
									device.deviceId,
									CHARACTERISTIC.IWING_TRAINERPAD,
									CHARACTERISTIC.BUTTONS
								);

								if (press === 0) {
									console.log(`Button pressed on device ${i}`);
									await turnOff_light(device);
									setTimeout(() => {
										turnOn_light(device, 0, COLOR_RED);
									}, 1000);

									if (initialHitCount > 0) {
										currentHitCount--;
										console.log(`Hit count decreased to ${currentHitCount}`);
										if (currentHitCount <= 0) {
											console.log("Hit count reached zero. Stopping game.");
											stopGame();
											return;
										}
									}

									console.log("---- Hit Debug ----");
									console.log(`Device ID: ${device.deviceId}`);
									console.log(`Time: ${new Date().toLocaleTimeString()}`);
									console.log(`Hit Count: ${currentHitCount}`);
									console.log("-------------------");
								}
							} catch (error) {
								console.error("Error reading characteristic:", error);
							}
						}
					}, 500);
				} catch (error) {
					console.error("Error in detectHits:", error);
				}
			};

			detectHits();
			await activateRandomPad();

			// Schedule additional pad activations
			intervalIdRef.current = setInterval(() => {
				activateRandomPad();
			}, interval + delay);

			// Manage game duration
			if (duration > 0) {
				let remainingTime = duration / 1000; // Convert milliseconds to seconds
				console.log(`Game will stop after ${remainingTime} seconds.`);

				// Log time every second
				gameTimerIntervalRef.current = setInterval(() => {
					remainingTime--;
					console.log(`Time remaining: ${remainingTime} seconds`);
					if (remainingTime <= 0) {
						clearInterval(gameTimerIntervalRef.current);
					}
				}, 1000);

				gameTimeoutRef.current = setTimeout(() => {
					console.log("Time is up. Stopping game.");
					stopGame();
				}, duration);
			}
		} catch (error) {
			console.error("Error in play function:", error);
		}
	};

	useEffect(() => {
		// Debug interval to update debugInfo state every second
		debugIntervalRef.current = setInterval(() => {
			const debugData = `
--- Debug Information ---
Time: ${new Date().toLocaleTimeString()}
Is Playing: ${isPlaying}
Active Pad Index: ${activePadIndex}
Hit Count: ${hitCount}
Timeout: ${timeout} seconds
Delay Time: ${delaytime} seconds
Duration: ${minDuration} minutes ${secDuration} seconds
Connected Devices Count: ${connectedDevices.length}
Connected Devices IDs: ${connectedDevices.map((d) => d.deviceId).join(", ")}
-------------------------
`;
			setDebugInfo(debugData);
		}, 1000); // Every second

		return () => {
			if (debugIntervalRef.current) {
				clearInterval(debugIntervalRef.current);
			}
		};
	}, [
		isPlaying,
		activePadIndex,
		hitCount,
		timeout,
		delaytime,
		minDuration,
		secDuration,
		connectedDevices,
	]);

	// Clear intervals when component is unmounted
	useEffect(() => {
		return () => {
			clearAllIntervalsAndTimeouts();
		};
	}, []);

	// Toggle debug view with animation
	const toggleDebugView = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsDebugVisible(!isDebugVisible);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.header}>Start Game</Text>
			<View>
				{positions.map((position, index) => (
					<View
						key={index}
						style={[
							styles.iconContainer,
							{ left: position.x, top: position.y },
						]}
					>
						<MaterialIcons
							name="wb-twilight"
							size={60}
							color={activePadIndex === index ? "blue" : "black"}
						/>
						<Text>Trainer Pad: {index}</Text>
					</View>
				))}
			</View>
			<TouchableOpacity
				style={styles.playButton}
				onPress={() =>
					play(
						(minDuration * 60 + secDuration) * 1000,
						timeout * 1000,
						delaytime * 1000,
						hitCount
					)
				}
				disabled={isPlaying}
			>
				<Text style={styles.buttonText}>
					{isPlaying ? "Playing..." : "Start Game"}
				</Text>
			</TouchableOpacity>

			{/* Button to toggle debug view */}
			<TouchableOpacity
				style={styles.debugToggleButton}
				onPress={toggleDebugView}
			>
				<Text style={styles.buttonText}>
					{isDebugVisible ? "Hide Debug" : "Show Debug"}
				</Text>
			</TouchableOpacity>

			{/* Debug Information View */}
			{isDebugVisible && (
				<View style={styles.debugContainer}>
					<ScrollView>
						<Text style={styles.debugText}>{debugInfo}</Text>
					</ScrollView>
				</View>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#e1f4f3", padding: 10 },
	header: {
		textAlign: "center",
		fontSize: 24,
		fontWeight: "bold",
		marginVertical: 20,
	},
	iconContainer: { position: "absolute", alignItems: "center" },
	playButton: {
		backgroundColor: "#2f95dc",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 10,
		alignSelf: "center",
		marginTop: 20,
	},
	debugToggleButton: {
		backgroundColor: "#555",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
		alignSelf: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	debugContainer: {
		backgroundColor: "#000000cc",
		padding: 10,
		borderRadius: 10,
		marginTop: 20,
		maxHeight: "40%",
	},
	debugText: {
		color: "#00FF00",
		fontFamily: "monospace",
		fontSize: 12,
	},
});

export default StartGame;
