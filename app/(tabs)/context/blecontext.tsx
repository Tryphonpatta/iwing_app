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
  private isActive: boolean = true;
  private vibrationListener: ((state: boolean) => void)[] = [];
  private activityTimeout: NodeJS.Timeout | null = null; // Timer for inactivity
  private isMonitoringActivity: boolean = false;
  version: number = 0;
  // private timer: number;

  constructor(device: Device) {
    this.device = device;
    // this.timer = 5; // Set timeout duration to 5 seconds
    // this.startInactivityMonitor();
  }

  // private resetInactivityTimer() {
  //   if (this.activityTimeout) {
  //     clearTimeout(this.activityTimeout);
  //   }
  //   this.activityTimeout = setTimeout(async () => {
  //     console.log(
  //       `No activity detected for ${this.timer} seconds, changing mode...`
  //     );
  //     await this.changeMode(0, 0, 0, 4); // Adjust mode parameters as needed
  //   }, this.timer * 1000);
  // }

  // private startInactivityMonitor() {
  //   if (this.isMonitoringActivity) return;
  //   this.isMonitoringActivity = true;
  //   this.resetInactivityTimer(); // Start the timer initially
  // }

  async writeCharacteristic(
    characteristic: string,
    value: string
  ): Promise<void> {
    // this.resetInactivityTimer(); // Reset timer
    await this.changeActive();
    // console.log("writing to characteristic");
    await this.device.writeCharacteristicWithResponseForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      characteristic,
      value
    );
  }

  async readCharacteristic(
    characteristic: string
  ): Promise<number | undefined> {
    // this.resetInactivityTimer(); // Reset timer
    await this.changeActive();
    const char = await this.device.readCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      characteristic
    );
    if (!char.value) {
      console.log("No data received");
      return;
    }
    console.log("version", char.value);
    return base64toDec(char.value as string);
  }

  async monitorVibration(): Promise<void> {
    // this.resetInactivityTimer(); // Reset timer

    console.log("monitoring vibration");
    this.device.monitorCharacteristicForService(
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.VIBRATION,
      async (error, characteristic) => {
        if (error) {
          console.log("Error monitoring characteristic", error);
          return;
        }
        if (!characteristic?.value) {
          console.log("No data received");
          return;
        }
        console.log("Vibration: ", base64toDec(characteristic.value as string));
        const newState = base64toDec(characteristic.value as string) >= 1;
        if (newState) {
          await this.beep();
          await this.writeCharacteristic(CHARACTERISTIC.MUSIC, "");
        }
        this.vibration = newState;
        this.vibrationListener.forEach((listener) => listener(newState));
      }
    );
  }
  async beep() {
    await this.changeActive();
    await this.writeCharacteristic(CHARACTERISTIC.MUSIC, "QwJSAkMCUgJDAlIC");
  }
  async waitForVibration(): Promise<void> {
    // this.resetInactivityTimer(); // Reset timer
    return new Promise((resolve) => {
      const listener = (state: boolean) => {
        if (state) {
          resolve();
          this.vibrationListener = this.vibrationListener.filter(
            (l) => l !== listener
          );
        }
      };
      this.vibrationListener.push(listener);
    });
  }

  async blinkLED(colors: string[]) {
    // this.resetInactivityTimer(); // Reset timer
    await this.changeActive();
    await this.writeCharacteristic(CHARACTERISTIC.MUSIC, "QwJSAkMCUgJDAlIC");
    for (let i = 0; i < 5; i++) {
      for (const color of colors) {
        await this.writeCharacteristic(CHARACTERISTIC.LED, color);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    await this.writeCharacteristic(CHARACTERISTIC.LED, "AAAA");
    await this.writeCharacteristic(CHARACTERISTIC.MUSIC, "");
  }

  async changeMode(a: number, b: number, c: number, d: number) {
    // this.resetInactivityTimer(); // Reset timer
    console.log(`Changing mode to: ${a}, ${b}, ${c}, ${d}`);
    await this.writeCharacteristic(
      CHARACTERISTIC.MODE,
      hexToBase64(`0${a}0${b}0${c}0${d}`)
    );
  }

  async readVersion() {
    const version = await this.readCharacteristic(CHARACTERISTIC.MODE);

    if (!version) return;
    console.log("Version: ", version % (16 * 16));
  }

  async changeRest() {
    await this.changeMode(0, 0, 0, 4);
    this.isActive = false;
  }

  async changeActive() {
    if (this.isActive) return;
    this.isActive = true;
    await this.changeMode(0, 0, 0, 0);

    // this.resetInactivityTimer();
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
  stopDeviceScan: () => void;
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
      console.log("set mode");
      // await tempDevices[index]?.writeCharacteristic(CHARACTERISTIC.LED, "AAD/");
      if (index === 4) {
        await tempDevices[index]?.writeCharacteristic(
          CHARACTERISTIC.MODE,
          hexToBase64("00000002")
        );
        //   console.log("change mode");
      }
      // await Promise.all([
      //   tempDevices[index]?.monitorVibration(),
      //   tempDevices[index]?.readVersion(),
      //   tempDevices[index]?.changeMode(0, 0, 0, 4),
      // ]);
      await Promise.all([
        tempDevices[index]?.monitorVibration(),
        tempDevices[index]?.readVersion(),
        tempDevices[index]?.changeRest(),
      ]);
      // await tempDevices[index]?.monitorVibration();
      // await tempDevices[index]?.readVersion();
      // await tempDevices[index]?.changeRest();
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      // await tempDevices[index]?.changeMode(0, 0, 0, 0);
      // await tempDevices[index]?.changeMode(0, 0, 0, 4);
      setConnectedDevice(tempDevices);
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
    const deviceId = [
      "894FFD97-2AA7-BAE7-A394-FB7606D8F144",
      "100351E2-4451-67E4-2539-65A9A65513EE",
      "57283496-587F-CFE2-570B-DB088FDAD43A",
      "F1A86E12-6977-CFC6-3396-E23230DBB7FF",
      "90619FED-76EF-EA85-D468-B3CD3A2631BE",
    ];
    bleManager.startDeviceScan([], null, (error, device) => {
      if (error) {
        console.log(error);
      }
      // if (
      //   device &&
      //   device.name === "Trainning_PAD" &&
      //   deviceId.includes(device.id)
      // ) {

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
  const stopDeviceScan = async () => {
    await bleManager.stopDeviceScan();
    setAllDevices([]);
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
        // // );
        // console.log("Writing to characteristic");
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
        stopDeviceScan,
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
