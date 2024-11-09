import { CHARACTERISTIC } from "../../../enum/characteristic";
import { Module } from "../../../util/buttonType";
import { base64toDec } from "../../../util/encode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";

type ModuleHome = Module | null;
interface BleManagerContextType {
	bleManager: BleManager;
	connectedDevices: Module[];
	module: ModuleHome[];
	setModule: React.Dispatch<React.SetStateAction<ModuleHome[]>>;
	setConnectedDevices: React.Dispatch<React.SetStateAction<Module[]>>;
	disconnectDevice: (deviceId: string) => Promise<void>;
	connectToDevice: (deviceId: string) => void;
	writeCharacteristic: (
		deviceId: string,
		serviceUUID: string,
		characteristicUUID: string,
		value: string
	) => void;
	readCharacteristic: (
		deviceId: string,
		serviceUUID: string,
		characteristicUUID: string
	) => Promise<number | null>;
	turnOn_light: (device: Module, sec: number, color: string) => void;
	turnOff_light: (device: Module) => void;
	// Add other functions as needed
}

const BleManagerContext = createContext<BleManagerContextType | undefined>(
	undefined
);

export const BleManagerProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [module, setModule] = useState<ModuleHome[]>([]);
	const [bleManager] = useState(new BleManager());
	const [connectedDevices, setConnectedDevices] = useState<Module[]>([]);

	const disconnectDevice = async (deviceId: string) => {
		// Check if the device is currently connected
		console.log(`Checking if device ${deviceId} is connected...`);
		const connectDevice = await bleManager.connectToDevice(deviceId);
		const isConnected = await bleManager.isDeviceConnected(deviceId);
		console.log(`Is device ${deviceId} connected: `, isConnected);

		// if (isConnected) {
		console.log(`Attempting to disconnect from device: ${deviceId}`);

		// Cancel the device connection
		const result = await bleManager.cancelDeviceConnection(deviceId).then(
			() => {
				console.log("Disconnected from device: ", deviceId);
				setConnectedDevices((prev) =>
					prev.filter((device) => device.deviceId !== deviceId).filter(Boolean)
				);
			},
			(error) => {
				console.error("Failed to disconnect from device: ", deviceId, error);
			}
		);
		console.log("Result from cancelDeviceConnection:", result);

		// Remove the device from the connectedDevices array using a new array

		// } else {
		// }
	};

	const connectToDevice = async (deviceId: string) => {
		try {
			console.log(`Connecting to device: ${deviceId}`);
			const isConnected = await bleManager.isDeviceConnected(deviceId);
			if (isConnected) return;
			const device = await bleManager.connectToDevice(deviceId);
			console.log(`Connected to device: ${deviceId}`);

			await device.discoverAllServicesAndCharacteristics();

			// //   const isConnected = await bleManager.isDeviceConnected("deviceId");
			// //   console.log("isConnected: ", isConnected);

			// //   if (isConnected) {
			const characteristicMap = new Map<string, number>();
			const services = await device.services();
			for (const service of services) {
				// console.log("Service UUID:", service.uuid);
				const characteristics = await service.characteristics();

				for (const characteristic of characteristics) {
					// console.log("Characteristic UUID:", characteristic.uuid);
					// console.log("Is Readable:", characteristic.isReadable);
					if (!characteristic.isReadable) {
						continue;
					}
					console.log("Characteristic UUID:", characteristic.uuid);
					const value = await characteristic.read();
					console.log("Valuess:", base64toDec(value.value as string));

					// Store the value in the characteristicMap
					characteristicMap.set(
						characteristic.uuid.toUpperCase(),
						base64toDec(value.value as string)
					);
				}
			}
			console.log("connected", connectedDevices);
			const existingDevice = connectedDevices.find(
				(e) => e.deviceId === device.id
			);
			console.log("existingDevice: ", existingDevice);
			if (existingDevice) {
				console.log("found");
				const index = connectedDevices.findIndex(
					(e) => e.deviceId === device.id
				);
				const updatedModule = connectedDevices[index];
				updatedModule.batteryVoltage =
					characteristicMap.get(CHARACTERISTIC.BATT_VOLTAGE) || 0;
				setConnectedDevices((prev) => {
					prev[index] = updatedModule;
					return prev.filter(Boolean);
				});
				return;
			}
			console.log("not found");
			setConnectedDevices((prev) => {
				const batteryVoltageValue = characteristicMap.get(
					CHARACTERISTIC.BATT_VOLTAGE
				);
				prev.push({
					deviceId: deviceId,
					batteryVoltage: batteryVoltageValue || 0,
					bleManager: bleManager,
					battFull: false,
					battCharging: false,
					IR_RX_status: false,
					VIB_threshold: 0,
					IR_TX_status: false,
					music: "",
					device: device,
				});
				return prev.filter(Boolean);
			});
			return;
		} catch (error) {
			console.error(`Failed to connect to device: ${deviceId}`, error);
			return null;
		}
	};

	const writeCharacteristic = async (
		deviceId: string,
		serviceUUID: string,
		characteristicUUID: string,
		value: string
	) => {
		try {
			console.log(
				"Writing to characteristic: ",
				characteristicUUID.toLowerCase()
			);
			console.log("Value: ", value);
			const device = await bleManager.connectToDevice(deviceId);
			await device.discoverAllServicesAndCharacteristics();

			console.log("Connected to device: ", deviceId);

			await device.writeCharacteristicWithResponseForService(
				serviceUUID,
				characteristicUUID.toLowerCase(),
				value
			);
		} catch (error) {
			console.error(
				`Failed to write to characteristic: ${characteristicUUID}`,
				error
			);
		}
	};

	//ws test function for turning on LED light
	const turnOn_light = async (device: Module, sec: number, color: string) => {
		console.log(
			`Turning on ${device.deviceId} ${color} light for ${sec} seconds`
		);

		// Define color codes
		const redColor = "/wAB";
		const blueColor = "AAD/";
		const offColor = "AAAA";

		// Choose color based on input
		const onColor = color === "blue" ? blueColor : redColor;

		// Turn on the light with the selected color
		await writeCharacteristic(
			device.deviceId,
			CHARACTERISTIC.IWING_TRAINERPAD,
			CHARACTERISTIC.LED,
			onColor
		);

		// Wait for the specified duration
		await new Promise((resolve) => setTimeout(resolve, sec * 1000));
	};

	const turnOff_light = async (device: Module) => {
		await writeCharacteristic(
			device.deviceId,
			CHARACTERISTIC.IWING_TRAINERPAD,
			CHARACTERISTIC.LED,
			"AAAA"
		);
		console.log(`turning off ${device.deviceId}`);
	};

	const readCharacteristic = async (
		deviceId: string,
		serviceUUID: string,
		characteristicUUID: string
	) => {
		try {
			console.log("Reading from device: ", deviceId);
			console.log(
				"Reading from characteristic: ",
				characteristicUUID.toLowerCase()
			);
			const device = await bleManager.connectToDevice(deviceId);
			await device.discoverAllServicesAndCharacteristics();
			console.log("sender ", deviceId);
			console.log("Connected to device: ", deviceId);
			const value = await device.readCharacteristicForService(
				CHARACTERISTIC.IWING_TRAINERPAD,
				characteristicUUID
			);
			console.log("value: ", value.value);
			return base64toDec(value.value as string);
		} catch (error) {
			console.error(
				`Failed to read from characteristic: ${characteristicUUID}`,
				error
			);
			return null;
		}
	};

	useEffect(() => {
		// Cleanup on unmount
		return () => {
			bleManager.destroy();
		};
	}, [bleManager]);

	return (
		<BleManagerContext.Provider
			value={{
				bleManager,
				connectedDevices,
				module,
				setModule,
				setConnectedDevices,
				disconnectDevice,
				connectToDevice,
				writeCharacteristic,
				readCharacteristic,
				turnOn_light,
				turnOff_light,
			}}
		>
			{children}
		</BleManagerContext.Provider>
	);
};

export const useBleManager = () => {
	const context = useContext(BleManagerContext);
	if (context === undefined) {
		throw new Error("useBleManager must be used within a BleManagerProvider");
	}
	return context;
};
