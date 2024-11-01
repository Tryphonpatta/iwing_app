import * as React from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBleManager } from "./context/blecontext";
import { Module } from "@/util/buttonType";
import { CHARACTERISTIC } from "@/enum/characteristic";
import { SelectList } from "react-native-dropdown-select-list";
import { base64toDec, base64toDecManu, hexToBase64 } from "@/util/encode";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

// Define the type for the module state
type ModuleHome = Module | null;

export default function Home() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState("");
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
  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const isCalibratingRef = React.useRef(isCalibrating);

  const isCenter = async () => {
    const right = readCharacteristic(
      module[3]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_RX
    );

    const left = readCharacteristic(
      module[0]?.deviceId as string,
      CHARACTERISTIC.IWING_TRAINERPAD,
      CHARACTERISTIC.IR_RX
    );
    return { left: left, right: right };
  };

  const blink = async (device: Module) => {
    console.log("Blinking");
    let redLight = true;
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
    console.log("Connected devices: ", connectedDevices);
    const moduleTemp: ModuleHome[] = [];
    for (let i = 0; i < connectedDevices.length; i++) {
      moduleTemp.push(connectedDevices[i]);
    }
    console.log("Module: ", moduleTemp);
    setModule(moduleTemp);
  }, [connectedDevices]);

  const DeviceCard = ({
    device,
    pad_no,
  }: {
    device: Module;
    pad_no: number;
  }) => (
    <View style={styles.cardcontainer}>
      <Text>Trainer Pad {pad_no}</Text>
      <View>
        <TouchableOpacity onPress={() => blink(device)}>
          <Text>Blink</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={[
          tw`text-center font-bold text-white my-4 mt-2 shadow-lg`,
          { backgroundColor: "#419E68", fontSize: 36 },
        ]}
      >
        Home
      </Text>
      <FlatList
        data={module}
        keyExtractor={(item, index) => (item ? item.deviceId : `null-${index}`)}
        renderItem={({ item, index }) =>
          item && <DeviceCard device={item} pad_no={index + 1} />
        }
        ListEmptyComponent={
          <Text style={tw`mx-4 my-2`}>No connected devices</Text>
        }
      />
      <View style={styles.footer}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  footer: {
    padding: 10,
    backgroundColor: "#E8F5E9",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cardcontainer: {
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
