import { CHARACTERISTIC } from "@/enum/characteristic";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { Module } from "./buttonType";

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
  await bleManager.connectToDevice(deviceId).then(async (device) => {
    console.log("Connected to device:", device.name);

    await device.discoverAllServicesAndCharacteristics();
    const services = await device.services();
    console.log("Services:", services);
    // Add your logic for handling the connected device
    await device.services().then((services) => {
      services.forEach((service) => {
        console.log("Service UUID:", service.uuid);
        service.characteristics().then((characteristics) => {
          characteristics.forEach(async (characteristic) => {
            console.log("Characteristic UUID:", characteristic.uuid);
            console.log("Is Readable:", characteristic.isReadable);
            if (characteristic.isReadable) {
              const value = await characteristic.read();
              console.log("uuid: ", characteristic.uuid);
              console.log("Value:", value.value);
            }
          });
        });
      });
    });
    await readCharacteristic(
      bleManager,
      deviceId,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.BATT_VOLTAGE
    );
    if (!module.find((e) => e.deviceId == device.id)) {
      setModule((prev) => {
        return [
          ...prev,
          {
            deviceId: device.id,
            batteryVoltage: 0,
            bleManager: bleManager,
            battFull: false,
            battCharging: false,
            IR_RX_status: false,
            VIB_threshold: 0,
            IR_TX_status: false,
            music: "",
          },
        ];
      });
      console.log("set module");
    }
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
