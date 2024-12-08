// setting.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Button,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Device } from "react-native-ble-plx";
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
    stopDeviceScan,
  } = useBleManager();

  const [scanning, setScanning] = useState<boolean>(false);
  const connectingDevicesRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Local state to track disconnected devices with timestamps
  const [disconnectedDevice, setDisconnectedDevice] = useState<
    { device: Device; addedAt: number }[]
  >([]);

  // Modal state moved to parent component
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>("");

  // Update disconnectedDevice when allDevices or connectedDevice change
  useEffect(() => {
    const now = Date.now();
    const newDisconnectedDevice = allDevices
      .filter(
        (device) =>
          !connectedDevice.find((m) => m?.device.id === device.id) &&
          !disconnectedDevice.find((d) => d.device.id === device.id)
      )
      .map((device) => ({ device, addedAt: now }));

    if (newDisconnectedDevice.length > 0) {
      setDisconnectedDevice((prevDevices) => [
        ...prevDevices,
        ...newDisconnectedDevice,
      ]);
    }
  }, [allDevices, connectedDevice]);

  // Remove devices from disconnectedDevice after 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDisconnectedDevice((prevDevices) =>
        prevDevices.filter(
          ({ addedAt }) => Date.now() - addedAt <= 10000 // 10 seconds
        )
      );
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  // Function to connect or disconnect the device
  const toggleConnection = async (device: Device) => {
    if (!device) return;
    const isConnect = connectedDevice.find((m) => m?.device.id === device.id);
    if (isConnect) {
      try {
        // Show modal
        setModalText("Disconnecting...");
        setIsModalVisible(true);

        // Add device ID to connecting devices (for disconnecting state)
        connectingDevicesRef.current.add(device.id);
        forceUpdate((n) => n + 1);

        await disconnectDevice(device);

        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);

        // Hide modal
        setIsModalVisible(false);

        // Add the device to disconnectedDevice list with timestamp
        if (!disconnectedDevice.find((d) => d.device.id === device.id)) {
          setDisconnectedDevice((prevDevices) => [
            ...prevDevices,
            { device, addedAt: Date.now() },
          ]);
        }
      } catch (error) {
        console.log("Failed to disconnect from device:", device.id, error);
        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
        // Hide modal
        setIsModalVisible(false);
      }
    } else {
      try {
        console.log("Connecting to device:", device.id);
        // Show modal
        setModalText("Connecting...");
        setIsModalVisible(true);

        // Add device ID to connecting devices
        connectingDevicesRef.current.add(device.id);
        forceUpdate((n) => n + 1);

        await connectToDevice(device);

        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);

        // Hide modal
        setIsModalVisible(false);

        // Remove the device from disconnectedDevice list
        setDisconnectedDevice((prevDevices) =>
          prevDevices.filter((d) => d.device.id !== device.id)
        );
      } catch (error) {
        console.log("Failed to connect to device:", device.id, error);
        // Remove device ID from connecting devices
        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
        // Hide modal
        setIsModalVisible(false);
      }
    }
  };

  const startScan = async () => {
    //Clear the list of disconnected devices
    setDisconnectedDevice([]);
    console.log("Scanning...");
    setScanning(true);

    scanForPeripherals();

    setTimeout(() => {
      setScanning(false);
      stopDeviceScan();

      console.log("Scan stopped after 10 seconds.");
    }, 10000);
  };

  useEffect(() => {
    console.log("state", connectedDevice);
  }, [connectedDevice]);

  // DeviceItem component
  const DeviceItem: React.FC<{ device: Device }> = ({ device }) => {
    const isConnect = connectedDevice.find((m) => m?.device.id === device.id);
    const isConnectingOrDisconnecting = connectingDevicesRef.current.has(
      device.id
    );

    return (
      <View
        style={[tw`flex-row items-center p-4 my-2`, styles.deviceContainer]}
      >
        {/* Device Image */}
        <Image
          source={require("../../assets/images/device.png")}
          style={tw`w-20 h-20`}
        />

        {/* Device Information */}
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
            {/* {device?.manufacturerData
							? base64toDecManu(device?.manufacturerData)
							: "N/A"} */}
            {(
              (base64toDecManu(device?.manufacturerData as string) / 30000) *
              100
            ).toFixed(2) + " %"}
          </Text>
        </View>

        {/* Connect/Disconnect Button */}
        <TouchableOpacity
          style={styles.blinkButton}
          onPress={async () => {
            await toggleConnection(device);
            console.log("Connected Devices:", connectedDevice);
          }}
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
      {/* Header */}
      <Text
        style={[
          tw`text-center font-bold text-white my-4 mt-8 shadow-lg`,
          { backgroundColor: "#419E68", fontSize: 36 },
        ]}
      >
        Settings
      </Text>

      {/* Connected Devices */}
      <View style={tw`bg-white shadow-lg`}>
        <Text style={tw`text-lg font-bold text-black rounded-lg p-2`}>
          Connected Devices
        </Text>
      </View>
      <FlatList
        data={connectedDevice.filter((d) => d != null)}
        keyExtractor={(item) => item!.device.id}
        renderItem={({ item }) => <DeviceItem device={item!.device} />}
        ListEmptyComponent={
          <Text style={tw`mx-4 my-2`}> No connected devices</Text>
        }
      />

      {/* Disconnected Devices */}
      <View style={tw`bg-white shadow-lg`}>
        <Text style={tw`text-lg font-bold text-black bg-white rounded-lg p-2`}>
          Disconnected Devices
        </Text>
      </View>
      <FlatList
        data={disconnectedDevice.map(({ device }) => device)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} />}
        ListEmptyComponent={
          <Text style={tw`mx-4 my-2`}> No disconnected devices</Text>
        }
      />

      {/* Scan Button */}
      <Button
        onPress={startScan}
        title={scanning ? "Scanning..." : "Start Scan"}
        disabled={scanning}
      />

      {/* Modal for Loading Indicator */}
      <Modal transparent={true} animationType="fade" visible={isModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator animating={true} size="large" color="#419E68" />
            <Text style={styles.modalText}>{modalText}</Text>
          </View>
        </View>
      </Modal>
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
  // Styles for the modal
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
});

export default BLE;
