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
import { base64toDec, hexToBase64 } from "@/util/encode";

// type Module = {
//   batteryVoltage: number;
//   batteryCharging: boolean;
//   batteryFull: boolean;
//   buttonPressed: boolean;
//   vibration: boolean;
//   IR_RX: boolean;
//   mode: number;
//   device: Device;
// };

export class ConnectedDevice {
  device: Device;
  vibration: boolean = true;

  constructor(device: Device) {
    this.device = device;
  }

  async writeCharacteristic(
    characteristic: string,
    value: string
  ): Promise<void> {
    console.log("writing to characteristic");
    await this.device.writeCharacteristicWithResponseForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      characteristic,
      value
    );
  }

  async readCharacteristic(
    characteristic: string
  ): Promise<number | undefined> {
    const char = await this.device.readCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      characteristic
    );
    if (!char.value) {
      console.log("No data received");
      return;
    }
    return base64toDec(char.value as string);
  }

  async monitorVibration(): Promise<void> {
    this.device.monitorCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.VIBRATION,
      (error, characteristic) => {
        if (error) {
          console.log("Error monitoring characteristic", error);
          return;
        }
        if (!characteristic?.value) {
          console.log("No data received");
          return;
        }
        // console.log(
        //   "Characteristic value: ",
        //   base64toDec(characteristic.value as string)
        // );
        this.vibration = base64toDec(characteristic.value as string) === 1;
      }
    );
  }

  async blinkLED(colors: string[]) {
    for (let i = 0; i < 5; i++) {
      for (const color of colors) {
        await this.writeCharacteristic(CHARACTERISTIC.LED, color);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    await this.writeCharacteristic(CHARACTERISTIC.LED, "AAAA");
  }
}

interface BleContextType {
  allDevices: Device[];
  connectedDevice: (ConnectedDevice | null)[];
  requestPermissions: () => Promise<boolean>;
  scanForPeripherals: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  startStreamingData: (device: Device, characteristic: string) => Promise<void>;
  writeCharacteristic: (
    device: Device,
    characteristic: string,
    value: string
  ) => Promise<void>;
  swapConnectedDevice: (i: number, j: number) => void;
  disconnectDevice: (device: Device) => Promise<void>;
  monitorCharacteristic: (
    device: Device,
    setFunction: (data: any) => void,
    characteristic: string
  ) => Promise<Subscription | undefined>;
  monitorCharacteristicRef: (
    device: Device,
    value: any,
    characteristic: string
  ) => Promise<Subscription | undefined>;
}

const BleContext = createContext<BleContextType | undefined>(undefined);

const bleManager = new BleManager();

export const BleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<
    (ConnectedDevice | null)[]
  >([null, null, null, null, null]);

  const requestAndroid31Permissions = async () => {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];
    const results = await PermissionsAndroid.requestMultiple(permissions);

    return Object.values(results).every((result) => result === "granted");
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return await requestAndroid31Permissions();
      }
    } else {
      return true;
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      const index = connectedDevice.findIndex((d) => d === null);
      const tempDevices = connectedDevice;
      tempDevices[index] = new ConnectedDevice(deviceConnection);
      // await tempDevices[index]?.writeCharacteristic(CHARACTERISTIC.LED, "AAD/");
      if (index === 4) {
        await tempDevices[index]?.writeCharacteristic(
          CHARACTERISTIC.MODE,
          hexToBase64("00000002")
        );
        console.log("change mode");
        await tempDevices[index]?.writeCharacteristic(
          CHARACTERISTIC.MODE,
          hexToBase64("00000102")
        );
        console.log("write default");
      }
      tempDevices[index]?.monitorVibration();
      setConnectedDevice(tempDevices);
      // const sub = deviceConnection.monitorCharacteristicForService(
      //   CHARACTERISTIC.IWING_TRAINERPAD,
      //   CHARACTERISTIC.BUTTONS,
      //   (error, characteristic) => {
      //     if (error) {
      //       console.log("Error monitoring characteristic", error);
      //       console.log(JSON.stringify(error));
      //       return;
      //     }
      //     if (!characteristic?.value) {
      //       console.log("No data received");
      //       return;
      //     }
      //     console.log(
      //       "Characteristic value: ",
      //       base64toDec(characteristic.value as string)
      //     );
      //     // setButtonStatus(base64toDec(characteristic.value as string) === 1);
      //   }
      // );
      // await new Promise((resolve) => setTimeout(resolve, 10000));
      // sub.remove();
      // bleManager.stopDeviceScan();
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  useEffect(() => {
    console.log("Connected Device Updated:", connectedDevice);
  }, [connectedDevice]);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () => {
    console.log("scanning for peripherals");
    bleManager.startDeviceScan([], null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name === "Trainning_PAD") {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            console.log("ID: ", device.id);
            console.log("Name: ", device.name);
            console.log("-----------------------------");
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  };

  const onDataUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return;
    }
    console.log(characteristic.value);
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
    device: Device,
    characteristic: string,
    value: string
  ) => {
    try {
      console.log(`write device: ${device.id}`);
      if (device) {
        // await bleManager.writeCharacteristicWithoutResponseForDevice(
        //   device.id,
        //   CHARACTERISTIC.IWING_TRAINERPAD,
        //   characteristic,
        //   value
        // );
        console.log("Writing to characteristic");
        // await device.writeCharacteristicWithoutResponseForService(
        //   CHARACTERISTIC.IWING_TRAINERPAD,
        //   characteristic,
        //   value
        // );
        await device.writeCharacteristicWithResponseForService(
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

  const swapConnectedDevice = (i: number, j: number) => {
    setConnectedDevice((prevDevices) => {
      const newDevices = [...prevDevices];
      const temp = newDevices[i];
      newDevices[i] = newDevices[j];
      newDevices[j] = temp;
      return newDevices;
    });
  };

  const disconnectDevice = async (device: Device) => {
    try {
      await device.cancelConnection();
      console.log("Disconnected from device");
      console.log(connectedDevice);
      const tempDevices = connectedDevice;
      const index = tempDevices.findIndex((d) => d?.device.id === device.id);
      tempDevices[index] = null;
      console.log(tempDevices);
      setConnectedDevice(tempDevices);
    } catch (e) {
      console.log("Failed to disconnect from device", e);
    }
  };

  const monitorCharacteristic = async (
    device: Device,
    setFunction: (data: any) => void,
    characteristic: string
  ) => {
    try {
      console.log("monitor ", device.id);
      if (device) {
        console.log("Monitoring characteristic...))))))).....");
        await device.discoverAllServicesAndCharacteristics();
        const sub = device.monitorCharacteristicForService(
          CHARACTERISTIC.IWING_TRAINERPAD,
          characteristic,
          (error, characteristic) => {
            // console.log("Hello");
            if (error) {
              console.log("Error monitoring characteristic", error);
              console.log(JSON.stringify(error));
              return;
            }
            if (!characteristic?.value) {
              console.log("No data received");
              return;
            }
            console.log(
              "Characteristic value: ",
              base64toDec(characteristic.value as string)
            );
            setFunction(base64toDec(characteristic.value as string) === 1);
          }
        );
        console.log("monitored");
        return sub;
      }
    } catch (e) {
      console.log("Failed to monitor characteristic", e);
    }
  };
  const monitorCharacteristicRef = async (
    device: Device,
    value: any,
    characteristic: string
  ) => {
    try {
      console.log("monitor ", device.id);
      if (device) {
        // await device.discoverAllServicesAndCharacteristics();
        console.log("discovered");
        const sub = device.monitorCharacteristicForService(
          CHARACTERISTIC.IWING_TRAINERPAD,
          CHARACTERISTIC.BUTTONS,
          (error, characteristic) => {
            // console.log("Hello", device);
            if (error) {
              console.log("Error monitoring characteristic", error);
              console.log(JSON.stringify(error));
              return;
            }
            if (!characteristic?.value) {
              console.log("No data received");
              return;
            }
            // console.log(
            //   "Characteristic value: ",
            //   base64toDec(characteristic.value as string)
            // );
            value.current = base64toDec(characteristic.value as string);
            // console.log(value.current);
          }
        );
        console.log("monitored");
        return sub;
      }
    } catch (e) {
      console.log("Failed to monitor characteristic", e);
    }
  };
  return (
    <BleContext.Provider
      value={{
        allDevices,
        connectedDevice,
        requestPermissions,
        scanForPeripherals,
        connectToDevice,
        startStreamingData,
        writeCharacteristic,
        swapConnectedDevice,
        disconnectDevice,
        monitorCharacteristic,
        monitorCharacteristicRef,
      }}
    >
      {children}
    </BleContext.Provider>
  );
};

export const useBleManager = () => {
  const context = useContext(BleContext);
  if (!context) {
    throw new Error("useBle must be used within a BleProvider");
  }
  return context;
};
