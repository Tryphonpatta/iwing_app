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
import { CHARACTERISTIC, prefix } from "@/enum/characteristic";
import { connectingDevice } from "@/util/ble";
import { useModuleContext } from "./context/context";
import { useBleManager } from "./context/blecontext";

export default function BLE() {
  const { module, setModule } = useModuleContext();
  const { bleManager, connectedDevices, setConnectedDevices, connectToDevice } =
    useBleManager();
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);

  const startScan = async () => {
    setDeviceList([]); // Clear the list before starting a new scan
    console.log("Scanning...");
    setScanning(true);

    bleManager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        bleManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.log("Scan error:", error);
            return;
          }

          if (device) {
            setDeviceList((prev) => {
              // Check if device is already in the list
              const deviceExists = prev.some((d) => d.id === device.id);

              // Add the device to a new array if not already present and if it matches criteria
              if (
                !deviceExists &&
                (device.name != null ||
                  (device.serviceUUIDs &&
                    device.serviceUUIDs[0].startsWith(prefix)))
              ) {
                console.log(device.name, device.id);

                // Return a new array to trigger a re-render
                return [...prev, device];
              }

              // Return the previous array if no changes
              return prev;
            });
          }
        });
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
            <Card key={item.id}>
              <View>
                <Text>{item.id}</Text>
                <Text>{item.name ? item.name : "undefine"}</Text>
                <Button
                  onPress={() => {
                    connectToDevice(item.id);
                  }}
                >
                  Connect
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
        <Button
          onPress={() => {
            startScan();
          }}
        >
          {scanning ? "Scanning..." : "Start Scan"}
        </Button>
      </Layout>
    </ApplicationProvider>
  );
}
