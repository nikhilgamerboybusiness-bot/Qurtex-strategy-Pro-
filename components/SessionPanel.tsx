import React, { useMemo } from 'react';
import { TRADING_SESSIONS, ACCURACY_TIMELINE } from '../constants';

interface SessionPanelProps {
  currentHour: number;
  localTime: string;
}

const SessionPanel: React.FC<SessionPanelProps> = ({ currentHour, localTime }) => {
  
  const accuracyClass = (acc: string) => {
    switch(acc) {
      case 'LOW': return 'bg-red-500/30 text-red-500';
      case 'MEDIUM': return 'bg-amber-500/30 text-amber-500';
      case 'HIGH': return 'bg-green-500/30 text-green-500';
      case 'PEAK': return 'bg-blue-500/30 text-blue-500';
      default: return 'bg-gray-700 text-gray-400';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 border border-panel-border">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-primary">TRADING SESSIONS & ACCURACY</h3>
        <span className="text-sm text-gray-400 font-mono">{localTime}</span>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {TRADING_SESSIONS.map((session) => {
          // Simplified active check logic: if current hour is within range
          // Note: This logic assumes simple day ranges. Overlap logic from original code is respected.
          const isActive = currentHour >= session.openTime && currentHour < session.closeTime;
          
          return (
            <div 
              key={session.name}
              className={`text-center p-3 rounded-lg border transition-all ${
                isActive 
                  ? 'bg-blue-500/10 border-primary' 
                  : 'bg-panel border-panel-border opacity-70'
              }`}
            >
              <div className="text-xs font-bold text-white mb-1">{session.name}</div>
              <div className="text-[10px] text-gray-400 mb-2">{session.timeRange}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {isActive ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="mt-2">
        <div className="text-xs text-gray-400 text-center mb-3">DAILY ACCURACY TIMELINE (GMT)</div>
        <div className="flex h-10 rounded-lg overflow-hidden border border-panel-border relative">
            {ACCURACY_TIMELINE.map((item) => (
              <div 
                key={item.hour}
                className={`flex-1 flex items-center justify-center text-[10px] font-bold relative group hover:z-10 hover:scale-110 transition-transform cursor-default ${accuracyClass(item.accuracy)}`}
              >
                {item.hour}
                {item.hour === currentHour && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
                    NOW
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SessionPanel;