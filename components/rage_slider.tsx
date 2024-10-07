import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

export default function RangeSlider(props: { is_round: boolean }) {
  const [sliderValue, setSliderValue] = useState(50); // State to manage slider value
  const { is_round } = props;

  return (
    <View style={styles.container}>
      <Text>Slider Value: {sliderValue}</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={100}
        value={sliderValue}
        onValueChange={
          (value) =>
            is_round
              ? setSliderValue(Math.round(value)) // Round value if is_round is true
              : setSliderValue(value) // Otherwise, set the value as-is
        }
        minimumTrackTintColor="#04AA6D"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#04AA6D"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
