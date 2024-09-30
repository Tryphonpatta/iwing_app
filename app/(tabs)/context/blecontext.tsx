import { CHARACTERISTIC } from "@/enum/characteristic";
import { Module } from "@/util/buttonType";
import { base64ToHex, hexstringtoDecimal } from "@/util/encode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BleManager } from "react-native-ble-plx";

interface BleManagerContextType {
  bleManager: BleManager;
  connectedDevices: Module[];
  setConnectedDevices: React.Dispatch<React.SetStateAction<Module[]>>;
  updateAllConnectedDevices: (deviceId: string) => void;
  disconnectDevice: (deviceId: string) => void;
  connectToDevice: (deviceId: string) => void;
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
      const isConnected = await bleManager.isDeviceConnected(deviceId);
      if (isConnected) {
        console.log(`Disconnecting from device: ${deviceId}`);
        await bleManager.cancelDeviceConnection(deviceId);
        setConnectedDevices((prev) =>
          prev.filter((device) => device.deviceId !== deviceId)
        );
        console.log(`Disconnected from device: ${deviceId}`);
      } else {
        console.log(`Device ${deviceId} is already disconnected`);
      }
    } catch (error) {
      console.error(`Failed to disconnect from device: ${deviceId}`, error);
    }
  };

  const updateAllConnectedDevices = async (deviceId: string) => {
    await bleManager.connectToDevice(deviceId);
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
        await connected[0].discoverAllServicesAndCharacteristics();
        const services = await connected[0].services();
        for (const service of services) {
          const characteristics = await service.characteristics();
          for (const characteristic of characteristics) {
            const value = await characteristic.read();
            console.log("Characteristic UUID:", characteristic.uuid);
            console.log("Value:", value.value);
            if (
              characteristic.uuid.toUpperCase() === CHARACTERISTIC.BATT_VOLTAGE
            ) {
              updatedModule.batteryVoltage = hexstringtoDecimal(
                base64ToHex(value.value as string)
              );
              console.log("Battery Voltage: ", updatedModule.batteryVoltage);
            }
            characteristicMap.set(
              characteristic.uuid.toUpperCase(),
              value.value as string
            );
          }
        }
        setConnectedDevices((prev) => {
          prev[index] = {
            deviceId: deviceId,
            batteryVoltage:
              hexstringtoDecimal(
                base64ToHex(
                  characteristicMap.get(CHARACTERISTIC.BATT_VOLTAGE) as string
                )
              ) || 0,
            bleManager: bleManager,
            battFull:
              hexstringtoDecimal(
                base64ToHex(
                  characteristicMap.get(CHARACTERISTIC.BATT_FULL) as string
                )
              ) === 1,
            battCharging:
              hexstringtoDecimal(
                base64ToHex(
                  characteristicMap.get(CHARACTERISTIC.BATT_CHARGING) as string
                )
              ) == 1,
            IR_RX_status:
              hexstringtoDecimal(
                base64ToHex(
                  characteristicMap.get(CHARACTERISTIC.IR_RX) as string
                )
              ) == 1,
            VIB_threshold:
              hexstringtoDecimal(
                base64ToHex(
                  characteristicMap.get(CHARACTERISTIC.VIB_THRES) as string
                )
              ) || 0,
            IR_TX_status:
              hexstringtoDecimal(
                base64ToHex(
                  characteristicMap.get(CHARACTERISTIC.IR_TX) as string
                )
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
        return prev;
      });
    }

    // console.log(connectedDevices);
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      const device = await bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      //   const isConnected = await bleManager.isDeviceConnected("deviceId");
      //   console.log("isConnected: ", isConnected);

      //   if (isConnected) {
      const characteristicMap = new Map<string, number>();
      const services = await device.services();
      console.log(services);
      for (const service of services) {
        // console.log("Service UUID:", service.uuid);
        const characteristics = await service.characteristics();

        for (const characteristic of characteristics) {
          // console.log("Characteristic UUID:", characteristic.uuid);
          // console.log("Is Readable:", characteristic.isReadable);

          const value = await characteristic.read();
          console.log("Value:", value.value);

          // Store the value in the characteristicMap
          characteristicMap.set(
            characteristic.uuid.toUpperCase(),
            hexstringtoDecimal(base64ToHex(value.value as string))
          );
        }
      }
      if (connectedDevices.find((e) => e.deviceId === device.id)) {
        console.log("found");
        const index = connectedDevices.findIndex(
          (e) => e.deviceId === device.id
        );
        const updatedModule = connectedDevices[index];
        updatedModule.batteryVoltage =
          characteristicMap.get(CHARACTERISTIC.BATT_VOLTAGE) || 0;
        setConnectedDevices((prev) => {
          prev[index] = updatedModule;
          return prev;
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
        return prev;
      });
      //   }
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
      const device = await bleManager.connectToDevice(deviceId);
      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        value
      );
    } catch (error) {
      console.error(
        `Failed to write to characteristic: ${characteristicUUID}`,
        error
      );
    }
  };

    useEffect(() => {
    // interval every 5 second
    const intervalID = setInterval(async () => {
      // have module more than 1 module
      if (connectedDevices.length > 0) {
        // find value every module 
        for (const device of connectedDevices)
        {
          await updateAllConnectedDevices(device.deviceId); // update value
        }
      }
    }, 5000);
    // Cleanup on unmount
    return () => {
      bleManager.destroy();
      clearInterval(intervalID);
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
