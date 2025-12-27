import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, Settings, Info, Crown, Palette, Volume2, Zap, Check, ChevronRight, Shield, Save, TrendingUp, BarChart2, DollarSign, ArrowLeft, Loader2, Copy, CheckCircle2, Globe, IndianRupee, Smartphone, ExternalLink, LogOut, Eye } from 'lucide-react';
import { AppSettings, UserProfile, TradeHistoryItem } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  user: UserProfile;
  onUpdateUser: (newUser: UserProfile) => void;
  history: TradeHistoryItem[];
  onLogout: () => void;
}

type Tab = 'PROFILE' | 'MEMBERSHIP' | 'BILLING' | 'SETTINGS' | 'ABOUT';
type PaymentStep = 'METHOD' | 'QR' | 'SUCCESS';
type PaymentRegion = 'GLOBAL' | 'INDIAN';
type IndianMethod = 'PHONEPE';
type GlobalMethod = 'CRYPTO_ADDRESS' | 'BINANCE_ID';

const UPI_ID = 'yobronikhil@axl';
const BANKING_NAME = 'NIKHIL CHAUHAN';

const THEME_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
];

const NETWORKS = [
  { id: 'BEP20', name: 'BNB Smart Chain (BEP20)', shortName: 'BEP20', address: '0xd83962ded13c6ce60936298928d160e2ca28a1fe' },
  { id: 'TRC20', name: 'Tron (TRC20)', shortName: 'TRC20', address: 'TCjSpgEES51Uq6PNxcfxhzhWg6jWRkxrwz' }
];

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, onClose, settings, onUpdateSettings, user, onUpdateUser, history, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('PROFILE');
  const [editForm, setEditForm] = useState({ username: '', email: user.email });
  const [isEditing, setIsEditing] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  
  const [paymentView, setPaymentView] = useState<'LIST' | 'CHECKOUT'>('LIST');
  const [paymentRegion, setPaymentRegion] = useState<PaymentRegion>('GLOBAL');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('METHOD');
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, value: string} | null>(null);
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState('BEP20');
  const [globalMethod, setGlobalMethod] = useState<GlobalMethod>('CRYPTO_ADDRESS');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const totalTrades = history.length;
  const wins = history.filter(h => h.result === 'PROFIT').length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const netProfitValue = history.reduce((acc, item) => item.result === 'PROFIT' ? acc + 10 : acc - 10, 0);
  const netProfitString = netProfitValue >= 0 ? `+$${netProfitValue}` : `-$${Math.abs(netProfitValue)}`;

  useEffect(() => {
    if (isOpen) {
      setEditForm({ username: user.username, email: user.email });
      setIsEditing(false);
      setLocalSettings(settings);
      setPaymentView('LIST'); 
      setPaymentStep('METHOD');
      setSelectedPlan(null);
      setOrderId('');
      setIsProcessing(false);
      setPaymentRegion('GLOBAL'); 
      setCopyFeedback(false);
    }
  }, [isOpen, user, settings]);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    onUpdateUser({ ...user, username: editForm.username, email: editForm.email, avatarInitials: editForm.username.slice(0, 2).toUpperCase() });
    setIsEditing(false);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const initiateUpgrade = (plan: {name: string, price: string, value: string}) => {
    if (plan.value === 'Free') onUpdateUser({ ...user, plan: 'Free' });
    else { setSelectedPlan(plan); setPaymentView('CHECKOUT'); setPaymentStep('METHOD'); setOrderId(''); }
  };

  const handleConfirmPayment = () => {
    if (!orderId || orderId.length < 5) { alert("Please enter a valid Transaction/Order ID"); return; }
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false); setPaymentStep('SUCCESS');
        setTimeout(() => { if (selectedPlan) onUpdateUser({ ...user, plan: selectedPlan.value as any }); onClose(); }, 2000);
    }, 1500);
  };

  const menuItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'PROFILE', label: 'My Profile', icon: <User size={16} /> },
    { id: 'MEMBERSHIP', label: 'Membership', icon: <Crown size={16} /> },
    { id: 'BILLING', label: 'Billing', icon: <CreditCard size={16} /> },
    { id: 'SETTINGS', label: 'Settings', icon: <Settings size={16} /> },
    { id: 'ABOUT', label: 'About', icon: <Info size={16} /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'PROFILE':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="relative mb-8">
               <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl shadow-lg"></div>
               <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                  <div className="w-24 h-24 bg-panel border-4 border-panel rounded-xl flex items-center justify-center shadow-xl text-3xl font-bold text-white bg-gradient-to-br from-gray-800 to-gray-900">
                    {user.avatarInitials}
                  </div>
                  <div className="mb-2">
                     <h2 className="text-2xl font-bold text-white flex items-center gap-2">{user.username} <Shield size={16} className="text-blue-400" /></h2>
                     <span className="text-sm text-gray-300">{user.email}</span>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
               <div className="bg-gray-800/40 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white">{totalTrades}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">Trades</div>
               </div>
               <div className="bg-gray-800/40 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-2xl font-bold text-green-400">{winRate}%</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">Win Rate</div>
               </div>
               <div className="bg-gray-800/40 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white">{netProfitString}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">Profit</div>
               </div>
            </div>
          </div>
        );
      case 'MEMBERSHIP':
        if (paymentView === 'CHECKOUT' && selectedPlan) {
            if (paymentStep === 'SUCCESS') return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <CheckCircle2 size={80} className="text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold">Payment Verified!</h2>
                    <p className="text-gray-400">Activating your {selectedPlan.name} plan...</p>
                </div>
            );
            if (paymentStep === 'QR') {
                const isIndian = paymentRegion === 'INDIAN';
                const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BANKING_NAME)}&am=${selectedPlan.price.replace(/[^\d.]/g, '')}&cu=INR`;
                return (
                    <div className="space-y-4">
                        <button onClick={() => setPaymentStep('METHOD')} className="text-gray-400 flex items-center gap-2 mb-4"><ArrowLeft size={16} /> Back</button>
                        <div className="bg-white p-6 rounded-2xl max-w-xs mx-auto text-center">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(isIndian ? upiLink : NETWORKS[0].address)}`} className="mx-auto mb-4" />
                            <div className="text-gray-900 font-bold">{isIndian ? BANKING_NAME : 'Binance Pay'}</div>
                            <div className="text-gray-500 text-xs font-mono break-all">{isIndian ? UPI_ID : NETWORKS[0].address}</div>
                        </div>
                        <input type="text" placeholder="Transaction ID / UTR" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700" />
                        <button onClick={handleConfirmPayment} disabled={isProcessing} className="w-full bg-primary py-3 rounded-xl font-bold">{isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Payment'}</button>
                    </div>
                );
            }
            return (
                <div className="space-y-4">
                    <button onClick={() => setPaymentView('LIST')} className="text-gray-400 flex items-center gap-2 mb-4"><ArrowLeft size={16} /> Back</button>
                    <h2 className="text-xl font-bold">Select Payment Method</h2>
                    {paymentRegion === 'INDIAN' ? (
                        <button onClick={() => setPaymentStep('QR')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl flex items-center gap-3">
                            <Smartphone className="text-purple-500" /> PhonePe / UPI
                        </button>
                    ) : (
                        <>
                            <button onClick={() => {setGlobalMethod('CRYPTO_ADDRESS'); setPaymentStep('QR');}} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl flex items-center gap-3">
                                <Globe className="text-yellow-500" /> Binance Pay (USDT)
                            </button>
                            <button onClick={() => {setGlobalMethod('BINANCE_ID'); setPaymentStep('QR');}} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl flex items-center gap-3">
                                <User className="text-blue-500" /> Binance ID (UID)
                            </button>
                        </>
                    )}
                </div>
            );
        }
        const plans = paymentRegion === 'INDIAN' ? [
            { name: 'Free', price: '₹0', value: 'Free' },
            { name: 'Standard', price: '₹100', value: 'Standard' },
            { name: 'Premium', price: '₹500', value: 'Premium' },
            { name: 'Ultimate', price: '₹1500', value: 'Ultimate' },
        ] : [
            { name: 'Free', price: '$0', value: 'Free' },
            { name: 'Standard', price: '$10', value: 'Standard' },
            { name: 'Premium', price: '$20', value: 'Premium' },
            { name: 'Ultimate', price: '$40', value: 'Ultimate' },
        ];
        return (
            <div className="space-y-6">
                <div className="flex justify-center bg-gray-900 p-1 rounded-lg w-fit mx-auto">
                    <button onClick={() => setPaymentRegion('GLOBAL')} className={`px-4 py-2 rounded-md text-xs font-bold ${paymentRegion === 'GLOBAL' ? 'bg-primary' : 'text-gray-400'}`}>Global</button>
                    <button onClick={() => setPaymentRegion('INDIAN')} className={`px-4 py-2 rounded-md text-xs font-bold ${paymentRegion === 'INDIAN' ? 'bg-primary' : 'text-gray-400'}`}>Indian</button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {plans.map(plan => (
                        <div key={plan.name} className="p-5 bg-gray-800/20 border border-white/10 rounded-xl flex flex-col justify-between">
                            <div><h4 className="font-bold text-white">{plan.name}</h4><div className="text-2xl font-bold text-primary">{plan.price}</div></div>
                            <button onClick={() => initiateUpgrade(plan as any)} disabled={user.plan === plan.name} className="mt-4 py-2 bg-white text-black font-bold rounded-lg disabled:opacity-50">
                                {user.plan === plan.name ? 'Active' : 'Select'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 'SETTINGS':
        return (
          <div className="space-y-6">
             <div className="bg-gray-800/20 border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Theme Color</h3>
                <div className="flex gap-4">
                    {THEME_COLORS.map(color => (
                        <button key={color.name} onClick={() => onUpdateSettings({...settings, primaryColor: color.value})} className={`w-8 h-8 rounded-full ${settings.primaryColor === color.value ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: color.value }} />
                    ))}
                </div>
             </div>
          </div>
        );
      default: return <div className="text-center p-10"><Shield size={40} className="mx-auto mb-4 text-primary" /><h2 className="text-xl font-bold">Quotex Pro Dashboard v5.5</h2></div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full h-full md:h-[650px] md:max-w-4xl bg-[#0F1115] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:flex w-64 bg-[#0A0C10] border-r border-gray-800 flex-col">
          <div className="p-6 border-b border-gray-800/50 flex items-center gap-3"><TrendingUp className="text-primary" /><h2 className="text-lg font-bold text-white">Account</h2></div>
          <div className="flex-1 p-3 space-y-1">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === item.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800/50">
             <button onClick={onLogout} className="w-full py-2 bg-red-500/10 text-red-500 font-bold rounded-lg mb-2">Sign Out</button>
             <button onClick={onClose} className="w-full py-2 bg-gray-800 text-gray-300 font-bold rounded-lg">Close</button>
          </div>
        </div>
        <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0C10] border-b border-gray-800"><h2 className="font-bold text-white">Settings</h2><button onClick={onClose}><X size={24} /></button></div>
        <div className="flex-1 overflow-y-auto p-4 md:p-10">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ProfileModal;