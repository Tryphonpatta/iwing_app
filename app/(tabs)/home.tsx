import * as React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBleManager } from "../../components/context/blecontext";
import { CHARACTERISTIC } from "@/enum/characteristic";
import { base64toDecManu } from "@/util/encode";
import tw from "twrnc";
import { hexToBase64 } from "@/util/encode";
import { MaterialIcons } from "@expo/vector-icons";
import { Device } from "react-native-ble-plx";

// Define the type for the module state
type ConnectedDevice = Device | null;

export default function Home() {
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [modalContent, setModalContent] = React.useState("");
	const { connectedDevice, writeCharacteristic } = useBleManager();
	// const blemanager = new BleManager();
	const [module, setModule] = React.useState<ConnectedDevice[]>([]);
	const [selectedModule, setSelectedModule] = React.useState<number | null>(
		null
	);
	const [isCalibrating, setIsCalibrating] = React.useState(false);
	const isCalibratingRef = React.useRef(isCalibrating);
	console.log("Connected devices at start: ", connectedDevice);
	React.useEffect(() => {
		console.log("Connected devices: ", connectedDevice);
		const moduleTemp: ConnectedDevice[] = [];
		for (let i = 0; i < connectedDevice.length; i++) {
			moduleTemp.push(connectedDevice[i]?.device as Device);
		}
		console.log("Module: ", moduleTemp);
		setModule(moduleTemp);
	}, [connectedDevice]);
	console.log(connectedDevice);
	const blink = async (device: Device) => {
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
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		//turn off the led light
		await writeCharacteristic(device, CHARACTERISTIC.LED, "AAAA");
	};

	const playMusic = async (device: Device) => {
		console.log("Playing music on device:", device.id);
		await writeCharacteristic(
			device, // Correct: pass Device object
			CHARACTERISTIC.MUSIC, // Correct: characteristic first
			hexToBase64("616161")
		);
		await new Promise((resolve) => setTimeout(resolve, 10));
		await writeCharacteristic(device, CHARACTERISTIC.MUSIC, hexToBase64("0"));
	};

	const DeviceCard = ({
		device,
		pad_no,
	}: {
		device: Device;
		pad_no: number;
	}) => (
		<View style={styles.cardcontainer}>
			<View style={styles.left}>
				<View style={styles.iconAndButton}>
					<MaterialIcons name="wb-twilight" size={70} color="black" />
					<TouchableOpacity
						style={styles.blinkbuttonBelow}
						onPress={async () => await blink(device)}
					>
						<Text style={{ color: "#EDEEF1" }}>Blink</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.identify_buttonBelow}
						onPress={async () => await playMusic(device)}
					>
						<Text style={{ color: "#EDEEF1" }}>Sound</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.right}>
				<Text style={styles.Normal_text}>Pad number : {pad_no + 1}</Text>
				<Text style={styles.Normal_text}>ID : {device.id}</Text>
				<Text
					style={[tw`text-sm`, styles.defaultBatteryText, styles.Normal_text]}
				>
					Battery Percentage:{" "}
					{device?.manufacturerData
						? `${base64toDecManu(device?.manufacturerData).toFixed(2)} V`
						: "N/A"}
				</Text>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<Text
				style={[
					tw`text-center font-bold text-white my-4 mt-2 shadow-lg`,
					{ backgroundColor: "#419E68", fontSize: 36 },
				]}
			>
				Home
			</Text>
			<View style={tw`bg-white shadow-lg`}>
				<Text style={tw`text-lg font-bold text-black rounded-lg p-2 `}>
					Connected Device
				</Text>
			</View>
			<FlatList
				data={connectedDevice.filter((d) => d != null)}
				keyExtractor={(item, index) =>
					item ? item.device.id : `null-${index}`
				}
				renderItem={({ item, index }) =>
					item && <DeviceCard device={item.device} pad_no={index} />
				}
				ListEmptyComponent={
					<Text style={tw`mx-4 my-2`}>No connected devices</Text>
				}
			/>
			<View style={styles.footer}></View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#e1f4f3",
	},
	footer: {
		padding: 10,
		backgroundColor: "#E8F5E9",
		flexDirection: "row",
		justifyContent: "space-around",
	},
	cardcontainer: {
		marginTop: 5,
		padding: 15,
		backgroundColor: "#fff",
		marginBottom: 10,
		borderRadius: 5,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 2,
		flexDirection: "row",
	},
	cardcontent: {
		flexDirection: "column",
	},
	blinkbutton: {
		backgroundColor: "#e0e0e0",
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 12,
		position: "absolute",
		marginRight: -100,
		marginTop: 40,
	},
	defaultBatteryText: {
		color: "#4CAF50",
	},
	left: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	right: {
		flex: 1,
	},
	iconAndButton: {
		flexDirection: "column", // จัดเรียงแนวตั้ง
		alignItems: "center", // จัดกึ่งกลางแนวนอน
		gap: 10, // ระยะห่างระหว่าง icon กับปุ่ม
	},
	blinkbuttonBelow: {
		backgroundColor: "#0EA5C9",
		paddingHorizontal: 16,
		paddingVertical: 3,
		borderRadius: 12,
		marginTop: "-3%",
	},
	identify_buttonBelow: {
		backgroundColor: "#ff0000",
		paddingHorizontal: 16,
		paddingVertical: 3,
		borderRadius: 12,
		marginTop: "-3%",
	},
	Normal_text: {
		marginVertical: "8%",
		fontSize: 16,
	},
});
