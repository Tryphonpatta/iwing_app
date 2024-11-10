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
import { Device } from "react-native-ble-plx";

const StartGame = () => {
	const { positions } = useIconPosition();
	const [activePadIndex, setActivePadIndex] = useState(-1); // No pad is active initially
	const [isPlaying, setIsPlaying] = useState(false); // To track if the game is active
	const {
		connectedDevices,
		blink,
		turnOn_light,
		turnOff_light,
		readCharacteristic,
	} = useBleManager();

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

	// Function to start the game :interval=timeout
	const play = async (
		duration: number,
		interval: number,
		delay: number,
		hitCount: number
	) => {
		setIsPlaying(true);
		const totalPads = positions.length;
		let count = hitCount;

		// Function to activate a random pad
		const activateRandomPad = () => {
			setActivePadIndex(-1);
			const randomIndex = Math.floor(Math.random() * totalPads);
			setActivePadIndex(randomIndex);
			return randomIndex;
		};

		// Function to handle pad activation and BLE interactions
		const handlePad = async () => {
			const padIndex = activateRandomPad();
			const device = connectedDevices[padIndex];
			if (device) {
				const startTime = new Date().toLocaleTimeString();
				console.log(`Pad number ${padIndex} is turned on at ${startTime}`);
				turnOn_light(device, interval, "blue");

				// Turn off the light after the `interval`
				setTimeout(() => {
					const offTime = new Date().toLocaleTimeString();
					console.log(`Pad number ${padIndex} is turned off at ${offTime}`);
					turnOff_light(device);
				}, interval);

				// Read the characteristic after a delay
				setTimeout(async () => {
					if (hitCount === 0) {
						turnOff_light(device);
					}
					if (connectedDevices.length === 0) return;

					for (let i = 0; i < connectedDevices.length; i++) {
						const device = connectedDevices[i];
						if (!device) continue;
						try {
							turnOn_light(device, 1000, "red");
							const press = await readCharacteristic(
								device.deviceId,
								CHARACTERISTIC.IWING_TRAINERPAD,
								CHARACTERISTIC.BUTTONS
							);
							if (press === 0) {
								console.log("press");
								hitCount--;
							} else {
								console.log("not press");
							}
						} catch (error) {
							console.error("bug");
						}
					}
				}, 1000);
				return () => {
					clearInterval(intervalId);
				};
			}
		};

		// Function to stop the game
		const stopGame = () => {
			setIsPlaying(false);
			setActivePadIndex(-1);
			clearInterval(intervalId);
			console.log("Game stopped");
		};

		// Activate a pad immediately
		await handlePad();

		// Start the interval to handle activation
		const intervalId = setInterval(() => {
			if (!isPlaying) {
				clearInterval(intervalId);
				return;
			}
			handlePad();
		}, interval + delay);

		// Stop the game after the specified duration
		setTimeout(() => {
			stopGame();
		}, duration);
	};

	// 			const offTime = new Date().toLocaleTimeString();
	// 			console.log(`Pad number ${startPadIndex} is turned off at ${offTime}`);
	// 			turnOff_light(device);
	// 		}, interval);
	// 	}

	// 	// Start the interval to handle activation, deactivation, and delay
	// 	const intervalId = setInterval(() => {
	// 		// Activate a random pad and get its index
	// 		const padIndex = activateRandomPad();
	// 		const device = connectedDevices[padIndex];

	// 		if (device) {
	// 			// Get the current time for logging
	// 			const currentTime = new Date().toLocaleTimeString();

	// 			// Log when the pad is turned on
	// 			console.log(`Pad number ${padIndex} is turned on at ${currentTime}`);

	// 			// Turn on light on the selected device
	// 			turnOn_light(device, interval, "blue");

	// 			// Turn off the light after `interval` time
	// 			setTimeout(() => {
	// 				// Log when the pad is turned off
	// 				const offTime = new Date().toLocaleTimeString();
	// 				console.log(`Pad number ${padIndex} is turned off at ${offTime}`);

	// 				// Turn off the light
	// 				turnOff_light(device);

	// 				// Wait for `delay` time before activating the next pad
	// 				setTimeout(() => {
	// 					if (isPlaying) {
	// 						activateRandomPad();
	// 					}
	// 				}, delay);
	// 			}, interval);
	// 		}
	// 	}, interval + delay);

	// 	// function hit
	// 	let count = hitCount;
	// 	while (count > 0 && isPlaying) {
	// 	  const padIndex = activateRandomPad();
	// 	  const device =connectedDevices[padIndex];
	// 	  if (device) {
	// 	    turnOn_light(device, timeout * 1000, "blue");
	// 	    try {
	// 	      const press = readCharacteristic(
	// 	        device.deviceId,
	// 	        CHARACTERISTIC.IWING_TRAINERPAD,
	// 	        CHARACTERISTIC.BUTTONS
	// 	      );
	// 	      if (press === 0) {
	// 	        console.log("กดแล้วฮับ");
	// 	        count--;
	// 	      }
	// 	      else {
	// 	        console.log("ยังไอสัส");

	// 	      }
	// 	    }
	// 	  }
	// 	}
	// 	// Stop the game after the specified duration
	// 	setTimeout(() => {
	// 		clearInterval(intervalId);
	// 		setIsPlaying(false);
	// 		setActivePadIndex(-1); // Deactivate all pads after the game ends
	// 	}, duration);
	// };
	useEffect(() => {
		const intervalId = setInterval(async () => {
			console.log("hit :", hitCount);
			console.log("time :", timeout);
		}, 1000);
		return () => {
			clearInterval(intervalId);
		};
	}, [connectedDevices, readCharacteristic]);

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
