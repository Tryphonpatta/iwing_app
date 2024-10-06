import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Button,
} from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import tw from "twrnc";
import { useBleManager } from "./context/blecontext"; // BLE context provider
import { prefix } from "@/enum/characteristic";
import { base64toDec, base64toDecManu } from "@/util/encode";

// BLE component for scanning and managing device connections
type DeviceCustom = Device & { isConnect: boolean };
const BLE = () => {
  const { bleManager, connectToDevice, connectedDevices } = useBleManager(); // BLE context values
  const [deviceList, setDeviceList] = useState<Device[]>([]); // List of BLE devices
  const [scanning, setScanning] = useState<boolean>(false); // Scanning state
  // DeviceItem component for rendering individual BLE devices

  const connectDevice = async (deviceId: string) => {
    connectToDevice(deviceId);
  };
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
              if (device.name == "Trainning_PAD" && !deviceExists) {
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

  useEffect(() => {}, []);
  const DeviceItem: React.FC<{
    device: Device;
  }> = ({ device }) => {
    const isConnect = connectedDevices
      ? connectedDevices.some((d) => d.deviceId === device.id)
      : false;
    console.log(device.manufacturerData);
    return (
      <View
        style={[tw`flex-row items-center p-4 my-2`, styles.deviceContainer]}
      >
        <Image
          source={require("../../assets/images/device.png")}
          style={tw`w-20 h-20`}
        />

        <View style={tw`ml-4`}>
          <Text style={tw`text-base font-bold text-black mb-1`}>
            Device ID: {device.id ? device.id : "N/A"}
          </Text>
          <Text
            style={[
              tw`text-sm`,
              isConnect ? styles.connectedText : styles.disconnectedText,
            ]}
          >
            Status: {isConnect ? "Connected" : "Disconnected"}
          </Text>

          <Text style={[tw`text-sm`, styles.defaultBatteryText]}>
            Battery Voltage:{" "}
            {device.manufacturerData
              ? base64toDecManu(device.manufacturerData)
              : "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.blinkButton}
          onPress={() => connectToDevice(device.id)}
        >
          <Text style={tw`text-gray-700`}>
            {isConnect ? "Disconnect" : "Connect"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Function to start scanning for BLE devices

  // Separate devices into connected and disconnected groups

  return (
    <View style={tw`flex-1 bg-white`}>
      <Text style={tw`text-2xl font-bold text-black my-4 text-center`}>
        BLE Devices
      </Text>
      <FlatList
        data={deviceList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} />}
      />
      <Button
        onPress={startScan}
        title={scanning ? "Scanning..." : "Start Scan"}
        disabled={scanning}
      />
    </View>
  );
};

// Define styles for the component
const styles = StyleSheet.create({
  deviceContainer: {
    backgroundColor: "#f0f4f7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  connectedText: {
    color: "#0E8850",
  },
  disconnectedText: {
    color: "#D32F2F",
  },
  defaultBatteryText: {
    color: "#4CAF50", // Default green color for non-charging status
  },
  blinkButton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    position: "absolute",
    right: 10,
  },
});

export default BLE;
