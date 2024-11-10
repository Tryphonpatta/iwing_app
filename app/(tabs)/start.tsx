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

const StartGame = () => {
	const { positions } = useIconPosition();
	const [activePadIndex, setActivePadIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const { connectedDevices, turnOn_light, turnOff_light, readCharacteristic } =
		useBleManager();

	// Declare refs for intervals
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
	const hitDetectionIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
	const alternatingLightsIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

	// Get the config mode from the training page
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

	const play = async (
		duration: number,
		interval: number,
		delay: number,
		initialHitCount: number
	) => {
		// Clear any existing intervals
		if (intervalIdRef.current) {
			clearInterval(intervalIdRef.current);
			intervalIdRef.current = null;
		}
		if (hitDetectionIntervalIdRef.current) {
			clearInterval(hitDetectionIntervalIdRef.current);
			hitDetectionIntervalIdRef.current = null;
		}
		if (alternatingLightsIntervalIdRef.current) {
			clearInterval(alternatingLightsIntervalIdRef.current);
			alternatingLightsIntervalIdRef.current = null;
		}

		setIsPlaying(true);
		const totalPads = positions.length;
		let currentHitCount = initialHitCount;

		// Ensure interval and duration are positive values
		if (interval <= 0) {
			interval = 1000;
		}
		if (duration <= 0) {
			duration = 60000;
		}

		const activateRandomPad = () => {
			setActivePadIndex(-1);
			const randomIndex = Math.floor(Math.random() * totalPads);
			setActivePadIndex(randomIndex);
			return randomIndex;
		};

		const handlePad = async () => {
			const padIndex = activateRandomPad();
			const device = connectedDevices[padIndex];
			if (device) {
				const startTime = new Date().toLocaleTimeString();
				console.log(`Pad number ${padIndex} is turned on at ${startTime}`);

				try {
					await turnOn_light(device, interval / 1000, "blue");
				} catch (error) {
					console.error("Error turning on light:", error);
				}

				// Turn off the light after the `interval`
				setTimeout(async () => {
					const offTime = new Date().toLocaleTimeString();
					console.log(`Pad number ${padIndex} is turned off at ${offTime}`);
					try {
						await turnOff_light(device);
					} catch (error) {
						console.error("Error turning off light:", error);
					}
				}, interval);
			} else {
				console.error(`No device found at index ${padIndex}`);
			}
		};

		const detectHits = () => {
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
							setTimeout(async () => {
								await turnOn_light(device, 0, "red");
							}, 1000);

							if (initialHitCount > 0) {
								currentHitCount--;
								console.log(`Hit count decreased to ${currentHitCount}`);
								if (currentHitCount <= 0) {
									stopGame();
								}
							}

							for (let k = 0; k < 100; k++) {
								console.log("success");
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
		};

		const stopGame = () => {
			setIsPlaying(false);
			setActivePadIndex(-1);
			if (intervalIdRef.current) {
				clearInterval(intervalIdRef.current);
				intervalIdRef.current = null;
			}
			if (hitDetectionIntervalIdRef.current) {
				clearInterval(hitDetectionIntervalIdRef.current);
				hitDetectionIntervalIdRef.current = null;
			}

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

			// Log "success" 100 times
			for (let k = 0; k < 100; k++) {
				console.log("success");
			}

			// Start alternating lights
			startAlternatingLights();
		};

		const startAlternatingLights = () => {
			let isRed = true;
			alternatingLightsIntervalIdRef.current = setInterval(() => {
				connectedDevices.forEach(async (device) => {
					if (device) {
						try {
							if (isRed) {
								await turnOn_light(device, 0, "red");
							} else {
								await turnOn_light(device, 0, "blue");
							}
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
		};

		detectHits();
		await handlePad();

		intervalIdRef.current = setInterval(() => {
			handlePad();
		}, interval + delay);

		if (initialHitCount === 0) {
			setTimeout(() => {
				stopGame();
			}, duration);
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

	// Cleanup intervals on unmount
	useEffect(() => {
		return () => {
			if (intervalIdRef.current) {
				clearInterval(intervalIdRef.current);
			}
			if (hitDetectionIntervalIdRef.current) {
				clearInterval(hitDetectionIntervalIdRef.current);
			}
			if (alternatingLightsIntervalIdRef.current) {
				clearInterval(alternatingLightsIntervalIdRef.current);
			}
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
