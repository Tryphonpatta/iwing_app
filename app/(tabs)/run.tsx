import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
// import Slider from "@react-native-community/slider";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Slider } from "@rneui/themed";
export default function App() {
  const [lightOut, setLightOut] = useState("");
  const [timeout, setTimeout] = useState(0);
  const [hitCount, setHitCount] = useState(0);

  const [lightDelay, setLightDelay] = useState("");
  const [delaytime, setDelaytime] = useState(0);

  const [duration, setDuration] = useState("");
  const [timeduration, setTimeDuration] = useState(0);
  const [hitduration, setHitDuration] = useState(0);

  return (
    <View style={styles.container}>
      {/* Light Out Section */}
      <View style={styles.section}>
        <View style={styles.label}>
          <MaterialIcons name="wb-twighlight" size={24} color="black" />
          <Text style={styles.labelText}>Light out</Text>
        </View>
        <View style={styles.selectBar}>
          <TouchableOpacity
            style={[styles.option, lightOut === "Hit" && styles.activeOption]}
            onPress={() => setLightOut("Hit")}
          >
            <Text
              style={[
                styles.optionText,
                lightOut === "Hit" && styles.activeOptionText,
              ]}
            >
              Hit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              lightOut === "Timeout" && styles.activeOption,
            ]}
            onPress={() => setLightOut("Timeout")}
          >
            <Text
              style={[
                styles.optionText,
                lightOut === "Timeout" && styles.activeOptionText,
              ]}
            >
              Timeout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              lightOut === "Hit or Timeout" && styles.activeOption,
            ]}
            onPress={() => setLightOut("Hit or Timeout")}
          >
            <Text
              style={[
                styles.optionText,
                lightOut === "Hit or Timeout" && styles.activeOptionText,
              ]}
            >
              Hit or Timeout
            </Text>
          </TouchableOpacity>
        </View>
        {lightOut === "Timeout" && (
          // Time out slider
          <View style={styles.section}>
            <Text style={styles.labelText}>Timeout : {timeout} </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={timeout}
              step={1}
              onValueChange={(value) => setTimeout(value)}
              minimumTrackTintColor="#4caf50"
              maximumTrackTintColor="#545454" // Custom track color
              thumbStyle={styles.thumb} // Custom thumb style
              trackStyle={styles.track}
            />
          </View>
        )}
        {lightOut === "Hit" && (
          // hit slider
          <View style={styles.section}>
            <Text style={styles.labelText}>Hit Count : {hitCount} </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={hitCount}
              onValueChange={(value) => setHitCount(value)}
              minimumTrackTintColor="#4caf50"
              maximumTrackTintColor="#545454" // Custom track color
              thumbStyle={styles.thumb} // Custom thumb style
              trackStyle={styles.track}
            />
          </View>
        )}
        {lightOut === "Hit or Timeout" && (
          <>
            {/* Time out slider */}
            <View style={styles.section}>
              <Text style={styles.labelText}>Timeout : {timeout}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={timeout}
                step={1}
                onValueChange={(value) => setTimeout(value)}
                minimumTrackTintColor="#4caf50"
                maximumTrackTintColor="#545454" // Custom track color
                thumbStyle={styles.thumb} // Custom thumb style
                trackStyle={styles.track}
              />
            </View>
            {/* Hit slider */}
            <View style={styles.section}>
              <Text style={styles.labelText}>Hit Count : {hitCount}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={hitCount}
                step={1}
                onValueChange={(value) => setHitCount(value)}
                minimumTrackTintColor="#4caf50"
                maximumTrackTintColor="#545454" // Custom track color
                thumbStyle={styles.thumb} // Custom thumb style
                trackStyle={styles.track}
              />
            </View>
          </>
        )}
      </View>

      {/* Light Delay Time Section */}
      <View style={styles.section}>
        <View style={styles.label}>
          <MaterialIcons name="wb-twighlight" size={24} color="black" />
          <Text style={styles.labelText}>Light Delay Time</Text>
        </View>
        <View style={styles.selectBar}>
          <TouchableOpacity
            style={[
              styles.option,
              lightDelay === "None" && styles.activeOption,
            ]}
            onPress={() => setLightDelay("None")}
          >
            <Text
              style={[
                styles.optionText,
                lightDelay === "None" && styles.activeOptionText,
              ]}
            >
              None
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              lightDelay === "Fixed" && styles.activeOption,
            ]}
            onPress={() => setLightDelay("Fixed")}
          >
            <Text
              style={[
                styles.optionText,
                lightDelay === "Fixed" && styles.activeOptionText,
              ]}
            >
              Fixed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              lightDelay === "Random" && styles.activeOption,
            ]}
            onPress={() => setLightDelay("Random")}
          >
            <Text
              style={[
                styles.optionText,
                lightDelay === "Random" && styles.activeOptionText,
              ]}
            >
              Random
            </Text>
          </TouchableOpacity>
        </View>
        {lightDelay === "Fixed" && ( // Updated to "Fixed"
          <View style={styles.section}>
            <Text style={styles.labelText}>
              Timeout : {delaytime.toFixed(2)} seconds
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={5}
              step={0.01}
              value={delaytime}
              onValueChange={(value) => setDelaytime(value)}
              minimumTrackTintColor="#4caf50"
              maximumTrackTintColor="#545454" // Custom track color
              thumbStyle={styles.thumb} // Custom thumb style
              trackStyle={styles.track}
            />
          </View>
        )}
      </View>

      {/* Duration Section */}
      <View style={styles.section}>
        <View style={styles.label}>
          <Entypo name="back-in-time" size={24} color="black" />
          <Text style={styles.labelText}>Duration</Text>
        </View>
        <View style={styles.selectBar}>
          <TouchableOpacity
            style={[styles.option, duration === "Hit" && styles.activeOption]}
            onPress={() => setDuration("Hit")}
          >
            <Text
              style={[
                styles.optionText,
                duration === "Hit" && styles.activeOptionText,
              ]}
            >
              Hit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              duration === "Timeout" && styles.activeOption,
            ]}
            onPress={() => setDuration("Timeout")}
          >
            <Text
              style={[
                styles.optionText,
                duration === "Timeout" && styles.activeOptionText,
              ]}
            >
              Timeout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              duration === "Hit or Timeout" && styles.activeOption,
            ]}
            onPress={() => setDuration("Hit or Timeout")}
          >
            <Text
              style={[
                styles.optionText,
                duration === "Hit or Timeout" && styles.activeOptionText,
              ]}
            >
              Hit or Timeout
            </Text>
          </TouchableOpacity>
        </View>
        {duration === "Hit" && (
          <>
            <Text>Hit Count : {hitduration}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={hitduration}
              onValueChange={(value) => setHitDuration(value)}
              minimumTrackTintColor="#4caf50"
              maximumTrackTintColor="#545454" // Custom track color
              thumbStyle={styles.thumb} // Custom thumb style
              trackStyle={styles.track}
            />
          </>
        )}
      </View>
      <TouchableOpacity>
        <View style={styles.button}>
          <Text>Train</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e1f4f3",
    padding: 20,
  },
  section: {
    marginBottom: 20,
    marginTop: 10,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  labelText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 20,
  },
  selectBar: {
    flexDirection: "row",
    backgroundColor: "#f3da74",
    borderRadius: 10,
    padding: 5,
  },
  option: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeOption: {
    backgroundColor: "#1e1e1e",
    borderRadius: 5,
  },
  optionText: {
    color: "black",
    fontWeight: "bold",
  },
  activeOptionText: {
    color: "white",
  },
  slider: {
    width: "100%",
  },
  thumb: {
    height: 30, // Size of the thumb
    width: 30, // Width of the thumb
    borderRadius: 15,
    backgroundColor: "#4EAF4C", // Thumb color
  },
  track: {
    height: 5,
  },
  button: {
    backgroundColor: "D9D9D9", // Primary color for the button
    paddingVertical: 12, // Adds padding to make the button more clickable
    paddingHorizontal: 20, // Horizontal padding for a wider button
    alignItems: "center", // Centers the text inside the button
    borderRadius: 15, // Rounded corners
    marginTop: 20, // Space above the button
  },
});
