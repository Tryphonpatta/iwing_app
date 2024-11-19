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
import { CHARACTERISTIC, prefix } from "../../enum/characteristic";
import { connectingDevice } from "../../util/ble";
import { useModuleContext } from "./context/context";
import { useBleManager } from "./context/blecontext";

export default function Explore() {
  const { module, setModule } = useModuleContext();
  const {
    connectToDevice,
    allDevices,
    connectedDevice,
    buttonStatus,
    requestPermissions,
    scanForPeripherals,
    startStreamingData,
    writeCharacteristic,
    swapConnectedDevice,
  } = useBleManager();
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [connectingDeviceList, setConnectingDeviceList] = useState<
    string | null
  >(null);
  const [scanning, setScanning] = useState<boolean>(false);

  const HomeScreen = ({ devices }: { devices: Device[] }) => {
    return (
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text category="h1">HOME</Text>
        <List
          data={allDevices}
          renderItem={({ item }) => (
            <Card key={item.id}>
              <View>
                <Text>{item.id}</Text>
                <Text>{item.name ? item.name : "undefine"}</Text>
                <Button
                  onPress={() => {
                    connectToDevice(item);
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
            scanForPeripherals();
          }}
        >
          {scanning ? "Scanning..." : "Start Scan"}
        </Button>
      </Layout>
    </ApplicationProvider>
  );
}
