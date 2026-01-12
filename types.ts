
export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED'
}

export interface Server {
  id: string;
  name: string;
  country: string;
  flag: string;
  ping: number;
  load: number;
  ip: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';
}

export interface TrafficData {
  time: string;
  down: number;
  up: number;
}
