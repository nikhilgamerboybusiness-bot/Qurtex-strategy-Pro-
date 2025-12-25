import React from 'react';
import { Currency, TradeType } from '../types';
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';

interface SignalCardProps {
  asset: Currency;
  tradeType: TradeType;
  strength: number;
  expirationTime: string;
  analysis?: {
    rsi: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strategy: string;
    macd: 'BUY' | 'SELL' | 'NEUTRAL';
  };
}

const SignalCard: React.FC<SignalCardProps> = ({ asset, tradeType, strength, expirationTime, analysis }) => {
  const isCall = tradeType === 'CALL';
  const isPositiveChange = asset.change.startsWith('+');

  // Default analysis if not provided
  const rsiVal = analysis?.rsi || 50;
  const strategyName = analysis?.strategy || 'Trend Following';

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl p-4 md:p-6 border border-panel-border shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${isCall ? 'from-green-500/10' : 'from-red-500/10'} to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
             <Zap size={24} className={strength > 90 ? "text-yellow-400 fill-yellow-400 animate-pulse" : "text-primary"} />
             AI SIGNAL
           </h2>
           <span className="text-[10px] text-gray-400 uppercase tracking-widest">{strategyName}</span>
        </div>
        <div className="text-right">
          <div className="text-xs md:text-sm text-gray-400 font-mono">Expires</div>
          <div className="font-bold text-white text-lg leading-none">{expirationTime}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 mb-6 md:mb-8 relative z-10">
        
        {/* Asset Info */}
        <div className="text-center md:text-left min-w-[100px]">
          <div className="text-3xl md:text-4xl font-bold text-white mb-2">{asset.name}</div>
          <div className="flex items-center justify-center md:justify-start gap-2">
             <span className="inline-block bg-gray-700 text-gray-300 text-[10px] md:text-xs px-3 py-1 rounded-full">
                {asset.type}
             </span>
             <span className={`text-xs font-bold ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                {asset.change}
             </span>
          </div>
        </div>

        {/* Big Trade Button */}
        <div className="flex-1 flex justify-center">
          <div className={`
            w-40 h-40 md:w-52 md:h-52 rounded-full flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,0,0,0.6)] border-8
            transition-all duration-300 scale-100 hover:scale-105 cursor-default relative
            ${isCall 
              ? 'bg-gradient-to-b from-green-600 to-green-800 border-green-500/30 shadow-green-900/40' 
              : 'bg-gradient-to-b from-red-600 to-red-800 border-red-500/30 shadow-red-900/40'}
          `}>
             {/* Inner pulsing circle */}
             <div className={`absolute inset-0 rounded-full border-2 opacity-50 animate-ping ${isCall ? 'border-green-400' : 'border-red-400'}`}></div>
             
            <div className="text-3xl md:text-5xl font-black text-white mb-1 drop-shadow-md tracking-tighter">{tradeType}</div>
            <div className="text-sm md:text-lg text-white/90 font-medium uppercase tracking-widest">
              {isCall ? 'HIGHER' : 'LOWER'}
            </div>
            {isCall ? <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white mt-2 drop-shadow-sm" /> : <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-white mt-2 drop-shadow-sm" />}
          </div>
        </div>

        {/* Strength Meter */}
        <div className="text-center md:text-right min-w-[100px]">
           <div className="relative inline-flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={226} 
                        strokeDashoffset={226 - (226 * strength) / 100} 
                        className={strength > 85 ? 'text-green-500' : 'text-yellow-500'} />
              </svg>
              <div className="absolute flex flex-col items-center">
                 <span className="text-xl font-bold text-white">{strength}%</span>
                 <span className="text-[9px] text-gray-400 uppercase">Accuracy</span>
              </div>
           </div>
        </div>
      </div>

      {/* Technical Indicators Logic Panel */}
      <div className="grid grid-cols-3 gap-2 relative z-10 bg-black/20 rounded-lg p-2 border border-white/5">
         
         {/* RSI Indicator */}
         <div className="flex flex-col items-center justify-center p-2 border-r border-white/5">
            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
               <Activity size={10} /> RSI (14)
            </div>
            <div className={`text-sm font-bold ${rsiVal > 70 ? 'text-red-400' : rsiVal < 30 ? 'text-green-400' : 'text-blue-400'}`}>
               {rsiVal}
            </div>
            <div className="text-[8px] text-gray-400">
               {rsiVal > 70 ? 'Overbought' : rsiVal < 30 ? 'Oversold' : 'Neutral'}
            </div>
         </div>

         {/* MACD / Trend */}
         <div className="flex flex-col items-center justify-center p-2 border-r border-white/5">
            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
               <BarChart3 size={10} /> SMA Trend
            </div>
            <div className={`text-sm font-bold ${analysis?.trend === 'BULLISH' ? 'text-green-400' : 'text-red-400'}`}>
               {analysis?.trend || 'NEUTRAL'}
            </div>
            <div className="text-[8px] text-gray-400">
               20-Period Moving Avg
            </div>
         </div>

         {/* Probability */}
         <div className="flex flex-col items-center justify-center p-2">
            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">
               Win Probability
            </div>
            <div className="text-sm font-bold text-yellow-400">
               High
            </div>
            <div className="text-[8px] text-gray-400">
               Based on Volatility
            </div>
         </div>

      </div>
    </div>
  );
};

export default SignalCard;