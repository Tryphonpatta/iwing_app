import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import Field from "./field";
import RunScreen from "../run";
import InputSpinner from "react-native-input-spinner";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const modes = [
  {
    id: 1,
    icon: "hand-right-outline",
    description: "ถนัดขวา: การทดสอบผู้ถนัดด้านขวามือ.",
  },
  {
    id: 2,
    icon: "hand-left-outline",
    description: "ถนัดซ้าย: การทดสอบผู้ถนัดด้านซ้ายมือ.",
  },
  { id: 3, icon: "dice", description: "สุ่ม: การทดสอบแบบสุ่มตำแหน่ง." },
];

const itemWidth = width * 0.8; // Make each item 80% of the screen width
const itemSpacing = width * 0.1;

const PatternScreen = () => {
  const [R1, setR1] = useState(0);
  const [R2, setR2] = useState(0);
  const [L1, setL1] = useState(0);
  const [L2, setL2] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [goField, setShowField] = useState(false);
  const [showRunScreen, setShowRunScreen] = useState(false);

  const [selectedMode, setSelectedMode] = useState(modes[0].id);

  // --- NEW: threshold state ---
  const [threshold, setThreshold] = useState(1);

  const [threL1, setThresholdL1] = useState(1);
  const [threR1, setThresholdR1] = useState(1);
  const [threL2, setThresholdL2] = useState(1);
  const [threR2, setThresholdR2] = useState(1);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSetting, setShowSetting] = useState(false);

  useEffect(() => {
    setModeValues(selectedMode);
  }, [selectedMode]);

  const handleStart = () => {
    let totalCounts = 0;
    if (selectedMode === 1 || selectedMode === 2) {
      totalCounts = L1;
      if (L1 <= 0) {
        Alert.alert(
          "Validation Error",
          "Please enter a value greater than 0 for L1."
        );
        return;
      }
    } else if (selectedMode === 3) {
      totalCounts = R1 + R2 + L1 + L2;
      if (totalCounts <= 0) {
        Alert.alert(
          "Validation Error",
          "Please enter at least one count to start."
        );
        return;
      }
    }

    setShowField(true);
  };

  const setModeValues = (modeId: any) => {
    if (modeId === 1 || modeId === 2) {
      // Reset R1, R2, and L2 when switching to Mode 1 or 2
      setR1(0);
      setR2(0);
      setL2(0);
    }
    // For Mode 3, retain existing values
  };

  // if (goField) {
  //   // Pass threshold along to Field if you need it there
  //   return (
  //     <Field
  //       R1={selectedMode === 3 ? R1 : undefined}
  //       R2={selectedMode === 3 ? R2 : undefined}
  //       L1={L1}
  //       L2={selectedMode === 3 ? L2 : undefined}
  //       mode={selectedMode}
  //       threshold={threshold}
  //     />
  //   );
  // }

  const renderModeIcon = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.iconContainer,
        selectedMode === item.id && styles.selectedIconContainer,
      ]}
      onPress={() => {
        setSelectedMode(item.id);
      }}
    >
      <Ionicons
        name={item.icon}
        size={80}
        color={selectedMode === item.id ? "#2f855a" : "#ccc"}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: selectedMode === item.id ? "#2f855a" : "#777",
          marginTop: 5,
          textAlign: "center",
        }}
      >
        {item.description.split(":")[0]}
      </Text>
    </TouchableOpacity>
  );

  return !goField ? (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pattern Mode</Text>
      </View>

      {/* Info and Settings Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          width: "97%",
          marginVertical: 10,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 15,
          }}
          onPress={() => setShowInfoModal(true)}
        >
          <Ionicons
            name="information-circle-outline"
            size={28}
            color="#2f855a"
          />
          <Text style={{ fontSize: 16, color: "#2f855a", marginLeft: 5 }}>
            ข้อมูล
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => setShowSetting(true)}
        >
          <Ionicons name="flash" size={28} color="#2f855a" />
          <Text style={{ fontSize: 16, color: "#2f855a", marginLeft: 5 }}>
            ความแรง
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.selectText}>เลือกโหมด</Text>
        <View style={styles.modeSelector}>
          <FlatList
            data={modes}
            renderItem={renderModeIcon}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            snapToInterval={itemWidth + itemSpacing}
            contentContainerStyle={{
              paddingHorizontal: (itemSpacing + 10) / 2,
            }}
          />
        </View>

        {/* Spinners for R/L counts */}
        <View style={styles.spinnerGridContainer}>
          {(selectedMode === 1 || selectedMode === 2) && (
            <View style={styles.spinnerGridRow}>
              <View style={styles.spinnerGridItem}>
                <InputSpinner
                  max={100}
                  min={0}
                  step={1}
                  value={L1}
                  onChange={(num) => setL1(num)}
                  style={styles.spinner}
                  skin="clean"
                  color="#2f855a"
                />
                <Text style={styles.spinnerGridLabel}>รอบ</Text>
              </View>
            </View>
          )}

          {selectedMode === 3 && (
            <>
              <View style={styles.spinnerGridRow}>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={L1}
                    onChange={(num) => setL1(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>L1</Text>
                </View>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={R1}
                    onChange={(num) => setR1(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>R1</Text>
                </View>
              </View>
              <View style={styles.spinnerGridRow}>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={L2}
                    onChange={(num) => setL2(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>L2</Text>
                </View>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={R2}
                    onChange={(num) => setR2(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>R2</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>เริ่มเกม</Text>
        </TouchableOpacity>

        {/* Info Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showInfoModal}
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mode Explanations</Text>
              {modes.map((mode) => (
                <Text key={mode.id} style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>
                    {mode.description.split(":")[0]}:{" "}
                  </Text>
                  {mode.description.split(":")[1]}
                </Text>
              ))}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Settings Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSetting}
          onRequestClose={() => setShowSetting(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: "#fafdfa" }]}>
              <Text style={styles.modalTitle}>ตั้งค่าความแรง</Text>

              <View style={styles.spinnerGridRow}>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={threL1}
                    onChange={(num) => setThresholdL1(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>L1</Text>
                </View>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={threR1}
                    onChange={(num) => setThresholdR1(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>R1</Text>
                </View>
              </View>
              <View style={styles.spinnerGridRow}>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={threL2}
                    onChange={(num) => setThresholdL2(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>L2</Text>
                </View>
                <View style={styles.spinnerGridItem}>
                  <InputSpinner
                    max={100}
                    min={0}
                    step={1}
                    value={threR2}
                    onChange={(num) => setThresholdR2(num)}
                    style={styles.spinner}
                    skin="clean"
                    color="#2f855a"
                  />
                  <Text style={styles.spinnerGridLabel}>R2</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSetting(false)}
              >
                <Text style={styles.closeButtonText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  ) : (
    <Field
      R1={selectedMode === 3 ? R1 : undefined}
      R2={selectedMode === 3 ? R2 : undefined}
      L1={L1}
      L2={selectedMode === 3 ? L2 : undefined}
      mode={selectedMode}
      threL1={threL1}
      threL2={threL2}
      threR1={threR1}
      threR2={threR2}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#419E68",
    marginTop: 30,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  selectText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f855a",
    marginBottom: 10,
  },
  modeSelector: {
    borderWidth: 2,
    borderColor: "#2f855a",
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  selectedIconContainer: {
    backgroundColor: "#d9f7be",
  },
  spinnerGridContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignSelf: "stretch",
    padding: 10,
    marginBottom: 20,
  },
  spinnerGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 8,
    width: "100%",
  },
  spinnerGridItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  spinner: {
    width: "80%",
    marginBottom: 5,
    borderRadius: 25,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  spinnerGridLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#2f855a",
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#2f855a",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default PatternScreen;
