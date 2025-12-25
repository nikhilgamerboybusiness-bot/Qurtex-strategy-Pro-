import React, { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';

interface WelcomeSplashProps {
  onComplete: () => void;
  developerName: string;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onComplete, developerName }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Animation sequence
    const t1 = setTimeout(() => setStep(1), 500); // Show Logo
    const t2 = setTimeout(() => setStep(2), 2000); // Show Developer
    const t3 = setTimeout(() => setStep(3), 4500); // Fade Out
    const t4 = setTimeout(onComplete, 5000); // Remove component

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ${step === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] transition-all duration-1000 ${step >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Container */}
        <div className={`transition-all duration-1000 transform ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
               <TrendingUp size={48} className="text-white relative z-10" />
           </div>
           
           <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">
             Quotex Strategy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pro</span>
           </h1>
           <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide">
             High Accuracy Trading Algorithm
           </p>
        </div>

        {/* Loading Bar */}
        <div className={`w-64 h-1 bg-gray-800 rounded-full mx-auto mt-8 overflow-hidden transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
           <div className="h-full bg-blue-500 animate-[loading_4s_ease-in-out_forwards]"></div>
        </div>

        {/* Developer Credit */}
        <div className={`mt-16 transition-all duration-1000 delay-500 transform ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">Developed & Engineered By</p>
           <div className="inline-block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 blur opacity-20"></div>
              <h2 className="relative text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200 font-serif">
                {developerName}
              </h2>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeSplash;