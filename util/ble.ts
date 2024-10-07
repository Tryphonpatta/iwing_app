import { CHARACTERISTIC } from "@/enum/characteristic";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { Module } from "./buttonType";
import { base64toDec, base64ToHex, hexstringtoDecimal } from "./encode";

export const requestBluetoothPermission = async () => {
  if (Platform.OS === "ios") {
    return true;
  }
  if (
    Platform.OS === "android" &&
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  ) {
    const apiLevel = parseInt(Platform.Version.toString(), 10);

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.ACCESS_FINE_LOCATION"] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
  }

  console.log("Permission have not been granted");

  return false;
};

export const connectingDevice = async (
  bleManager: BleManager,
  deviceId: string,
  setConnectingDeviceList: (value: React.SetStateAction<string | null>) => void,
  module: Module[],
  setModule: React.Dispatch<React.SetStateAction<Module[]>>
) => {
  console.log("Connecting to", deviceId);
  setConnectingDeviceList(deviceId);

  try {
    const device = await bleManager.connectToDevice(deviceId);
    console.log("Connected to device:", device.name);

    await device.discoverAllServicesAndCharacteristics();
    const services = await device.services();
    console.log("Services:", services);

    // Create a map to store characteristic values
    const characteristicMap = new Map();

    // Read each characteristic
    for (const service of services) {
      // console.log("Service UUID:", service.uuid);
      const characteristics = await service.characteristics();

      for (const characteristic of characteristics) {
        // console.log("Characteristic UUID:", characteristic.uuid);
        // console.log("Is Readable:", characteristic.isReadable);

        if (characteristic.isReadable) {
          const value = await characteristic.read();
          console.log("Value:", base64toDec(value.value as string));
          console.log();
          // Store the value in the characteristicMap
          characteristicMap.set(
            characteristic.uuid.toUpperCase(),
            base64toDec(value.value as string)
          );
        }
      }
    }

    // Now that we have read all values, we can set the module state
    const batteryVoltageValue = characteristicMap.get(
      CHARACTERISTIC.BATT_VOLTAGE
    );

    if (!module.find((e) => e.deviceId === device.id)) {
      setModule((prev) => [
        ...prev,
        {
          deviceId: device.id,
          batteryVoltage: batteryVoltageValue,
          bleManager: bleManager,
          battFull: false,
          battCharging: false,
          IR_RX_status: false,
          VIB_threshold: 0,
          IR_TX_status: false,
          music: "",
        },
      ]);
      console.log("set module with battery voltage:", batteryVoltageValue);
    }
  } catch (error) {
    console.error("Error connecting to device:", error);
  }
};

const readCharacteristic = async (
  bleManager: BleManager,
  deviceId: string,
  serviceUUID: string,
  characteristicUUID: string
) => {
  const readData = await bleManager
    .readCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID)
    .then((readData) => {
      console.log("Data Read from the BLE device:", readData);
    })
    .catch((error) => {
      console.log("Error while reading data from BLE device:", error);
    });
};

export const disconnectDevice = async (
  bleManager: BleManager,
  deviceId: string,
  setModule: React.Dispatch<React.SetStateAction<Module[]>>
) => {
  try {
    // Check if the device is connected before attempting to disconnect
    const connectedDevice = await bleManager.isDeviceConnected(deviceId);
    await bleManager.cancelDeviceConnection(deviceId);

    if (connectedDevice) {
      console.log(`Disconnecting from device: ${deviceId}`);

      // Attempt to disconnect the device
      await bleManager.cancelDeviceConnection(deviceId);
      console.log(`Disconnected from device: ${deviceId}`);

      // Update the connected devices state

      // Optionally, update your module state
      setModule((prev) =>
        prev.filter((module) => module.deviceId !== deviceId)
      );
    } else {
      console.log(`Device ${deviceId} is already disconnected`);
    }
  } catch (error) {
    console.error(`Failed to disconnect from device: ${deviceId}`, error);
  }
};
