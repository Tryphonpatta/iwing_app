// Home.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useBleManager } from './context/blecontext'; // Use the real BLE context

const SquareComponent = () => {
  const { connectedDevices, connectToDevice, disconnectDevice } = useBleManager(); // Use BLE context
  const [devices, setDevices] = useState(connectedDevices);

  useEffect(() => {
    // Update devices whenever connectedDevices state changes
    setDevices(connectedDevices);
  }, [connectedDevices]);

  // Function to toggle connection status for a specific device
  const toggleConnection = async (deviceId: string) => {
    const device = devices.find((d) => d.deviceId === deviceId);
    if (device && device.isConnected) {
      // Call disconnectDevice from the context
      await disconnectDevice(deviceId);
    } else {
      // Call connectToDevice from the context
      await connectToDevice(deviceId);
    }
  };

  return (
    <View style={tw`w-4/5 aspect-square justify-between`}>
      <View style={tw`flex-row justify-between`}>
        {devices.slice(0, 2).map((device) => (
          <View key={device.deviceId} style={tw`items-center`}>
            <Text style={tw`text-lg font-bold text-black mb-1`}>{device.deviceId}</Text>
            <TouchableOpacity
              style={tw`${device.isConnected ? 'bg-red-600' : 'bg-green-500'} w-10 h-10 rounded-full justify-center items-center mb-1`}
              onPress={() => toggleConnection(device.deviceId)}
            >
              <Text style={tw`${device.isConnected ? 'text-white' : 'text-black'} text-sm`}>{device.batteryVoltage}</Text>
            </TouchableOpacity>
            <Text style={tw`text-sm mt-1 text-center`}>{device.isConnected ? 'DISCONNECT' : 'CONNECT'}</Text>
          </View>
        ))}
      </View>

      {/* Center Square */}
      <View style={tw`w-full h-full bg-gray-300 my-4`}></View>

      <View style={tw`flex-row justify-between`}>
        {devices.slice(2, 4).map((device) => (
          <View key={device.deviceId} style={tw`items-center`}>
            <Text style={tw`text-lg font-bold text-black mb-1`}>{device.deviceId}</Text>
            <TouchableOpacity
              style={tw`${device.isConnected ? 'bg-red-600' : 'bg-green-500'} w-10 h-10 rounded-full justify-center items-center mb-1`}
              onPress={() => toggleConnection(device.deviceId)}
            >
              <Text style={tw`${device.isConnected ? 'text-white' : 'text-black'} text-sm`}>{device.batteryVoltage}</Text>
            </TouchableOpacity>
            <Text style={tw`text-sm mt-1 text-center`}>{device.isConnected ? 'DISCONNECT' : 'CONNECT'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Home = () => {
  const { bleManager, connectedDevices, setConnectedDevices, updateAllConnectedDevices } = useBleManager(); // Use the real BLE context

  // Scan and update devices list when the component mounts
  useEffect(() => {
    const scanDevices = async () => {
      // Start scanning for devices here if required
      console.log("Scanning for devices...");
    };
    scanDevices();
  }, []);

  return (
    <ScrollView style={tw`bg-green-100`} contentContainerStyle={[tw`items-center`, { flexGrow: 1 }]}>
      <Text style={[tw`font-bold my-5`, styles.customText]}>Press to Connect</Text>
      <SquareComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  customText: {
    fontSize: 32,
    color: '#0E8850',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
});

export default Home;
