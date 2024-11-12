import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useIconPosition } from "./IconPositionContext";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useBleManager } from "./context/blecontext";
import { CHARACTERISTIC } from "@/enum/characteristic";

const COLOR_BLUE = "red";
const COLOR_RED = "blue";

const StartGame = () => {
	const { positions } = useIconPosition();
	const [activePadIndex, setActivePadIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const { connectedDevices, turnOn_light, turnOff_light, readCharacteristic } =
		useBleManager();

	// Declare refs for intervals
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
	const hitDetectionIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
	const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const alternatingLightsIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
	const alternatingLightsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

	// Move clearAllIntervalsAndTimeouts here
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
		if (alternatingLightsIntervalIdRef.current) {
			clearInterval(alternatingLightsIntervalIdRef.current);
			alternatingLightsIntervalIdRef.current = null;
		}
		if (alternatingLightsTimeoutRef.current) {
			clearTimeout(alternatingLightsTimeoutRef.current);
			alternatingLightsTimeoutRef.current = null;
		}
	};

	const startAlternatingLights = () => {
		try {
			let isRed = true;
			alternatingLightsIntervalIdRef.current = setInterval(() => {
				console.log(`Toggling lights to ${isRed ? "RED" : "BLUE"}`);
				connectedDevices.forEach(async (device) => {
					if (device) {
						try {
							// Toggle lights between red and blue
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
			}, 10000); // 10 seconds
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

			// Check interval and duration values
			if (interval <= 0) {
				interval = 1000;
			}
			if (duration <= 0) {
				duration = 60000;
			}

			const activateRandomPad = () => {
				try {
					setActivePadIndex(-1);
					const randomIndex = Math.floor(Math.random() * totalPads);
					setActivePadIndex(randomIndex);
					return randomIndex;
				} catch (error) {
					console.error("Error in activateRandomPad:", error);
					return -1;
				}
			};

			const handlePad = async () => {
				try {
					const padIndex = activateRandomPad();
					const device = connectedDevices[padIndex];
					if (device) {
						const startTime = new Date().toLocaleTimeString();
						console.log(`Pad number ${padIndex} is turned on at ${startTime}`);

						await turnOn_light(device, 0, COLOR_BLUE); // Use the color constant

						if (hitCount === 0) {
							stopGame();
						}
					}
				} catch (error) {
					console.error("Error in handlePad:", error);
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
									turnOff_light(device);
									setTimeout(() => {
										turnOn_light(device, 0, COLOR_RED); // Use the color constant
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
			await handlePad();

			// Schedule additional pad activations
			intervalIdRef.current = setInterval(() => {
				handlePad();
			}, interval + delay);

			// Manage game duration
			if (initialHitCount === 0 && duration > 0) {
				// 'timelight' mode
				gameTimeoutRef.current = setTimeout(() => {
					console.log("Time is up. Stopping game.");
					stopGame();
				}, duration);
			} else if (initialHitCount > 0 && duration === 0) {
				// 'hit' mode
				// Game stops when hit count reaches zero
			} else if (initialHitCount > 0 && duration > 0) {
				// 'hit or timelight' mode
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
		const intervalId = setInterval(async () => {
			console.log("---- Debug Information ----");
			console.log("Current Hit Count:", hitCount);
			console.log("Is Playing:", isPlaying);
			console.log("Active Pad Index:", activePadIndex);
			console.log("Connected Devices:", connectedDevices.length);
			console.log("----------------------------");
		}, 5000);
		return () => {
			clearInterval(intervalId);
		};
	}, [hitCount, isPlaying, activePadIndex, connectedDevices]);

	// Clear intervals when component is unmounted
	useEffect(() => {
		return () => {
			clearAllIntervalsAndTimeouts();
		};
	}, []);

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
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#e1f4f3" },
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
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
});

export default StartGame;
