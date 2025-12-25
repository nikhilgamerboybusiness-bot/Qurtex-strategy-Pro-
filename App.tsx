import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, CheckCircle, XCircle, Bot, Volume2, VolumeX, FileOutput, TrendingUp, User, ChevronDown, Gift, Settings, LayoutDashboard, Coins, History, Lock, Crown, PartyPopper, X, Clock, PlayCircle, WifiOff, LogOut } from 'lucide-react';
import CurrencyPanel from './components/CurrencyPanel';
import SessionPanel from './components/SessionPanel';
import SignalCard from './components/SignalCard';
import TimerCard from './components/TimerCard';
import HistoryPanel from './components/HistoryPanel';
import ProfileModal from './components/ProfileModal';
import AdPlaceholder from './components/AdPlaceholder';
import AuthModal from './components/AuthModal';
import WelcomeSplash from './components/WelcomeSplash';
import { CURRENCY_DATA, AD_CONFIG } from './constants';
import { TradeType, TradeHistoryItem, AppSettings, Currency, UserProfile } from './types';
import { playBeepSound, playWarningSound } from './services/soundService';

// Helper to get formatted time
const getFormattedTime = () => new Date().toLocaleTimeString([], { hour12: false });
const getGMTTime = () => new Date().toUTCString().split(' ')[4];

type MobileTab = 'TRADE' | 'MARKET' | 'HISTORY';

// PLAN CONFIGURATION - Trade Limits per Plan
const PLAN_LIMITS: Record<string, number> = {
  'Free': 20,
  'Standard': 100,
  'Premium': 100,
  'Ultimate': 150
};

const BONUS_LIMIT = 20;

const App: React.FC = () => {
  // --- Authentication & Welcome State ---
  
  // LAZY INITIALIZATION: Check storage IMMEDIATELY to prevent login screen flash on reload
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('quotex_user_profile');
      return stored ? JSON.parse(stored) : {
        username: 'Trading Pro',
        email: 'trader@example.com',
        plan: 'Free',
        avatarInitials: 'TP'
      };
    } catch (e) {
      return {
        username: 'Trading Pro',
        email: 'trader@example.com',
        plan: 'Free',
        avatarInitials: 'TP'
      };
    }
  });

  // Check auth status immediately on mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
      const session = localStorage.getItem('quotex_auth_session');
      const hasProfile = localStorage.getItem('quotex_user_profile');
      return session === 'active' && !!hasProfile;
  });

  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);

  // --- Main App State ---
  const [mobileTab, setMobileTab] = useState<MobileTab>('TRADE');
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [tradeType, setTradeType] = useState<TradeType>('CALL');
  const [signalStrength, setSignalStrength] = useState(88);
  const [secondsRemaining, setSecondsRemaining] = useState(59);
  const [syncStatus, setSyncStatus] = useState('SYNCING...');
  const [isAutoMode, setIsAutoMode] = useState(true); // Default to TRUE (Always On)
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Network Status
  
  // Advanced Analysis State
  const [marketAnalysis, setMarketAnalysis] = useState({
      rsi: 50,
      trend: 'NEUTRAL' as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
      strategy: 'Standard Analysis',
      macd: 'NEUTRAL' as 'BUY' | 'SELL' | 'NEUTRAL'
  });

  // Settings / Profile
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    soundVolume: 0.3,
    primaryColor: '#3b82f6',
    autoRotation: 'SEQUENTIAL',
    minSignalStrength: 75,
  });

  // Trade Limits & Bonus State
  const [tradesRemaining, setTradesRemaining] = useState(PLAN_LIMITS['Free']);
  const [bonusClaimsToday, setBonusClaimsToday] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  
  // UI Flow States
  const [showUpgradeCelebration, setShowUpgradeCelebration] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false); // Controls the Limit Reached Blocker
  const [showBonusModal, setShowBonusModal] = useState(false); // Controls the "Get 1 Free Trade" popup

  // Ad State
  const [showAppOpenAd, setShowAppOpenAd] = useState(true);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [showRewardedInterstitialAd, setShowRewardedInterstitialAd] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [showRecurringAd, setShowRecurringAd] = useState(false); // For 5 min recurring ad
  const [activeRewardType, setActiveRewardType] = useState<'TRADE' | 'SIGNAL' | null>(null);
  
  // History - Initialized from Local Storage
  const [history, setHistory] = useState<TradeHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tradeHistory');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [
      { id: '1', time: '12:29:50', asset: 'AUD/NZD', signal: 'CALL', result: 'PROFIT', profitAmount: '+75%' },
      { id: '2', time: '12:28:50', asset: 'USD/INR', signal: 'PUT', result: 'LOSS', profitAmount: '-100%' },
      { id: '3', time: '12:27:50', asset: 'USD/COP', signal: 'CALL', result: 'PROFIT', profitAmount: '+80%' },
    ];
  });
  
  // --- AUTH EFFECTS ---
  
  // Handle splash screen visibility - only show if authenticated and hasn't seen it
  useEffect(() => {
    if (isAuthenticated) {
        const hasSeenSplash = localStorage.getItem('has_seen_welcome_splash');
        if (!hasSeenSplash) {
            setShowWelcomeSplash(true);
        }
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = (loggedInUser: UserProfile, isNewUser: boolean = false) => {
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      // Save user to storage AND set session token
      localStorage.setItem('quotex_user_profile', JSON.stringify(loggedInUser));
      localStorage.setItem('quotex_auth_session', 'active');
      
      if (isNewUser) {
          // FORCE RESET LIMITS FOR NEW USER ACCOUNT
          const initialTrades = PLAN_LIMITS[loggedInUser.plan] || 20;
          setTradesRemaining(initialTrades);
          setBonusClaimsToday(0);
          
          // Force update storage immediately to prevent useEffect race condition
          localStorage.setItem('tradesRemaining', initialTrades.toString());
          localStorage.setItem('bonusClaimsToday', '0');
          localStorage.setItem('lastResetDate', new Date().toDateString());

          setShowWelcomeSplash(true);
          localStorage.removeItem('has_seen_welcome_splash');
      } else {
          // Existing user logic
          const hasSeen = localStorage.getItem('has_seen_welcome_splash');
          if (!hasSeen) setShowWelcomeSplash(true);
      }
  };

  const handleSplashComplete = useCallback(() => {
      setShowWelcomeSplash(false);
      localStorage.setItem('has_seen_welcome_splash', 'true');
  }, []);

  // Persist history changes
  useEffect(() => {
    localStorage.setItem('tradeHistory', JSON.stringify(history));
  }, [history]);

  // DAILY RESET LOGIC & PERSISTENCE
  useEffect(() => {
    if (!isAuthenticated) return;

    // Load saved bonus state
    const savedDate = localStorage.getItem('lastResetDate');
    const savedBonus = localStorage.getItem('bonusClaimsToday');
    const savedTrades = localStorage.getItem('tradesRemaining');

    const today = new Date().toDateString();

    if (savedDate !== today) {
        // NEW DAY - RESET EVERYTHING
        setBonusClaimsToday(0);
        // On new day, reset to current plan limit
        setTradesRemaining(PLAN_LIMITS[user.plan]);
        setLastResetDate(today);
        
        localStorage.setItem('lastResetDate', today);
        localStorage.setItem('bonusClaimsToday', '0');
    } else {
        // SAME DAY - RESTORE
        if (savedBonus) setBonusClaimsToday(parseInt(savedBonus));
        // Only restore trades if we have a saved value
        // Note: If handleAuthSuccess just ran for a new user, savedTrades will be 20, so this is safe
        if (savedTrades !== null) setTradesRemaining(parseInt(savedTrades));
    }
  }, [isAuthenticated]); // removed user dependency to rely on closure or storage

  // Save state on change
  useEffect(() => {
     if (!isAuthenticated) return;
     localStorage.setItem('bonusClaimsToday', bonusClaimsToday.toString());
     localStorage.setItem('tradesRemaining', tradesRemaining.toString());
  }, [bonusClaimsToday, tradesRemaining, isAuthenticated]);

  // --- NETWORK CONNECTIVITY LISTENER ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('SYNCING...'); // Reset sync status when back online
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- RECURRING AD TIMER (Every 5 Minutes) ---
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // 5 minutes = 5 * 60 * 1000 = 300000 ms
    const RECURRING_INTERVAL = 5 * 60 * 1000;
    
    const intervalId = setInterval(() => {
       if (navigator.onLine) {
         setShowRecurringAd(true);
       }
    }, RECURRING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Next Signal Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewCountdown, setPreviewCountdown] = useState(10);
  const [nextSignal, setNextSignal] = useState<{trade: TradeType, asset: string, profit: number}>({
    trade: 'PUT',
    asset: 'USD/INR',
    profit: 94
  });

  // Time displays
  const [localTime, setLocalTime] = useState(getFormattedTime());
  const [gmtTime, setGmtTime] = useState(getGMTTime());

  // Refs for logic
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingTradeRef = useRef<{ trade: TradeType; index: number } | null>(null);
  const isAutoTransitionRef = useRef(false);

  // Use a ref to access the latest state inside the interval closure without resetting the timer
  const stateRef = useRef({
    assetIndex: currentAssetIndex,
    tradeType: tradeType,
    strength: signalStrength,
    tradesLeft: tradesRemaining,
    autoMode: isAutoMode,
    isOnline: isOnline
  });

  const currentAsset = CURRENCY_DATA[currentAssetIndex];

  // Sync stateRef
  useEffect(() => {
    stateRef.current = {
      assetIndex: currentAssetIndex,
      tradeType,
      strength: signalStrength,
      tradesLeft: tradesRemaining,
      autoMode: isAutoMode,
      isOnline: isOnline
    };
  }, [currentAssetIndex, tradeType, signalStrength, tradesRemaining, isAutoMode, isOnline]);

  // --- LOGIC: ADVANCED TRADINGVIEW-STYLE ALGORITHM ---
  // Improved logic to reduce losses by aligning signals with Trend & Volatility
  const calculateHighAccuracySignal = (asset: Currency) => {
    // 1. Parse Market Data
    const changeValue = parseFloat(asset.change.replace('%', ''));
    const isPositive = changeValue > 0;
    const absChange = Math.abs(changeValue);
    
    // 2. Identify Volatility State
    // Low volatility = < 0.1%, High Volatility = > 1.0%
    const isVolatile = absChange > 0.8;
    const isFlat = absChange < 0.05;

    // 3. Smart RSI Simulation based on Trend Strength
    // If trending hard up (e.g. +1.5%), RSI is likely high (70-85)
    // If trending hard down, RSI is likely low (15-30)
    // If flat, RSI hovers middle (40-60)
    let baseRsi = 50;
    if (isPositive) baseRsi = 50 + (absChange * 15); // e.g. 1.0% change -> 65 RSI
    else baseRsi = 50 - (absChange * 15);

    // Add noise to simulate real-time fluctuation
    const noise = Math.floor(Math.random() * 10) - 5; 
    let rsi = Math.max(10, Math.min(90, Math.floor(baseRsi + noise)));

    let signal: TradeType;
    let strategy: string;
    let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    let macd: 'BUY' | 'SELL' | 'NEUTRAL';
    let strengthScore = 0;

    // 4. Trend Determination
    if (changeValue > 0.1) trend = 'BULLISH';
    else if (changeValue < -0.1) trend = 'BEARISH';
    else trend = 'NEUTRAL';

    // 5. Strategy Selection Logic (Trend Following vs Mean Reversion)
    
    // OTC Markets behave differently (often trending hard or reversing sharply)
    if (asset.isOTC) {
        // OTC LOGIC: MOMENTUM FOLLOWING
        if (isVolatile) {
             // Strong move -> Follow the trend (Momentum)
             signal = isPositive ? 'CALL' : 'PUT';
             strategy = 'OTC Momentum Push';
             macd = isPositive ? 'BUY' : 'SELL';
             strengthScore = 85 + Math.random() * 10; // High confidence in OTC momentum
        } else {
             // Low volatility OTC -> Dangerous, often random
             signal = isPositive ? 'PUT' : 'CALL'; // Bet against small drift
             strategy = 'OTC Micro-Reversal';
             macd = 'NEUTRAL';
             strengthScore = 65 + Math.random() * 10; // Low confidence
        }
    } else {
        // REAL MARKET LOGIC: TECHNICAL ANALYSIS
        
        // Scenario A: Strong Trend (SMA Alignment)
        if (absChange > 0.3 && absChange < 1.5) {
            signal = isPositive ? 'CALL' : 'PUT';
            strategy = 'SMA Trend Following';
            macd = isPositive ? 'BUY' : 'SELL';
            // High confidence if not overextended
            if (rsi > 30 && rsi < 70) strengthScore = 88 + Math.random() * 7;
            else strengthScore = 80 + Math.random() * 5; // Slightly risky if overbought/sold
        } 
        // Scenario B: Extreme Overbought/Oversold (Reversal)
        else if (absChange >= 1.5 || rsi > 80 || rsi < 20) {
            signal = rsi > 80 ? 'PUT' : 'CALL';
            strategy = 'RSI Divergence Reversal';
            macd = rsi > 80 ? 'SELL' : 'BUY';
            strengthScore = 90 + Math.random() * 5; // Reversals at extremes are high probability
        }
        // Scenario C: Sideways / Consolidation
        else {
            // In sideways markets, use Bollinger Band bounce logic (simulated)
            signal = Math.random() > 0.5 ? 'CALL' : 'PUT';
            strategy = 'Bollinger Range Bounce';
            macd = 'NEUTRAL';
            strengthScore = 70 + Math.random() * 12; // Lower confidence
        }
    }

    // 6. Final Strength Calibration
    // Cap strength based on "Flat" markets to avoid bad signals
    if (isFlat) {
        strengthScore = Math.min(strengthScore, 75); // Never give high confidence on flat market
    }

    const finalStrength = Math.min(99, Math.floor(strengthScore));

    return {
        signal,
        strength: finalStrength,
        analysis: {
            rsi,
            trend,
            strategy,
            macd
        }
    };
  };

  const generateSignal = useCallback((indexOverride?: number, usePending: boolean = false) => {
    if (!navigator.onLine) return;

    const assetIndex = indexOverride ?? currentAssetIndex;
    const asset = CURRENCY_DATA[assetIndex];
    
    let newTrade: TradeType;
    let strength = 0;
    let analysisData;

    if (usePending && pendingTradeRef.current && pendingTradeRef.current.index === assetIndex) {
      newTrade = pendingTradeRef.current.trade;
      const result = calculateHighAccuracySignal(asset);
      strength = result.strength;
      analysisData = result.analysis;
    } else {
       const result = calculateHighAccuracySignal(asset);
       newTrade = result.signal;
       strength = result.strength;
       analysisData = result.analysis;
    }

    setTradeType(newTrade);
    setSignalStrength(strength);
    setMarketAnalysis(analysisData || { rsi: 50, trend: 'NEUTRAL', strategy: 'AI Analysis', macd: 'NEUTRAL' });

    let nextIndex = assetIndex;
    if (settings.autoRotation === 'SEQUENTIAL') {
      nextIndex = (assetIndex + 1) % CURRENCY_DATA.length;
    } else if (settings.autoRotation === 'RANDOM') {
      let attempts = 0;
      do {
        nextIndex = Math.floor(Math.random() * CURRENCY_DATA.length);
        attempts++;
      } while (nextIndex === assetIndex && attempts < 3);
    }
    
    const nextAssetItem = CURRENCY_DATA[nextIndex];
    const nextAnalysis = calculateHighAccuracySignal(nextAssetItem);
    
    setNextSignal({
      trade: nextAnalysis.signal,
      asset: nextAssetItem.name,
      profit: nextAssetItem.profit1min
    });

    pendingTradeRef.current = { trade: nextAnalysis.signal, index: nextIndex };
    
    return { trade: newTrade, strength, asset };

  }, [currentAssetIndex, settings.minSignalStrength, settings.autoRotation]);

  // Initial load logic
  useEffect(() => {
    if (isOnline && isAuthenticated) {
       generateSignal();
    }
  }, [isOnline, isAuthenticated]);

  // Clock Update Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTime(getFormattedTime());
      setGmtTime(getGMTTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Perfect Timing Logic & Auto Logging
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncAndStart = () => {
      const ms = new Date().getMilliseconds();
      const delay = 1000 - ms;

      setTimeout(() => {
        if (stateRef.current.isOnline) {
            setSyncStatus('PERFECT');
        }
        
        timerRef.current = setInterval(() => {
          const currentState = stateRef.current;
          
          if (!currentState.isOnline) {
              setSyncStatus('OFFLINE');
              return;
          }

          if (currentState.tradesLeft <= 0) {
              setSecondsRemaining(0); 
              setShowPreview(false); 
              return;
          }

          const now = new Date();
          const currentSec = now.getSeconds();
          
          let rem = 59 - currentSec;
          if (rem < 0) rem = 59;

          setSecondsRemaining(rem);

          if (rem <= 10 && rem > 0) {
            setShowPreview(true);
            setPreviewCountdown(rem);
            if (rem === 10 && settings.soundVolume > 0) playWarningSound(settings.soundVolume);
          } else {
            setShowPreview(false);
          }

          if (currentSec === 0) {
             if (currentState.autoMode) {
               if (currentState.tradesLeft <= 0) return;

               const finishedAsset = CURRENCY_DATA[currentState.assetIndex];
               
               // Logic: Auto-log win based on Signal Strength (Simulated Realism)
               // Higher strength = Higher chance of simulated win
               // This aligns the auto-logger with the new "High Accuracy" logic
               const winThreshold = currentState.strength / 100; // e.g. 88% -> 0.88
               // Add a slight house edge (subtract 0.05) to be realistic about losses
               const isWin = Math.random() < (winThreshold - 0.05); 
               
               const result = isWin ? 'PROFIT' : 'LOSS';
               const profitAmt = isWin ? `+${finishedAsset.profit1min}%` : '-100%';
               
               const autoItem: TradeHistoryItem = {
                 id: Date.now().toString() + Math.random().toString().slice(2,5),
                 time: getFormattedTime(),
                 asset: finishedAsset.name,
                 signal: currentState.tradeType,
                 result: result,
                 profitAmount: profitAmt
               };
               
               setHistory(prev => [autoItem, ...prev].slice(0, 50));
               setTradesRemaining(prev => Math.max(0, prev - 1));

               isAutoTransitionRef.current = true;
               setCurrentAssetIndex(prev => {
                 if (settings.autoRotation === 'NONE') return prev;
                 if (pendingTradeRef.current) {
                    return pendingTradeRef.current.index;
                 }
                 if (settings.autoRotation === 'RANDOM') return Math.floor(Math.random() * CURRENCY_DATA.length);
                 return (prev + 1) % CURRENCY_DATA.length;
               });
             }
          }

        }, 1000);
      }, delay);
    };

    syncAndStart();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [settings.soundVolume, settings.autoRotation, isAuthenticated]);

  useEffect(() => {
    if (isOnline && isAuthenticated) {
        const usePending = isAutoTransitionRef.current;
        generateSignal(currentAssetIndex, usePending);
        
        if (settings.soundVolume > 0 && isAutoTransitionRef.current) {
            playBeepSound(settings.soundVolume);
        }
    }
    
    isAutoTransitionRef.current = false;
  }, [currentAssetIndex, generateSignal, settings.soundVolume, isOnline, isAuthenticated]); 

  // --- Handlers ---

  const handleManualSignal = () => {
    if (!isOnline) {
        alert("Please connect to the internet.");
        return;
    }
    if (tradesRemaining <= 0) {
        setShowLimitModal(true);
        return;
    }
    setTradesRemaining(prev => Math.max(0, prev - 1));
    setShowInterstitialAd(true);
    generateSignal(undefined, false);
  };

  const handleExport = () => {
    setShowRewardedInterstitialAd(true);
  };

  const handleExportRewardEarned = () => {
    alert("Data exported successfully!");
    setShowRewardedInterstitialAd(false);
  };

  const handleBonus = () => {
    if (!isOnline) return;
    setActiveRewardType('SIGNAL');
    setShowRewardedAd(true);
  }

  const handleBonusEarned = () => {
    alert("Bonus Unlocked: Signal Strength +5%");
    setSignalStrength(prev => Math.min(100, prev + 5));
    setShowRewardedAd(false);
    setActiveRewardType(null);
  };

  const handleClaimBonusTrade = () => {
      if (!isOnline) return;
      setActiveRewardType('TRADE');
      setShowRewardedAd(true);
  };

  const handleBonusTradeEarned = () => {
      setTradesRemaining(prev => prev + 1);
      setBonusClaimsToday(prev => prev + 1);
      setShowBonusModal(false); 
      setShowRewardedAd(false);
      setShowLimitModal(false);
      setActiveRewardType(null);
  };

  const handleRewardCallback = () => {
      if (activeRewardType === 'TRADE') {
          handleBonusTradeEarned();
      } else if (activeRewardType === 'SIGNAL') {
          handleBonusEarned();
      }
  };

  const handleLogResult = (result: 'PROFIT' | 'LOSS') => {
    const item: TradeHistoryItem = {
      id: Date.now().toString(),
      time: getFormattedTime(),
      asset: currentAsset.name,
      signal: tradeType,
      result: result,
      profitAmount: result === 'PROFIT' ? `+${Math.round(currentAsset.profit1min * (0.8 + Math.random() * 0.2))}%` : '-100%'
    };
    setHistory(prev => [item, ...prev].slice(0, 50));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your trading history?")) {
      setHistory([]);
      localStorage.removeItem('tradeHistory'); 
    }
  };

  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const toggleSound = () => {
    setSettings(prev => ({
      ...prev,
      soundVolume: prev.soundVolume > 0 ? 0 : 0.3
    }));
  };

  const toggleAutoMode = () => {
      if (!isAutoMode) {
          setIsAutoMode(true);
      }
  };

  const handleUpdateUser = (newUser: UserProfile) => {
    const oldPlan = user.plan;
    setUser(newUser);
    localStorage.setItem('quotex_user_profile', JSON.stringify(newUser));

    // CHECK FOR UPGRADE
    if (newUser.plan !== oldPlan) {
        const newLimit = PLAN_LIMITS[newUser.plan];
        setTradesRemaining(newLimit);
        localStorage.setItem('tradesRemaining', newLimit.toString()); // Force save immediately
        
        // Show Celebration
        setShowUpgradeCelebration(true);
        // Hide celebration after a few seconds
        setTimeout(() => setShowUpgradeCelebration(false), 5000);
    }
  };

  const handleLogout = () => {
    // 1. Remove session token
    localStorage.removeItem('quotex_auth_session');
    
    // 2. Immediately update state to trigger "Sign In" modal visibility
    // No page reload needed, making it instant
    setIsProfileOpen(false);
    setIsAuthenticated(false);
  };

  // --- Modal Logic ---
  const closeLimitModal = () => {
      setShowLimitModal(false);
      if (bonusClaimsToday < BONUS_LIMIT) {
          setShowBonusModal(true);
      }
  };

  const limitPercentage = (tradesRemaining / PLAN_LIMITS[user.plan]) * 100;
  const isLowTrades = tradesRemaining <= 5;
  const isLimitReached = tradesRemaining <= 0;

  return (
    <div className="container mx-auto p-2 md:p-4 min-h-screen flex flex-col gap-4 pb-24 md:pb-4 relative">
      
      {/* --- OFFLINE MODAL (Global) --- */}
      {!isOnline && isAuthenticated && (
          <div className="fixed inset-0 z-[500] bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
             <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                <WifiOff size={48} className="text-red-500" />
             </div>
             <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Connection Lost</h2>
             <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base leading-relaxed">
                Your internet connection is low or disconnected. <br/>
                Trading signals require a stable connection to ensure accuracy.
             </p>
             <div className="flex flex-col gap-4">
               <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/40"
               >
                  Retry Connection
               </button>
               <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-white underline decoration-gray-500 underline-offset-4 transition-colors"
               >
                  Sign Out / Reset
               </button>
             </div>
          </div>
      )}

      {/* --- WELCOME SPLASH SCREEN --- */}
      {showWelcomeSplash && (
        <WelcomeSplash 
          onComplete={handleSplashComplete} 
          developerName="Nikhil Chauhan" 
        />
      )}

      {/* --- IF NOT AUTHENTICATED, SHOW AUTH MODAL --- */}
      {!isAuthenticated && (
         <div className="fixed inset-0 z-[100] bg-background">
            <AuthModal onAuthSuccess={handleAuthSuccess} />
         </div>
      )}

      {/* --- ADS OVERLAYS --- */}
      {showAppOpenAd && isOnline && isAuthenticated && (
        <AdPlaceholder 
          type="APP_OPEN" 
          adUnitId={AD_CONFIG.appOpen} 
          onClose={() => setShowAppOpenAd(false)} 
        />
      )}
      
      {showInterstitialAd && isOnline && isAuthenticated && (
        <AdPlaceholder 
          type="INTERSTITIAL" 
          adUnitId={AD_CONFIG.interstitial} 
          onClose={() => setShowInterstitialAd(false)} 
        />
      )}

      {showRewardedInterstitialAd && isOnline && isAuthenticated && (
        <AdPlaceholder 
          type="REWARDED" 
          adUnitId={AD_CONFIG.rewardedInterstitial} 
          onClose={() => setShowRewardedInterstitialAd(false)} 
          onReward={handleExportRewardEarned}
        />
      )}

      {/* --- Recurring 5-Min Ad --- */}
      {showRecurringAd && isOnline && isAuthenticated && (
        <AdPlaceholder 
          type="REWARDED" 
          adUnitId={AD_CONFIG.rewarded} 
          onClose={() => setShowRecurringAd(false)}
          skipDuration={4} 
        />
      )}

      {showRewardedAd && isOnline && isAuthenticated && (
        <AdPlaceholder 
          type="REWARDED" 
          adUnitId={activeRewardType === 'TRADE' ? AD_CONFIG.rewardedTrade : AD_CONFIG.rewarded} 
          onClose={() => setShowRewardedAd(false)} 
          onReward={handleRewardCallback}
        />
      )}

      {/* --- PLAN UPGRADE CELEBRATION --- */}
      {showUpgradeCelebration && isAuthenticated && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-500">
             {/* Animation Background */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping delay-100"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-500 rounded-full animate-ping delay-200"></div>
            </div>
            
            <div className="relative z-10 text-center scale-100 animate-in zoom-in-50 duration-500 p-6">
                <Crown size={80} className="text-yellow-400 mx-auto mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                
                <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tight">Plan Activated!</h2>
                
                <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/30 rounded-2xl p-6 mt-6 backdrop-blur-md">
                     <div className="text-gray-300 text-lg mb-2">You have upgraded to</div>
                     <div className="text-3xl font-bold text-primary mb-6">{user.plan} Membership</div>
                     
                     <div className="flex items-center justify-center gap-4">
                        <div className="bg-gray-800 p-4 rounded-xl text-center min-w-[120px]">
                           <div className="text-gray-400 text-xs uppercase font-bold mb-1">New Limit</div>
                           <div className="text-2xl font-bold text-white">{PLAN_LIMITS[user.plan]}</div>
                           <div className="text-[10px] text-gray-500">Trades/Day</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl text-center min-w-[120px]">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-1">Status</div>
                            <div className="text-2xl font-bold text-green-500 flex justify-center"><CheckCircle /></div>
                            <div className="text-[10px] text-gray-500">Active</div>
                        </div>
                     </div>
                </div>

                <button 
                  onClick={() => setShowUpgradeCelebration(false)}
                  className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                >
                    Start Trading
                </button>
            </div>
        </div>
      )}

      {/* --- LIMIT REACHED BLOCKER (With Cancel Option) --- */}
      {showLimitModal && !showUpgradeCelebration && isOnline && isAuthenticated && (
         <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                <Lock size={48} className="text-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Daily Limit Reached</h2>
            <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base leading-relaxed">
                You have used all <span className="text-white font-bold">{PLAN_LIMITS[user.plan]} trades</span> for today. 
            </p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-lg rounded-xl shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
                >
                    <Crown size={20} className="fill-black" />
                    UPGRADE PLAN
                </button>
                
                <button 
                    onClick={closeLimitModal}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-colors border border-gray-700"
                >
                    Cancel (Read Only)
                </button>
            </div>
         </div>
      )}

      {/* --- BONUS TRADE MODAL --- */}
      {showBonusModal && !showLimitModal && isOnline && isAuthenticated && (
          <div className="fixed inset-0 z-[65] bg-black/80 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-br from-indigo-900 to-gray-900 border border-indigo-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  
                  <div className="relative z-10 text-center">
                      <Gift size={48} className="text-indigo-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Claim Free Trade</h3>
                      <p className="text-gray-300 text-sm mb-6">
                          Watch a short ad to get <strong>1 Free Trade</strong> instantly.
                      </p>

                      <div className="bg-black/30 rounded-lg p-3 mb-6 flex justify-between items-center">
                          <span className="text-xs text-gray-400 uppercase font-bold">Bonus Claimed</span>
                          <span className="text-lg font-bold text-indigo-400">{bonusClaimsToday} / {BONUS_LIMIT}</span>
                      </div>

                      <div className="space-y-3">
                        <button 
                            onClick={handleClaimBonusTrade}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 transition-all"
                        >
                            <PlayCircle size={18} /> GET 1 TRADE
                        </button>
                        <button 
                            onClick={() => setShowBonusModal(false)}
                            className="text-gray-500 text-xs hover:text-white transition-colors"
                        >
                            No thanks, keep read-only
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        user={user}
        onUpdateUser={handleUpdateUser}
        history={history}
        onLogout={handleLogout}
      />
      
      {/* Top Banner Ad */}
      {isOnline && isAuthenticated && (
        <AdPlaceholder 
            type="BANNER" 
            adUnitId={AD_CONFIG.topBanner} 
            className="rounded-xl shadow-lg" 
        />
      )}

      {isAuthenticated && (
      <>
      {/* GLOBAL TOP HEADER */}
      <header className="flex items-center justify-between bg-panel p-3 md:p-4 rounded-xl border border-panel-border shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
             <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">Quotex Pro</h1>
            <p className="text-[10px] md:text-xs text-gray-400 font-medium">Professional Dashboard v5.5</p>
          </div>
        </div>
        
        {/* Profile Button */}
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-panel-border rounded-lg p-1.5 md:px-3 md:py-2 transition-all group"
        >
           <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">{user.username}</div>
              <div className="text-[10px] text-gray-400">{user.plan} Plan</div>
           </div>
           <div className="relative">
             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
               {user.avatarInitials}
             </div>
             <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-panel rounded-full"></div>
           </div>
        </button>
      </header>

      <div className="flex flex-col xl:flex-row gap-4 flex-1">
        
        {/* === GROUP 1: LEFT SIDEBAR / MARKET TAB CONTENT === */}
        <div className={`w-full xl:w-80 flex flex-col gap-4 ${mobileTab === 'MARKET' ? 'flex' : 'hidden md:flex'}`}>
            
            {/* SIDEBAR PROFILE CARD */}
            <div className="bg-panel rounded-xl p-5 border border-panel-border relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                
                <div className="flex items-start gap-3 relative z-10">
                    <div className="relative">
                        <div 
                          className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-lg border border-panel-border cursor-pointer" 
                          onClick={() => setIsProfileOpen(true)}
                        >
                            {user.avatarInitials}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-panel"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h2 className="text-sm font-bold text-white truncate cursor-pointer hover:text-primary transition-colors" onClick={() => setIsProfileOpen(true)}>{user.username}</h2>
                            <button 
                                onClick={() => setIsProfileOpen(true)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <Settings size={14} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mb-1">{user.email}</p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                            {user.plan} PRO
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-panel-border grid grid-cols-2 gap-2">
                   <div className="bg-gray-800/30 rounded p-2 text-left">
                      <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Status</div>
                      <div className="text-xs font-bold text-green-400 flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
                          {isOnline ? 'Active' : 'Offline'}
                      </div>
                   </div>
                   <div className="bg-gray-800/30 rounded p-2 text-left">
                      <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Trades Left</div>
                      <div className={`text-xs font-bold ${isLowTrades ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
                          {tradesRemaining} / {PLAN_LIMITS[user.plan]}
                      </div>
                   </div>
                </div>
            </div>

            {/* Mobile Only: Show Session Panel here in Market Tab */}
            <div className="md:hidden">
              <SessionPanel 
                currentHour={new Date().getUTCHours()} 
                localTime={localTime}
              />
            </div>

            <CurrencyPanel 
              currentAssetIndex={currentAssetIndex}
              onSelectAsset={setCurrentAssetIndex}
              gmtTime={gmtTime}
            />
            
            {/* Native Advanced Ad */}
            {isOnline && (
                <AdPlaceholder 
                    type="NATIVE" 
                    adUnitId={AD_CONFIG.nativeAdvanced} 
                />
            )}
        </div>

        {/* === GROUP 2: RIGHT PANEL / TRADE & HISTORY TABS CONTENT === */}
        <div className={`flex-1 flex flex-col gap-4 ${mobileTab !== 'MARKET' ? 'flex' : 'hidden md:flex'}`}>
          
          <div className="hidden md:block">
            <SessionPanel 
              currentHour={new Date().getUTCHours()} 
              localTime={localTime}
            />
          </div>

          <div className={`flex flex-col gap-4 ${mobileTab === 'TRADE' ? 'contents' : 'hidden md:contents'}`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-[2]">
                <SignalCard 
                  asset={currentAsset}
                  tradeType={tradeType}
                  strength={signalStrength}
                  expirationTime={new Date(Date.now() + secondsRemaining * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  analysis={marketAnalysis}
                />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <TimerCard 
                  seconds={secondsRemaining}
                  syncStatus={syncStatus}
                  nextSignal={nextSignal}
                  showPreview={showPreview}
                  previewCountdown={previewCountdown}
                />
                
                <div className="bg-panel rounded-xl p-4 md:p-5 border border-panel-border flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-primary">QUICK ACTIONS</h3>
                  </div>
                  
                  {/* Trade Limit Progress Bar */}
                  <div className="mb-4">
                      <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Zap size={10} className={isLowTrades ? "text-red-500 animate-pulse" : "text-yellow-400"} />
                              Daily Limit
                          </span>
                          <span className={`text-[10px] font-bold ${isLowTrades ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                              {tradesRemaining} / {PLAN_LIMITS[user.plan]} Left
                          </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                           <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                  isLowTrades ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                              }`}
                              style={{ width: `${Math.min(100, limitPercentage)}%` }}
                           ></div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleManualSignal}
                      className={`border border-panel-border text-white text-xs font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                          tradesRemaining <= 0 || !isOnline
                          ? 'bg-gray-800 opacity-50 cursor-not-allowed' 
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {tradesRemaining <= 0 ? <Lock size={14} className="text-red-500" /> : <Zap size={14} className="text-yellow-400" />} 
                      {tradesRemaining <= 0 ? 'LIMIT REACHED' : 'NEW SIGNAL'}
                    </button>
                    
                    {/* AUTO MODE BUTTON */}
                    <button 
                      onClick={toggleAutoMode}
                      className={`${
                          isAutoMode 
                            ? (isLimitReached
                                ? 'bg-primary/50 border-primary/50 shadow-none' // On but limited
                                : 'bg-primary hover:bg-blue-600 shadow-lg shadow-blue-900/50')
                            : (isLimitReached
                                ? 'bg-gray-800 opacity-50 cursor-not-allowed' 
                                : 'bg-gray-800 hover:bg-gray-700')
                      } border border-panel-border text-white text-xs font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                    >
                      {isLimitReached && !isAutoMode ? <Lock size={14} /> : <Bot size={14} />} 
                      {isAutoMode 
                        ? (isLimitReached ? 'AUTO PAUSED' : 'AUTO MODE ON') 
                        : (isLimitReached ? 'LOCKED' : 'AUTO MODE')
                      }
                    </button>
                    
                    <button 
                      onClick={() => handleLogResult('PROFIT')}
                      className={`bg-gray-800 hover:bg-gray-700 border border-panel-border text-white text-xs font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                    >
                      <CheckCircle size={14} className="text-green-500" /> LOG WIN
                    </button>
                    <button 
                      onClick={() => handleLogResult('LOSS')}
                      className={`bg-gray-800 hover:bg-gray-700 border border-panel-border text-white text-xs font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                    >
                      <XCircle size={14} className="text-red-500" /> LOG LOSS
                    </button>
                    <button 
                      onClick={toggleSound}
                      className={`${settings.soundVolume > 0 ? 'bg-primary hover:bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} border border-panel-border text-white text-xs font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                    >
                      {settings.soundVolume > 0 ? <Volume2 size={14} /> : <VolumeX size={14} />} SOUND
                    </button>
                    <button 
                      onClick={handleExport}
                      className="bg-gray-800 hover:bg-gray-700 border border-panel-border text-white text-xs font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileOutput size={14} /> EXPORT
                    </button>
                    <button 
                      onClick={handleBonus}
                      className="col-span-2 bg-gradient-to-r from-yellow-600 to-amber-700 hover:from-yellow-500 hover:to-amber-600 border border-yellow-500/30 text-white text-xs font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20"
                    >
                      <Gift size={14} className="text-white" /> GET BONUS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${mobileTab === 'HISTORY' ? 'block' : 'hidden md:block'}`}>
            <HistoryPanel 
              history={history} 
              onClearHistory={handleClearHistory} 
              onDeleteItem={handleDeleteItem}
            />
          </div>

        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-panel border-t border-panel-border flex justify-around items-center p-2 z-50 pb-safe">
          <button 
            onClick={() => setMobileTab('TRADE')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'TRADE' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold">Trade</span>
          </button>
          
          <button 
            onClick={() => setMobileTab('MARKET')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'MARKET' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Coins size={20} />
            <span className="text-[10px] font-bold">Market</span>
          </button>

          <button 
            onClick={() => setMobileTab('HISTORY')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'HISTORY' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <History size={20} />
            <span className="text-[10px] font-bold">History</span>
          </button>
      </div>
      </>
      )}

    </div>
  );
};

export default App;