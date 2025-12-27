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

const getFormattedTime = () => new Date().toLocaleTimeString([], { hour12: false });
const getGMTTime = () => new Date().toUTCString().split(' ')[4];

type MobileTab = 'TRADE' | 'MARKET' | 'HISTORY';

const PLAN_LIMITS: Record<string, number> = {
  'Free': 20,
  'Standard': 100,
  'Premium': 100,
  'Ultimate': 150
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('quotex_user_profile');
      return stored ? JSON.parse(stored) : { username: 'Trader Pro', email: 'user@example.com', plan: 'Free', avatarInitials: 'TP' };
    } catch (e) { return { username: 'Trader Pro', email: 'user@example.com', plan: 'Free', avatarInitials: 'TP' }; }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('quotex_auth_session') === 'active');
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('TRADE');
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [tradeType, setTradeType] = useState<TradeType>('CALL');
  const [signalStrength, setSignalStrength] = useState(88);
  const [secondsRemaining, setSecondsRemaining] = useState(59);
  const [syncStatus, setSyncStatus] = useState('SYNCING...');
  const [isAutoMode, setIsAutoMode] = useState(true); 
  const [isOnline, setIsOnline] = useState(navigator.onLine); 
  
  const [marketAnalysis, setMarketAnalysis] = useState({ rsi: 50, trend: 'NEUTRAL' as any, strategy: 'Trend Following', macd: 'NEUTRAL' as any });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({ soundVolume: 0.3, primaryColor: '#3b82f6', autoRotation: 'SEQUENTIAL', minSignalStrength: 75 });
  const [tradesRemaining, setTradesRemaining] = useState(PLAN_LIMITS['Free']);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);

  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem('has_seen_splash')) { setShowWelcomeSplash(true); }
  }, [isAuthenticated]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (localStorage.getItem('last_reset') !== today) {
        setTradesRemaining(PLAN_LIMITS[user.plan]);
        localStorage.setItem('last_reset', today);
    } else {
        const saved = localStorage.getItem('trades_left');
        if (saved) setTradesRemaining(parseInt(saved));
    }
  }, [user.plan]);

  useEffect(() => { localStorage.setItem('trades_left', tradesRemaining.toString()); }, [tradesRemaining]);

  const calculateSignal = useCallback(() => {
    const asset = CURRENCY_DATA[currentAssetIndex];
    const strength = 80 + Math.floor(Math.random() * 19);
    const signal = Math.random() > 0.5 ? 'CALL' : 'PUT';
    setTradeType(signal as TradeType);
    setSignalStrength(strength);
    setMarketAnalysis({ rsi: 40 + Math.random() * 20, trend: signal === 'CALL' ? 'BULLISH' : 'BEARISH', strategy: 'SMA Alignment', macd: signal === 'CALL' ? 'BUY' : 'SELL' });
  }, [currentAssetIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
        const sec = new Date().getSeconds();
        setSecondsRemaining(59 - sec);
        if (sec === 0 && isAutoMode && tradesRemaining > 0) {
            const win = Math.random() < 0.85;
            const item: TradeHistoryItem = { 
                id: Date.now().toString(), 
                time: getFormattedTime(), 
                asset: CURRENCY_DATA[currentAssetIndex].name, 
                signal: tradeType, 
                result: win ? 'PROFIT' : 'LOSS', 
                profitAmount: win ? `+${CURRENCY_DATA[currentAssetIndex].profit1min}%` : '-100%' 
            };
            setHistory(prev => [item, ...prev]);
            setTradesRemaining(prev => prev - 1);
            calculateSignal();
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoMode, tradesRemaining, currentAssetIndex, tradeType, calculateSignal]);

  const handleManualSignal = () => {
    if (tradesRemaining > 0) { setTradesRemaining(prev => prev - 1); setShowInterstitialAd(true); calculateSignal(); }
    else { alert("Daily Limit Reached! Upgrade plan."); }
  };

  const handleLogout = () => { localStorage.removeItem('quotex_auth_session'); setIsAuthenticated(false); };

  if (!isAuthenticated) return <AuthModal onAuthSuccess={(u) => { setUser(u); setIsAuthenticated(true); localStorage.setItem('quotex_auth_session', 'active'); }} />;

  return (
    <div className="container mx-auto p-2 md:p-4 min-h-screen flex flex-col gap-4 pb-20">
      {showWelcomeSplash && <WelcomeSplash onComplete={() => { setShowWelcomeSplash(false); localStorage.setItem('has_seen_splash', 'true'); }} developerName="Nikhil Chauhan" />}
      {showInterstitialAd && <AdPlaceholder type="INTERSTITIAL" adUnitId={AD_CONFIG.interstitial} onClose={() => setShowInterstitialAd(false)} />}
      
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} settings={settings} onUpdateSettings={setSettings} user={user} onUpdateUser={setUser} history={history} onLogout={handleLogout} />

      <header className="flex justify-between items-center bg-panel p-4 rounded-xl border border-panel-border">
          <div className="flex items-center gap-3">
              <TrendingUp className="text-primary" />
              <div><h1 className="font-bold text-lg">Quotex Pro</h1><p className="text-[10px] text-gray-400">Netlify Build v5.5</p></div>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="bg-gray-800 px-3 py-2 rounded-lg text-xs font-bold border border-panel-border">
              {user.username} ({user.plan})
          </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
          <div className={`w-full lg:w-80 ${mobileTab === 'MARKET' ? 'block' : 'hidden lg:block'}`}>
              <CurrencyPanel currentAssetIndex={currentAssetIndex} onSelectAsset={setCurrentAssetIndex} gmtTime={getGMTTime()} />
          </div>
          <div className={`flex-1 flex flex-col gap-4 ${mobileTab !== 'MARKET' ? 'block' : 'hidden lg:block'}`}>
              <SessionPanel currentHour={new Date().getUTCHours()} localTime={getFormattedTime()} />
              <div className="flex flex-col xl:flex-row gap-4">
                  <div className="flex-[2]"><SignalCard asset={CURRENCY_DATA[currentAssetIndex]} tradeType={tradeType} strength={signalStrength} expirationTime={getFormattedTime()} analysis={marketAnalysis} /></div>
                  <div className="flex-1 flex flex-col gap-4">
                      <TimerCard seconds={secondsRemaining} syncStatus="PERFECT" showPreview={secondsRemaining < 10} previewCountdown={secondsRemaining} />
                      <div className="bg-panel p-5 rounded-xl border border-panel-border">
                          <div className="flex justify-between text-xs mb-2"><span>Trades Remaining</span><span>{tradesRemaining}</span></div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(tradesRemaining/PLAN_LIMITS[user.plan])*100}%` }}></div></div>
                          <button onClick={handleManualSignal} className="w-full py-3 bg-primary rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20">NEW SIGNAL</button>
                      </div>
                  </div>
              </div>
              <HistoryPanel history={history} onClearHistory={() => setHistory([])} onDeleteItem={(id) => setHistory(h => h.filter(x => x.id !== id))} />
          </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-panel border-t border-panel-border flex justify-around p-3">
          <button onClick={() => setMobileTab('TRADE')} className={`flex flex-col items-center gap-1 ${mobileTab === 'TRADE' ? 'text-primary' : 'text-gray-500'}`}><LayoutDashboard size={20} /><span className="text-[10px]">Trade</span></button>
          <button onClick={() => setMobileTab('MARKET')} className={`flex flex-col items-center gap-1 ${mobileTab === 'MARKET' ? 'text-primary' : 'text-gray-500'}`}><Coins size={20} /><span className="text-[10px]">Market</span></button>
          <button onClick={() => setMobileTab('HISTORY')} className={`flex flex-col items-center gap-1 ${mobileTab === 'HISTORY' ? 'text-primary' : 'text-gray-500'}`}><History size={20} /><span className="text-[10px]">History</span></button>
      </div>
    </div>
  );
};

export default App;