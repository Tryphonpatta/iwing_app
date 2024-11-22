import React, { useState, useEffect, useRef } from "react"; // Import necessary React hooks
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Module,
  Modal,
} from "react-native"; // Import React Native components
import tw from "twrnc";

import { RouteProp, useRoute } from "@react-navigation/native"; // Import navigation hooks
import { useBleManager } from "./context/blecontext"; // Import custom BLE manager context
import { CHARACTERISTIC } from "@/enum/characteristic"; // Import BLE characteristics enumeration

// import { Result } from "@/app/(tabs)/result";
import ShowPad from "../running";
import { Device } from "react-native-ble-plx";

function createInterval(callback: any, delay: number) {
  let intervalId = setInterval(callback, delay);
  let resolvePromise: any;

  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  return { intervalId, clear, promise };
}
// Define the StartGame functional component
const StartGame = () => {
  // Destructure positions from the IconPosition context
  // const { positions } = useIconPosition();

  // State to track the currently active pad index; -1 means no active pad
  const [activePadIndex, setActivePadIndex] = useState(-1);

  //
  const activePadIndexRef = useRef<number>(activePadIndex);
  // setActivePadIndex(-1);
  // State to track if the game is currently playing
  const [isHit, setIshit] = useState(1);
  const isHitRef = useRef(isHit);
  const isHitObjRef = useRef([1, 1, 1, 1, 1, 1, 1, 1, 1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowresult] = useState(false);

  // Ref to store the interval ID for hit detection to allow clearing it later
  const hitDetectionIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to store the interval ID for pad activation to allow clearing it later
  const padActivationIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to keep track of the latest hit count to avoid stale closures
  const hitCountRef = useRef(0);

  // Ref to keep track of the latest isPlaying state
  const isPlayingRef = useRef(isPlaying);
  // Example positions data for pads
  const positions = [
    { x: 50, y: 100 },
    { x: 150, y: 200 },
    { x: 250, y: 300 },
  ];

  // Update isPlayingRef whenever isPlaying state changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Destructure BLE manager functions and connected devices from the context
  const {
    connectedDevice,
    writeCharacteristic,
    monitorCharacteristic,
    monitorCharacteristicRef,
  } = useBleManager();
  let gameEndTime: number;

  // Define the type for route parameters received from the training page
  type StartScreenParams = {
    lightOut: string;
    hitCount: number;
    timeout: number;
    lightDelay: string;
    delaytime: number;
    duration: string;
    hitduration: number;
    minDuration: number;
    secDuration: number;
  };

  // Retrieve the route and its parameters using the useRoute hook
  const route = useRoute<RouteProp<{ start: StartScreenParams }, "start">>();
  const [pressButton, setPressButton] = useState(false);

  // Destructure parameters with default values in case they are undefined
  const {
    lightOut = null,
    hitCount = 0,
    timeout = 0,
    lightDelay = null,
    delaytime = -1,
    duration = null,
    hitduration = 0,
    minDuration = 0,
    secDuration = 0,
  } = route.params || {};
  // Example positions data for pads
  let currenttime: number, starttime: number;

  // State to track the number of hits by the user
  const [userHitCount, setUserHitCount] = useState(0);

  // Update hitCountRef whenever userHitCount state changes
  useEffect(() => {
    hitCountRef.current = userHitCount;
  }, [userHitCount]);

  // useEffect hook to log the userHitCount whenever it updates
  useEffect(() => {
    console.log(`Hit Count updated: ${userHitCount}`);
  }, [userHitCount]);

  const isHitMode = lightOut === "Hit" || lightOut === "Hit or Timeout";
  const isTimeMode = lightOut === "Timeout" || lightOut === "Hit or Timeout";
  const isHitModeDur = duration === "Hit" || duration === "Hit or Timeout";
  const isTimeModeDur = duration === "Timeout" || duration === "Hit or Timeout";

  const Result = ({
    isHitMode,
    isTimeMode,
    isHitModeDur,
    isTimeModeDur,
    onClose,
  }: {
    isHitMode: boolean;
    isTimeMode: boolean;
    isHitModeDur: boolean;
    isTimeModeDur: boolean;
    onClose: () => void;
  }) => (
    <Modal animationType="slide" transparent={true} visible={showResult}>
      <View style={styles.overlay}>
        <View style={styles.detailBox}>
          <Text style={styles.sectionTitle}>Training Detail</Text>
          <Text style={styles.separator}>---------------</Text>

          <View style={styles.col}>
            <Text style={styles.label}>Lights Out</Text>
            <View style={styles.row}>
              <Text style={styles.label}>• Mode </Text>
              <Text style={styles.output}>{lightOut}</Text>
            </View>
            {isTimeMode && (
              <View style={styles.row}>
                <Text style={styles.label}>• Time out </Text>
                <Text style={styles.output}>{timeout}</Text>
              </View>
            )}
            {isHitMode && (
              <View style={styles.row}>
                <Text style={styles.label}>•Hit count</Text>
                <Text style={styles.output}>{hitCount || "N/A"} times</Text>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Light Delay Time</Text>
            <Text style={styles.output}>{delaytime || 0} seconds</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.row}>
              <Text style={styles.label}>• Mode</Text>
              <Text style={styles.output}>{duration || "N/A"}</Text>
            </View>
            {isTimeModeDur && (
              <View style={styles.row}>
                <Text style={styles.label}>• Time out</Text>
                <Text style={styles.output}>
                  {minDuration * 60 + secDuration || "N/A"} seconds
                </Text>
              </View>
            )}
            {isHitModeDur && (
              <View style={styles.row}>
                <Text style={styles.label}>• Hit count</Text>
                <Text style={styles.output}>{hitduration || "N/A"} times</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Measurement</Text>
          <Text style={styles.separator}>---------------</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Hit Count</Text>
            <Text style={styles.output}>{userHitCount || "N/A"} times</Text>
          </View>

          {/* <View style={styles.row}>
            <Text style={styles.label}>Total Time</Text>
            <Text style={styles.output}>
              {(gameEndTime - starttime) / 1000} seconds
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time Remain</Text>
            <Text style={styles.output}>
              {(minDuration * 60 + secDuration - (gameEndTime - starttime)) /
                1000}{" "}
              seconds
            </Text>
          </View> */}

          <View style={styles.row}>
            {isHitMode && (
              <View style={styles.row}>
                <Text style={styles.label}>• Hit Percentage</Text>
                <Text style={styles.output}>
                  {(userHitCount / hitduration) * 100 || "N/A"} %
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleCloseResult = () => setShowresult(false);
  // Function to detect hits by the user with proper handling of lightOut modes
  // const detectHits = async (activePadIndexRef: number): Promise<number> => {
  //   try {
  //     // ตรวจสอบว่าอุปกรณ์เชื่อมต่ออยู่และ activePadIndex อยู่ในช่วงที่ถูกต้องหรือไม่
  //     console.log(
  //       `active padingix->${activePadIndexRef}, length conntect->${connectedDevice.length}`
  //     );

  //     if (
  //       connectedDevice.length === 0 ||
  //       activePadIndexRef < 0 ||
  //       activePadIndexRef >= connectedDevice.length
  //     ) {
  //       console.log("No valid connected devices or invalid activePadIndex.");
  //       return -1;
  //     }

  //     const device = connectedDevice[activePadIndexRef] as Device;
  //     // อ่านค่าปุ่มจากอุปกรณ์
  //     const press = await monitorCharacteristic(
  //       device,
  //       setIshit,
  //       CHARACTERISTIC.BUTTONS
  //     );

  //     console.log(`Device ${device?.id} - press: ${isHit}`);
  //     if (isHit === null) {
  //       return -1;
  //     } else {
  //       return isHit;
  //     }
  //     return press === 0 ? 0 : 1; // คืนค่า 0 หากมีการกดปุ่ม มิฉะนั้นคืนค่า 1
  //   } catch (error) {
  //     console.error("Error in detectHits:", error);
  //     return 1;
  //   }
  // };

  // Function to start the game with additional modes and conditions
  const play_2 = async (
    timeduration: number,
    interval: number,
    delay: number
  ) => {
    if (isPlaying) return;
    const activateRandomPad = () => {
      const totalPads = connectedDevice.filter(
        (device) => device !== null
      ).length;
      const randomIndex = Math.floor(Math.random() * totalPads);
      console.log(`Activated pad index: ${randomIndex}`);
      return randomIndex; // Return the selected index
    };
    let hit = 0;
    console.log("hit duration", hitduration);
    while (hit < hitduration) {
      const index = activateRandomPad();
      if (!connectedDevice[index]) {
        console.log("device is null");
        continue;
      }
      console.log("index", index);
      //turn on
      // await writeCharacteristic(
      //   connectedDevice[index].device,
      //   CHARACTERISTIC.LED,
      //   "AAD/"
      // );
      connectedDevice[index].writeCharacteristic(CHARACTERISTIC.LED, "AAD/");
      console.log("write");
      const isHitSub = await monitorCharacteristicRef(
        connectedDevice[index].device,
        isHitRef,
        CHARACTERISTIC.BUTTONS
      );

      console.log("monitored", hitCount);
      let buttonHit = 0;
      while (buttonHit < hitCount) {
        console.log("button Hit", buttonHit);
        while (isHitRef.current) {
          // console.log("loop for hit", isHitRef.current);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        while (!isHitRef.current) {
          // console.log("loop for hit", isHitRef.current);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        buttonHit += 1;
        hit += 1;
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("loop for hit", buttonHit);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      // await writeCharacteristic(
      //   connectedDevice[index].device,
      //   CHARACTERISTIC.LED,
      //   "AAAA"
      // );
      connectedDevice[index].writeCharacteristic(CHARACTERISTIC.LED, "AAAA");
      isHitSub?.remove();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    setIsPlaying(false);
    setShowresult(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={[
          tw`text-center font-bold text-white my-4 mt-8 shadow-lg`,
          { backgroundColor: "#419E68", fontSize: 36 },
        ]}
      >
        Test
      </Text>
      <TouchableOpacity
        style={styles.playButton} // Styles for the play button
        onPress={() => {
          console.log("Start Game button pressed.");
          play_2(
            (minDuration * 60 + secDuration) * 1000, // Calculate duration in milliseconds
            timeout * 1000, // Convert timeout to milliseconds
            delaytime * 1000 // Delay time is already in milliseconds
          ); // ตั้งค่า isPlaying เป็น true เมื่อกดปุ่ม
          // setIsPlaying(true);
          setShowresult(false);
        }}
      >
        <Text style={styles.buttonText}>
          {pressButton ? `Playing...${isHitRef.current}` : "Start Game 2"}
        </Text>
      </TouchableOpacity>
      <View style={styles.hitCountContainer}>
        <Text style={styles.hitCountText}>Hit Count: {userHitCount}</Text>
      </View>

      {/* Display all pads based on their positions */}
      <ShowPad isPlaying={isPlaying} activePadIndex={activePadIndex}></ShowPad>

      {/* Display the current hit count */}

      {showResult && (
        <Result
          isHitMode={isHitMode}
          isTimeMode={isTimeMode}
          isHitModeDur={isHitModeDur}
          isTimeModeDur={isTimeModeDur}
          onClose={handleCloseResult}
        />
      )}
      {/* </TouchableOpacity> */}
    </SafeAreaView>
  );
};

// Define the styles for the component
// Define the styles for the component
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e1f4f3" }, // Container style with background color
  header: {
    textAlign: "center", // Center align the text
    fontSize: 24, // Font size
    fontWeight: "bold", // Bold font weight
    marginVertical: 20, // Vertical margin
  },
  iconContainer: { position: "absolute", alignItems: "center" }, // Absolute positioning for icons
  playButton: {
    backgroundColor: "#2f95dc", // Button background color
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    borderRadius: 10, // Rounded corners
    alignSelf: "center", // Center the button horizontally
    marginTop: 20, // Top margin
  },
  result_container: {
    flex: 1,
    backgroundColor: "#E6F7F4",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    alignItems: "center",
    justifyContent: "center",
  },
  detailBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 8,
  },
  separator: {
    fontSize: 12,
    color: "#000000",
    marginBottom: 12,
  },
  col: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: "#000000",
  },
  output: {
    fontSize: 14,
    color: "#2E7D32",
  },
  buttonText: {
    color: "white", // Text color
    fontWeight: "bold", // Bold font weight
    fontSize: 16, // Font size
  },
  hitCountContainer: {
    marginTop: 30, // Top margin
    alignItems: "center", // Center align the hit count
  },
  hitCountText: {
    fontSize: 20, // Font size for hit count
    fontWeight: "bold", // Bold font weight
    color: "#333", // Text color
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4A4A4A",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
    width: "70%",
  },
});

export default StartGame; // Export the StartGame component
