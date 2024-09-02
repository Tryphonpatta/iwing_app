import React, { useEffect, useState } from "react";
import * as eva from "@eva-design/eva";
import {
  ApplicationProvider,
  Button,
  Layout,
  Text,
  List,
} from "@ui-kitten/components";
import { BleManager, Device, State } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";

const HomeScreen = ({ devices }: { devices: string[] }) => (
  <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text category="h1">HOME</Text>
    <List data={devices} renderItem={({ item }) => <Text>{item}</Text>} />
  </Layout>
);

export default function Explore() {
  const bleManager = new BleManager();
  const [deviceList, setDeviceList] = useState<string[]>([]);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);

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
                if (!prev.includes(device.id)) {
                  console.log(device.name, device.id);
                  return [...prev, device.id];
                }
                return prev;
              });
            }
          }
        );
      }
    }, true);
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
