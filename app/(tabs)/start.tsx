import React, { useState, useEffect, useRef } from "react"; // Import necessary React hooks
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
	Module,
} from "react-native"; // Import React Native components
import { MaterialIcons } from "@expo/vector-icons"; // Import Material Icons for visual representation
import { useIconPosition } from "./IconPositionContext"; // Import custom hook for icon positions
import { RouteProp, useRoute } from "@react-navigation/native"; // Import navigation hooks
import { useBleManager } from "./context/blecontext"; // Import custom BLE manager context
import { CHARACTERISTIC } from "@/enum/characteristic"; // Import BLE characteristics enumeration
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import { useNavigation } from "@react-navigation/native";
import { Result } from "@/app/(tabs)/result";

function createInterval(callback: any, delay: number) {
	let intervalId = setInterval(callback, delay);
	let resolvePromise: any;

	const promise = new Promise((resolve) => {
		resolvePromise = resolve;
	});

	const clear = () => {
		clearInterval(intervalId);
		resolvePromise();
	};

	return { intervalId, clear, promise };
}
// Define the StartGame functional component
const StartGame = () => {
	// Destructure positions from the IconPosition context
	const { positions } = useIconPosition();

	// State to track the currently active pad index; -1 means no active pad
	const [activePadIndex, setActivePadIndex] = useState(-1);

	//
	const activePadIndexRef = useRef<number>(activePadIndex);

	// State to track if the game is currently playing
	const [isPlaying, setIsPlaying] = useState(false);

	// Ref to store the interval ID for hit detection to allow clearing it later
	const hitDetectionIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

	// Ref to store the interval ID for pad activation to allow clearing it later
	const padActivationIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

	// Ref to keep track of the latest hit count to avoid stale closures
	const hitCountRef = useRef(0);

	// Ref to keep track of the latest isPlaying state
	const isPlayingRef = useRef(isPlaying);

	// Update isPlayingRef whenever isPlaying state changes
	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	// Destructure BLE manager functions and connected devices from the context
	const { connectedDevices, turnOn_light, turnOff_light, readCharacteristic } =
		useBleManager();

	// Define the type for route parameters received from the training page
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

	// Retrieve the route and its parameters using the useRoute hook
	const route = useRoute<RouteProp<{ start: StartScreenParams }, "start">>();

	// Destructure parameters with default values in case they are undefined
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

	// State to track the number of hits by the user
	const [userHitCount, setUserHitCount] = useState(0);

	// Update hitCountRef whenever userHitCount state changes
	useEffect(() => {
		hitCountRef.current = userHitCount;
	}, [userHitCount]);

	// useEffect hook to log the userHitCount whenever it updates
	useEffect(() => {
		console.log(`Hit Count updated: ${userHitCount}`);
	}, [userHitCount]);

	// Function to detect hits by the user with proper handling of lightOut modes
	const detectHits = async (activePadIndexRef: number): Promise<number> => {
		try {
			// ตรวจสอบว่าอุปกรณ์เชื่อมต่ออยู่และ activePadIndex อยู่ในช่วงที่ถูกต้องหรือไม่
			console.log(
				`active padingix->${activePadIndexRef}, length conntect->${connectedDevices.length}`
			);

			if (
				connectedDevices.length === 0 ||
				activePadIndexRef < 0 ||
				activePadIndexRef >= connectedDevices.length
			) {
				console.log("No valid connected devices or invalid activePadIndex.");
				return -1;
			}

			const device = connectedDevices[activePadIndexRef];
			// อ่านค่าปุ่มจากอุปกรณ์
			const press = await readCharacteristic(
				device.deviceId,
				CHARACTERISTIC.IWING_TRAINERPAD,
				CHARACTERISTIC.BUTTONS
			);

			console.log(`Device ${device.deviceId} - press: ${press}`);
			if (press === null) {
				return -1;
			} else {
				return press;
			}
			return press === 0 ? 0 : 1; // คืนค่า 0 หากมีการกดปุ่ม มิฉะนั้นคืนค่า 1
		} catch (error) {
			console.error("Error in detectHits:", error);
			return 1;
		}
	};

	// Function to start the game with additional modes and conditions
	const play_2 = async (duration: number, interval: number, delay: number) => {
		const activateRandomPad = () => {
			// Deactivate any currently active pad
			// setActivePadIndex(-1);
			const totalPads = connectedDevices.length;

			// Select a random pad index

			const randomIndex = Math.floor(Math.random() * totalPads);
			// setActivePadIndex(randomIndex); // Set the new active pad index
			console.log(`Activated pad index: ${randomIndex},${totalPads}`);
			// setActivePadIndex(randomIndex);
			// activePadIndexRef.current = randomIndex;
			return randomIndex; // Return the selected index
		};

		// random
		const starttime = Date.now(); // Current time in milliseconds
		let currentime = Date.now();
		let hittemp = 0;
		let wait_hit = false;
		isPlayingRef.current = true;
		while (hitCountRef.current < hitduration) {
			console.log(`${hitCountRef.current},${hitduration} `);

			if (wait_hit === true) {
				await new Promise((resolve) => setTimeout(resolve, 500));
				continue;
			}
			let currentime = Date.now();
			// setActivePadIndex(activateRandomPad());
			// activateRandomPad();
			activePadIndexRef.current = await activateRandomPad();
			const activedevice = connectedDevices[activePadIndexRef.current];
			// console.log("is turning on");
			console.log(`${activedevice.deviceId}`);
			//await turnOn_light(activedevice, "red");
			// console.log(`open light`);

			await new Promise((resolve) => setTimeout(resolve, 1000));
			if (activedevice && wait_hit == false) {
				// เปิดไฟ
				await turnOn_light(activedevice, "blue");
				// console.log(`Light turned on for device ${activedevice.deviceId}`);

				// ตรวจจับการกดในช่วงเวลาที่กำหนด
				const { clear, promise } = createInterval(async () => {
					// if (!isPlayingRef.current) {
					// 	console.log("game is ended");
					// 	clearInterval(hitInterval); // หยุดการตรวจจับหากเกมหยุดเล่น
					// 	return;
					// }
					// console.log("before hit detect");
					// console.log(`active padref -> ${activePadIndexRef.current}`);

					if (wait_hit === true) return;

					const hitDetected = await detectHits(activePadIndexRef.current);
					console.log(`hit detect low -> ${hitDetected}`);

					if (hitDetected === 0 && wait_hit == false) {
						console.log("this his detect kod law");
						// พบการกด
						hittemp++;
						setUserHitCount((prevCount) => prevCount + 1);
						console.log(`Hit detected. hittemp: ${hittemp}`);
						// ปิดไฟเมื่อกดถึงจำนวนที่กำหนด
						if (lightOut === "Hit" && hittemp >= hitCount) {
							console.log(
								"==============================================================="
							);
							await turnOff_light(activedevice);
							wait_hit = true;
							setTimeout(() => {
								wait_hit = false;
							}, 1000);
							hittemp = 0; // รีเซ็ต hittemp
							clear(); // หยุดตรวจจับการกด
							console.log(
								`Light turned off for device ${activedevice.deviceId} after ${hittemp} hits`
							);
						}
					}
				}, 500);
				await promise;
			}
		}

		console.error(`game end`);

		// Set the game state to playing
		setIsPlaying(false);
		isPlayingRef.current = false; // ตั้งค่า ref ทันทีเพื่อให้ gameLogic รู้ว่าเกมกำลังเล่น

		// Reset the user hit count at the start of the game

		// Total number of pads available
		const totalPads = positions.length;
	};

	return (
		<SafeAreaView style={styles.container}>
			<TouchableOpacity
				style={styles.playButton} // Styles for the play button
				onPress={() => {
					console.log("Start Game button pressed.");
					play_2(
						(minDuration * 60 + secDuration) * 1000, // Calculate duration in milliseconds
						timeout * 1000, // Convert timeout to milliseconds
						delaytime // Delay time is already in milliseconds
					);
					setIsPlaying(true); // ตั้งค่า isPlaying เป็น true เมื่อกดปุ่ม
				}}
			>
				<Text style={styles.buttonText}>
					{isPlaying ? "Playing..." : "Start Game 2"}
				</Text>
			</TouchableOpacity>
			{isPlaying ? (
				<>
					{/* Header text for the game */}
					<Text style={styles.header}>Start Game</Text>

					{/* Display all pads based on their positions */}
					<View>
						{positions.map((position, index) => (
							<View
								key={index} // Unique key for each pad
								style={[
									styles.iconContainer, // Base styles for icon container
									{ left: position.x, top: position.y }, // Position the pad based on x and y coordinates
								]}
							>
								{/* Display the pad icon with color based on its active state */}
								<MaterialIcons
									name="wb-twilight" // Icon name
									size={60} // Icon size
									color={activePadIndex === index ? "blue" : "black"} // Color changes if the pad is active
								/>
								{/* Display the pad number */}
								<Text>Trainer Pad: {index}</Text>
							</View>
						))}
					</View>

					{/* Button to start the play_2 function */}

					{/* Display the current hit count */}
					<View style={styles.hitCountContainer}>
						<Text style={styles.hitCountText}>Hit Count: {userHitCount}</Text>
					</View>
				</>
			) : (
				<Result prop={userHitCount} />
			)}
			<Text>Finish</Text>
			{/* </TouchableOpacity> */}
		</SafeAreaView>
	);
};

// Define the styles for the component
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#e1f4f3" }, // Container style with background color
	header: {
		textAlign: "center", // Center align the text
		fontSize: 24, // Font size
		fontWeight: "bold", // Bold font weight
		marginVertical: 20, // Vertical margin
	},
	iconContainer: { position: "absolute", alignItems: "center" }, // Absolute positioning for icons
	playButton: {
		backgroundColor: "#2f95dc", // Button background color
		paddingVertical: 12, // Vertical padding
		paddingHorizontal: 20, // Horizontal padding
		borderRadius: 10, // Rounded corners
		alignSelf: "center", // Center the button horizontally
		marginTop: 20, // Top margin
	},
	buttonText: {
		color: "white", // Text color
		fontWeight: "bold", // Bold font weight
		fontSize: 16, // Font size
	},
	hitCountContainer: {
		marginTop: 30, // Top margin
		alignItems: "center", // Center align the hit count
	},
	hitCountText: {
		fontSize: 20, // Font size for hit count
		fontWeight: "bold", // Bold font weight
		color: "#333", // Text color
	},
});

export default StartGame; // Export the StartGame component
