import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import tw from 'twrnc';

// Helper function to format time in hh:mm:ss
const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00:00'; // If countdown is less than or equal to 0
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to convert hh:mm:ss string to seconds
const parseTimeInput = (timeString) => {
  const timeParts = timeString.split(':').map(part => parseInt(part, 10));
  
  // Ensure the time input has valid numbers for hours, minutes, and seconds
  if (timeParts.length === 3) {
    const [hrs, mins, secs] = timeParts;
    return (hrs * 3600) + (mins * 60) + secs;
  }
  return NaN; // Return NaN for invalid input
};

const Run = () => {
  const [countdown, setCountdown] = useState(60); // Countdown value to be displayed
  const [inputTime, setInputTime] = useState(''); // User input for the countdown time
  const [isRunning, setIsRunning] = useState(false); // State to track if the countdown is running
  const [initialTime, setInitialTime] = useState(60); // To store initial input time

  // Countdown logic
  useEffect(() => {
    let timer;
    if (isRunning && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000); // Decrease countdown every second
    }
    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [isRunning, countdown]);

  // Handler to start the countdown
  const startCountdown = () => {
    const timeInSeconds = parseTimeInput(inputTime); // Convert input from hh:mm:ss to seconds
    if (!isNaN(timeInSeconds) && timeInSeconds > 0) {
      setCountdown(timeInSeconds); // Set the countdown to the input time
      setInitialTime(timeInSeconds); // Save the initial time
      setIsRunning(true); // Start countdown
      setInputTime(''); // Clear input field
    } else {
      alert('Please enter a valid time in hh:mm:ss format');
    }
  };

  // Handler to stop the countdown
  const stopCountdown = () => {
    setIsRunning(false); // Stop the countdown
  };

  // Handler to reset the countdown
  const resetCountdown = () => {
    setCountdown(initialTime); // Reset to the initial time
    setIsRunning(false); // Stop the countdown
  };

  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <Text style={tw`text-3xl font-bold text-green-700`}>Running Screen</Text>

      {/* Countdown Display */}
      <Text style={tw`text-6xl text-gray-700 mt-10`}>
        {countdown >= 0 ? formatTime(countdown) : '00:00:00'}
      </Text>

      {/* Input for Countdown Time */}
      {!isRunning && (
        <TextInput
            style={tw`border border-gray-300 rounded w-40 text-center my-4 text-lg`}
            placeholder={inputTime === '' ? 'hh:mm:ss' : ''} // Show placeholder only when input is empty
            keyboardType="numeric"
            value={inputTime}
            onChangeText={setInputTime} // Update input value
        />
        )}


      {/* Start Button */}
      {!isRunning && <Button title="Start Countdown" onPress={startCountdown} disabled={isRunning} />}

      {/* Stop Button */}
      {isRunning && <Button title="Stop Countdown" onPress={stopCountdown} />}
      
      <View style={{paddingBottom: 12}}> </View>
      {/* Reset Button */}
      {!isRunning && countdown !== initialTime && <Button title="Reset" onPress={resetCountdown} />}

      {/* Instructions */}
      <Text style={tw`text-lg text-gray-500 mt-4`}>
        Enter time and press start to begin countdown.
      </Text>
    </View>
  );
};

export default Run;
