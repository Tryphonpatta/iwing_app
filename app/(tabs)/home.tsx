import * as React from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBleManager } from "./context/blecontext";
import { Module } from "@/util/buttonType";
import { CHARACTERISTIC } from "@/enum/characteristic";
import { SelectList } from "react-native-dropdown-select-list";
import { base64toDec, decToBase64, hexToBase64 } from "@/util/encode";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

export type ModuleHome = Module | null;

export const isCenter = async (
  module: ModuleHome[],
  readCharacteristic: Function
) => {
  // if (module[3] == null || module[2] == null) {
  //   console.log("Module not found");
  //   return { left: -1, right: -1 };
  // }
  const right = await readCharacteristic(
    module[3]?.deviceId as string,
    CHARACTERISTIC.IWING_TRAINERPAD,
    CHARACTERISTIC.IR_RX
  );
  const left = await readCharacteristic(
    module[2]?.deviceId as string,
    CHARACTERISTIC.IWING_TRAINERPAD,
    CHARACTERISTIC.IR_RX
  );
  return { left, right };
};

export const isHit = async (
  module: ModuleHome[],
  readCharacteristic: Function,
  id: number
) => {
  try {
    const hit = await readCharacteristic(
      module[id]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_RX
    );
    console.log(hit);
    return hit ? hit == 255 : false;
  } catch (e) {
    console.log("Error: ", e);
  }
};

export default function Home() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState("");
  const [isCalibrate, setIsCalibrate] = React.useState(false);
  const isCalibrateRef = React.useRef(isCalibrate);

  const {
    bleManager,
    connectedDevices,
    module,
    setModule,
    setConnectedDevices,
    writeCharacteristic,
    readCharacteristic,
    disconnectDevice,
  } = useBleManager();
  const [selectedModule, setSelectedModule] = React.useState<number | null>(
    null
  );
  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const isCalibratingRef = React.useRef(isCalibrating);
  const test = async () => {
    // const read = await readCharacteristic(
    //   module[0]?.deviceId as string,
    //   CHARACTERISTIC.IWING_TRAINERPAD,
    //   CHARACTERISTIC.BUTTONS
    // );
    // console.log("read", read);
    const devices = await bleManager.connectToDevice(
      module[0]?.deviceId as string
    );
    await devices.discoverAllServicesAndCharacteristics();
    // console.log("character wow", buttonCharacteristic);
    const monitor = bleManager.monitorCharacteristicForDevice(
      module[0]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.BUTTONS.toLocaleLowerCase(),
      (error, characteristic) => {
        if (error) {
          console.error(
            "Failed to monitor characteristic:",
            error,
            error.iosErrorCode,
            error.errorCode
          );
          return;
        }
        console.log("Received characteristic:", characteristic);
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    monitor.remove();
    console.log("Monitor removed");
  };
  // export const isCenter = async () => {
  //   const right = readCharacteristic(
  //     module[3]?.deviceId as string,
  //     CHARACTERISTIC.IWING_TRAINERPAD,
  //     CHARACTERISTIC.IR_RX
  //   );
  //   const left = readCharacteristic(
  //     module[0]?.deviceId as string,
  //     CHARACTERISTIC.IWING_TRAINERPAD,
  //     CHARACTERISTIC.IR_RX
  //   );
  //   return { left: left, right: right };
  // };

  const testMusic = async (index: number) => {
    writeCharacteristic(
      module[index]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.MUSIC,
      hexToBase64("616161")
    );
  };

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

  const setThreshold = (val: number) => {
    if (module.find((e) => e == null)) {
      console.log("Module not found");
      return;
    }
    for (let i = 0; i < 4; i++) {
      writeCharacteristic(
        module[i]?.deviceId as string,
        CHARACTERISTIC.IWING_TRAINERPAD,
        CHARACTERISTIC.VIB_THRES,
        hexToBase64(decToBase64(val))
      );
    }
    console.log("Threshold set to: ", val);
  };

  // const isHit = async (id: number) => {
  //   try {
  //     const hit = await readCharacteristic(
  //       module[id]?.deviceId as string,
  //       CHARACTERISTIC.IWING_TRAINERPAD,
  //       CHARACTERISTIC.VIBRATION
  //     );
  //     return hit ? hit == 255 : false;
  //   } catch (e) {
  //     console.log("Error: ", e);
  //   }
  // };

  const calibrate = async (sender: number, receiver: number) => {
    writeCharacteristic(
      module[sender]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_TX,
      hexToBase64("01")
    );
    writeCharacteristic(
      module[receiver]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.MODE,
      hexToBase64("01")
    );
    while (isCalibratingRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("Calibration done");
    writeCharacteristic(
      module[sender]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_TX,
      hexToBase64("00")
    );
    writeCharacteristic(
      module[receiver]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.MODE,
      hexToBase64("00")
    );
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
              style={[
                styles.outlineContainer,
                {
                  borderColor: module[0] ? "green" : "#808080",
                  backgroundColor: module[0]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (module[0] != null) {
                  setSelectedModule(1);
                  toggleModal("Device 1 Content");
                }
              }}
            >
              <Text style={styles.buttonText}>Device 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outlineContainer,
                {
                  borderColor: module[1] ? "green" : "#808080",
                  backgroundColor: module[1]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (module[1] != null) {
                  setSelectedModule(2);
                  toggleModal("Device 2 Content");
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
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/images/field.png")}
                style={styles.fieldImage}
              />
            </View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.outlineContainer,
                {
                  borderColor: module[2] ? "green" : "#808080",
                  backgroundColor: module[2]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (module[2] != null) {
                  setSelectedModule(3);
                  toggleModal("Device 3 Content");
                }
              }}
            >
              <Text style={styles.buttonText}>Device 3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outlineContainer,
                {
                  borderColor: module[3] ? "green" : "#808080",
                  backgroundColor: module[3]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (module[3] != null) {
                  setSelectedModule(4);
                  toggleModal("Device 4 Content");
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
            <Ionicons name="checkmark-circle" size={50} color="green" />
            <Text style={styles.modalText}>{modalContent}</Text>
            <View style={styles.dividerLine} />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "green" }]}
              onPress={async () => {
                // if (
                //   selectedModule &&
                //   connectedDevice[selectedModule - 1] != null
                // ) {
                //   disconnectDevice(
                //     connectedDevice[selectedModule - 1] as Device
                //   );
                // }
                startStreamingData(connectedDevice[selectedModule as number - 1] as Device, CHARACTERISTIC.BUTTONS)
              }}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: "#fff", fontWeight: "bold" },
                ]}
              >
                disconnect
              </Text>
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
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 16,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: "red", marginRight: 8 },
                ]} // Adjust marginRight to add spacing between buttons
                onPress={() => {
                  // console.log(module);
                  // console.log(selectedModule);
                  if (selectedModule && module[selectedModule - 1] != null) {
                    blink(module[selectedModule - 1] as Module);
                  }
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#fff", fontWeight: "bold" },
                  ]}
                >
                  Blink
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: "orange", marginRight: 8 },
                ]} // Adjust marginRight to add spacing between buttons
                onPress={() => {
                  if (
                    selectedModule &&
                    module[selectedModule - 1] != null &&
                    module[4 - selectedModule] &&
                    isCalibrating === false
                  ) {
                    setIsCalibrating(true);
                    isCalibratingRef.current = true;
                    calibrate(selectedModule - 1, 4 - selectedModule);
                  } else {
                    console.log("Invalid module");
                    setIsCalibrating(false);
                    isCalibratingRef.current = false;
                  }
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#fff", fontWeight: "bold" },
                  ]}
                >
                  Calibrate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { marginRight: 8 }]} // Adjust marginRight to add spacing between buttons
                onPress={() => {
                  testMusic((selectedModule as number) - 1);
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#fff", fontWeight: "bold" },
                  ]}
                >
                  Music
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                style={[styles.closeButton, { marginLeft: 8 }]}
                onPress={() => {
                  setSelectedModule(null);
                  toggleModal("");
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity> */}
            </View>
            {/* <Text style={styles.conditionalText}>
              {isCalibrate ? "Sender" : "Receiver"}
            </Text> */}
            <View style={styles.dividerLine} />
            <View style={{ width: "100%", alignItems: "flex-end" }}>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: "#cccccc", marginLeft: 4 },
                ]}
                onPress={() => {
                  setSelectedModule(null);
                  toggleModal("");
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
  conditionalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // Customize the color as desired
    marginVertical: 10,
  },
  dividerLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc", // Light gray line color
    marginVertical: 10, // Adjust spacing above and below the line as needed
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  fieldImage: {
    width: 300,
    height: 350,
    resizeMode: "cover", // Adjust the image scaling as needed
  },
  outlineContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 0, 0.2)", // Light transparent green
    minWidth: "25%",
    borderRadius: 10,
    borderWidth: 2,
  },
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
    minWidth: "25%",
  },
  buttonText: {
    color: "#00000",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 320,
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    elevation: 8,
    gap: 10,

    shadowColor: "rgba(0, 0, 0, 0.24)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,

    borderColor: "#f0f0f0",
    borderWidth: 1,
    margin: 20,
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    // marginBottom: 20,
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
