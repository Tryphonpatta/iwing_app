import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import RunScreen from '../run'; // นำเข้า RunScreen

const { width } = Dimensions.get('window');

const ManualScreen = () => {
  const [isStopped, setIsStopped] = useState(false);
  const [selectedColor, setSelectedColor] = useState('red');

  if (isStopped) {
    return <RunScreen />; // เมื่อกด STOP กลับไปที่ RunScreen
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <View style={styles.container}>
      {/* ปุ่ม L1, R1, L2, R2 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>L1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>R1</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>L2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>R2</Text>
        </TouchableOpacity>
      </View>

      {/* ส่วนเลือกสี */}
      <Text style={styles.sectionTitle}>Color</Text>
      <View style={styles.colorRow}>
        <TouchableOpacity
          style={[styles.colorButton, selectedColor === 'red' && styles.selectedColor]}
          onPress={() => handleColorChange('red')}
        >
          <Text style={styles.colorText}>red</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.colorButton, selectedColor === 'green' && styles.selectedColor]}
          onPress={() => handleColorChange('green')}
        >
          <Text style={styles.colorText}>green</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.colorButton, selectedColor === 'blue' && styles.selectedColor]}
          onPress={() => handleColorChange('blue')}
        >
          <Text style={styles.colorText}>blue</Text>
        </TouchableOpacity>
      </View>

      {/* ปุ่ม Stop */}
      <TouchableOpacity
        style={styles.stopButton}
        onPress={() => {
          setIsStopped(true); // เมื่อกด STOP ให้เปลี่ยนเป็น true เพื่อกลับไปที่ RunScreen
        }}
      >
        <Text style={styles.stopButtonText}>STOP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f5f0',
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '60%',
  },
  controlButton: {
    backgroundColor: '#e0e0e0',
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  colorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedColor: {
    backgroundColor: '#5d9b8c',
  },
  colorText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#e63946',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  stopButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ManualScreen;
