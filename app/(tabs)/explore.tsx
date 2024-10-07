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

export default function Explore() {
  const { module, setModule } = useModuleContext();
  const { bleManager, connectedDevices, setConnectedDevices, connectToDevice } =
    useBleManager();
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [connectingDeviceList, setConnectingDeviceList] = useState<
    string | null
  >(null);
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
                if (
                  (!prev.find((e) => e.id == device.id) &&
                    device.name != null) ||
                  (device.serviceUUIDs &&
                    device.serviceUUIDs[0].startsWith(prefix))
                ) {
                  prev.push(device);
                  console.log(device.name, device.id);
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
            <Card key={item.id}>
              <View>
                <Text>{item.id}</Text>
                <Text>{item.name ? item.name : "undefine"}</Text>
                <Button
                  onPress={() => {
                    connectToDevice(item.id);
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
