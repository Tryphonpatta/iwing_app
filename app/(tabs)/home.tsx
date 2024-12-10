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
import { ConnectedDevice, useBleManager } from "./context/blecontext";
import { Module } from "@/util/buttonType";
import { CHARACTERISTIC } from "@/enum/characteristic";
import { SelectList } from "react-native-dropdown-select-list";
import { base64toDec, decToBase64, hexToBase64 } from "@/util/encode";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { Device } from "react-native-ble-plx";
import { Audio } from "expo-av";

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

// export const isHit = async (
//   module: ModuleHome[],
//   readCharacteristic: Function,
//   id: number
// ) => {
//   try {
//     const hit = await readCharacteristic(
//       module[id]?.deviceId as string,
//       CHARACTERISTIC.IWING_TRAINERPAD,
//       CHARACTERISTIC.IR_RX
//     );
//     console.log(hit);
//     return hit ? hit == 255 : false;
//   } catch (e) {
//     console.log("Error: ", e);
//   }
// };

export default function Home() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState("");
  const [isCalibrate, setIsCalibrate] = React.useState(false);
  const isCalibrateRef = React.useRef(isCalibrate);

  const {
    connectedDevice,
    writeCharacteristic,
    swapConnectedDevice,
    disconnectDevice,
  } = useBleManager();
  const [selectedModule, setSelectedModule] = React.useState<number | null>(
    null
  );
  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const isCalibratingRef = React.useRef(isCalibrating);

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
      connectedDevice[index]?.device as Device,
      CHARACTERISTIC.MUSIC,
      hexToBase64("616161")
    );
  };

  const blink = async (device: ConnectedDevice) => {
    console.log("Blinking");
    let redLight = true;
    const maxRetry = 10;
    const redColor = "/wAB";
    const blueColor = "AAD/";
    console.log("sounddd");
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/audio/beep-06.mp3")
    );
    await sound.playAsync();
    console.log("sounddd");
    await device.blinkLED([redColor, blueColor]);
    // await device.writeCharacteristic(
    //   CHARACTERISTIC.MODE,
    //   hexToBase64("00000102")
    // );
    // for (let i = 0; i < 10; i++) {
    //   await writeCharacteristic(
    //     device,
    //     CHARACTERISTIC.LED,
    //     redLight ? redColor : blueColor
    //   );
    //   redLight = !redLight;
    //   await new Promise((resolve) => setTimeout(resolve, 10));
    // }
    // await writeCharacteristic(device, CHARACTERISTIC.LED, "AAAA");
  };

  const calibrate = async (sender: number, receiver: number) => {
    // writeCharacteristic(
    //   connectedDevice[sender]?.device as Device,
    //   CHARACTERISTIC.IR_TX,
    //   hexToBase64("01")
    // );
    connectedDevice[sender]?.writeCharacteristic(
      CHARACTERISTIC.IR_TX,
      hexToBase64("01")
    );
    // writeCharacteristic(
    //   connectedDevice[receiver]?.device as Device,
    //   CHARACTERISTIC.MODE,
    //   hexToBase64("01")
    // );
    connectedDevice[receiver]?.writeCharacteristic(
      CHARACTERISTIC.MODE,
      hexToBase64("01")
    );
    while (isCalibratingRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("Calibration done");
    // writeCharacteristic(
    //   connectedDevice[sender]?.device as Device,
    //   CHARACTERISTIC.IR_TX,
    //   hexToBase64("00")
    // );
    connectedDevice[sender]?.writeCharacteristic(
      CHARACTERISTIC.IR_TX,
      hexToBase64("00")
    );
    // writeCharacteristic(
    //   connectedDevice[receiver]?.device as Device,
    //   CHARACTERISTIC.MODE,
    //   hexToBase64("00")
    // );
    connectedDevice[receiver]?.writeCharacteristic(
      CHARACTERISTIC.MODE,
      hexToBase64("00")
    );
  };

  React.useEffect(() => {
    isCalibrateRef.current = isCalibrate;
  }, [isCalibrate]);

  const toggleModal = (content: string) => {
    setModalContent(content);
    setIsModalVisible(!isModalVisible);
  };
  function swapModule(index1: number, index2: number) {
    swapConnectedDevice(index1, index2);
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
                  borderColor: connectedDevice[0] ? "green" : "#808080",
                  backgroundColor: connectedDevice[0]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (connectedDevice[0] != null) {
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
                  borderColor: connectedDevice[1] ? "green" : "#808080",
                  backgroundColor: connectedDevice[1]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (connectedDevice[1] != null) {
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
              <TouchableOpacity
                style={[
                  styles.outlineContainer,
                  {
                    borderColor: connectedDevice[4] ? "green" : "#808080",
                    backgroundColor: connectedDevice[4]
                      ? "rgba(0, 255, 0, 0.2)"
                      : "#BFBFBF",
                  },
                  styles.overlayButton,
                ]}
                onPress={() => {
                  if (connectedDevice[4] != null) {
                    setSelectedModule(5);
                    toggleModal("Device 5 Content");
                  }
                }}
              >
                <Text style={styles.buttonText}>Device Center</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.outlineContainer,
                {
                  borderColor: connectedDevice[2] ? "green" : "#808080",
                  backgroundColor: connectedDevice[2]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (connectedDevice[2] != null) {
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
                  borderColor: connectedDevice[3] ? "green" : "#808080",
                  backgroundColor: connectedDevice[3]
                    ? "rgba(0, 255, 0, 0.2)"
                    : "#BFBFBF",
                },
              ]}
              onPress={() => {
                if (connectedDevice[3] != null) {
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
              style={[styles.button, { backgroundColor: "blue" }]}
              onPress={async () => {
                if (
                  selectedModule &&
                  connectedDevice[selectedModule - 1] != null
                ) {
                  console.log("set Default");
                  await connectedDevice[selectedModule - 1]?.changeMode(
                    0,
                    0,
                    1,
                    2
                  );
                }
              }}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: "#fff", fontWeight: "bold" },
                ]}
              >
                Set Default
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "green" }]}
              onPress={async () => {
                if (
                  selectedModule &&
                  connectedDevice[selectedModule - 1] != null
                ) {
                  await disconnectDevice(
                    connectedDevice[selectedModule - 1]?.device as Device
                  );
                }
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
              data={[1, 2, 3, 4, 5].filter(
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
                  if (
                    selectedModule &&
                    connectedDevice[selectedModule - 1] != null
                  ) {
                    blink(
                      connectedDevice[selectedModule - 1] as ConnectedDevice
                    );
                    if (selectedModule - 1 === 3) {
                      connectedDevice[4]?.writeCharacteristic(
                        CHARACTERISTIC.MODE,
                        hexToBase64("00000102")
                      );
                    }
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
                    connectedDevice[selectedModule - 1] != null &&
                    connectedDevice[5 - selectedModule] &&
                    isCalibrating === false
                  ) {
                    setIsCalibrating(true);
                    isCalibratingRef.current = true;
                    calibrate(selectedModule - 1, 5 - selectedModule);
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
  overlayButton: {
    position: "absolute",
    alignItems: "center",
    height: 100,
    paddingHorizontal: 30,
    maxWidth: 150,
  },
});
