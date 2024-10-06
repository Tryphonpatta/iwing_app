import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Button } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import tw from "twrnc";
import { useBleManager } from "./context/blecontext"; // BLE context provider
import { prefix } from "@/enum/characteristic";

// DeviceItem component for rendering individual BLE devices
const DeviceItem: React.FC<{ device: Device; onConnect: (deviceId: string) => void }> = ({ device, onConnect }) => {
  return (
    <View style={[tw`flex-row items-center p-4 my-2`, styles.deviceContainer]}>
      <Image source={require("../../assets/images/device.png")} style={tw`w-20 h-20`} />

      <View style={tw`ml-4`}>
        <Text style={tw`text-lg font-bold text-black mb-1`}>Device ID: {device.id}</Text>
        <Text style={[tw`text-sm`, device.isConnected ? styles.connectedText : styles.disconnectedText]}>
          Status: {device.isConnected ? "Connected" : "Disconnected"}
        </Text>

        <Text style={[tw`text-sm`, styles.defaultBatteryText]}>
          Battery Voltage: {device.manufacturerData ? device.manufacturerData : "N/A"}
        </Text>
      </View>

      <TouchableOpacity style={styles.blinkButton} onPress={() => onConnect(device.id)}>
        <Text style={tw`text-gray-700`}>{device.isConnected ? "Disconnect" : "Connect"}</Text>
      </TouchableOpacity>
    </View>
  );
};

// BLE component for scanning and managing device connections
const BLE = () => {
  const { bleManager, connectToDevice } = useBleManager(); // BLE context values
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);

  // Function to start scanning for BLE devices
  const startScan = () => {
    setDevices([]); // Clear devices before starting scan
    console.log("Scanning started...");
    setScanning(true);

    bleManager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        bleManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.log("Scan error:", error);
            setScanning(false);
            return;
          }

          if (device) {
            setDevices((prev) => {
              const deviceExists = prev.some((d) => d.id === device.id);

              if (!deviceExists && (device.name || (device.serviceUUIDs && device.serviceUUIDs[0].startsWith(prefix)))) {
                console.log(`Discovered device: ${device.name}, ID: ${device.id}`);
                return [...prev, { ...device, isConnected: false }]; // Default isConnected to false
              }
              return prev;
            });
          }
        });
      }
    }, true);

    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  const handleConnect = async (deviceId: string) => {
    try {
      const device = await connectToDevice(deviceId);
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, isConnected: true } : d))
      );
      console.log(`Connected to device ID: ${deviceId}`);
    } catch (error) {
      console.error(`Failed to connect to device ID: ${deviceId}`, error);
    }
  };

  // Separate devices into connected and disconnected groups
  const connectedDevices = devices.filter((device) => device.isConnected);
  const disconnectedDevices = devices.filter((device) => !device.isConnected);

  return (
    <View style={tw`flex-1 bg-white`}>
      <Text style={tw`text-2xl font-bold text-black my-4 text-center`}>BLE Devices</Text>

      {/* Render connected devices first */}
      <Text style={tw`text-xl font-semibold text-green-600 my-2 text-left`}>Connected Devices:</Text>
      <FlatList
        data={connectedDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} onConnect={handleConnect} />}
        contentContainerStyle={tw`px-4`}
      />

      {/* Render disconnected devices below connected devices */}
      <Text style={tw`text-xl font-semibold text-red-600 my-2 text-left`}>Disconnected Devices:</Text>
      <FlatList
        data={disconnectedDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} onConnect={handleConnect} />}
        contentContainerStyle={tw`px-4`}
      />

      <Button onPress={startScan} title={scanning ? "Scanning..." : "Start Scan"} disabled={scanning} />
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
