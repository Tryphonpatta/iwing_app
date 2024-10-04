import React from "react";
import {
  ApplicationProvider,
  Button,
  Layout,
  Text,
} from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { useModuleContext } from "./context/context";
import { disconnectDevice } from "../../util/ble";
import { useBleManager } from "./context/blecontext";
import { View } from "react-native";
import { CHARACTERISTIC } from "../../enum/characteristic";

export default function App() {
  const {
    bleManager,
    connectedDevices,
    setConnectedDevices,
    updateAllConnectedDevices,
    disconnectDevice,
    writeCharacteristic,
  } = useBleManager();
  console.log("app : ", module);
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Welcome to UI Kitten</Text>
        {/* <Button
          onPress={() => {
          }}
        >
          Print Module
        </Button> */}
        {connectedDevices.map((item, index) => {
          return (
            <View key={index}>
              <Text>{item.deviceId}</Text>
              <Text>{item.batteryVoltage}</Text>
              <Button
                onPress={() => {
                  disconnectDevice(item.deviceId);
                }}
              >
                Disconnect
              </Button>
              <Button
                onPress={() => {
                  updateAllConnectedDevices(item.deviceId);
                }}
              >
                Update
              </Button>
              <Button
                onPress={() => {
                  writeCharacteristic(
                    item.deviceId,
                    CHARACTERISTIC.IWING_TRAINERPAD.toLowerCase(),
                    CHARACTERISTIC.LED,
                    "AP8A"
                  );
                }}
              >
                Test
              </Button>
            </View>
          );
        })}
        <Button
          onPress={() => {
            setConnectedDevices([]);
          }}
        >
          Clear
        </Button>
      </Layout>
    </ApplicationProvider>
  );
}
