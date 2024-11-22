import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Button,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import tw from "twrnc";
import { base64toDecManu } from "@/util/encode";
import { useBleManager } from "./context/blecontext";

const BLE = () => {
  const {
    connectToDevice,
    allDevices,
    connectedDevice,
    scanForPeripherals,
    disconnectDevice,
  } = useBleManager();

  const [scanning, setScanning] = useState<boolean>(false);
  const connectingDevicesRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Connect or disconnect the device and update its status immediately
  const toggleConnection = async (device: Device) => {
    if (!device) return;
    const isConnect = connectedDevice.find((m) => m?.id == device.id);
    if (isConnect) {
      try {
        // Add device ID to connecting devices (for disconnecting state)
        connectingDevicesRef.current.add(device.id);
        forceUpdate((n) => n + 1);

        await disconnectDevice(device);

        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
      } catch (error) {
        console.log("Failed to disconnect from device:", device.id, error);
        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
      }
    } else {
      try {
        console.log("Connecting to device:", device.id);
        // Add device ID to connecting devices
        connectingDevicesRef.current.add(device.id);
        forceUpdate((n) => n + 1);
        // Attempt to connect to the device
        await connectToDevice(device);
        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
      } catch (error) {
        console.log("Failed to connect to device:", device.id, error);
        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
      }
    }
  };

  const startScan = async () => {
    console.log("Scanning...");
    setScanning(true);

    scanForPeripherals();

    setTimeout(() => {
      setScanning(false);
      console.log("Scan stopped after 10 seconds.");
    }, 10000);
  };

  const DeviceItem: React.FC<{ device: Device }> = ({ device }) => {
    const isConnect = connectedDevice.find((m) => m?.id == device?.id);
    const isConnectingOrDisconnecting = connectingDevicesRef.current.has(
      device.id
    );
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
            Device ID: {device?.id ? device.id : "N/A"}
          </Text>
          <Text
            style={[
              tw`text-sm`,
              isConnect
                ? isConnectingOrDisconnecting
                  ? styles.disconnectingText
                  : styles.connectedText
                : isConnectingOrDisconnecting
                ? styles.connectingText
                : styles.disconnectedText,
            ]}
          >
            Status:{" "}
            {isConnect
              ? isConnectingOrDisconnecting
                ? "Disconnecting..."
                : "Connected"
              : isConnectingOrDisconnecting
              ? "Connecting..."
              : "Disconnected"}
          </Text>

          <Text style={[tw`text-sm`, styles.defaultBatteryText]}>
            Battery Voltage:{" "}
            {device?.manufacturerData
              ? base64toDecManu(device?.manufacturerData)
              : "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.blinkButton}
          onPress={() => toggleConnection(device)}
          disabled={isConnectingOrDisconnecting} // Disable button while connecting/disconnecting
        >
          <Text style={tw`text-gray-700`}>
            {isConnect
              ? isConnectingOrDisconnecting
                ? "Disconnecting..."
                : "Disconnect"
              : isConnectingOrDisconnecting
              ? "Connecting..."
              : "Connect"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: "#E8F5E9" }]}>
      <Text
        style={[
          tw`text-center font-bold text-white my-4 mt-8 shadow-lg`,
          { backgroundColor: "#419E68", fontSize: 36 },
        ]}
      >
        Settings
      </Text>

      {/* Render connected devices */}
      <View style={tw`bg-white shadow-lg`}>
        <Text style={tw`text-lg font-bold text-black rounded-lg p-2`}>
          Connected Devices
        </Text>
      </View>
      <FlatList
        data={connectedDevice.filter((d) => d != null)}
        keyExtractor={(item) => item?.id as string}
        renderItem={({ item }) => <DeviceItem device={item as Device} />}
        ListEmptyComponent={
          <Text style={tw`mx-4 my-2`}> No connected devices</Text>
        }
      />

      {/* Render disconnected devices */}
      <View style={tw`bg-white shadow-lg`}>
        <Text style={tw`text-lg font-bold text-black bg-white rounded-lg p-2`}>
          Disconnected Devices
        </Text>
      </View>
      <FlatList
        data={allDevices.filter(
          (d) => d != null && !connectedDevice.find((m) => m?.id == d.id)
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} />}
        ListEmptyComponent={
          <Text style={tw`mx-4 my-2`}> No disconnected devices</Text>
        }
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
  connectingText: {
    color: "#FFA500", // Orange color for connecting state
  },
  disconnectedText: {
    color: "#D32F2F",
  },
  disconnectingText: {
    color: "#FF4500", // OrangeRed color for disconnecting state
  },
  defaultBatteryText: {
    color: "#4CAF50",
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
