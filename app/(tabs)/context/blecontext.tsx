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
		try {
			console.log(`Checking if device ${deviceId} is connected...`);
			const isConnected = await bleManager.isDeviceConnected(deviceId);
			console.log(`Is device ${deviceId} connected: `, isConnected);

			if (isConnected) {
				console.log(`Attempting to disconnect from device: ${deviceId}`);

				// Cancel the device connection
				await bleManager.cancelDeviceConnection(deviceId);
				console.log("Disconnected from device: ", deviceId);

				// Remove the device from the connectedDevices array
				setConnectedDevices((prev) =>
					prev.filter((device) => device.deviceId !== deviceId)
				);
			} else {
				console.log(`Device ${deviceId} is not connected.`);
			}
		} catch (error) {
			console.error("Failed to disconnect from device: ", deviceId, error);
		}
	};

	const connectToDevice = async (deviceId: string) => {
		try {
			console.log(`Connecting to device: ${deviceId}`);
			const isConnected = await bleManager.isDeviceConnected(deviceId);
			if (isConnected) {
				console.log(`Device ${deviceId} is already connected.`);
				return;
			}

			const device = await bleManager.connectToDevice(deviceId);
			console.log(`Connected to device: ${deviceId}`);

			await device.discoverAllServicesAndCharacteristics();

			const characteristicMap = new Map<string, number>();
			const services = await device.services();
			for (const service of services) {
				const characteristics = await service.characteristics();

				for (const characteristic of characteristics) {
					if (!characteristic.isReadable) {
						continue;
					}
					console.log("Characteristic UUID:", characteristic.uuid);
					const value = await characteristic.read();
					console.log("Values:", base64toDec(value.value as string));

					// Store the value in the characteristicMap
					characteristicMap.set(
						characteristic.uuid.toUpperCase(),
						base64toDec(value.value as string)
					);
				}
			}

			const existingDevice = connectedDevices.find(
				(e) => e.deviceId === device.id
			);
			if (existingDevice) {
				console.log("Device already exists in connectedDevices.");
				const index = connectedDevices.findIndex(
					(e) => e.deviceId === device.id
				);
				const updatedModule = connectedDevices[index];
				updatedModule.batteryVoltage =
					characteristicMap.get(CHARACTERISTIC.BATT_VOLTAGE) || 0;
				setConnectedDevices((prev) => {
					const newDevices = [...prev];
					newDevices[index] = updatedModule;
					return newDevices;
				});
			} else {
				console.log("Adding new device to connectedDevices.");
				const batteryVoltageValue = characteristicMap.get(
					CHARACTERISTIC.BATT_VOLTAGE
				);
				setConnectedDevices((prev) => [
					...prev,
					{
						deviceId: deviceId,
						batteryVoltage: batteryVoltageValue || 0,
						bleManager: bleManager,
						battFull: false,
						battCharging: false,
						IR_RX_status: false,
						VIB_threshold: 0,
						IR_TX_status: false,
						music: "",
						device: device, // Store the device object
					},
				]);
			}
		} catch (error) {
			console.error(`Failed to connect to device: ${deviceId}`, error);
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

			// Retrieve the device from connectedDevices
			const deviceEntry = connectedDevices.find(
				(device) => device.deviceId === deviceId
			);

			if (!deviceEntry) {
				console.error(`Device ${deviceId} not found in connected devices.`);
				return;
			}

			const device = deviceEntry.device;

			const isConnected = await device.isConnected();
			if (!isConnected) {
				console.log(`Device ${deviceId} is not connected. Reconnecting...`);
				await device.connect();
				await device.discoverAllServicesAndCharacteristics();
			}

			await device.writeCharacteristicWithResponseForService(
				serviceUUID,
				characteristicUUID.toLowerCase(),
				value
			);
			console.log(`Successfully wrote to characteristic on device ${deviceId}`);
		} catch (error) {
			console.error(
				`Failed to write to characteristic: ${characteristicUUID}`,
				error
			);
		}
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

			// Retrieve the device from connectedDevices
			const deviceEntry = connectedDevices.find(
				(device) => device.deviceId === deviceId
			);

			if (!deviceEntry) {
				console.error(`Device ${deviceId} not found in connected devices.`);
				return null;
			}

			const device = deviceEntry.device;

			const isConnected = await device.isConnected();
			if (!isConnected) {
				console.log(`Device ${deviceId} is not connected. Reconnecting...`);
				await device.connect();
				await device.discoverAllServicesAndCharacteristics();
			}

			const characteristic = await device.readCharacteristicForService(
				serviceUUID,
				characteristicUUID
			);
			console.log("Characteristic value: ", characteristic.value);
			return base64toDec(characteristic.value as string);
		} catch (error) {
			console.error(
				`Failed to read from characteristic: ${characteristicUUID}`,
				error
			);
			return null;
		}
	};

	// Function to turn on LED light
	const turnOn_light = async (device: Module, sec: number, color: string) => {
		try {
			console.log(
				`Turning on ${device.deviceId} ${color} light for ${sec} seconds`
			);

			// Define color codes
			const redColor = "/wAB";
			const blueColor = "AAD/";
			const offColor = "AAAA";

			// Choose color based on input
			const onColor = color === "blue" ? blueColor : redColor;

			await writeCharacteristic(
				device.deviceId,
				CHARACTERISTIC.IWING_TRAINERPAD,
				CHARACTERISTIC.LED,
				onColor
			);

			// Wait for the specified duration
			await new Promise((resolve) => setTimeout(resolve, sec * 1000));
		} catch (error) {
			console.error(
				`Error turning on light for device ${device.deviceId}:`,
				error
			);
		}
	};

	const turnOff_light = async (device: Module) => {
		try {
			await writeCharacteristic(
				device.deviceId,
				CHARACTERISTIC.IWING_TRAINERPAD,
				CHARACTERISTIC.LED,
				"AAAA"
			);
			console.log(`Turning off ${device.deviceId}`);
		} catch (error) {
			console.error(
				`Error turning off light for device ${device.deviceId}:`,
				error
			);
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
