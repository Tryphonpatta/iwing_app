# iWing Training App 🥊

A React Native Expo application for fitness training that connects to Bluetooth Low Energy (BLE) training pads. This app provides an interactive exercise experience using wireless training pads with real-time feedback and performance tracking.

## 🏋️ Overview

The iWing app is designed for fitness training using specialized Bluetooth training pads called "Trainning_PAD". The app allows users to:

- Connect to multiple BLE training devices simultaneously
- Configure various training modes and exercises
- Monitor real-time performance and battery status
- Track exercise results and performance metrics
- Customize training parameters like hit counts, delays, and thresholds

## 🚀 Features

### Bluetooth Connectivity
- **Device Discovery**: Scan and connect to multiple training pads
- **Real-time Monitoring**: Live battery status and device health
- **Device Management**: Connect/disconnect multiple devices with visual feedback
- **Auto-reconnection**: Maintains stable connections during training sessions

### Training Modes
- **Light Out Mode**: Hit targets as they light up with configurable timing
- **Light Delay Mode**: Customizable delay patterns for reaction training  
- **Custom Sequences**: Create personalized training sequences
- **Hit Counting**: Track successful hits and missed targets

### Performance Tracking
- **Real-time Feedback**: Instant response to pad interactions
- **Session Results**: Detailed performance metrics after each session
- **Battery Monitoring**: Track device battery levels and charging status
- **Calibration Tools**: Fine-tune device sensitivity and responsiveness

### User Interface
- **Drag & Drop**: Interactive pad positioning on screen
- **Visual Feedback**: Color-coded status indicators
- **Responsive Design**: Works on both Android and iOS devices
- **Tab Navigation**: Easy access to different app sections

## 📱 App Structure

### Main Screens
- **Home**: Dashboard with connected devices and quick controls
- **Mode**: Configure training parameters and exercise types
- **Start**: Begin training sessions with real-time pad visualization
- **Setting**: Device management and Bluetooth connectivity
- **Running**: Active training session with interactive pad display

### Core Components
- `BleContext`: Manages Bluetooth connections and device communication
- `TrainingConfig`: Handles exercise configuration and parameters
- `ShowPad`: Visual representation of training pads during sessions
- `Dropdown`: UI components for parameter selection

## 🛠️ Technical Stack

### Core Technologies
- **React Native**: Cross-platform mobile development
- **Expo**: Development and build toolchain
- **TypeScript**: Type-safe JavaScript development
- **React Navigation**: Screen navigation and routing

### Key Dependencies
- `react-native-ble-plx`: Bluetooth Low Energy communication
- `react-native-draggable`: Interactive pad positioning
- `twrnc`: Tailwind CSS styling for React Native
- `@ui-kitten/components`: UI component library
- `expo-router`: File-based routing system

### Device Communication
- **BLE Characteristics**: Custom UUID-based communication protocol
- **Real-time Data**: Battery voltage, charging status, hit detection
- **Device Control**: LED indicators, vibration feedback, IR transmission

## 🔧 Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npx expo start
   ```

3. **Run on Device**
   - Install Expo Go app on your mobile device
   - Scan QR code from development server
   - Or use Android emulator/iOS simulator

4. **Build for Production**
   ```bash
   npx eas build --platform android
   npx eas build --platform ios
   ```

## 📋 Prerequisites

### Hardware Requirements
- Compatible training pads with "Trainning_PAD" BLE identifier
- Android/iOS device with Bluetooth 4.0+ support

### Permissions
- **Android**: Bluetooth, Location (for BLE scanning)
- **iOS**: Bluetooth usage description

## 🎯 Usage

1. **Device Setup**
   - Navigate to Settings tab
   - Scan for available training pads
   - Connect to discovered devices (up to 4 pads supported)

2. **Configure Training**
   - Go to Mode tab
   - Select training type (Light Out/Light Delay)
   - Set parameters (hit count, delays, thresholds)

3. **Start Training**
   - Navigate to Start tab
   - Position pads on screen using drag & drop
   - Begin training session
   - View real-time feedback and results

4. **Monitor Performance**
   - Track hits, misses, and reaction times
   - View session summaries
   - Monitor device battery levels

## 🔐 BLE Protocol

The app communicates with training pads using custom BLE characteristics:

- **Service UUID**: `B2E9FDA1-822C-4729-B8E2-9C35E763xxxx`
- **Battery Voltage**: Monitor power levels
- **Hit Detection**: Real-time impact sensing
- **LED Control**: Visual feedback and indicators
- **Vibration**: Haptic feedback control
- **IR Communication**: Infrared data transmission

## 🤝 Contributing

This project is built for KU (Kasetsart University) fitness training programs. The app motto is "Exercise is always right!" reflecting the commitment to consistent physical training.

## 📄 License

Private project for educational and fitness training purposes.

---

**Exercise is always right!** 💪
