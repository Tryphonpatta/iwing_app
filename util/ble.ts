import { CHARACTERISTIC } from "@/enum/characteristic";
import { BleManager } from "react-native-ble-plx";

export const connectingDevice = async (
  bleManager: BleManager,
  deviceId: string,
  setConnectingDeviceList: (value: React.SetStateAction<string | null>) => void
) => {
  console.log("Connecting to", deviceId);
  setConnectingDeviceList(deviceId);
  await bleManager.connectToDevice(deviceId).then(async (device) => {
    console.log("Connected to device:", device.name);

    // Add your logic for handling the connected device
    await readCharacteristic(
      bleManager,
      deviceId,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.BATT_VOLTAGE
    );
    return device.discoverAllServicesAndCharacteristics();
  });
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
