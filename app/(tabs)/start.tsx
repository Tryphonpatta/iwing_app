import React, { useState, useEffect, useRef } from "react"; // Import necessary React hooks
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
	Module,
	Modal,
} from "react-native"; // Import React Native components
import tw from "twrnc";

import { RouteProp, useRoute } from "@react-navigation/native"; // Import navigation hooks
import { useBleManager } from "./context/blecontext"; // Import custom BLE manager context
import { CHARACTERISTIC } from "@/enum/characteristic"; // Import BLE characteristics enumeration

// import { Result } from "@/app/(tabs)/result";
import ShowPad from "../running";
import { Device } from "react-native-ble-plx";
import { light } from "@eva-design/eva";
import index from "..";

const StartGame = () => {
	// Destructure positions from the IconPosition context
	// const { positions } = useIconPosition();

	// State to track the currently active pad index; -1 means no active pad
	const [activePadIndex, setActivePadIndex] = useState(-1);

	// time
	const startTimeRef = useRef<number | null>(null);
	const gameEndTimeRef = useRef<number | null>(null);

	// start stop game
	const stopGameRef = useRef<boolean>(false);

	//
	const activePadIndexRef = useRef<number>(activePadIndex);
	// setActivePadIndex(-1);
	// State to track if the game is currently playing
	const [isHit, setIshit] = useState(1);
	const isHitRef = useRef(isHit);
	const isHitObjRef = useRef([1, 1, 1, 1, 1, 1, 1, 1, 1]);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showResult, setShowresult] = useState(false);

	// variable to show before game end

	// Ref to store the interval ID for hit detection to allow clearing it later
	const hitDetectionIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

	// Ref to store the interval ID for pad activation to allow clearing it later
	const padActivationIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

	// Ref to keep track of the latest hit count to avoid stale closures
	const hitCountRef = useRef(0);

	// function blink
	const blink = async (device: Device) => {
		try {
			console.log("Blinking");
			let redLight = true;
			const redColor = "/wAB";
			const blueColor = "AAD/";
			for (let i = 0; i < 10; i++) {
				await writeCharacteristic(
					device,
					CHARACTERISTIC.LED,
					redLight ? redColor : blueColor
				);
				redLight = !redLight;
				await new Promise((resolve) => setTimeout(resolve, 300)); // เพิ่มระยะเวลาที่เหมาะสม
			}
			// ปิดไฟ LED หลังจากกระพริบเสร็จ
			await writeCharacteristic(device, CHARACTERISTIC.LED, "AAAA");
		} catch (error) {
			console.error("Error in blink:", error);
		}
	};

	// Ref to keep track of the latest isPlaying state
	const isPlayingRef = useRef(isPlaying);
	// Example positions data for pads
	const positions = [
		{ x: 50, y: 100 },
		{ x: 150, y: 200 },
		{ x: 250, y: 300 },
	];

	// Update isPlayingRef whenever isPlaying state changes
	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	// Destructure BLE manager functions and connected devices from the context
	const {
		connectedDevice,
		writeCharacteristic,
		monitorCharacteristic,
		monitorCharacteristicRef,
	} = useBleManager();
	let gameEndTime: number;

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
	const [pressButton, setPressButton] = useState(false);

	// Destructure parameters with default values in case they are undefined
	let {
		lightOut = null,
		hitCount = 0,
		timeout = 0,
		lightDelay = null,
		delaytime = -1,
		duration = null,
		hitduration = 0,
		minDuration = 0,
		secDuration = 0,
	} = route.params || {};
	// Example positions data for pads

	// State to track the number of hits by the user
	const [userHitCount, setUserHitCount] = useState(0);
	const [preEndHitCount, setPreEndHitCount] = useState(0);

	// Update hitCountRef whenever userHitCount state changes
	useEffect(() => {
		hitCountRef.current = userHitCount;
	}, [userHitCount]);

	// useEffect hook to log the userHitCount whenever it updates
	useEffect(() => {
		console.log(`Hit Count updated: ${userHitCount}`);
	}, [userHitCount]);

	const isHitMode = lightOut === "Hit" || lightOut === "Hit or Timeout";
	const isTimeMode = lightOut === "Timeout" || lightOut === "Hit or Timeout";
	const isHitModeDur = duration === "Hit" || duration === "Hit or Timeout";
	const isTimeModeDur = duration === "Timeout" || duration === "Hit or Timeout";

	// const Result = ({
	// 	isHitMode,
	// 	isTimeMode,
	// 	isHitModeDur,
	// 	isTimeModeDur,
	// 	onClose,
	// 	prehitCount,
	// }: {
	// 	isHitMode: boolean;
	// 	isTimeMode: boolean;
	// 	isHitModeDur: boolean;
	// 	isTimeModeDur: boolean;
	// 	onClose: () => void;
	// }) => (
	// 	<Modal animationType="slide" transparent={true} visible={showResult}>
	// 		<View style={styles.overlay}>
	// 			<View style={styles.detailBox}>
	// 				<Text style={styles.sectionTitle}>Training Detail</Text>
	// 				<Text style={styles.separator}>---------------</Text>

	// 				<View style={styles.col}>
	// 					<Text style={styles.label}>Lights Out</Text>
	// 					<View style={styles.row}>
	// 						<Text style={styles.label}>• Mode </Text>
	// 						<Text style={styles.output}>{lightOut}</Text>
	// 					</View>
	// 					{isTimeMode && (
	// 						<View style={styles.row}>
	// 							<Text style={styles.label}>• Time out </Text>
	// 							<Text style={styles.output}>{timeout}</Text>
	// 						</View>
	// 					)}
	// 					{isHitMode && (
	// 						<View style={styles.row}>
	// 							<Text style={styles.label}>•Hit count</Text>
	// 							<Text style={styles.output}>{hitCount + " times"}</Text>
	// 						</View>
	// 					)}
	// 				</View>

	// 				<View style={styles.row}>
	// 					<Text style={styles.label}>Light Delay Time</Text>
	// 					{delaytime === 0 ? (
	// 						<View>
	// 							<Text style={styles.output}>No delay</Text>
	// 						</View>
	// 					) : (
	// 						<Text style={styles.output}>{delaytime.toFixed(2)} seconds</Text>
	// 					)}
	// 				</View>

	// 				<View style={styles.col}>
	// 					<Text style={styles.label}>Duration</Text>
	// 					<View style={styles.row}>
	// 						<Text style={styles.label}>• Mode</Text>
	// 						<Text style={styles.output}>{duration || "end Game"}</Text>
	// 					</View>
	// 					{isTimeModeDur && (
	// 						<View style={styles.row}>
	// 							<Text style={[styles.label, { fontWeight: "bold" }]}>
	// 								• Time out
	// 							</Text>
	// 							<Text style={styles.output}>
	// 								{minDuration * 60 + secDuration + " seconds" || "end Game"}
	// 							</Text>
	// 						</View>
	// 					)}
	// 					{isHitModeDur && (
	// 						<View style={styles.row}>
	// 							<Text style={styles.label}>• Hit count</Text>
	// 							<Text style={styles.output}>{hitduration + " times"}</Text>
	// 						</View>
	// 					)}
	// 				</View>

	// 				<Text style={styles.sectionTitle}>Measurement</Text>
	// 				<Text style={styles.separator}>---------------</Text>

	// 				<View style={styles.row}>
	// 					<Text style={styles.label}>Total time</Text>
	// 					{isHitMode || isTimeMode || isHitModeDur || isTimeModeDur ? (
	// 						<Text style={styles.output}>
	// 							{gameEndTimeRef.current && startTimeRef.current
	// 								? `${(
	// 										(gameEndTimeRef.current - startTimeRef.current) /
	// 										1000
	// 								  ).toFixed(2)} seconds`
	// 								: "N/A"}
	// 						</Text>
	// 					) : (
	// 						<Text style={styles.output}>No data available</Text>
	// 					)}
	// 				</View>

	// 				<View style={styles.row}>
	// 					<Text style={styles.label}>Hit Count</Text>
	// 					{/*  */}
	// 					<Text style={styles.output}>{preEndHitCount} times</Text>
	// 				</View>

	// 				<View style={styles.row}>
	// 					{isHitMode && (
	// 						<View style={styles.row}>
	// 							<Text style={styles.label}>• Hit Percentage</Text>
	// 							<Text style={styles.output}>
	// 								{hitduration > 0
	// 									? Math.min((userHitCount / hitduration) * 100, 100).toFixed(
	// 											2
	// 									  ) + " %"
	// 									: "end Game"}
	// 							</Text>
	// 						</View>
	// 					)}
	// 				</View>

	// 				<TouchableOpacity style={styles.button} onPress={onClose}>
	// 					<Text style={styles.buttonText}>Finish</Text>
	// 				</TouchableOpacity>
	// 			</View>
	// 		</View>
	// 	</Modal>
	// );
	interface ResultProps {
		isHitMode?: boolean;
		isTimeMode?: boolean;
		isHitModeDur?: boolean;
		isTimeModeDur?: boolean;
		onClose: () => void;
		prehitCount?: number;
	}

	const Result: React.FC<ResultProps> = ({
		isHitMode = false,
		isTimeMode = false,
		isHitModeDur = false,
		isTimeModeDur = false,
		onClose,
		prehitCount = 0,
	}) => (
		<Modal animationType="fade" transparent={true} visible={showResult}>
			<View style={styles.overlay}>
				<View style={styles.detailBox}>
					<Text style={styles.sectionTitle}>Training Detail</Text>
					<View style={styles.separator} />

					<Section title="Lights Out">
						<DetailRow label="Mode" value={lightOut || "N/A"} />
						{isTimeMode && (
							<DetailRow
								label="Time Out"
								value={timeout !== undefined ? `${timeout} seconds` : "N/A"}
							/>
						)}
						{isHitMode && (
							<DetailRow label="Hit Count" value={`${hitCount || 0} times`} />
						)}
					</Section>

					<Section title="Light Delay Time">
						<Text style={[styles.value]}>
							{delaytime === 0
								? "No delay"
								: delaytime > 0
								? `${delaytime.toFixed(2)} seconds`
								: "N/A"}
						</Text>
					</Section>

					<Section title="Duration">
						<DetailRow label="Mode" value={duration || "End Game"} />
						{isTimeModeDur && (
							<DetailRow
								label="Time Out"
								value={
									minDuration !== undefined && secDuration !== undefined
										? `${minDuration * 60 + secDuration} seconds`
										: "N/A"
								}
								bold
							/>
						)}
						{isHitModeDur && (
							<DetailRow
								label="Hit Count"
								value={`${hitduration || 0} times`}
							/>
						)}
					</Section>

					<Text style={styles.sectionTitle}>Measurement</Text>
					<View style={styles.separator} />

					<DetailRow
						label="Total Time"
						value={
							isHitMode || isTimeMode || isHitModeDur || isTimeModeDur
								? gameEndTimeRef.current && startTimeRef.current
									? `${(
											(gameEndTimeRef.current - startTimeRef.current) /
											1000
									  ).toFixed(2)} seconds`
									: "N/A"
								: "No data available"
						}
					/>
					<DetailRow label="Hit Count" value={`${preEndHitCount} times`} />

					{isHitMode && (
						<DetailRow
							label="Hit Percentage"
							value={
								hitduration > 0
									? `${Math.min(
											(userHitCount / hitduration) * 100,
											100
									  ).toFixed(2)}%`
									: "No data or bug"
							}
						/>
					)}

					<TouchableOpacity style={styles.button} onPress={onClose}>
						<Text style={styles.buttonText}>Finish</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);

	const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
		title,
		children,
	}) => (
		<View style={[styles.section, { justifyContent: "center" }]}>
			<Text style={styles.sectionTitle}>{title}</Text>
			<View>{children}</View>
		</View>
	);

	const DetailRow: React.FC<{
		label: string;
		value: string;
		bold?: boolean;
	}> = ({ label, value, bold }) => (
		<View style={styles.row}>
			<Text style={[styles.label, bold && styles.bold]}>{label}</Text>
			<Text style={styles.value}>{value}</Text>
		</View>
	);

	const handleCloseResult = () => setShowresult(false);
	//_______________________________________________________________________________________game play function
	const activateRandomPad = (activepad: number) => {
		const connectedPads = connectedDevice.filter((device) => device !== null);
		const totalPads = connectedPads.length;
		let randomIndex = Math.floor(Math.random() * totalPads);
		if (totalPads === 1) {
			return activepad;
		}
		while (activepad === randomIndex) {
			randomIndex = Math.floor(Math.random() * totalPads);
			console.log("Random index :++++++++summmmm", randomIndex);
		}
		console.log("Random index :++++++++ mai summ", randomIndex);
		return randomIndex;
	};

	const randomTime = () => {
		// Return a random number between 0.5 and 5
		return Math.random() * 4.5 + 0.5;
	};

	const play_hit = async (hitCount: number) => {
		const timeout = (minDuration * 60 + secDuration) * 1000; // Game duration in milliseconds
		const startTime = Date.now(); // Record start time

		//duration = "Timeout"  or "Hit or Timeout"case;
		let activepad = 0;
		while (
			(duration === "Timeout" || duration === "Hit or Timeout") &&
			timeout - (Date.now() - startTime) > 0
		) {
			const remainingTime = timeout - (Date.now() - startTime);
			if (remainingTime <= 0) {
				console.log("Time is up. Exiting the loop.");
				break;
			}

			if (lightDelay === "Random") {
				delaytime = randomTime();
			}

			console.log("Remaining time:", remainingTime);

			try {
				const index = activateRandomPad(activepad);
				activepad = index;
				// Turn on the pad's LED
				setActivePadIndex(index);

				if (hitCount >= hitduration && duration === "Hit or Timeout") {
					console.log("Hit duration reached. Exiting the loop.");
					break;
				}

				// Turn on the pad's LED
				await writeCharacteristic(
					connectedDevice[index].device,
					CHARACTERISTIC.LED,
					"wAAA"
				);

				// Wait for button release or timeout
				await Promise.race([
					connectedDevice[index].waitForButtonToBeFalse(),
					new Promise((_, reject) =>
						setTimeout(() => reject(new Error("Time is up")), remainingTime)
					),
				]);

				// Turn off the pad's LED
				setActivePadIndex(-1);
				await writeCharacteristic(
					connectedDevice[index].device,
					CHARACTERISTIC.LED,
					"AAAA"
				);

				// Delay for the specified `delaytime`
				await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));

				// Increment hit count
				hitCount++;
				setUserHitCount(hitCount);
				console.log("Button hit successfully!");
			} catch (error) {
				if (error.message === "Time is up") {
					console.log("Time ran out. Ending the game.");
					break;
				} else {
					console.error("An error occurred:", error);
				}
			}
		}

		//duration = "Hit"  case;

		while (duration === "Hit" && hitCount < hitduration) {
			if (lightDelay === "Random") {
				delaytime = randomTime();
			}
			try {
				const index = activateRandomPad(activepad);
				activepad = index;
				// Turn on the pad's LED
				setActivePadIndex(index);
				await writeCharacteristic(
					connectedDevice[index].device,
					CHARACTERISTIC.LED,
					"wAAA"
				);

				// Wait for button release or timeout
				await connectedDevice[index].waitForButtonToBeTrue();
				hitCount++;
				setUserHitCount(hitCount);
				// Turn off the pad's LED
				setActivePadIndex(-1);
				await writeCharacteristic(
					connectedDevice[index].device,
					CHARACTERISTIC.LED,
					"AAAA"
				);
				await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
			} catch (error) {
				console.error("An error occurred:", error);
			}
		}
		//turn off the light when game end
		setActivePadIndex(-1);
		if (connectedDevice[activepad].device) {
			await writeCharacteristic(
				connectedDevice[activepad].device,
				CHARACTERISTIC.LED,
				"AAAA"
			);
		}
	};
	const play_timeout = async (hitCount: number, interval: number) => {
		const timeout = (minDuration * 60 + secDuration) * 1000; // Game duration in milliseconds
		const startTime = Date.now(); // Record start time
		let activepad = 0;
		while (
			(duration === "Timeout" || duration === "Hit or Timeout") &&
			Date.now() - startTime < timeout
		) {
			if (lightDelay === "Random") {
				delaytime = randomTime();
			}
			const index = activateRandomPad(activepad);
			activepad = index;
			setActivePadIndex(index);
			try {
				if (hitCount >= hitduration && duration === "Hit or Timeout") break;
				// Turn on the pad's LED
				setActivePadIndex(index);
				await writeCharacteristic(
					connectedDevice[index].device,
					CHARACTERISTIC.LED,
					"wAAA"
				);

				// Wait for button release, game timeout, or interval timeout
				await Promise.race([
					connectedDevice[index].waitForButtonToBeFalse(), // Button release
					new Promise(
						(_, reject) =>
							setTimeout(
								() => reject("Timeout"),
								timeout - (Date.now() - startTime)
							) // Game timeout
					),
					new Promise(
						(_, reject) =>
							setTimeout(() => reject("Interval Timeout"), interval) // Interval timeout
					),
				]);
				hitCount++;
				setUserHitCount(hitCount);

				// Turn off the pad's LED after successful interaction
				setActivePadIndex(-1);
				await writeCharacteristic(
					connectedDevice[activepad].device,
					CHARACTERISTIC.LED,
					"AAAA"
				);

				// Delay for the specified `delaytime`
				await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
			} catch (error) {
				if (error === "Timeout") {
					console.log("Game timeout reached. Ending the game.");
					break; // Exit the loop if total game timeout is reached
				} else if (error === "Interval Timeout") {
					console.log("Interval timeout reached. Moving to the next pad.");
					setActivePadIndex(-1);
					await writeCharacteristic(
						connectedDevice[index].device,
						CHARACTERISTIC.LED,
						"AAAA"
					);

					// Delay for the specified `delaytime`
					await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
				} else {
					console.error("An unexpected error occurred:", error);
				}
			}
		}
		//duration = "Hit" case;
		while (duration === "Hit" && hitCount < hitduration) {
			try {
				if (lightDelay === "Random") {
					delaytime = randomTime();
				}
				const index = activateRandomPad(activepad);
				activepad = index;
				setActivePadIndex(index);
				// Turn on the pad's LED
				await writeCharacteristic(
					connectedDevice[index].device,
					CHARACTERISTIC.LED,
					"wAAA"
				);

				// Create a race to detect whether it's the button press or timeout
				const result = await Promise.race([
					connectedDevice[index]
						.waitForButtonToBeFalse()
						.then(() => "Button Pressed"),
					new Promise((_, reject) =>
						setTimeout(() => reject("Interval Timeout"), interval)
					).catch(() => "Interval Timeout"),
				]);

				// Check the result of the race
				if (result === "Button Pressed") {
					// Increment the hit count if button was pressed
					hitCount++;
					setUserHitCount(hitCount);
					console.log(`Hit count: ${hitCount} out of ${hitduration}`);
					// Turn off the pad's LED after successful interaction
					setActivePadIndex(-1);
					await writeCharacteristic(
						connectedDevice[index].device,
						CHARACTERISTIC.LED,
						"AAAA"
					);
				} else if (result === "Interval Timeout") {
					console.log("Interval timeout reached. Moving to the next pad.");
					setActivePadIndex(-1);
					await writeCharacteristic(
						connectedDevice[index].device,
						CHARACTERISTIC.LED,
						"AAAA"
					);
				}

				// Delay for the specified time between hits
				await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
			} catch (error) {
				console.error("An error occurred:", error);
			}
		}

		if (connectedDevice[activepad].device) {
			setActivePadIndex(-1);
			await writeCharacteristic(
				connectedDevice[activepad].device,
				CHARACTERISTIC.LED,
				"AAAA"
			);
		}
	};
	const play_hitOrTimeout = async (hitCounts: number, interval: number) => {
		const colorDict = {
			1: "/wAB", // Red (#FF0000)
			2: "/wAg", // Green (#00FF00)
			3: "AA/A", // Blue (#0000FF)
			4: "/wDg", // Yellow (#FFFF00)
			5: "9vAM", // Purple (#800080)
			6: "AP8A", // Teal (#008080)
			7: "+/8A", // Orange (#FFA500)
			8: "wDwA", // Dark Gray-Blue (#2C3E50)
			9: "/wDw", // Light Green (#32CD32)
			10: "+/wA", // Crimson (#DC143C)
		};

		const timeout = (minDuration * 60 + secDuration) * 1000; // Total game duration in milliseconds
		const startTime = Date.now(); // Start time of the game
		let activepad = -1; // Track the active pad
		let currentHitCounts: number = 0; // Initialize the current hit count
		let isstuck = false;
		while (
			duration === "Hit" &&
			hitCounts < hitduration // Continue while time remains and hit count is not met
		) {
			if (lightDelay === "Random") {
				delaytime = randomTime();
			}

			try {
				// Activate a random pad
				if (!isstuck || activepad < 0) {
					const index = activateRandomPad(activepad);
					activepad = index;
					setActivePadIndex(index);
				}

				// Turn on the pad's LED
				const padTurnon = Date.now();
				await writeCharacteristic(
					connectedDevice[activepad].device,
					CHARACTERISTIC.LED,
					colorDict[currentHitCounts + 1]
				);

				// Wait for button press, interval timeout, or game timeout
				const result = await Promise.race([
					connectedDevice[activepad].waitForButtonToBeFalse().then(() => "Hit"), // Button release
					new Promise(
						(_, reject) =>
							setTimeout(() => reject("Interval Timeout"), interval) // Interval timeout
					),
				]);

				// Turn off the pad's LED
				if (result === "Hit") {
					currentHitCounts++;
					hitCounts++;
					setUserHitCount(hitCounts);
					isstuck = true;

					if (currentHitCounts >= hitCount) {
						isstuck = false;
						console.log("Hit duration reached. Exiting the loop.");
						currentHitCounts = 0;
						setActivePadIndex(-1);
						await writeCharacteristic(
							connectedDevice[activepad].device,
							CHARACTERISTIC.LED,
							"AAAA"
						);

						// Delay before activating the next pad
						await new Promise((resolve) =>
							setTimeout(resolve, delaytime * 1000)
						);
					}
				}
			} catch (error) {
				if (error === "Interval Timeout") {
					isstuck = false;
					console.log(
						"Interval timeout reached. Moving to the next pad.---------------"
					);
					currentHitCounts = 0;
					setActivePadIndex(-1);
					await writeCharacteristic(
						connectedDevice[activepad].device,
						CHARACTERISTIC.LED,
						"AAAA"
					);
					await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
				} else {
					console.error("An unexpected error occurred:", error);
				}

				// Ensure the pad's LED is turned off in case of an error
				setActivePadIndex(-1);
				if (activepad >= 0) {
					await writeCharacteristic(
						connectedDevice[activepad].device,
						CHARACTERISTIC.LED,
						"AAAA"
					);
				}

				// Delay before activating the next pad
				await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
			}
		}

		while (
			(duration === "Timeout" || duration === "Hit or Timeout") &&
			Date.now() - startTime < timeout
			// Continue while time remains and hit count is not met
		) {
			if (lightDelay === "Random") {
				delaytime = randomTime();
			}
			if (duration === "Hit or Timeout" && hitCounts >= hitduration) break;

			try {
				// Activate a random pad
				if (!isstuck || activepad < 0) {
					const index = activateRandomPad(activepad);
					activepad = index;
					setActivePadIndex(index);
				}

				// Turn on the pad's LED
				const padTurnon = Date.now();
				await writeCharacteristic(
					connectedDevice[activepad].device,
					CHARACTERISTIC.LED,
					colorDict[currentHitCounts + 1]
				);

				// Wait for button press, interval timeout, or game timeout
				const result = await Promise.race([
					connectedDevice[activepad].waitForButtonToBeFalse().then(() => "Hit"),
					new Promise(
						(_, reject) =>
							setTimeout(
								() => reject("Timeout"),
								timeout - (Date.now() - startTime)
							) // Game timeout
					),
					new Promise((_, reject) =>
						setTimeout(
							() => reject("Interval Timeout"),
							interval - (Date.now() - padTurnon)
						)
					),
				]);

				// Turn off the pad's LED
				if (result === "Hit") {
					currentHitCounts++;
					hitCounts++;
					setUserHitCount(hitCounts);
					isstuck = true;

					if (currentHitCounts >= hitCount) {
						isstuck = false;
						console.log("Hit duration reached. Exiting the loop.");
						currentHitCounts = 0;
						setActivePadIndex(-1);
						await writeCharacteristic(
							connectedDevice[activepad].device,
							CHARACTERISTIC.LED,
							"AAAA"
						);

						// Delay before activating the next pad
						await new Promise((resolve) =>
							setTimeout(resolve, delaytime * 1000)
						);
					}
				}
			} catch (error) {
				if (error === "Interval Timeout") {
					isstuck = false;
					console.log(
						"Interval timeout reached. Moving to the next pad.---------------"
					);
					currentHitCounts = 0;
					setActivePadIndex(-1);
					await writeCharacteristic(
						connectedDevice[activepad].device,
						CHARACTERISTIC.LED,
						"AAAA"
					);
					await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
				} else if (error === "Timeout") {
					console.log("Game timeout reached. Ending the game.");
					break; // Exit the loop if total game timeout is reached
				} else {
					console.error("An unexpected error occurred:", error);
				}

				// Ensure the pad's LED is turned off in case of an error
				setActivePadIndex(-1);
				if (activepad >= 0) {
					await writeCharacteristic(
						connectedDevice[activepad].device,
						CHARACTERISTIC.LED,
						"AAAA"
					);
				}

				// Delay before activating the next pad
				await new Promise((resolve) => setTimeout(resolve, delaytime * 1000));
			}
		}

		// Final cleanup: turn off any active pad
		if (activepad >= 0) {
			await writeCharacteristic(
				connectedDevice[activepad].device,
				CHARACTERISTIC.LED,
				"AAAA"
			);
		}
	};

	const play_2 = async (
		timeduration: number,
		interval: number,
		delay: number
	) => {
		if (isPlaying) return;

		let hit = 0;
		hitCountRef.current = 0;
		setUserHitCount(0);
		setPressButton(true);
		startTimeRef.current = Date.now();
		let startTime = Date.now();

		if (lightOut === "Hit") {
			await play_hit(hit);
		} else if (lightOut === "Timeout") {
			await play_timeout(hit, interval);
		} else if (lightOut === "Hit or Timeout") {
			await play_hitOrTimeout(hit, interval);
		}

		setPreEndHitCount(hit);

		setUserHitCount(hit); // Update the user's hit count
		setPressButton(false);
		setIsPlaying(false);
		setShowresult(true);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Text
				style={[
					tw`text-center font-bold text-white my-4 mt-8 shadow-lg`,
					{ backgroundColor: "#419E68", fontSize: 36 },
				]}
			>
				Test
			</Text>
			<TouchableOpacity
				style={styles.playButton}
				onPress={() => {
					console.log("Start Game button pressed.");
					console.log("isPlaying : ", isPlaying);
					if (isPlaying) {
						console.log("stop gameeeeeee...");
						stopGameRef.current = true; // ส่งสัญญาณให้หยุดเกม
						setIsPlaying(false);
						gameEndTimeRef.current = Date.now();
						setShowresult(true);
						connectedDevice.forEach(async (deviceObj) => {
							if (deviceObj && deviceObj.device) {
								await blink(deviceObj.device);
							}
						});
						setPressButton(false);
					} else {
						stopGameRef.current = false; // รีเซ็ตสัญญาณหยุดเกม
						setIsPlaying(true);
						startTimeRef.current = Date.now();
						play_2(
							(minDuration * 60 + secDuration) * 1000,
							timeout * 1000,
							delaytime * 1000
						);
						setShowresult(false);
					}
				}}
			>
				<Text style={styles.buttonText}>
					{pressButton ? `Playing...` : "Start Game"}
					{/* {pressButton ? `force stop` : "Start Game"} */}
				</Text>
			</TouchableOpacity>
			<View style={styles.hitCountContainer}>
				<Text style={styles.hitCountText}>
					{/* ระบบหลัก */}
					Hit Count: {userHitCount} {"\n"}
				</Text>
			</View>
			{/* Display all pads based on their positions */}
			<ShowPad isPlaying={isPlaying} activePadIndex={activePadIndex}></ShowPad>
			{/* Display the current hit count */}
			{showResult && (
				<Result
					isHitMode={isHitMode}
					isTimeMode={isTimeMode}
					isHitModeDur={isHitModeDur}
					isTimeModeDur={isTimeModeDur}
					onClose={handleCloseResult}
					prehitCount={preEndHitCount}
				/>
			)}
			{/* </TouchableOpacity> */}
		</SafeAreaView>
	);
};

// Define the styles for the component
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
	section: {
		marginVertical: 10,
	},
	result_container: {
		flex: 1,
		backgroundColor: "#E6F7F4",
		alignItems: "center",
		justifyContent: "center",
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
		alignItems: "center",
		justifyContent: "center",
	},
	detailBox: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 16,
		width: "80%",
		alignItems: "center",
	},
	sectionTitle: {
		justifyContent: "center",
		fontWeight: "bold",
		fontSize: 16,
		marginVertical: 8,
	},
	separator: {
		fontSize: 12,
		color: "#000000",
		marginBottom: 12,
	},
	col: {
		flexDirection: "column",
		justifyContent: "space-between",
		width: "100%",
		paddingVertical: 4,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		paddingVertical: 4,
	},
	label: {
		fontSize: 14.5,
		color: "#000000",
	},
	output: {
		fontSize: 14,
		color: "#2E7D32",
	},
	buttonText: {
		color: "white", // Text color
		fontWeight: "bold", // Bold font weight
		fontSize: 16, // Font size
	},
	buttonText2: {
		color: "red", // Text color
		// marginTop: ,
		fontWeight: "bold", // Bold font weight
		fontSize: 16, // Font size
	},
	value: {
		fontSize: 14,
		color: "#2E7D32",
	},
	bold: {
		fontWeight: "bold",
	},
	hitCountContainer: {
		marginTop: 30, // Top margin
		alignItems: "center", // Center align the hit count
	},
	hitCountText: {
		fontSize: 20, // Font size for hit count
		fontWeight: "bold", // Bold font weight
		color: "#333", // Text color
		marginTop: 5,
	},
	button: {
		backgroundColor: "#4A4A4A",
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 20,
		marginTop: 10,
		alignItems: "center",
		width: "70%",
	},
});

export default StartGame; // Export the StartGame component
