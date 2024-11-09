import React from "react";
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import { useBleManager } from "./context/blecontext";
import { Module } from "@/util/buttonType";
import { MaterialIcons } from "@expo/vector-icons";
import Draggable from "react-native-draggable";
import { useIconPosition } from "./IconPositionContext";

const Running = () => {
	const { connectedDevices, blink, turnOn_light } = useBleManager();
	const { positions, setPosition } = useIconPosition();
	const [module, setModule] = React.useState<Module[]>([]);

	React.useEffect(() => {
		setModule(connectedDevices);
	}, [connectedDevices]);

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
			maxX={300}
			maxY={600}
			onDragRelease={(e, gestureState) =>
				setPosition(pad_no, { x: gestureState.moveX, y: gestureState.moveY })
			}
		>
			<View style={styles.draggableContainer}>
				<TouchableOpacity
					onPress={() => {
						try {
							blink(device);
						} catch (error) {
							console.error(error);
						}
					}}
				>
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
			<View>
				{module.length > 0 ? (
					module.map((device, index) => (
						<DeviceDraggable
							key={device.deviceId}
							device={device}
							pad_no={index}
						/>
					))
				) : (
					<Text style={[tw`text-center  text-black my-4 mt-8 shadow-lg`]}>
						No connected devices
					</Text>
				)}
			</View>
		</SafeAreaView>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#e1f4f3",
	},
	draggableContainer: {
		alignItems: "center",
	},
	button: {
		backgroundColor: "#545454",
		paddingVertical: 12,
		paddingHorizontal: 20,
		alignItems: "center",
		borderRadius: 15,
		marginTop: 20,
		width: 200,
		alignSelf: "center",
		marginEnd: 10,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	icon: {
		marginLeft: 20,
	},
});
export default Running;
