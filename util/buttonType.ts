import { BleManager } from "react-native-ble-plx";

export type Module = {
  isConnected: Module | undefined;
  deviceId: string;
  batteryVoltage: number;
  bleManager: BleManager;
  battFull: boolean;
  battCharging: boolean;
  IR_RX_status: boolean;
  VIB_threshold: number;
  IR_TX_status: boolean;
  music: string;
};
