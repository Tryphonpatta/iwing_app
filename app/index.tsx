import "react-native-gesture-handler";
import "react-native-reanimated";
import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import className from "twrnc";
import { useRouter } from "expo-router";

const index = () => {
	const router = useRouter();
	return (
		<Pressable
			onPress={() => router.push("/home")}
			style={className`bg-green-500 flex-1 justify-center items-center`}
		>
			<Image
				source={require("../assets/images/badlogo.png")}
				style={className`w-70 h-70`}
			/>
			<Text style={className`text-6xl font-bold text-white`}>KU</Text>
			<Text style={className`text-lg text-white font-semibold mt-2`}>
				Exercise is always right!
			</Text>
		</Pressable>
	);
};

export default index;
