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
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { CHARACTERISTIC } from "@/enum/characteristic";

export default function App() {
  const {
    bleManager,
    connectedDevices,
    setConnectedDevices,
    updateAllConnectedDevices,
    disconnectDevice,
    writeCharacteristic,
  } = useBleManager();
  const screenHeight = Dimensions.get("window").height;

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ScrollView>
          <View
            style={{
              height: "auto",
              maxHeight: screenHeight,
              marginBottom: 300,
            }}
          >
            <Text>Welcome to UI Kittens</Text>
            {connectedDevices.map((item, index) => {
              return (
                <View key={index}>
                  <Text>{item.deviceId}</Text>
                  <Text>{item.batteryVoltage}</Text>
                  <Text>{item.IR_RX_status == true ? "1" : "0"}</Text>
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
                  <Layout style={{ flexDirection: "row", height: "20%" }}>
                    <Button
                      onPress={() => {
                        writeCharacteristic(
                          item.deviceId,
                          CHARACTERISTIC.IWING_TRAINERPAD.toLowerCase(),
                          CHARACTERISTIC.LED,
                          "AADf"
                        );
                      }}
                    >
                      Blue
                    </Button>
                    <Button
                      onPress={() => {
                        writeCharacteristic(
                          item.deviceId,
                          CHARACTERISTIC.IWING_TRAINERPAD.toLowerCase(),
                          CHARACTERISTIC.LED,
                          "/wAA"
                        );
                      }}
                    >
                      Red
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
                      Green
                    </Button>
                    <Button
                      onPress={() => {
                        writeCharacteristic(
                          item.deviceId,
                          CHARACTERISTIC.IWING_TRAINERPAD.toLowerCase(),
                          CHARACTERISTIC.LED,
                          "AAAA"
                        );
                      }}
                    >
                      Disable
                    </Button>
                  </Layout>
                  <Button
                    onPress={() => {
                      writeCharacteristic(
                        item.deviceId,
                        CHARACTERISTIC.IWING_TRAINERPAD.toLowerCase(),
                        CHARACTERISTIC.IR_TX,
                        "AQ=="
                      );
                    }}
                  >
                    Enable IR_TX
                  </Button>
                  <Button
                    onPress={() => {
                      writeCharacteristic(
                        item.deviceId,
                        CHARACTERISTIC.IWING_TRAINERPAD.toLowerCase(),
                        CHARACTERISTIC.IR_TX,
                        "AA=="
                      );
                    }}
                  >
                    Disable IR_TX
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
          </View>
        </ScrollView>
      </Layout>
    </ApplicationProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  item: {
    fontSize: 18,
    marginVertical: 10,
  },
});
