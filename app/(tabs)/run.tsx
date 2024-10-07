import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ManualScreen from './running/manual'; // นำเข้า ManualScreen
import PatternScreen from './running/pettern'; // นำเข้า PatternScreen

const RunScreen = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  if (selectedMode === 'manual') {
    return <ManualScreen />; // ถ้าเลือก manual ให้แสดง ManualScreen
  }

  if (selectedMode === 'pattern') {
    return <PatternScreen />; // ถ้าเลือก pattern ให้แสดง PatternScreen
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mode</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'pattern' ? styles.selected : styles.unselected,
          ]}
          onPress={() => setSelectedMode('pattern')}
        >
          <Text style={styles.buttonText}>Pattern</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'manual' ? styles.selected : styles.unselected,
          ]}
          onPress={() => setSelectedMode('manual')}
        >
          <Text style={styles.buttonText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* ปุ่มอื่นๆ */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          if (selectedMode) {
            setSelectedMode(selectedMode);
          } else {
            alert('Please select a mode');
          }
        }}
      >
        <Text style={styles.startButtonText}>Start</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 40,
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  selected: {
    backgroundColor: '#5d9b8c',
  },
  unselected: {
    backgroundColor: '#ffffff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#2f855a',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  startButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RunScreen;
