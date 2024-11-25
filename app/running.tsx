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
import { Device } from "react-native-ble-plx";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height * 0.6; // -250 เพื่อทำให้ไม่ตกลงไปด้านล่าง
// console.log(`witdth -> ${ScreenWidth}, height -> ${ScreenHeight}`);

function ShowPad(props: any) {
	const { connectedDevice } = useBleManager();
	const { positions, setPosition } = useIconPosition();
	const [module, setModule] = React.useState<Module[]>([]);

	useEffect(() => {
		console.log("ActivePadIndexRef updated:", props.activePadIndexRef);
	}, [props.activePadIndexRef]); // Logs changes to activePadIndex

	const clamp = (value: number, min: number, max: number) => {
		return Math.min(Math.max(value, min), max);
	};

	const calculateDistance = (
		x1: number,
		y1: number,
		x2: number,
		y2: number
	) => {
		const dx = x1 - x2;
		const dy = y1 - y2;
		return Math.sqrt(dx * dx + dy * dy);
	};
	// const fixPostion = {
	// 	// padindex 0 (L1)
	// 	0: { x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.1 },
	// 	// padindex 1 (R1)
	// 	1: { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.1 },
	// 	// padindex 2 (L2)
	// 	2: { x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.3 },
	// 	// padindex 3 (R2)
	// 	3: { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.3 },
	// 	// padindex 4 (L3)
	// 	4: { x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.5 },
	// 	// padindex 5 (R3)
	// 	5: { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.5 },
	// 	// padindex 6 (L4)
	// 	6: { x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.7 },
	// 	// padindex 7 (R4)
	// 	7: { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.7 },
	// };

	const DeviceDraggable = ({
		device,
		pad_no,
	}: {
		device: Device;
		pad_no: number;
	}) => (
		<Draggable
			x={positions[pad_no]?.x || 50}
			y={positions[pad_no]?.y || 50 + pad_no * 120}
			// x={fixPostion[pad_no]?.x || 50}
			// y={fixPostion[pad_no]?.y || 50 + pad_no * 120}
			minX={0}
			minY={0}
			maxX={SCREEN_WIDTH - 60} // Subtracting icon size to keep it fully visible
			maxY={SCREEN_HEIGHT - 60} // Adjusting for safe area and keeping it fully visible
			// onDragRelease={(e, gestureState) =>

			// 	setPosition(pad_no, { x: gestureState.moveX, y: gestureState.moveY })
			// }
			onDragRelease={(e, gestureState) => {
				const clampedX = clamp(
					// gestureState.moveX - 60 / 2,
					positions[pad_no].x + gestureState.dx,
					0,
					SCREEN_WIDTH - 60
				);
				const clampedY = clamp(
					// gestureState.moveY - 60 / 2,
					positions[pad_no].y + gestureState.dy,
					0,
					SCREEN_HEIGHT - 60
				);
				setPosition(pad_no, { x: clampedX, y: clampedY });
			}}
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
		device: Device;
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
			{/* <View>
				{connectedDevice.length > 0 ? (
					connectedDevice
						.filter((device) => device !== null)
						.map((device, index) => (
							<StillDevice
								key={device.id}
								device={device as unknown as Device}
								pad_no={index}
								activePadIndex={props.activePadIndex}
							/>
						))
				) : (
					<Text style={[tw`text-center text-black my-4 mt-8 shadow-lg`]}>
						No connected devices
					</Text>
				)}
			</View> */}
			<View>
				{connectedDevice.length > 0 ? (
					props.isPlaying ? (
						connectedDevice
							.filter((device) => device !== null)
							.map((device, index) => (
								<StillDevice
									key={device?.id}
									device={device as unknown as Device}
									pad_no={index}
									activePadIndex={props.activePadIndex}
								/>
							))
					) : (
						connectedDevice
							.filter((device) => device !== null)
							.map((device, index) => (
								<DeviceDraggable
									key={device?.id}
									device={device as unknown as Device}
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
