import React, { useState, useEffect } from "react";
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
	const [activePadIndex, setActivePadIndex] = useState(-1); // No pad is active initially
	const [isPlaying, setIsPlaying] = useState(false); // To track if the game is active
	const { connectedDevices, turnOn_light, turnOff_light, readCharacteristic } =
		useBleManager();

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
		timeout = 0,
		lightDelay = "",
		delaytime = 0,
		duration = "",
		hitduration = 0,
		minDuration = 0,
		secDuration = 0,
	} = route.params || {};

	// Function to start the game
	const play = async (
		duration: number,
		interval: number,
		delay: number,
		initialHitCount: number
	) => {
		setIsPlaying(true);
		const totalPads = positions.length;
		let hitCount = initialHitCount;
		let hitDetectionIntervalId: NodeJS.Timeout;
		let intervalId: NodeJS.Timeout;

		// Function to activate a random pad
		const activateRandomPad = () => {
			setActivePadIndex(-1);
			const randomIndex = Math.floor(Math.random() * totalPads);
			setActivePadIndex(randomIndex);
			return randomIndex;
		};

		// Function to handle pad activation
		const handlePad = async () => {
			const padIndex = activateRandomPad();
			const device = connectedDevices[padIndex];
			if (device) {
				const startTime = new Date().toLocaleTimeString();
				console.log(`Pad number ${padIndex} is turned on at ${startTime}`);

				try {
					await turnOn_light(device, interval / 1000, "blue"); // Convert interval to seconds
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

		// Function to detect hits
		const detectHits = () => {
			hitDetectionIntervalId = setInterval(async () => {
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
							// Turn off the red light
							await turnOff_light(device);
							// After 1 second, turn the red light back on
							setTimeout(async () => {
								await turnOn_light(device, 0, "red");
							}, 1000);

							// Decrement hit count and check for game over
							if (initialHitCount > 0) {
								hitCount--;
								console.log(`Hit count decreased to ${hitCount}`);
								if (hitCount <= 0) {
									stopGame();
								}
							}

							// Log "success" 100 times for each press
							for (let k = 0; k < 100; k++) {
								console.log("success");
							}

							// Show debug information
							console.log("---- Hit Debug ----");
							console.log(`Device ID: ${device.deviceId}`);
							console.log(`Time: ${new Date().toLocaleTimeString()}`);
							console.log(`Hit Count: ${hitCount}`);
							console.log("-------------------");
						} else {
							// Uncomment the following line if you want to see when no press is detected
							// console.log(`No button press detected on device ${i}`);
						}
					} catch (error) {
						console.error("Error reading characteristic:", error);
					}
				}
			}, 500); // Adjust the interval as needed
		};

		// Function to stop the game
		const stopGame = () => {
			setIsPlaying(false);
			setActivePadIndex(-1);
			clearInterval(intervalId);
			clearInterval(hitDetectionIntervalId);

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
		};

		// Start hit detection
		detectHits();

		// Activate a pad immediately
		await handlePad();

		// Start the interval to handle activation
		intervalId = setInterval(() => {
			if (!isPlaying) {
				clearInterval(intervalId);
				return;
			}
			handlePad();
		}, interval + delay);

		// Stop the game after the specified duration
		setTimeout(() => {
			if (initialHitCount === 0 || hitCount > 0) {
				stopGame();
			}
		}, duration);
	};

	// useEffect for debugging
	useEffect(() => {
		const intervalId = setInterval(async () => {
			console.log("---- Debug Information ----");
			console.log("Current Hit Count:", hitCount);
			console.log("Is Playing:", isPlaying);
			console.log("Active Pad Index:", activePadIndex);
			console.log("Connected Devices:", connectedDevices.length);
			console.log("----------------------------");
		}, 5000); // Display info every 5 seconds
		return () => {
			clearInterval(intervalId);
		};
	}, [hitCount, isPlaying, activePadIndex, connectedDevices]);

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
							color={activePadIndex === index ? "blue" : "black"} // Show color for active pad
						/>
						<Text>Trainer Pad: {index}</Text>
					</View>
				))}
			</View>
			<TouchableOpacity
				style={styles.playButton}
				onPress={() =>
					play(
						(minDuration * 60 + secDuration) * 1000, // duration in ms
						timeout * 1000, // interval in ms
						delaytime * 1000, // delay time in ms
						hitCount
					)
				}
				disabled={isPlaying} // Disable button if already playing
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
