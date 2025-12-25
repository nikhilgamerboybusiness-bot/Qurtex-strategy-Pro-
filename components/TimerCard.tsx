import React from 'react';

interface TimerCardProps {
  seconds: number;
  syncStatus: string;
  nextSignal?: {
    trade: string;
    asset: string;
    profit: number;
  };
  showPreview: boolean;
  previewCountdown: number;
}

const TimerCard: React.FC<TimerCardProps> = ({ 
  seconds, 
  syncStatus, 
  nextSignal, 
  showPreview, 
  previewCountdown 
}) => {
  const formattedTime = `00:${seconds.toString().padStart(2, '0')}`;
  const progress = ((59 - seconds) / 59) * 100;
  
  // Color logic
  let timeColor = 'text-white';
  if (seconds <= 10) timeColor = 'text-red-500 animate-pulse';
  else if (seconds <= 20) timeColor = 'text-amber-500';

  return (
    <div className="bg-panel rounded-xl p-5 border border-panel-border">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-primary">TRADE EXPIRES IN</h3>
        <div className="text-sm text-gray-400">
          Sync: <span className={syncStatus === 'PERFECT' ? 'text-green-500 font-bold' : 'text-amber-500'}>{syncStatus}</span>
        </div>
      </div>

      {/* Timer Display */}
      <div className={`text-6xl font-bold text-center font-mono my-4 drop-shadow-lg ${timeColor}`}>
        {formattedTime}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
        <p className="text-xs text-blue-200 text-center">
          ⏱️ <strong>Quotex Timing:</strong> 1-minute trades expire at :00 (exact seconds)
        </p>
      </div>

      {/* Next Signal Preview */}
      {showPreview && nextSignal && (
        <div className="bg-gray-800/80 border border-dashed border-primary/50 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-xs text-primary text-center mb-1">
            NEXT SIGNAL IN {previewCountdown}s
          </div>
          <div className={`text-lg font-bold text-center ${nextSignal.trade === 'CALL' ? 'text-green-400' : 'text-red-400'}`}>
            {nextSignal.trade} on {nextSignal.asset} ({nextSignal.profit}%)
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerCard;