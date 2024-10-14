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
import { useBleManager } from "./context/blecontext";
import { prefix } from "@/enum/characteristic";
import { base64toDec, base64toDecManu } from "@/util/encode";

// BLE component for scanning and managing device connections
type DeviceCustom = Device & { isConnect: boolean };
const BLE = () => {
  const { bleManager, connectToDevice, connectedDevices } = useBleManager(); // BLE context values
  const [deviceList, setDeviceList] = useState<DeviceCustom[]>([]); // List of BLE devices with custom type
  const [scanning, setScanning] = useState<boolean>(false); // Scanning state

  // Connect or disconnect the device and update its status immediately
  const toggleConnection = async (device: DeviceCustom) => {
    if (device.isConnect) {
      try {
        // Disconnect from the device
        await bleManager.cancelDeviceConnection(device.id);
        updateDeviceStatus(device.id, false);
      } catch (error) {
        console.log("Failed to disconnect from device:", device.id, error);
      }
    } else {
      try {
        console.log("Connecting to device:", device.id);
        // Attempt to connect to the device
        await connectToDevice(device.id);
        // Update the status only if the connection was successful
        updateDeviceStatus(device.id, true);
      } catch (error) {
        console.log("Failed to connect to device:", device.id, error);
        // Optionally, inform the user that the connection failed
      }
    }
  }; 

  // Update device status in the list based on its connection status
  const updateDeviceStatus = (deviceId: string, isConnect: boolean) => {
    setDeviceList((prevList: any) =>
      prevList.map((d: any) =>
        d.id === deviceId ? { ...d, isConnect: isConnect } : d
      )
    );
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
            setDeviceList((prev: any) => {
              const deviceExists = prev.some((d: any) => d.id === device.id);

              if (device.name === "Trainning_PAD" && !deviceExists) {
                return [...prev, { ...device, isConnect: false }];
              }
              return prev;
            });
          }
        });
      }
    }, true);

    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
      console.log("Scan stopped after 10 seconds.");
    }, 10000);
  };

  useEffect(() => {
    // Update device connection statuses when connectedDevices change
    setDeviceList((prev: any) =>
      prev.map((device: any) => ({
        ...device,
        isConnect: connectedDevices.some((d) => d.deviceId === device.id),
      }))
    );
  }, [connectedDevices]);

  // Separate the devices into connected and disconnected groups
  const connectedDevicesList = deviceList.filter((device) => device.isConnect);
  const disconnectedDevicesList = deviceList.filter(
    (device) => !device.isConnect
  );

  const DeviceItem: React.FC<{ device: DeviceCustom }> = ({ device }) => {
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
              device.isConnect ? styles.connectedText : styles.disconnectedText,
            ]}
          >
            Status: {device.isConnect ? "Connected" : "Disconnected"}
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
          onPress={() => toggleConnection(device)}
        >
          <Text style={tw`text-gray-700`}>
            {device.isConnect ? "Disconnect" : "Connect"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: "#E8F5E9" }]}>
      <Text style={[tw`text-center font-bold text-white my-4 mt-8 shadow-lg`, { backgroundColor: "#419E68", fontSize: 36 }]}>
        Settings
      </Text>

      {/* Render connected devices */}
      <View style={tw`bg-white shadow-lg`}>
      <Text style={tw`text-lg font-bold text-black rounded-lg p-2 `}>  Connected Devices</Text>
      </View>
      <FlatList
        data={connectedDevicesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} />}
        ListEmptyComponent={<Text style={tw`mx-4 my-2`}>  No connected devices</Text>}
      />

      {/* Render disconnected devices */}
      <View style={tw`bg-white shadow-lg`}>
      <Text style={tw`text-lg font-bold text-black bg-white rounded-lg p-2`}>  Disconnected Devices</Text>
      </View>
      <FlatList
        data={disconnectedDevicesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} />}
        ListEmptyComponent={<Text style={tw`mx-4 my-2`}>  No disconnected devices</Text>}
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
