import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const PatternScreen = () => {
  const [R1, setR1] = useState('');
  const [R2, setR2] = useState('');
  const [L1, setL1] = useState('');
  const [L2, setL2] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pattern Mode</Text>

      {/* Input R1 */}
      <TextInput
        style={styles.input}
        value={R1}
        onChangeText={(text) => setR1(text.replace(/[^0-9]/g, ''))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="R1"
      />

      {/* Input R2 */}
      <TextInput
        style={styles.input}
        value={R2}
        onChangeText={(text) => setR2(text.replace(/[^0-9]/g, ''))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="R2"
      />

      {/* Input L1 */}
      <TextInput
        style={styles.input}
        value={L1}
        onChangeText={(text) => setL1(text.replace(/[^0-9]/g, ''))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="L1"
      />

      {/* Input L2 */}
      <TextInput
        style={styles.input}
        value={L2}
        onChangeText={(text) => setL2(text.replace(/[^0-9]/g, ''))} // กรอกได้เฉพาะตัวเลข
        keyboardType="numeric"
        placeholder="L2"
      />

      {/* ปุ่มบันทึกข้อมูล */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#2f855a',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PatternScreen;
