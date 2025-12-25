import { Currency, TradingSession, AccuracyData } from './types';

export const AD_CONFIG = {
  appOpen: 'ca-app-pub-9589522419777492/7251281891',
  topBanner: 'ca-app-pub-9589522419777492/2164700078',
  nativeAdvanced: 'ca-app-pub-9589522419777492/5234674404',
  interstitial: 'ca-app-pub-9589522419777492/7685577928',
  rewardedInterstitial: 'ca-app-pub-9589522419777492/3347178986',
  rewarded: 'ca-app-pub-9589522419777492/5285455922',
  rewardedTrade: 'ca-app-pub-9589522419777492/1650405190',
};

export const CURRENCY_DATA: Currency[] = [
  // High Profit OTC Pairs (From Screenshot)
  { name: "USD/TRY", type: "OTC", change: "+0.34%", profit1min: 95, profit5min: 94, isOTC: true },
  { name: "EUR/SGD", type: "OTC", change: "+0.02%", profit1min: 91, profit5min: 86, isOTC: true },
  { name: "EUR/GBP", type: "Regular", change: "-0.25%", profit1min: 89, profit5min: 90, isOTC: false },
  { name: "EUR/NZD", type: "OTC", change: "+0.71%", profit1min: 88, profit5min: 93, isOTC: true },
  { name: "NZD/CHF", type: "OTC", change: "-3.18%", profit1min: 88, profit5min: 84, isOTC: true },
  { name: "NZD/USD", type: "OTC", change: "+2.21%", profit1min: 88, profit5min: 93, isOTC: true },
  { name: "USD/PKR", type: "OTC", change: "-0.17%", profit1min: 87, profit5min: 87, isOTC: true },
  { name: "USD/ZAR", type: "OTC", change: "+0.41%", profit1min: 86, profit5min: 78, isOTC: true },
  
  // Existing Popular Pairs & Others from List
  { name: "AUD/NZD", type: "OTC", change: "+3.18%", profit1min: 94, profit5min: 94, isOTC: true },
  { name: "USD/INR", type: "OTC", change: "-0.2%", profit1min: 94, profit5min: 94, isOTC: true },
  { name: "USD/COP", type: "OTC", change: "+0.14%", profit1min: 93, profit5min: 93, isOTC: true },
  { name: "NZD/JPY", type: "OTC", change: "-1%", profit1min: 91, profit5min: 93, isOTC: true },
  { name: "GBP/NZD", type: "OTC", change: "+1.04%", profit1min: 88, profit5min: 91, isOTC: true },
  { name: "EUR/JPY", type: "Regular", change: "+0.14%", profit1min: 87, profit5min: 90, isOTC: false },
  
  // Mid-range & Others
  { name: "USD/BRL", type: "OTC", change: "-3.37%", profit1min: 85, profit5min: 88, isOTC: true },
  { name: "USD/IDR", type: "OTC", change: "+0.4%", profit1min: 85, profit5min: 91, isOTC: true },
  { name: "USD/ARS", type: "OTC", change: "+0.56%", profit1min: 84, profit5min: 84, isOTC: true },
  { name: "USD/DZD", type: "OTC", change: "+0%", profit1min: 84, profit5min: 84, isOTC: true },
  { name: "CAD/CHF", type: "OTC", change: "+3.97%", profit1min: 83, profit5min: 86, isOTC: true },
  
  // Standard Pairs
  { name: "USD/PHP", type: "OTC", change: "+0%", profit1min: 86, profit5min: 89, isOTC: true },
  { name: "USD/JPY", type: "Regular", change: "-0.2%", profit1min: 79, profit5min: 90, isOTC: false },
  { name: "USD/NGN", type: "OTC", change: "+0%", profit1min: 79, profit5min: 77, isOTC: true }
];

export const TRADING_SESSIONS: TradingSession[] = [
  { name: "ASIAN SESSION", timeRange: "00:00-09:00 GMT", openTime: 0, closeTime: 9, accuracy: "MEDIUM" },
  { name: "LONDON SESSION", timeRange: "08:00-17:00 GMT", openTime: 8, closeTime: 17, accuracy: "HIGH" },
  { name: "NEW YORK SESSION", timeRange: "13:00-22:00 GMT", openTime: 13, closeTime: 22, accuracy: "HIGH" },
  { name: "OVERLAP PERIOD", timeRange: "13:00-17:00 GMT", openTime: 13, closeTime: 17, accuracy: "PEAK" }
];

export const ACCURACY_TIMELINE: AccuracyData[] = [
  { hour: 0, accuracy: "LOW" }, { hour: 1, accuracy: "LOW" }, { hour: 2, accuracy: "LOW" },
  { hour: 3, accuracy: "LOW" }, { hour: 4, accuracy: "LOW" }, { hour: 5, accuracy: "MEDIUM" },
  { hour: 6, accuracy: "MEDIUM" }, { hour: 7, accuracy: "MEDIUM" }, { hour: 8, accuracy: "HIGH" },
  { hour: 9, accuracy: "HIGH" }, { hour: 10, accuracy: "HIGH" }, { hour: 11, accuracy: "HIGH" },
  { hour: 12, accuracy: "HIGH" }, { hour: 13, accuracy: "PEAK" }, { hour: 14, accuracy: "PEAK" },
  { hour: 15, accuracy: "PEAK" }, { hour: 16, accuracy: "PEAK" }, { hour: 17, accuracy: "HIGH" },
  { hour: 18, accuracy: "HIGH" }, { hour: 19, accuracy: "MEDIUM" }, { hour: 20, accuracy: "MEDIUM" },
  { hour: 21, accuracy: "LOW" }, { hour: 22, accuracy: "LOW" }, { hour: 23, accuracy: "LOW" }
];