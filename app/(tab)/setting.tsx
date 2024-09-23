import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import tw from 'twrnc';
import { mockDevices, Device } from './DeviceMockup'; // Import the mockup data

// Define the props for DeviceItem, which includes the device object
const DeviceItem: React.FC<{ device: Device }> = ({ device }) => {
  return (
    <View style={[tw`flex-row items-center p-4 my-2`, styles.deviceContainer]}>
      {/* Device Image */}
      <Image
        source={require('../../assets/images/device.png')}  // Replace with your image path
        style={tw`w-20 h-20`}
      />

      {/* Device Info */}
      <View style={tw`ml-4`}>
        <Text style={tw`text-lg font-bold`}>Name: {device.name}</Text>
        <Text style={[tw`text-sm`, device.isConnected ? styles.connectedText : styles.disconnectedText]}>
          Status: {device.status}
        </Text>
        <Text style={tw`text-sm text-green-600`}>Battery: {device.battery}</Text>
      </View>

      {/* Blink Button */}
      <TouchableOpacity style={styles.blinkButton}>
        <Text style={tw`text-gray-700`}>Blink</Text>
      </TouchableOpacity>
    </View>
  );
};

const Settings = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices); // Use mockDevices from mockup file

  return (
    <View style={tw`flex-1 bg-green-100`}>
      <Text style={tw`text-2xl font-bold text-green-700 my-4 text-center`}>Setting</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceItem device={item} />}
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
