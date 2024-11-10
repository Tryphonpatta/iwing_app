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
	const [activePadIndex, setActivePadIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const {
		connectedDevices,
		blink,
		turnOn_light,
		turnOff_light,
		readCharacteristic,
	} = useBleManager();

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

	const play = async (
		duration: number,
		interval: number,
		delay: number,
		hitCount: number
	) => {
		setIsPlaying(true);
		const totalPads = positions.length;
		let count = hitCount;
		let intervalId: NodeJS.Timeout;

		const activateRandomPad = () => {
			setActivePadIndex(-1);
			const randomIndex = Math.floor(Math.random() * totalPads);
			setActivePadIndex(randomIndex);
			return randomIndex;
		};

		const handlePad = async () => {
			if (count <= 0) {
				stopGame();
				return;
			}

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
					if (count === 0) return;
					if (connectedDevices.length === 0) return;

					try {
						const press = await readCharacteristic(
							device.deviceId,
							CHARACTERISTIC.IWING_TRAINERPAD,
							CHARACTERISTIC.BUTTONS
						);
						if (press === 0) {
							console.log("press");
							count--;
							if (count <= 0) {
								stopGame();
							}
						} else {
							console.log("not press");
						}
					} catch (error) {
						console.error("bug");
					}
				}, 5000);
			}
		};

		const stopGame = () => {
			setIsPlaying(false);
			setActivePadIndex(-1);
			clearInterval(intervalId);
			console.log("Game stopped");
		};

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
			stopGame();
		}, duration);
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
