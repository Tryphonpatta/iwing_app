import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // นำเข้า useNavigation
// import { getFirestore, collection, getDocs } from 'firebase/firestore';
// import firebase from 'firebase/app';
// import 'firebase/firestore';
import CryptoJS from "crypto-js";

const { width } = Dimensions.get("window");

const ResultScreen = () => {
  const navigation = useNavigation(); // ใช้ useNavigation เพื่อควบคุมการนำทาง

  const [resultData, setResultData] = useState({
    time: "Loading...",
    averagePace: "Loading...",
    averageSpeed: "Loading...",
    bestPace: "Loading...",
    movingTime: "Loading...",
    idleTime: "Loading...",
  });

  useEffect(() => {
    // const fetchData = async () => {
    //   const querySnapshot = await getDocs(collection(db, "results"));
    //   const data = querySnapshot.docs.map(doc => doc.data());
    //   if (data.length > 0) {
    //     const result = data[0];  // Assuming we take the first result for now
    //     setResultData({
    //       time: result.time,
    //       averagePace: result.averagePace,
    //       averageSpeed: result.averageSpeed,
    //       bestPace: result.bestPace,
    //       movingTime: result.movingTime,
    //       idleTime: result.idleTime,
    //     });
    //     // สุ่มตัวเลขแล้วทำการ Hash ด้วย SHA-256
    //     const randomValue = `${result.time}${result.averagePace}${result.averageSpeed}${result.bestPace}${result.movingTime}${result.idleTime}`;
    //     const hash = CryptoJS.SHA256(randomValue).toString(CryptoJS.enc.Hex);
    //     // ส่งค่า hash ไปที่ Log
    //     console.log(`Hash value: ${hash}`);
    //   }
    // };
    // fetchData();
  }, []);

  const handleDonePress = () => {
    navigation.navigate("run"); // นำทางไปหน้า run.tsx
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Result</Text>

      <View style={styles.resultContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{resultData.time}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average pace:</Text>
          <Text style={styles.value}>{resultData.averagePace}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average speed:</Text>
          <Text style={styles.value}>{resultData.averageSpeed}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Best pace:</Text>
          <Text style={styles.value}>{resultData.bestPace}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Moving time:</Text>
          <Text style={styles.value}>{resultData.movingTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Idle time:</Text>
          <Text style={styles.value}>{resultData.idleTime}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f5f0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#000",
  },
  resultContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 8,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1, // เพิ่ม flex เพื่อให้ label มีขนาดเท่ากัน
  },
  value: {
    fontSize: 20,
    color: "#333",
    textAlign: "right",
    flex: 1, // เพิ่ม flex เพื่อให้ value มีขนาดเท่ากัน
  },
  doneButton: {
    backgroundColor: "#2f855a",
    paddingVertical: 15,
    width: width * 0.6, // กำหนดความกว้างของปุ่มให้สัมพันธ์กับหน้าจอ
    borderRadius: 30, // ปรับให้ปุ่มมีขอบมนมากขึ้น
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ResultScreen;
