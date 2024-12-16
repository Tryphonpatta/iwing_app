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
import { ConnectedDevice, useBleManager } from "./context/blecontext";
import { Ionicons } from "@expo/vector-icons";

type BatteryInfo = {
  icon: JSX.Element;
  text: string;
  color: string;
};

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
  // Track devices currently connecting/disconnecting
  const connectingDevicesRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Track disconnected devices (raw BLE Devices) with timestamps
  const [disconnectedDevice, setDisconnectedDevice] = useState<
    { device: Device; addedAt: number }[]
  >([]);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>("");

  /**
   * Whenever allDevices or connectedDevice changes:
   * - Any device in allDevices but not in connectedDevice is considered "disconnected".
   * - If it's not already in disconnectedDevice, add it with a timestamp.
   */
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

  /**
   * Periodically remove devices from disconnectedDevice if older than 10 seconds.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setDisconnectedDevice((prevDevices) =>
        prevDevices.filter(({ addedAt }) => Date.now() - addedAt <= 10000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Connect or Disconnect a given device.
   */
  const toggleConnection = async (device: Device) => {
    if (!device) return;
    const isConnect = connectedDevice.find((m) => m?.device.id === device.id);
    try {
      if (isConnect) {
        // Disconnect
        setModalText("Disconnecting...");
        setIsModalVisible(true);
        connectingDevicesRef.current.add(device.id);
        forceUpdate((n) => n + 1);

        await disconnectDevice(device);

        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
        setIsModalVisible(false);

        // Mark as disconnected
        if (!disconnectedDevice.find((d) => d.device.id === device.id)) {
          setDisconnectedDevice((prev) => [
            ...prev,
            { device, addedAt: Date.now() },
          ]);
        }
      } else {
        // Connect
        console.log("Connecting to device:", device.id);
        setModalText("Connecting...");
        setIsModalVisible(true);
        connectingDevicesRef.current.add(device.id);
        forceUpdate((n) => n + 1);

        await connectToDevice(device);

        connectingDevicesRef.current.delete(device.id);
        forceUpdate((n) => n + 1);
        setIsModalVisible(false);

        // Remove from disconnected list if present
        setDisconnectedDevice((prev) =>
          prev.filter((d) => d.device.id !== device.id)
        );
      }
    } catch (error) {
      console.log("Failed to connect/disconnect:", device.id, error);
      connectingDevicesRef.current.delete(device.id);
      forceUpdate((n) => n + 1);
      setIsModalVisible(false);
    }
  };

  /**
   * Start scanning for BLE devices, stop after 10s.
   */
  const startScan = async () => {
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
    console.log("Connected devices state:", connectedDevice);
  }, [connectedDevice]);

  /**
   * A function to compute battery info for a ConnectedDevice.
   */
  const statusBattery = async (
    connectDevice: ConnectedDevice
  ): Promise<BatteryInfo | undefined> => {
    const rawBattery = connectDevice.battery;

    const isCharging = false;

    if (isCharging) {
      return {
        icon: <Ionicons name="battery-charging" size={16} color="#FFD700" />,
        text: "Charging",
        color: "#FFD700",
      };
    }

    // if (typeof rawBattery === "number") {
    if (rawBattery < 20) {
      return {
        icon: <Ionicons name="battery-dead" size={16} color="#FF0000" />,
        text: `${rawBattery.toFixed(2)}%`,
        color: "#FF0000",
      };
    }
    return {
      icon: <Ionicons name="battery-full" size={16} color="#4CAF50" />,
      text: `${rawBattery.toFixed(2)}%`,
      color: "#4CAF50",
    };
    // }

    // If battery is undefined
    return undefined;
  };

  /**
   * Props for DeviceItem
   */
  interface DeviceItemProps {
    connectDevice: ConnectedDevice;
    toggleConnection: (device: Device) => Promise<void>;
    connectingDevicesRef: React.MutableRefObject<Set<string>>;
    connectedDevice: (ConnectedDevice | null)[];
  }

  /**
   * A React component for showing a ConnectedDevice's information,
   * including a button to disconnect/reconnect.
   */
  const DeviceItem: React.FC<DeviceItemProps> = ({
    connectDevice,
    toggleConnection,
    connectingDevicesRef,
    connectedDevice,
  }) => {
    const isConnect = connectedDevice.some(
      (m) => m?.device.id === connectDevice.device.id
    );
    // console.log(connectDevice.battery)
    const isConnectingOrDisconnecting = connectingDevicesRef.current.has(
      connectDevice.device.id
    );

    // useEffect(() => {
    //   let mounted = true;
    //   if (isConnect) {
    //     statusBattery(connectDevice).then((info) => {
    //       if (mounted && info) {
    //         setBatteryInfo(info);
    //       }
    //     });
    //   } else {
    //     setBatteryInfo(undefined);
    //   }
    //   return () => {
    //     mounted = false;
    //   };
    // }, [isConnect, connectDevice]);

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
            Device ID: {connectDevice.device.id ?? "N/A"}
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

          <Text
            style={[
              tw`text-sm`,
              {
                color: connectDevice?.isCharging
                  ? "#FFD700" // Yellow for charging
                  : connectDevice?.battery < 20
                  ? "#FF0000" // Red for low battery
                  : "#4CAF50", // Green for normal battery level
              },
            ]}
          >
            {connectDevice?.isCharging
              ? "Battery Charging"
              : `Battery Voltage: ${connectDevice?.battery?.toFixed(2)}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.blinkButton}
          onPress={() => toggleConnection(connectDevice.device)}
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

  /**
   * A simpler component for raw Disconnected Devices (no ConnectedDevice class).
   * We add a Connect button here as well, using the same toggleConnection function.
   */
  const DisconnectedItem: React.FC<{
    device: Device;
    toggleConnection: (device: Device) => Promise<void>;
    connectingDevicesRef: React.MutableRefObject<Set<string>>;
  }> = ({ device, toggleConnection, connectingDevicesRef }) => {
    const isConnecting = connectingDevicesRef.current.has(device.id);

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
            Disconnected Device ID: {device.id}
          </Text>
          <Text style={styles.disconnectedText}>Status: Disconnected</Text>
        </View>

        <TouchableOpacity
          style={styles.blinkButton}
          onPress={() => toggleConnection(device)}
        >
          <Text style={tw`text-gray-700`}>
            {isConnecting ? "Connecting..." : "Connect"}
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
        data={connectedDevice.filter((d) => d !== null) as ConnectedDevice[]}
        keyExtractor={(item) => item.device.id}
        renderItem={({ item }) => (
          <DeviceItem
            connectDevice={item}
            toggleConnection={toggleConnection}
            connectingDevicesRef={connectingDevicesRef}
            connectedDevice={connectedDevice}
          />
        )}
        ListEmptyComponent={
          <Text style={tw`mx-4 my-2`}>No connected devices</Text>
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
        renderItem={({ item }) => (
          <DisconnectedItem
            device={item}
            toggleConnection={toggleConnection}
            connectingDevicesRef={connectingDevicesRef}
          />
        )}
        ListEmptyComponent={
          <Text style={tw`mx-4 my-2`}>No disconnected devices</Text>
        }
      />

      {/* Scan Button */}
      <Button
        onPress={startScan}
        title={scanning ? "Scanning..." : "Start Scan"}
        disabled={scanning}
      />

      {/* Loading Modal */}
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
    color: "#FFA500", // Orange
  },
  disconnectedText: {
    color: "#D32F2F",
  },
  disconnectingText: {
    color: "#FF4500",
  },
  blinkButton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    position: "absolute",
    right: 10,
  },
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
