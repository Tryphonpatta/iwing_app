import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import { useBleManager } from "./(tabs)/context/blecontext";
import { Module } from "@/util/buttonType";
import { MaterialIcons } from "@expo/vector-icons";
import Draggable from "react-native-draggable";
import { useIconPosition } from "./(tabs)/IconPositionContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function ShowPad(props: any) {
  const { connectedDevices } = useBleManager();
  const { positions, setPosition } = useIconPosition();
  const [module, setModule] = React.useState<Module[]>([]);

  useEffect(() => {
    console.log("ActivePadIndexRef updated:", props.activePadIndexRef);
  }, [props.activePadIndexRef]); // Logs changes to activePadIndex

  const DeviceDraggable = ({
    device,
    pad_no,
  }: {
    device: Module;
    pad_no: number;
  }) => (
    <Draggable
      x={positions[pad_no]?.x || 50}
      y={positions[pad_no]?.y || 50 + pad_no * 120}
      minX={0}
      minY={0}
      maxX={SCREEN_WIDTH - 60} // Subtracting icon size to keep it fully visible
      maxY={SCREEN_HEIGHT - 100} // Adjusting for safe area and keeping it fully visible
      onDragRelease={(e, gestureState) =>
        setPosition(pad_no, { x: gestureState.moveX, y: gestureState.moveY })
      }
    >
      <View style={styles.draggableContainer}>
        <TouchableOpacity onPress={() => console.log("Pad pressed", pad_no)}>
          <MaterialIcons
            name="wb-twilight"
            size={60}
            color="black"
            style={styles.icon}
          />
          <Text>Trainer Pad : {pad_no}</Text>
        </TouchableOpacity>
      </View>
    </Draggable>
  );

  const StillDevice = ({
    device,
    pad_no,
    activePadIndex,
  }: {
    device: Module;
    pad_no: number;
    activePadIndex: number;
  }) => (
    <View
      key={pad_no}
      style={[
        styles.iconContainer,
        { left: positions[pad_no]?.x, top: positions[pad_no]?.y },
      ]}
    >
      <MaterialIcons
        name="wb-twilight"
        size={60}
        color={activePadIndex === pad_no ? "blue" : "black"}
      />
      <Text>Trainer Pad: {pad_no}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {connectedDevices.length > 0 ? (
          props.isPlaying ? (
            connectedDevices.map((device, index) => (
              <StillDevice
                key={device.deviceId}
                device={device}
                pad_no={index}
                activePadIndex={props.activePadIndex}
              />
            ))
          ) : (
            connectedDevices.map((device, index) => (
              <DeviceDraggable
                key={device.deviceId}
                device={device}
                pad_no={index}
              />
            ))
          )
        ) : (
          <Text style={[tw`text-center text-black my-4 mt-8 shadow-lg`]}>
            No connected devices
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e1f4f3",
  },
  draggableContainer: {
    alignItems: "center",
  },
  icon: {
    marginLeft: 20,
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
  },
});

export default ShowPad;
