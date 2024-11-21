import { CHARACTERISTIC } from "../../../enum/characteristic";
import { Module } from "../../../util/buttonType";
import { base64toDec } from "../../../util/encode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  Subscription,
} from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";
import { CHARACTERISTIC } from "@/enum/characteristic";

type ConnectedDevice = Device | null;

interface BleContextType {
  allDevices: Device[];
  connectedDevice: ConnectedDevice[];
  buttonStatus: Boolean | null;
  requestPermissions: () => Promise<boolean>;
  scanForPeripherals: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  startStreamingData: (device: Device, characteristic: string) => Promise<void>;
  writeCharacteristic: (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ) => Promise<void>;
  readCharacteristic: (
    device: Device,
    characteristic: string
  ) => Promise<number | null>;
  swapConnectedDevice: (i: number, j: number) => void;
  disconnectDevice: (device: Device) => Promise<void>;
  monitorCharacteristic: (
    device: Device,
    characteristicId: string
  ) => Promise<Subscription | null>;
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
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return;
    }
    console.log(characteristic.value)
    // const buffer = Buffer.from(characteristic.value, "base64");
    // if (buffer.readUInt8(0)) {
    //   console.log("*** Button pressed");
    //   setButtonStatus(true);
    // } else {
    //   console.log("*** Button released");
    //   setButtonStatus(false);
    // }
  };

  const startStreamingData = async (device: Device, characteristic: string) => {
    if (device) {
      await device.discoverAllServicesAndCharacteristics();

      const sub = device.monitorCharacteristicForService(
        CHARACTERISTIC.IWING_TRAINERPAD,
        characteristic,
        onDataUpdate
      );
    } else {
      console.log("No Device Connected");
    }
  };

  const writeCharacteristic = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ) => {
    try {
      if (device) {
        device.writeCharacteristicWithResponseForService(
          CHARACTERISTIC.IWING_TRAINERPAD,
          characteristic,
          value
        );
        console.log("Data written to characteristic");
      } else {
        console.log("No Device Connected");
      }
    } catch (e) {
      console.log("Failed to write to characteristic", e);
    }
  };

  const readCharacteristic = async (
    deviceId: Device,
    characteristicUUID: string
  ) => {
    try {
      console.log("Reading from device: ", deviceId);
      console.log(
        "Reading from characteristic: ",
        characteristicUUID.toLowerCase()
      );
      const device = await bleManager.connectToDevice(deviceId.id);
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

  const swapConnectedDevice = (i: number, j: number) => {
    setConnectedDevice((prevDevices) => {
      const newDevices = [...prevDevices];
      const temp = newDevices[i];
      newDevices[i] = newDevices[j];
      newDevices[j] = temp;
      return newDevices;
    });
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

  const monitorCharacteristic = async (
    device: Device,
    characteristicId: string
  ) => {
    // const isConnected = await bleManager.isDeviceConnected(device.id);
    // console.log("isConnected: ", isConnected);
    console.log(device.id);
    const deviceId = device.id;
    const devices = await bleManager.connectToDevice(deviceId);

    const subscription = devices.monitorCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      characteristicId,
      (error, characteristic) => {
        if (error) {
          console.error("Failed to monitor characteristic: ", error);
          return;
        }
        console.log("Received characteristic: ", characteristic);
      }
    );
    return subscription;
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
        swapConnectedDevice,
        disconnectDevice,
        monitorCharacteristic,
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
