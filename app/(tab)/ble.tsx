import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import tw from 'twrnc';

const BLE = () => {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <Text style={styles.title}>Bluetooth Low Energy (BLE) Screen</Text>
      <Text style={styles.description}>
        This is the BLE screen where you can scan for BLE devices, connect to them, and more.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E8850',
  },
  description: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default BLE;
