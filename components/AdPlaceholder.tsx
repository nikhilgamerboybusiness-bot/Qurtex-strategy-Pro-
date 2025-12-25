import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Star } from 'lucide-react';

interface AdPlaceholderProps {
  type: 'BANNER' | 'NATIVE' | 'INTERSTITIAL' | 'REWARDED' | 'APP_OPEN';
  adUnitId: string;
  onClose?: () => void;
  onReward?: () => void;
  className?: string;
  skipDuration?: number; // Duration in seconds before close button appears
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ 
  type, 
  adUnitId, 
  onClose, 
  onReward,
  className = '',
  skipDuration = 0
}) => {
  const [countdown, setCountdown] = useState(skipDuration);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  if (type === 'BANNER') {
    return (
      <div className={`w-full h-[50px] sm:h-[90px] bg-gray-900 border-b border-gray-800 flex flex-col items-center justify-center relative overflow-hidden ${className}`}>
        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] px-1 font-bold">AD</div>
        <p className="text-gray-500 text-xs font-mono">Google AdMob Banner</p>
        <p className="text-gray-700 text-[9px] font-mono mt-1">{adUnitId}</p>
      </div>
    );
  }

  if (type === 'NATIVE') {
    return (
      <div className={`w-full bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col gap-2 relative ${className}`}>
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[9px] px-1 font-bold rounded">Ad</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="flex-1">
            <div className="h-3 w-24 bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-2 w-full bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-32 w-full bg-gray-800 rounded-lg mt-2 flex items-center justify-center">
          <p className="text-gray-600 text-xs font-mono text-center">
            Native Advanced Ad<br/>
            {adUnitId}
          </p>
        </div>
        <button className="w-full py-2 bg-blue-600 rounded text-xs font-bold text-white mt-1">
          Install / Open
        </button>
      </div>
    );
  }

  if (type === 'APP_OPEN' || type === 'INTERSTITIAL' || type === 'REWARDED') {
    // Determine if we can close based on skipDuration
    const canClose = countdown === 0;

    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white text-black rounded-lg overflow-hidden shadow-2xl relative">
           {/* Close Button or Timer */}
           <div className="absolute top-2 right-2 z-10">
              {!canClose ? (
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                   <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Close in {countdown}s
                </div>
              ) : (
                <button 
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 p-1 rounded-full transition-colors animate-in zoom-in duration-300"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              )}
           </div>

           {/* Ad Content */}
           <div className="bg-gray-200 h-64 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-300"></div>
              <Star size={48} className="text-yellow-500 mb-2 relative z-10" />
              <h3 className="font-bold text-lg text-gray-800 relative z-10">
                {type === 'APP_OPEN' ? 'Welcome Back!' : 'Sponsored Content'}
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2 font-mono break-all relative z-10">
                ID: {adUnitId}
              </p>
           </div>
           
           <div className="p-4">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-blue-600 rounded-lg shadow-sm"></div>
               <div>
                 <h4 className="font-bold">Amazing Trading App</h4>
                 <div className="text-xs text-yellow-600">★★★★★</div>
               </div>
             </div>
             
             {type === 'REWARDED' && !skipDuration ? (
                <button 
                  onClick={onReward}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle size={18} /> Watch to get Reward
                </button>
             ) : (
                <button 
                  onClick={onClose} // If forced/skipped, main action is usually download or close, but for sim we keep download logic visually
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors"
                >
                  Download Now
                </button>
             )}
           </div>
        </div>
        
        <div className="mt-4 text-white/50 text-xs text-center font-mono">
          Google AdMob Test Mode<br/>
          {type} ADVERTISEMENT
        </div>
      </div>
    );
  }

  return null;
};

export default AdPlaceholder;