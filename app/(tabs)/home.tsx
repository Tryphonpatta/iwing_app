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
import { CHARACTERISTIC } from "@/enum/characteristic";
import { SelectList } from "react-native-dropdown-select-list";
import { base64toDec, base64toDecManu, hexToBase64 } from "@/util/encode";
import tw from "twrnc";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BleManager, Device } from "react-native-ble-plx";

// Define the type for the module state
type ConnectedDevice = Device | null;

export default function Home() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState("");
  const { connectedDevice, writeCharacteristic } = useBleManager();
  // const blemanager = new BleManager();
  const [module, setModule] = React.useState<ConnectedDevice[]>([]);
  const [selectedModule, setSelectedModule] = React.useState<number | null>(
    null
  );
  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const isCalibratingRef = React.useRef(isCalibrating);
  console.log("Connected devices at start: ", connectedDevice);
  React.useEffect(() => {
    console.log("Connected devices: ", connectedDevice);
    const moduleTemp: ConnectedDevice[] = [];
    for (let i = 0; i < connectedDevice.length; i++) {
      moduleTemp.push(connectedDevice[i] as Device);
    }
    console.log("Module: ", moduleTemp);
    setModule(moduleTemp);
  }, [connectedDevice]);
  console.log(connectedDevice);
  const blink = async (device: Device) => {
    console.log("Blinking");
    let redLight = true;
    const redColor = "/wAB";
    const blueColor = "AAD/";
    for (let i = 0; i < 10; i++) {
      await writeCharacteristic(
        device,
        CHARACTERISTIC.LED,
        redLight ? redColor : blueColor
      );
      redLight = !redLight;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    //turn off the led light
    await writeCharacteristic(device, CHARACTERISTIC.LED, "AAAA");
  };

  const DeviceCard = ({
    device,
    pad_no,
  }: {
    device: Device;
    pad_no: number;
  }) => (
    <View style={styles.cardcontainer}>
      <MaterialIcons name="wb-twilight" size={60} color="black" />
      <View style={styles.cardcontent}>
        <Text>Trainer Pad : {pad_no}</Text>
        <View style={styles.blinkbutton}>
          <TouchableOpacity onPress={async () => await blink(device)}>
            <Text style={tw`text-gray-700 `}>Blink</Text>
          </TouchableOpacity>
        </View>
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
      <View style={tw`bg-white shadow-lg`}>
        <Text style={tw`text-lg font-bold text-black rounded-lg p-2 `}>
          Connected Device
        </Text>
      </View>
      <FlatList
        data={connectedDevice.filter((d) => d != null)}
        keyExtractor={(item, index) => (item ? item.id : `null-${index}`)}
        renderItem={({ item, index }) =>
          item && <DeviceCard device={item} pad_no={index} />
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
    backgroundColor: "#e1f4f3",
  },
  footer: {
    padding: 10,
    backgroundColor: "#E8F5E9",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cardcontainer: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
  },
  cardcontent: {
    flexDirection: "column",
  },
  blinkbutton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    position: "absolute",
    right: 10,
    marginTop: 25,
  },
});
