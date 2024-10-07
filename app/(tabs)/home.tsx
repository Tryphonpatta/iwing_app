import * as React from "react";
import { StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBleManager } from "./context/blecontext";
import { Module } from "@/util/buttonType";
import { CHARACTERISTIC } from "@/enum/characteristic";
import { SelectList } from "react-native-dropdown-select-list";
import { base64toDec, hexToBase64 } from "@/util/encode";
import tw from "twrnc";

type ModuleHome = Module | null;
export default function Home() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState("");
  const [isCalibrate, setIsCalibrate] = React.useState(false);
  const isCalibrateRef = React.useRef(isCalibrate); // This ref tracks the latest state of isCalibrate

  const {
    bleManager,
    connectedDevices,
    setConnectedDevices,
    writeCharacteristic,
    readCharacteristic,
  } = useBleManager();
  const [module, setModule] = React.useState<ModuleHome[]>([]);
  const [selectedModule, setSelectedModule] = React.useState<number | null>(
    null
  );
  const blink = async (device: Module) => {
    console.log("Blinking");
    let redLight = true;
    const maxRetry = 10;
    const redColor = "/wAB";
    const blueColor = "AAD/";
    for (let i = 0; i < 10; i++) {
      await writeCharacteristic(
        device.deviceId,
        CHARACTERISTIC.IWING_TRAINERPAD,
        CHARACTERISTIC.LED,
        redLight ? redColor : blueColor
      );
      redLight = !redLight;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    writeCharacteristic(
      device.deviceId,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.LED,
      "AAAA"
    );
  };

  const calibrate = async (sender: number, receiver: number) => {
    console.log(sender, receiver);
    writeCharacteristic(
      module[sender]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_TX,
      hexToBase64("01")
    );
    console.log("calibrate : ", isCalibrate);
    console.log("turn on irtx");
    const maxRetry = 10;
    let retry = 0;
    while (isCalibrateRef.current) {
      if (retry > maxRetry) {
        console.log("Failed to calibrate (Timeout)");
        break;
      }
      for (let i = 0; i < 100; i++) {
        if (!isCalibrateRef.current) break;
        const data = await readCharacteristic(
          module[receiver]?.deviceId as string,
          CHARACTERISTIC.IWING_TRAINERPAD,
          CHARACTERISTIC.IR_RX
        );
        console.log("data : ", data);
        const val = base64toDec(data ? data : "00") == 1 ? 1 : 0;
        console.log("value : ", val);
        if (val != 1) {
          writeCharacteristic(
            module[receiver]?.deviceId as string,
            CHARACTERISTIC.IWING_TRAINERPAD,
            CHARACTERISTIC.LED,
            hexToBase64("ff0000")
          );
        } else {
          writeCharacteristic(
            module[receiver]?.deviceId as string,
            CHARACTERISTIC.IWING_TRAINERPAD,
            CHARACTERISTIC.LED,
            hexToBase64("00ff00")
          );
        }
        console.log(data);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      retry++;
    }
    writeCharacteristic(
      module[sender]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_TX,
      hexToBase64("00")
    );
    writeCharacteristic(
      module[receiver]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.LED,
      hexToBase64("000000")
    );
    console.log("turn off irtx");
  };

  React.useEffect(() => {
    isCalibrateRef.current = isCalibrate;
  }, [isCalibrate]);

  React.useEffect(() => {
    const moduleTemp: ModuleHome[] = [];
    for (let i = 0; i < connectedDevices.length; i++) {
      moduleTemp.push(connectedDevices[i]);
    }
    for (let i = moduleTemp.length; i < 4; i++) {
      moduleTemp.push(null);
    }
    setModule(moduleTemp);
  }, [connectedDevices]);
  const toggleModal = (content: string) => {
    setModalContent(content);
    setIsModalVisible(!isModalVisible);
  };
  function swapModule(index1: number, index2: number) {
    const moduleTemp = [...module];
    const temp = moduleTemp[index1];
    moduleTemp[index1] = moduleTemp[index2];
    moduleTemp[index2] = temp;
    setModule(moduleTemp);
    console.log("swapped");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}> */}
      <Text
        style={[
          tw`text-center font-bold text-white my-4 mt-2 shadow-lg`,
          { backgroundColor: "#419E68", fontSize: 36 },
        ]}
      >
        Home
      </Text>
      {/* </View> */}

      {/* Content */}
      <View style={styles.content}>
        {/* <Text style={styles.contentText}>This is the main content area</Text> */}
        <View style={{ gap: 30 }}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: module[0] ? "green" : "#BFBFBF",
                minWidth: "40%",
                borderRadius: 10,
              }}
              onPress={() => {
                if (module[0] != null) {
                  setSelectedModule(1);
                  toggleModal("Button 1 Content");
                }
              }}
            >
              <Text style={styles.buttonText}>Device 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: module[1] ? "green" : "#BFBFBF",
                minWidth: "40%",
                borderRadius: 10,
              }}
              onPress={() => {
                if (module[1] != null) {
                  setSelectedModule(2);
                  toggleModal("Button 2 Content");
                }
              }}
            >
              <Text style={styles.buttonText}>Device 2</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
            }}
          >
            <View
              style={{ backgroundColor: "green", width: 300, height: 350 }}
            ></View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: module[2] ? "green" : "#BFBFBF",
                minWidth: "40%",
                borderRadius: 10,
              }}
              onPress={() => {
                if (module[2] != null) {
                  setSelectedModule(3);
                  toggleModal("Button 3 Content");
                }
              }}
            >
              <Text style={styles.buttonText}>Device 3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: module[3] ? "green" : "#BFBFBF",
                minWidth: "40%",
                borderRadius: 10,
              }}
              onPress={() => {
                if (module[3] != null) {
                  setSelectedModule(4);
                  toggleModal("Button 4 Content");
                }
              }}
            >
              <Text style={styles.buttonText}>Device 4</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => toggleModal("")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalContent}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.log(module);
                console.log(selectedModule);
                if (selectedModule && module[selectedModule - 1] != null) {
                  blink(module[selectedModule - 1] as Module);
                }
              }}
            >
              <Text style={styles.buttonText}>Blink</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (
                  !isCalibrate &&
                  selectedModule &&
                  module[4 - selectedModule] != null
                ) {
                  setIsCalibrate(true);
                  isCalibrateRef.current = true;
                  await calibrate(selectedModule - 1, 4 - selectedModule);
                } else if (isCalibrate) {
                  console.log("cancel calibrate : ", isCalibrate);
                  setIsCalibrate(false);
                } else {
                  console.log("Module not found");
                }
              }}
            >
              <Text style={styles.buttonText}>SetUP</Text>
            </TouchableOpacity>
            <SelectList
              setSelected={(val: number) => {
                swapModule((selectedModule as number) - 1, val - 1);
                setSelectedModule(null);
                toggleModal("");
              }}
              data={[1, 2, 3, 4].filter(
                (val) => val !== (selectedModule as number)
              )}
              save="value"
              boxStyles={{ height: 40, minWidth: 150, width: 150 }}
              dropdownStyles={{ maxHeight: 120 }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedModule(null);
                toggleModal("");
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Calibration Modal */}

      {/* Footer */}
      <View style={styles.footer}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  header: {
    padding: 20,
    backgroundColor: "#419E68",
    alignItems: "center",
  },
  headerText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 16,
    color: "#333",
  },
  buttonRow: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    width: "100%",
    gap: 20,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    minWidth: "40%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    padding: 10,
    backgroundColor: "#E8F5E9",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
