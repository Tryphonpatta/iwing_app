import { CHARACTERISTIC } from "../../../enum/characteristic";
import { Module } from "../../../util/buttonType";
import { base64toDec } from "../../../util/encode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";

interface BleManagerContextType {
  bleManager: BleManager;
  connectedDevices: Module[];
  setConnectedDevices: React.Dispatch<React.SetStateAction<Module[]>>;
  updateAllConnectedDevices: (deviceId: string) => void;
  disconnectDevice: (deviceId: string) => void;
  connectToDevice: (deviceId: string) => void;
  blink: (device: Module) => void;
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
  ) => Promise<number | undefined>;
  turnOn_light: (device: Module, sec: number, color: string) => void;
  // Add other functions as needed
}

const BleManagerContext = createContext<BleManagerContextType | undefined>(
  undefined
);

export const BleManagerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bleManager] = useState(new BleManager());
  const [connectedDevices, setConnectedDevices] = useState<Module[]>([]);

  const disconnectDevice = async (deviceId: string) => {
    try {
      // Check if the device is currently connected
      const isConnected = await bleManager.isDeviceConnected(deviceId);
      console.log(`Is device ${deviceId} connected: `, isConnected);

      if (isConnected) {
        console.log(`Attempting to disconnect from device: ${deviceId}`);

        // Cancel the device connection
        const result = await bleManager.cancelDeviceConnection(deviceId);
        console.log("Result from cancelDeviceConnection:", result);

        // Remove the device from the connectedDevices array using a new array
        setConnectedDevices((prev) =>
          prev.filter((device) => device.deviceId !== deviceId).filter(Boolean)
        );

        console.log(`Successfully disconnected from device: ${deviceId}`);
      } else {
        console.log(`Device ${deviceId} is already disconnected or not found`);
      }
    } catch (error) {
      console.error(`Failed to disconnect from device: ${deviceId}`, error);
    }
  };
  const blink = async (device: Module) => {
    console.log("Blinking");
    let redLight = true;
    const redColor = "/wAB";
    const blueColor = "AAD/";
    for (let i = 0; i < 10; i++) {
      await writeCharacteristic(
        device.deviceId,
        CHARACTERISTIC.IWING_TRAINERPAD,
        CHARACTERISTIC.LED,
        redLight ? redColor : blueColor
      );
      redLight = !redLight;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    //turn off the led light
    await writeCharacteristic(
      device.deviceId,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.LED,
      "AAAA"
    );
  };

  //ws test function for turning on LED light
  const turnOn_light = async (device: Module, sec: number, color: string) => {
    console.log(`Turning on ${color} light for ${sec} minute`);
    const redColor = "/wAB";
    const blueColor = "AAD/";
    if (color === "blue") {
      color = blueColor;
    } else if (color === "red") {
      color = redColor;
    }

    await writeCharacteristic(
      device.deviceId,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.LED,
      color
    );
    //turn
    await new Promise((resolve) => setTimeout(resolve, sec * 1000));
    console.log(`Turning off ${color} light after ${sec} minute`);
  };
  const updateAllConnectedDevices = async (deviceId: string) => {
    const device = await bleManager.connectToDevice(deviceId);
    const connected = await bleManager.connectedDevices([
      CHARACTERISTIC.IWING_TRAINERPAD,
    ]);
    const isConnected = await bleManager.isDeviceConnected(deviceId);
    console.log("isConnected: ", isConnected);
    const characteristicMap = new Map<string, string>();
    if (isConnected) {
      if (connectedDevices.find((device) => device.deviceId === deviceId)) {
        const index = connectedDevices.findIndex(
          (device) => device.deviceId === deviceId
        );
        const updatedModule = connectedDevices[index];
        await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();
        for (const service of services) {
          const characteristics = await service.characteristics();
          for (const characteristic of characteristics) {
            const value = await characteristic.read();
            console.log("Characteristic UUID:", characteristic.uuid);
            console.log("Value:", value.value);
            if (
              characteristic.uuid.toUpperCase() === CHARACTERISTIC.BATT_VOLTAGE
            ) {
              updatedModule.batteryVoltage = base64toDec(value.value as string);
              console.log("Battery Voltage: ", updatedModule.batteryVoltage);
            }
            characteristicMap.set(
              characteristic.uuid.toUpperCase(),
              value.value as string
            );
          }
        }
        setConnectedDevices((prev) => {
          console.log(
            base64toDec(characteristicMap.get(CHARACTERISTIC.IR_RX) as string)
          );
          prev[index] = {
            deviceId: deviceId,
            batteryVoltage: base64toDec(
              characteristicMap.get(CHARACTERISTIC.BATT_VOLTAGE) as string
            ),
            bleManager: bleManager,
            battFull:
              base64toDec(
                characteristicMap.get(CHARACTERISTIC.BATT_FULL) as string
              ) == 1,

            battCharging:
              base64toDec(
                characteristicMap.get(CHARACTERISTIC.BATT_CHARGING) as string
              ) == 1,
            IR_RX_status:
              base64toDec(
                characteristicMap.get(CHARACTERISTIC.IR_RX) as string
              ) == 1,
            VIB_threshold:
              base64toDec(
                characteristicMap.get(CHARACTERISTIC.VIB_THRES) as string
              ) || 0,
            IR_TX_status:
              base64toDec(
                characteristicMap.get(CHARACTERISTIC.IR_TX) as string
              ) == 1,
            music: characteristicMap.get(CHARACTERISTIC.MUSIC) || "",
          };
          return prev;
        });
        return;
      }
      setConnectedDevices((prev) => {
        prev.push({
          deviceId: deviceId,
          batteryVoltage: 0,
          bleManager: bleManager,
          battFull: false,
          battCharging: false,
          IR_RX_status: false,
          VIB_threshold: 0,
          IR_TX_status: false,
          music: "",
        });
        return prev.filter(Boolean);
      });
    }

    // console.log(connectedDevices);
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

  const readCharacteristic = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ) => {
    try {
      console.log(
        "Reading from characteristic: ",
        characteristicUUID.toLowerCase()
      );
      const device = await bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      console.log("Connected to device: ", deviceId);

      const service = await device
        .services()
        .then((services) => services.find((s) => s.uuid === serviceUUID));
      if (!service) {
        console.error(`Service ${serviceUUID} not found`);
        return 0;
      }

      const characteristic = await service
        .characteristics()
        .then((characteristics) =>
          characteristics.find((c) => c.uuid === characteristicUUID)
        );
      if (!characteristic) {
        console.error(`Characteristic ${characteristicUUID} not found`);
        return 0;
      }
      const value = await characteristic.read();
      console.log("Value: ", value);
      return base64toDec(value.value as string);
    } catch (error) {
      console.error(
        `Failed to read from characteristic: ${characteristicUUID}`,
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
        setConnectedDevices,
        updateAllConnectedDevices,
        disconnectDevice,
        connectToDevice,
        writeCharacteristic,
        readCharacteristic,
        blink,
        turnOn_light,
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
