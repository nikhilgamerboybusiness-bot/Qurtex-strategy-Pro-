export interface Currency {
  name: string;
  type: string;
  change: string;
  profit1min: number;
  profit5min: number;
  isOTC: boolean;
}

export type TradeType = 'CALL' | 'PUT';

export interface TradeHistoryItem {
  time: string;
  asset: string;
  signal: TradeType;
  result: 'PROFIT' | 'LOSS';
  profitAmount: string;
  id: string;
}

export interface TradingSession {
  name: string;
  timeRange: string;
  openTime: number;
  closeTime: number;
  accuracy: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
}

export interface AccuracyData {
  hour: number;
  accuracy: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
}

export interface AppSettings {
  soundVolume: number; // 0 to 1
  primaryColor: string; // hex code
  autoRotation: 'SEQUENTIAL' | 'RANDOM' | 'NONE';
  minSignalStrength: number; // 0 to 100
}

export interface UserProfile {
  username: string;
  email: string;
  plan: 'Free' | 'Standard' | 'Premium' | 'Ultimate';
  avatarInitials: string;
}