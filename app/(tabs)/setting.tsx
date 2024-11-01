import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	FlatList,
	Button,
} from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import tw from "twrnc";
import { useBleManager } from "./context/blecontext";
import { base64toDecManu } from "@/util/encode";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

// Custom type for BLE devices
type DeviceCustom = Device & { isConnect: boolean };

const BLE = () => {
	const { bleManager, connectToDevice, connectedDevices } = useBleManager();
	const [deviceList, setDeviceList] = useState<DeviceCustom[]>([]);
	const [scanning, setScanning] = useState<boolean>(false);

	// Function to toggle connection status
	const toggleConnection = async (device: DeviceCustom) => {
		if (device.isConnect) {
			try {
				await bleManager.cancelDeviceConnection(device.id);
				updateDeviceStatus(device.id, false);
			} catch (error) {
				console.log("Failed to disconnect from device:", device.id, error);
			}
		} else {
			try {
				await connectToDevice(device.id);
				updateDeviceStatus(device.id, true);
			} catch (error) {
				console.log("Failed to connect to device:", device.id, error);
			}
		}
	};

	// Function to update device connection status in the list
	const updateDeviceStatus = (deviceId: string, isConnect: boolean) => {
		setDeviceList((prevList) =>
			prevList.map((d) =>
				d.id === deviceId ? { ...d, isConnect: isConnect } : d
			)
		);
	};

	// Function to start scanning for devices
	const startScan = async () => {
		setDeviceList([]);
		setScanning(true);
		bleManager.onStateChange((state) => {
			if (state === State.PoweredOn) {
				bleManager.startDeviceScan(null, null, (error, device) => {
					if (error) {
						console.log("Scan error:", error);
						return;
					}
					if (device) {
						setDeviceList((prev) => {
							const deviceExists = prev.some((d) => d.id === device.id);
							if (device.name === "Trainning_PAD" && !deviceExists) {
								return [...prev, { ...device, isConnect: false }];
							}
							return prev;
						});
					}
				});
			}
		}, true);
		setTimeout(() => {
			bleManager.stopDeviceScan();
			setScanning(false);
		}, 10000);
	};

	useEffect(() => {
		setDeviceList((prev) =>
			prev.map((device) => ({
				...device,
				isConnect: connectedDevices.some((d) => d.deviceId === device.id),
			}))
		);
	}, [connectedDevices]);

	const connectedDevicesList = deviceList.filter((device) => device.isConnect);
	const disconnectedDevicesList = deviceList.filter(
		(device) => !device.isConnect
	);

	const DeviceItem: React.FC<{ device: DeviceCustom }> = ({ device }) => {
		const getBatteryIconAndColor = (batteryLevel: number | null) => {
			if (batteryLevel === null || isNaN(batteryLevel)) {
				return {
					icon: <FontAwesome name="battery-empty" size={24} color="gray" />,
					color: "gray",
				};
			}
			if (batteryLevel > 75) {
				return {
					icon: <FontAwesome name="battery-full" size={24} color="green" />,
					color: "green",
				};
			} else if (batteryLevel > 50) {
				return {
					icon: (
						<FontAwesome
							name="battery-three-quarters"
							size={24}
							color="yellow"
						/>
					),
					color: "yellow",
				};
			} else if (batteryLevel > 25) {
				return {
					icon: <FontAwesome name="battery-half" size={24} color="orange" />,
					color: "orange",
				};
			} else {
				return {
					icon: <FontAwesome name="battery-quarter" size={24} color="red" />,
					color: "red",
				};
			}
		};

		const batteryLevel = device.manufacturerData
			? base64toDecManu(device.manufacturerData)
			: null;
		const { icon, color } = getBatteryIconAndColor(batteryLevel);

		return (
			<View
				style={[
					tw`flex-row items-center p-4 m-2`,
					styles.deviceContainer,
					{
						backgroundColor: device.isConnect ? "#FFFFFF" : "#D9D9D9",
					},
				]}
			>
				<MaterialIcons name="wb-twilight" size={60} color="black" />
				<View style={tw`flex-1 ml-4`}>
					<Text style={tw`text-base font-bold text-black mb-2`}>
						Name: {device.name || "N/A"}
					</Text>

					<View style={tw`flex-row items-center mb-1`}>
						<FontAwesome
							name="circle"
							size={12}
							color={device.isConnect ? "green" : "red"}
						/>
						<Text
							style={[
								tw`ml-2`,
								device.isConnect
									? styles.connectedText
									: styles.disconnectedText,
							]}
						>
							{device.isConnect ? "connect" : "disconnect"}
						</Text>
					</View>

					<View style={tw`flex-row items-center`}>
						{icon}
						<Text style={tw`ml-2 text-sm text-gray-700`}>
							battery: {batteryLevel !== null ? `${batteryLevel}%` : "N/A"}
						</Text>
					</View>
				</View>

				<TouchableOpacity
					style={styles.blinkButton}
					onPress={() => toggleConnection(device)}
				>
					<Text style={tw`text-gray-700`}>
						{device.isConnect ? "Disconnect" : "Connect"}
					</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={[tw`flex-1`, { backgroundColor: "#E8F5E9" }]}>
			<Text
				style={[
					tw`text-center font-bold text-white my-4 mt-8 shadow-lg`,
					{ backgroundColor: "#419E68", fontSize: 36 },
				]}
			>
				Settings
			</Text>

			{/* Render connected devices */}
			<View style={tw`bg-white shadow-lg`}>
				<Text style={tw`text-lg font-bold text-black rounded-lg p-2`}>
					Connected Devices
				</Text>
			</View>
			<FlatList
				data={connectedDevicesList}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <DeviceItem device={item} />}
				ListEmptyComponent={
					<Text style={tw`mx-4 my-2`}> No connected devices</Text>
				}
			/>

			{/* Render disconnected devices */}
			<View style={tw`bg-white shadow-lg`}>
				<Text style={tw`text-lg font-bold text-black rounded-lg p-2`}>
					Disconnected Devices
				</Text>
			</View>
			<FlatList
				data={disconnectedDevicesList}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <DeviceItem device={item} />}
				ListEmptyComponent={
					<Text style={tw`mx-4 my-2`}> No disconnected devices</Text>
				}
			/>

			<Button
				onPress={startScan}
				title={scanning ? "Scanning..." : "Start Scan"}
				disabled={scanning}
			/>
		</View>
	);
};

// Define styles for the component
const styles = StyleSheet.create({
	deviceContainer: {
		backgroundColor: "#f0f4f7",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	connectedText: {
		color: "#0E8850",
	},
	disconnectedText: {
		color: "#D32F2F",
	},
	blinkButton: {
		backgroundColor: "#e0e0e0",
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 12,
		position: "absolute",
		right: 10,
	},
});

export default BLE;
