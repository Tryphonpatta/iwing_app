import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import tw from 'twrnc';
import { useBleManager } from './context/blecontext'; // Use the real BLE context

// Define the props for DeviceItem, which includes the device object
const DeviceItem: React.FC<{ device: any }> = ({ device }) => {
  // Local state to track connection status for each device
  const [isConnected, setIsConnected] = useState(device.isConnected);

  // Function to handle connection/disconnection
  const handleConnectToggle = () => {
    if (isConnected) {
      console.log(`Disconnecting from device: ${device.deviceId}`);
    } else {
      console.log(`Connecting to device: ${device.deviceId}`);
    }
    setIsConnected(!isConnected); // Toggle the local connection state
  };

  return (
    <View style={[tw`flex-row items-center p-4 my-2`, styles.deviceContainer]}>
      {/* Device Image */}
      <Image
        source={require('../../assets/images/device.png')}
        style={tw`w-20 h-20`}
      />

      {/* Device Info */}
      <View style={tw`ml-4`}>
        <Text style={tw`text-lg font-bold text-black mb-1`}>Device ID: {device.deviceId}</Text>
        <Text style={[tw`text-sm`, isConnected ? styles.connectedText : styles.disconnectedText]}>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        
        {/* Battery Voltage with Conditional Color Based on Charging Status */}
        <Text style={[tw`text-sm`, device.battCharging ? styles.chargingText : styles.defaultBatteryText]}>
          Battery Voltage: {device.batteryVoltage}
        </Text>
      </View>

      {/* Connect/Disconnect Button */}
      <TouchableOpacity
        style={styles.blinkButton}
        onPress={handleConnectToggle}
      >
        <Text style={tw`text-gray-700`}>{isConnected ? 'Disconnect' : 'Connect'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const Settings = () => {
  const { connectedDevices } = useBleManager(); // Use BLE context
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    setDevices(connectedDevices); // Update devices when connectedDevices changes
  }, [connectedDevices]);

  return (
    <View style={tw`flex-1 bg-green-100`}>
      <Text style={tw`text-2xl font-bold text-green-700 my-4 text-center`}>Setting</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.deviceId}
        renderItem={({ item }) => (
          <DeviceItem
            device={{
              ...item,
            }}
          />
        )}
        contentContainerStyle={tw`px-4`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  deviceContainer: {
    backgroundColor: '#f0f4f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  connectedText: {
    color: '#0E8850',
  },
  disconnectedText: {
    color: '#D32F2F',
  },
  chargingText: {
    color: 'yellow', // Yellow color for charging status
  },
  defaultBatteryText: {
    color: '#4CAF50', // Default green color for non-charging status
  },
  blinkButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    position: 'absolute',
    right: 10,
  },
});

export default Settings;
