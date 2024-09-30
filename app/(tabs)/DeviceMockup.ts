export interface Device {
    id: string;
    name: string;
    status: string;
    battery: string;
    isConnected: boolean;
  }
  
  export const mockDevices: Device[] = [
    { id: '1', name: 'L1', status: 'Disconnect', battery: '100%', isConnected: false },
    { id: '2', name: 'L2', status: 'Connect', battery: '90%', isConnected: true },
    { id: '3', name: 'R1', status: 'Disconnect', battery: '55%', isConnected: false },
    { id: '4', name: 'R2', status: 'Connect', battery: '9%', isConnected: true },
  ];