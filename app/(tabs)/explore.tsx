import React, { useEffect, useState } from "react";
import * as eva from "@eva-design/eva";
import {
  ApplicationProvider,
  Button,
  Layout,
  Text,
  List,
  Card,
} from "@ui-kitten/components";
import { BleManager, Device, State } from "react-native-ble-plx";
import { PermissionsAndroid, Platform, View } from "react-native";
import { CHARACTERISTIC } from "@/enum/characteristic";
import { connectingDevice } from "@/util/ble";

export default function Explore() {
  const bleManager = new BleManager();
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [connectingDeviceList, setConnectingDeviceList] = useState<
    string | null
  >(null);
  const [scanning, setScanning] = useState<boolean>(false);

  // const connectingDevice = async (deviceId: string) => {
  //   console.log("Connecting to", deviceId);
  //   setConnectingDeviceList(deviceId);
  //   await bleManager.connectToDevice(deviceId).then(async (device) => {
  //     console.log("Connected to device:", device.name);

  //     // Add your logic for handling the connected device
  //     await readCharacteristic(
  //       deviceId,
  //       CHARACTERISTIC.IWING_TRAINERPAD,
  //       CHARACTERISTIC.BATT_VOLTAGE
  //     );
  //     return device.discoverAllServicesAndCharacteristics();
  //   });
  // };
  // const readCharacteristic = async (
  //   deviceId: string,
  //   serviceUUID: string,
  //   characteristicUUID: string
  // ) => {
  //   const readData = await bleManager
  //     .readCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID)
  //     .then((readData) => {
  //       console.log("Data Read from the BLE device:", readData);
  //     })
  //     .catch((error) => {
  //       console.log("Error while reading data from BLE device:", error);
  //     });
  // };

  const startScan = async () => {
    setDeviceList([]);
    console.log("Scanning...");
    setScanning(true);
    bleManager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        bleManager.startDeviceScan(
          null,
          null,
          (error, device: Device | null) => {
            // console.log(".");
            if (error) {
              console.log("Scan error:", error);
              return;
            }
            if (device) {
              setDeviceList((prev) => {
                if (
                  !prev.find((e) => e.id == device.id) &&
                  device.name != null
                ) {
                  console.log(device.name, device.id);
                  return [...prev, device];
                }
                return prev;
              });
            }
          }
        );
      }
    }, true);
  };
  const HomeScreen = ({ devices }: { devices: Device[] }) => {
    return (
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text category="h1">HOME</Text>
        <List
          data={devices}
          renderItem={({ item }) => (
            <Card>
              <View>
                <Text>{item.id}</Text>
                <Text>{item.name ? item.name : "undefine"}</Text>
                <Button
                  onPress={async () => {
                    await connectingDevice(
                      bleManager,
                      item.id,
                      setConnectingDeviceList
                    );
                  }}
                >
                  connect
                </Button>
              </View>
            </Card>
          )}
        />
      </Layout>
    );
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text category="h4">BLE Devices:</Text>
        <HomeScreen devices={deviceList} />
        <Button onPress={startScan}>
          {scanning ? "Scanning..." : "Start Scan"}
        </Button>
      </Layout>
    </ApplicationProvider>
  );
}
