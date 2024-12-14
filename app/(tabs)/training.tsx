import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	ScrollView,
	Modal,
	FlatList,
} from "react-native";
// import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Slider } from "@rneui/themed";
import CounterInput from "react-native-counter-input";
//counter lib usage:https://github.com/WrathChaos/react-native-counter-input
import tw, { style } from "twrnc";
import { light } from "@eva-design/eva";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import { useNavigation } from "@react-navigation/native";

const Dropdown = ({ label, selectedValue, onValueChange, options }) => {
	const [modalVisible, setModalVisible] = useState(false);

	const handleSelect = (value) => {
		onValueChange(value);
		setModalVisible(false);
	};

	return (
		<View style={styles.dropdownContainer}>
			<TouchableOpacity
				style={styles.dropdownButton}
				onPress={() => setModalVisible(true)}
			>
				<Text style={styles.dropdownButtonText}>
					{selectedValue ? selectedValue.toString() : label}
				</Text>
			</TouchableOpacity>

			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					onPress={() => setModalVisible(false)}
				>
					<View style={styles.modalContent}>
						<FlatList
							data={options}
							keyExtractor={(item) => item.toString()}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.option}
									onPress={() => handleSelect(item)}
								>
									<Text style={styles.optionText}>{item}</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

export default function App() {
	const [lightOut, setLightOut] = useState("");
	const [timeout, setTimeout] = useState(0.5);
	const [hitCount, setHitCount] = useState(0);

	const [lightDelay, setLightDelay] = useState("");
	const [delaytime, setDelaytime] = useState(0.5);

	const [duration, setDuration] = useState("");
	const [timeduration, setTimeDuration] = useState(0);
	const [hitduration, setHitDuration] = useState(0);
	const [minDuration, setMinDuration] = useState(0);
	const [secDuration, setSecDuration] = useState(0);
	const [randomNumber, setRandomNumber] = useState<number | null>(null); // State to hold the random number
	const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
	const [dropdownVisible, setDropdownVisible] = useState(false); // State to control dropdown visibility

	const getRandomNumber = (): number => {
		const min = 0.5;
		const max = 5.0;
		const random = (Math.random() * (max - min) + min).toFixed(2); // Generate random number between 0.50 and 5.00
		return parseFloat(random); // Convert the string to a number
	};

	type RootStackParamList = {
		start: {
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
		training: undefined; // add other routes here as needed
	};

	type TrainingScreenNavigationProp = NativeStackNavigationProp<
		RootStackParamList,
		"training"
	>;
	const navigation = useNavigation<TrainingScreenNavigationProp>();

	const goToStartPage = () => {
		navigation.navigate("start", {
			lightOut,
			hitCount,
			timeout,
			lightDelay,
			delaytime,
			duration,
			hitduration,
			minDuration,
			secDuration,
		});
		console.log(
			`go to the start page ${lightOut} ${hitCount} ${timeout} ${lightDelay} ${delaytime} ${duration} ${hitduration} ${minDuration} ${secDuration}`
		);
	};

	return (
		<ScrollView style={styles.scrollView}>
			<View style={[tw`flex-1`, { backgroundColor: "#e1f4f3" }]}>
				<Text
					style={[
						tw`text-center font-bold text-white my-4 mt-8 shadow-lg`,
						{
							backgroundColor: "#419E68",
							fontSize: 36,
						},
					]}
				>
					Training
				</Text>
				<View style={styles.container}>
					{/* Light Out Section */}
					<View style={styles.section}>
						<View style={styles.label}>
							<MaterialIcons
								name="wb-twighlight"
								size={30}
								color="black"
								style={styles.icon}
							/>
							<Text style={styles.labelText}>Light out</Text>
						</View>
						<View style={styles.selectBar}>
							<TouchableOpacity
								style={[
									styles.option,
									lightOut === "Hit" && styles.activeOption,
								]}
								onPress={() => {
									setLightOut("Hit"), setHitCount(1);
								}}
							>
								<Text
									style={[
										styles.optionText,
										lightOut === "Hit" && styles.activeOptionText,
									]}
								>
									Hit
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.option,
									lightOut === "Timeout" && styles.activeOption,
								]}
								onPress={() => setLightOut("Timeout")}
							>
								<Text
									style={[
										styles.optionText,
										lightOut === "Timeout" && styles.activeOptionText,
									]}
								>
									Timeout
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.option,
									lightOut === "Hit or Timeout" && styles.activeOption,
								]}
								onPress={() => setLightOut("Hit or Timeout")}
							>
								<Text
									style={[
										styles.optionText,
										lightOut === "Hit or Timeout" && styles.activeOptionText,
									]}
								>
									Hit or Timeout
								</Text>
							</TouchableOpacity>
						</View>
						{lightOut === "Timeout" && (
							// Time out slider
							<View style={styles.section}>
								<Text style={styles.labelText}>
									Timeout : {timeout.toFixed(1)} seconds
								</Text>
								<Slider
									style={styles.slider}
									minimumValue={0.5}
									maximumValue={100}
									value={timeout}
									step={0.5}
									onValueChange={(value) => setTimeout(value)}
									minimumTrackTintColor="#4caf50"
									maximumTrackTintColor="#545454" // Custom track color
									thumbStyle={styles.thumb} // Custom thumb style
									trackStyle={styles.track}
								/>
							</View>
						)}

						{lightOut === "Hit or Timeout" && (
							<>
								{/* Time out slider */}
								<View style={styles.section}>
									<Text style={styles.labelText}>
										Timeout : {timeout.toFixed(1)} seconds
									</Text>
									<Slider
										style={styles.slider}
										minimumValue={0.5}
										maximumValue={100}
										value={timeout}
										step={0.5}
										onValueChange={(value) => setTimeout(value)}
										minimumTrackTintColor="#4caf50"
										maximumTrackTintColor="#545454" // Custom track color
										thumbStyle={styles.thumb} // Custom thumb style
										trackStyle={styles.track}
									/>
								</View>
								{/* Hit slider */}
								{/* <View style={styles.section}>
									<Text style={styles.labelText}>Hit Count : {hitCount}</Text>
									<Slider
										style={styles.slider}
										minimumValue={1}
										maximumValue={5}
										value={hitCount}
										step={1}
										onValueChange={(value) => setHitCount(value)}
										minimumTrackTintColor="#4caf50"
										maximumTrackTintColor="#545454" // Custom track color
										thumbStyle={styles.thumb} // Custom thumb style
										trackStyle={styles.track}
									/>
								</View> */}
								{/* dropdown for hit count */}
								<View style={[styles.section]}>
									<Text style={styles.labelText}>Hit Count: {hitCount}</Text>
									<TouchableOpacity
										style={styles.dropdownButton}
										onPress={() => setDropdownVisible(!dropdownVisible)}
									>
										<Text style={styles.dropdownButtonText}>
											{hitCount ? hitCount.toString() : "Select Hit Count"}
										</Text>
										<MaterialIcons
											name={
												dropdownVisible ? "arrow-drop-up" : "arrow-drop-down"
											}
											size={24}
											color="#555"
										/>
									</TouchableOpacity>

									{dropdownVisible && (
										<View style={styles.dropdownOptions}>
											{[1, 2, 3, 4, 5, 6].map((item) => (
												<TouchableOpacity
													key={item}
													style={[
														styles.option,
														item === hitCount && styles.activeOption,
													]}
													onPress={() => {
														setHitCount(item);
														setDropdownVisible(false);
													}}
												>
													<Text
														style={[
															styles.optionText,
															item === hitCount && styles.activeOptionText,
														]}
													>
														{item}
													</Text>
												</TouchableOpacity>
											))}
										</View>
									)}
								</View>
							</>
						)}
					</View>

					{/* Light Delay Time Section */}
					<View style={styles.section}>
						<View style={styles.label}>
							<MaterialIcons
								name="wb-twighlight"
								size={30}
								color="black"
								style={styles.icon}
							/>
							<Text style={styles.labelText}>Light Delay Time</Text>
						</View>
						<View style={styles.selectBar}>
							<TouchableOpacity
								style={[
									styles.option,
									lightDelay === "None" && styles.activeOption,
								]}
								onPress={() => setLightDelay("None")}
							>
								<Text
									style={[
										styles.optionText,
										lightDelay === "None" && styles.activeOptionText,
									]}
								>
									None
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.option,
									lightDelay === "Fixed" && styles.activeOption,
								]}
								onPress={() => setLightDelay("Fixed")}
							>
								<Text
									style={[
										styles.optionText,
										lightDelay === "Fixed" && styles.activeOptionText,
									]}
								>
									Fixed
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.option,
									lightDelay === "Random" && styles.activeOption,
								]}
								onPress={() => setLightDelay("Random")}
							>
								<Text
									style={[
										styles.optionText,
										lightDelay === "Random" && styles.activeOptionText,
									]}
									onPress={() => {
										setLightDelay("Random");
										setDelaytime(getRandomNumber()); // Generate and set random delay when selecting "Random"
									}}
								>
									Random
								</Text>
							</TouchableOpacity>
						</View>
						{lightDelay === "Fixed" && ( // Updated to "Fixed"
							<View style={styles.section}>
								<Text style={styles.labelText}>
									Timeout : {delaytime.toFixed(2)} seconds
								</Text>
								<Slider
									style={styles.slider}
									minimumValue={0.5}
									maximumValue={5}
									step={0.01}
									value={delaytime}
									onValueChange={(value) => setDelaytime(value)}
									minimumTrackTintColor="#4caf50"
									maximumTrackTintColor="#545454" // Custom track color
									thumbStyle={styles.thumb} // Custom thumb style
									trackStyle={styles.track}
								/>
							</View>
						)}
						{lightDelay === "Random" && (
							<Text style={styles.labelText}>Random Time : {delaytime}</Text>
						)}
					</View>

					{/* Duration Section */}
					<View style={styles.section}>
						<View style={styles.label}>
							<Entypo
								name="back-in-time"
								size={30}
								color="black"
								style={styles.icon}
							/>
							<Text style={styles.labelText}>Duration</Text>
						</View>
						<View style={styles.selectBar}>
							<TouchableOpacity
								style={[
									styles.option,
									duration === "Hit" && styles.activeOption,
								]}
								onPress={() => setDuration("Hit")}
							>
								<Text
									style={[
										styles.optionText,
										duration === "Hit" && styles.activeOptionText,
									]}
								>
									Hit
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.option,
									duration === "Timeout" && styles.activeOption,
								]}
								onPress={() => setDuration("Timeout")}
							>
								<Text
									style={[
										styles.optionText,
										duration === "Timeout" && styles.activeOptionText,
									]}
								>
									Timeout
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.option,
									duration === "Hit or Timeout" && styles.activeOption,
								]}
								onPress={() => setDuration("Hit or Timeout")}
							>
								<Text
									style={[
										styles.optionText,
										duration === "Hit or Timeout" && styles.activeOptionText,
									]}
								>
									Hit or Timeout
								</Text>
							</TouchableOpacity>
						</View>
						{duration === "Hit" && (
							<View style={styles.section}>
								<Text style={styles.labelText}>Hit Count : {hitduration}</Text>
								<Slider
									style={styles.slider}
									minimumValue={1}
									maximumValue={100}
									step={1}
									value={hitduration}
									onValueChange={(value) => setHitDuration(value)}
									minimumTrackTintColor="#4caf50"
									maximumTrackTintColor="#545454" // Custom track color
									thumbStyle={styles.thumb} // Custom thumb style
									trackStyle={styles.track}
								/>
							</View>
						)}
						{duration === "Timeout" && (
							<View style={styles.section}>
								<Text style={styles.labelText}>
									Timeout : {minDuration} min {secDuration} sec
								</Text>
								<View style={styles.counterContainer}>
									<CounterInput
										min={0}
										max={59}
										onChange={(value) => setMinDuration(value)}
										horizontal={true}
										style={styles.counter}
									/>

									<CounterInput
										min={0}
										max={59}
										horizontal={true}
										onChange={(value) => setSecDuration(value)}
										style={styles.counter}
									/>
								</View>
							</View>
						)}
						{duration === "Hit or Timeout" && (
							<View style={styles.section}>
								<Text style={styles.labelText}>
									Timeout : {minDuration} min {secDuration} sec
								</Text>
								<View style={styles.counterContainer}>
									<CounterInput
										min={0}
										max={59}
										onChange={(value) => {
											setMinDuration(value);
										}}
										horizontal={true}
										style={styles.counter}
									/>

									<CounterInput
										min={0}
										max={59}
										horizontal={true}
										onChange={(value) => {
											setSecDuration(value);
										}}
										style={styles.counter}
									/>
								</View>
								<Text style={styles.labelText}>Hit Count : {hitduration}</Text>
								<Slider
									style={styles.slider}
									minimumValue={1}
									maximumValue={100}
									step={1}
									value={hitduration}
									onValueChange={(value) => setHitDuration(value)}
									minimumTrackTintColor="#4caf50"
									maximumTrackTintColor="#545454" // Custom track color
									thumbStyle={styles.thumb} // Custom thumb style
									trackStyle={styles.track}
								/>
							</View>
						)}
					</View>
					<TouchableOpacity
						onPress={() => {
							goToStartPage();
						}}
					>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Finish</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#e1f4f3",
		padding: 20,
	},
	section: {
		marginBottom: 20,
		marginTop: 10,
	},
	label: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	labelText: {
		fontWeight: "bold",
		fontSize: 16,
	},
	icon: {
		width: 100,
		height: 30,
		marginRight: "-14%",
	},
	selectBar: {
		flexDirection: "row",
		backgroundColor: "#f3da74",
		borderRadius: 10,
		padding: 5,
	},
	option: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 10,
	},
	activeOption: {
		backgroundColor: "#1e1e1e",
		borderRadius: 5,
	},
	optionText: {
		color: "black",
		fontWeight: "bold",
	},
	activeOptionText: {
		color: "white",
	},
	slider: {
		width: "100%",
	},
	thumb: {
		height: 30, // Size of the thumb
		width: 30, // Width of the thumb
		borderRadius: 15,
		backgroundColor: "#4EAF4C", // Thumb color
	},
	track: {
		height: 5,
	},
	button: {
		backgroundColor: "#545454", // Set a visible button color
		paddingVertical: 12, // Padding for height
		paddingHorizontal: 20, // Padding for width
		alignItems: "center",
		borderRadius: 15,
		marginTop: 20,
		width: 200,
		alignSelf: "center",
	},
	counterContainer: {
		flexDirection: "row",
	},
	counterLabel: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},
	counterText: {
		fontSize: 16,
		fontWeight: "bold",
		marginLeft: 5,
	},
	timeLabel: {
		fontSize: 16,
		fontWeight: "bold",
		marginHorizontal: 8,
	},
	counter: {
		// flexDirection: "row",
		width: 100, // Set a smaller width for the counter

		fontWeight: "regular",
		transform: [{ scale: 0.8 }],
		marginRight: 20,
	},
	buttonText: {
		color: "white", // Text color for contrast
		fontWeight: "bold",
		fontSize: 16,
	},
	scrollView: {
		flex: 1,
		backgroundColor: "#e1f4f3", // Background color for the entire scrollable area
	},
	labelText_counter: {
		width: 60, // Set a smaller width for the counter
		height: 30,
		fontSize: 16,
		fontWeight: "bold",
		marginLeft: 15,
		marginRight: 10,
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		overflow: "hidden",
		marginTop: 10,
	},
	picker: {
		height: 50,
		width: "100%",
	},
	dropdownButton: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	dropdownButtonText: {
		fontSize: 16,
		color: "#333",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		margin: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	dropdownOptions: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 10,
		marginTop: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
});
