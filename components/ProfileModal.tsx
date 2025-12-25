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
type IndianMethod = 'PHONEPE' | 'ERUPEE';
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
  {
    id: 'BEP20',
    name: 'BNB Smart Chain (BEP20)',
    shortName: 'BEP20',
    address: '0xd83962ded13c6ce60936298928d160e2ca28a1fe'
  },
  {
    id: 'TRC20',
    name: 'Tron (TRC20)',
    shortName: 'TRC20',
    address: 'TCjSpgEES51Uq6PNxcfxhzhWg6jWRkxrwz'
  },
  {
    id: 'ERC20',
    name: 'Ethereum (ERC20)',
    shortName: 'ERC20',
    address: '0xd83962ded13c6ce60936298928d160e2ca28a1fe'
  }
];

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings,
  user,
  onUpdateUser,
  history,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('PROFILE');
  const [editForm, setEditForm] = useState({ username: '', email: user.email });
  const [isEditing, setIsEditing] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  
  // Payment State
  const [paymentView, setPaymentView] = useState<'LIST' | 'CHECKOUT'>('LIST');
  const [paymentRegion, setPaymentRegion] = useState<PaymentRegion>('GLOBAL');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('METHOD');
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, value: string} | null>(null);
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState('BEP20');
  const [indianMethod, setIndianMethod] = useState<IndianMethod>('PHONEPE');
  const [globalMethod, setGlobalMethod] = useState<GlobalMethod>('CRYPTO_ADDRESS');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Calculate Stats
  const totalTrades = history.length;
  const wins = history.filter(h => h.result === 'PROFIT').length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  // Simulated Net Profit calculation for display
  const netProfitValue = history.reduce((acc, item) => {
    return item.result === 'PROFIT' ? acc + 10 : acc - 10;
  }, 0);
  const netProfitString = netProfitValue >= 0 ? `+$${netProfitValue}` : `-$${Math.abs(netProfitValue)}`;

  useEffect(() => {
    if (isOpen) {
      setEditForm({ username: user.username, email: user.email });
      setIsEditing(false);
      setLocalSettings(settings);
      // Reset payment flow on open
      setPaymentView('LIST'); 
      setPaymentStep('METHOD');
      setSelectedPlan(null);
      setOrderId('');
      setIsProcessing(false);
      setSelectedNetworkId('BEP20');
      setPaymentRegion('GLOBAL'); // Default to global
      setGlobalMethod('CRYPTO_ADDRESS');
      setCopyFeedback(false);
    }
  }, [isOpen, user, settings]);

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
  };

  const handleSaveProfile = () => {
    onUpdateUser({
      ...user,
      username: editForm.username,
      email: editForm.email,
      avatarInitials: editForm.username.slice(0, 2).toUpperCase()
    });
    setIsEditing(false);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Step 1: User clicks Select Plan
  const initiateUpgrade = (plan: {name: string, price: string, value: string}) => {
    if (plan.value === 'Free') {
        onUpdateUser({ ...user, plan: 'Free' });
    } else {
        setSelectedPlan(plan);
        setPaymentView('CHECKOUT');
        setPaymentStep('METHOD');
        setOrderId('');
        setSelectedNetworkId('BEP20');
    }
  };

  // Step 2: User selects Method
  const goToQrScreen = (method?: IndianMethod) => {
    if (method) setIndianMethod(method);
    setPaymentStep('QR');
  };

  // Step 3: Verify Order ID and Finish
  const handleConfirmPayment = () => {
    if (!orderId || orderId.length < 5) {
        alert("Please enter a valid Transaction/Order ID (UTR)");
        return;
    }

    setIsProcessing(true);
    
    // Simulate verification
    setTimeout(() => {
        setIsProcessing(false);
        setPaymentStep('SUCCESS');
        
        // Final Redirect logic
        setTimeout(() => {
            if (selectedPlan) {
                onUpdateUser({ ...user, plan: selectedPlan.value as any });
            }
            onClose(); // Redirect to home (close modal)
        }, 1500); // Reduced delay to show home celebration sooner
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
          <div className="space-y-6 animate-in fade-in duration-300 pb-10">
            {/* Header Banner */}
            <div className="relative mb-8 mt-2 md:mt-0">
               <div className="h-24 md:h-32 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl shadow-lg"></div>
               <div className="absolute -bottom-8 left-4 md:left-6 flex items-end gap-3 md:gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-panel border-4 border-panel rounded-xl flex items-center justify-center shadow-xl text-2xl md:text-3xl font-bold text-white bg-gradient-to-br from-gray-800 to-gray-900">
                    {user.avatarInitials}
                  </div>
                  <div className="mb-1 md:mb-2">
                     <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        {user.username}
                        <Shield size={16} className="text-blue-400 fill-blue-400/20" />
                     </h2>
                     <span className="text-xs md:text-sm text-gray-300 font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">{user.email}</span>
                  </div>
               </div>
               <div className="absolute bottom-2 right-2 md:right-4">
                  <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg border border-white/10 ${
                    user.plan === 'Ultimate' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                    user.plan === 'Premium' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                    user.plan === 'Standard' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {user.plan}
                  </span>
               </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4">
               <div className="bg-gray-800/40 p-3 md:p-4 rounded-xl border border-white/5 text-center">
                  <div className="flex justify-center mb-2 text-blue-400"><BarChart2 size={18} /></div>
                  <div className="text-lg md:text-2xl font-bold text-white">{totalTrades}</div>
                  <div className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-wider">Trades</div>
               </div>
               <div className="bg-gray-800/40 p-3 md:p-4 rounded-xl border border-white/5 text-center">
                  <div className="flex justify-center mb-2 text-green-400"><TrendingUp size={18} /></div>
                  <div className="text-lg md:text-2xl font-bold text-green-400">{winRate}%</div>
                  <div className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-wider">Win Rate</div>
               </div>
               <div className="bg-gray-800/40 p-3 md:p-4 rounded-xl border border-white/5 text-center">
                  <div className="flex justify-center mb-2 text-yellow-400"><DollarSign size={18} /></div>
                  <div className="text-lg md:text-2xl font-bold text-white">{netProfitString}</div>
                  <div className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-wider">Profit</div>
               </div>
            </div>

            {/* Edit Form */}
            <div className="bg-gray-800/20 p-4 md:p-6 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-base md:text-lg font-bold text-white">Account Details</h3>
                 {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      EDIT
                    </button>
                 )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Username</label>
                  <input 
                    type="text" 
                    value={isEditing ? editForm.username : user.username} 
                    readOnly={!isEditing}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all ${
                      isEditing ? 'border-primary/50' : 'border-transparent cursor-not-allowed text-gray-400'
                    }`} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={isEditing ? editForm.email : user.email} 
                    readOnly={!isEditing}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all ${
                      isEditing ? 'border-primary/50' : 'border-transparent cursor-not-allowed text-gray-400'
                    }`} 
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({ username: user.username, email: user.email });
                    }}
                    className="px-4 py-2 bg-transparent hover:bg-gray-800 text-gray-400 font-bold rounded-lg transition-colors text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-xs md:text-sm shadow-lg shadow-blue-900/20"
                  >
                    <Save size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button Mobile/Content Area */}
            <button 
                onClick={onLogout}
                className="w-full mt-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 flex items-center justify-center gap-2 transition-colors md:hidden"
            >
                <LogOut size={16} /> Sign Out
            </button>
          </div>
        );

      case 'MEMBERSHIP':
        // ======================= CHECKOUT VIEW =======================
        if (paymentView === 'CHECKOUT' && selectedPlan) {
            
            // --- SUCCESS STATE ---
            if (paymentStep === 'SUCCESS') {
                return (
                    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                            <CheckCircle2 size={100} className="text-green-500 relative z-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 text-center">Congratulations!</h2>
                        <p className="text-gray-400 text-center mb-8 max-w-xs">
                            You have successfully upgraded to the <span className="text-primary font-bold">{selectedPlan.name} Plan</span>.
                        </p>
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-white/5 w-full max-w-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500">Amount Paid</span>
                                <span className="font-bold text-white">{selectedPlan.price}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Payment Method</span>
                                <span className="font-bold text-[#F0B90B]">
                                  {paymentRegion === 'INDIAN' ? (indianMethod === 'PHONEPE' ? 'PhonePe' : 'eRupee') : (globalMethod === 'BINANCE_ID' ? 'Binance ID' : 'Binance Pay')}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-8 animate-pulse">Redirecting to Dashboard...</p>
                    </div>
                );
            }

            // --- QR PAYMENT STATE (GLOBAL) ---
            if (paymentStep === 'QR' && paymentRegion === 'GLOBAL') {
                // BRANCH: BINANCE ID (SCREENSHOT REPLICATION)
                if (globalMethod === 'BINANCE_ID') {
                  return (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-10 duration-300">
                        <button 
                            onClick={() => setPaymentStep('METHOD')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-bold"
                        >
                            <ArrowLeft size={16} /> Back to Methods
                        </button>

                        <div className="flex-1 flex flex-col items-center max-w-sm mx-auto w-full overflow-y-auto custom-scrollbar pb-4">
                            
                            <h2 className="text-lg font-bold text-white mb-4">Send to Binance ID</h2>

                            {/* ACCOUNT INFO CARD - REPLICATING SCREENSHOT */}
                            <div className="w-full bg-[#1E2329] rounded-xl overflow-hidden border border-gray-700 shadow-2xl mb-6 relative">
                               <div className="absolute top-0 left-0 w-full h-1 bg-[#F0B90B]"></div>
                               {/* Card Header */}
                               <div className="p-4 flex items-center justify-between border-b border-gray-700 bg-[#252a30]">
                                  <h3 className="text-white font-bold text-sm">Account Info</h3>
                                  <User size={16} className="text-gray-400" />
                               </div>
                               
                               <div className="p-5">
                                  {/* User Row */}
                                  <div className="flex items-center gap-3 mb-6">
                                     <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center relative flex-shrink-0">
                                        <User className="text-black fill-black/20" size={24} />
                                        <div className="absolute bottom-0 right-0 bg-gray-600 rounded-full p-0.5 border border-[#1E2329]">
                                            <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            </div> 
                                        </div>
                                     </div>
                                     <div className="min-w-0">
                                        <div className="text-white font-bold text-lg truncate">qurtex strategy pro</div>
                                        <div className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded inline-block font-medium">Regular</div>
                                     </div>
                                  </div>

                                  {/* UID Row */}
                                  <div className="flex justify-between items-center mb-4">
                                     <span className="text-gray-400 text-xs font-medium">Binance ID (UID)</span>
                                     <div className="flex items-center gap-2">
                                        <span className="text-white font-mono font-bold text-sm">949745650</span>
                                        <button 
                                          onClick={() => { 
                                              navigator.clipboard.writeText('949745650'); 
                                              setCopyFeedback(true); 
                                              setTimeout(()=>setCopyFeedback(false), 2000); 
                                          }} 
                                          className="text-gray-400 hover:text-white transition-colors"
                                        >
                                           {copyFeedback ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                                        </button>
                                     </div>
                                  </div>

                                  {/* Email Row */}
                                  <div className="flex justify-between items-center mb-6">
                                     <span className="text-gray-400 text-xs font-medium">Reg.Info</span>
                                     <div className="flex items-center gap-2 max-w-[60%]">
                                        <span className="text-white text-xs truncate">nikhilgamerboybusiness@gmail.com</span>
                                        <Eye size={14} className="text-gray-400 flex-shrink-0" />
                                     </div>
                                  </div>

                                  {/* Banner */}
                                  <div className="bg-[#2B3139] rounded-lg p-3 flex justify-between items-center border border-gray-700">
                                     <div>
                                        <div className="text-white text-sm font-bold">Upgrade to VIP1</div>
                                        <div className="text-[10px] text-gray-500">Trade more to reach the next level</div>
                                        <div className="w-24 h-1 bg-yellow-500/30 rounded-full mt-2 relative">
                                           <div className="absolute left-0 top-0 h-full w-2 bg-yellow-500 rounded-full"></div>
                                        </div>
                                     </div>
                                     <div className="text-[#F0B90B] text-xs font-bold flex items-center gap-1 cursor-pointer hover:text-yellow-400">
                                        Benefits <ChevronRight size={12} />
                                     </div>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="text-left space-y-2 w-full">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-4">
                                  <p className="text-xs text-blue-300">
                                    <span className="font-bold">Instructions:</span> Open Binance App &gt; Pay &gt; Send. Enter the Binance ID above.
                                  </p>
                                </div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Transaction Order ID</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Order ID (18+ digits)"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full bg-[#2b3139] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F0B90B] transition-colors"
                                    maxLength={25}
                                />
                                <p className="text-[10px] text-gray-500">Found in payment details after successful transfer.</p>
                            </div>

                            <button 
                                onClick={handleConfirmPayment}
                                disabled={isProcessing || orderId.length < 5}
                                className={`w-full mt-6 py-3 rounded-lg font-bold text-black transition-all flex items-center justify-center gap-2 ${
                                    isProcessing || orderId.length < 5 
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                    : 'bg-[#F0B90B] hover:bg-[#debb0b]'
                                }`}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                  );
                }

                // BRANCH: CRYPTO ADDRESS (QR)
                const currentNetwork = NETWORKS.find(n => n.id === selectedNetworkId) || NETWORKS[0];

                return (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-10 duration-300">
                        <button 
                            onClick={() => setPaymentStep('METHOD')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-bold"
                        >
                            <ArrowLeft size={16} /> Back to Methods
                        </button>

                        <div className="flex-1 flex flex-col items-center max-w-sm mx-auto w-full overflow-y-auto custom-scrollbar pb-4">
                            
                            {/* Network Selector */}
                            <div className="w-full mb-4">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Select Network</label>
                                <div className="flex p-1 bg-gray-800 rounded-lg border border-gray-700">
                                    {NETWORKS.map(net => (
                                        <button
                                            key={net.id}
                                            onClick={() => setSelectedNetworkId(net.id)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                                                selectedNetworkId === net.id 
                                                ? 'bg-[#F0B90B] text-black shadow-md' 
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {net.shortName}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* White Deposit Card */}
                            <div className="bg-white rounded-2xl p-6 w-full text-gray-900 shadow-2xl mb-6 relative overflow-hidden flex-shrink-0">
                                <h3 className="text-center font-bold text-lg mb-6 text-gray-900">Deposit USDT to Binance</h3>

                                {/* QR Code */}
                                <div className="flex justify-center mb-6 relative">
                                    <div className="w-48 h-48 relative">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentNetwork.address}&color=000000&bgcolor=FFFFFF&margin=0`}
                                            alt={`${currentNetwork.name} QR`}
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                                <span className="text-white font-bold text-sm">₮</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Network */}
                                <div className="flex justify-between items-start mb-4 text-xs md:text-sm">
                                    <span className="text-gray-500 font-medium">Network</span>
                                    <span className="font-bold text-gray-900 text-right">{currentNetwork.name}</span>
                                </div>

                                {/* Wallet Address */}
                                <div className="flex justify-between items-start mb-8 text-xs md:text-sm">
                                    <span className="text-gray-500 font-medium whitespace-nowrap mr-4">Wallet Address</span>
                                    <div className="flex flex-col items-end flex-1 min-w-0">
                                        <span className="font-bold text-gray-900 text-right break-all font-mono leading-tight">
                                            {currentNetwork.address}
                                        </span>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <p className="text-[10px] text-gray-400 mb-6">Don't send NFTs to this address.</p>

                                {/* Binance Logo */}
                                <div className="flex justify-center items-center gap-2 text-[#F0B90B] font-bold">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#F0B90B"/><path d="M10.605 6.648l1.396 1.396 1.396-1.396-1.396-1.395-1.396 1.395zm-3.95 3.95L8.05 12l-1.395 1.396-1.396-1.395L6.655 10.6l1.396-1.396-1.396-1.396 1.396-1.395L9.447 9.2l-2.791 2.791zm3.95 3.951l1.396 1.396 1.396-1.396-1.396-1.395-1.396 1.395zm3.95-3.95L15.95 12l1.396 1.396 1.395-1.395L17.345 10.6l-1.395-1.396 1.395-1.396-1.395-1.395L14.553 9.2l2.791 2.791z" fill="black"/><path d="M12 10.5l-1.5 1.5 1.5 1.5 1.5-1.5-1.5-1.5z" fill="black"/></svg>
                                    <span className="text-[#F0B90B] tracking-wide text-lg">BINANCE</span>
                                </div>
                            </div>

                            <div className="text-left space-y-2 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase">Transaction Verification</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Order ID (18 chars)"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full bg-[#2b3139] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F0B90B] transition-colors"
                                    maxLength={18}
                                />
                                <p className="text-[10px] text-gray-500">Find the Order ID in your Binance payment history.</p>
                            </div>

                            <button 
                                onClick={handleConfirmPayment}
                                disabled={isProcessing || orderId.length < 5}
                                className={`w-full mt-6 py-3 rounded-lg font-bold text-black transition-all flex items-center justify-center gap-2 ${
                                    isProcessing || orderId.length < 5 
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                    : 'bg-[#F0B90B] hover:bg-[#debb0b]'
                                }`}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                );
            }

            // --- QR PAYMENT STATE (INDIAN / PHONEPE) ---
            if (paymentStep === 'QR' && paymentRegion === 'INDIAN') {
                const isPhonePe = indianMethod === 'PHONEPE';
                const themeColor = isPhonePe ? '#5f259f' : '#00bfa5'; 
                
                // Styles based on screenshots
                const cardBg = isPhonePe ? 'bg-black border border-gray-800' : 'bg-white';
                const textColor = isPhonePe ? 'text-white' : 'text-gray-900';
                const subTextColor = isPhonePe ? 'text-gray-400' : 'text-gray-500';
                
                // --- ROBUST PRICE PARSING ---
                // Strip everything except digits and dot
                const rawPrice = selectedPlan.price.replace(/[^\d.]/g, '');
                // Ensure it has two decimal places for UPI standard (e.g. 100.00)
                const priceNum = rawPrice ? parseFloat(rawPrice).toFixed(2) : '0.00';
                
                // --- ROBUST UPI LINK CONSTRUCTION ---
                // Add Transaction Note (tn) to look more legit
                const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BANKING_NAME)}&am=${priceNum}&cu=INR&tn=PlanUpgrade`;
                
                return (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-10 duration-300">
                        <button 
                            onClick={() => setPaymentStep('METHOD')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-bold"
                        >
                            <ArrowLeft size={16} /> Back to Methods
                        </button>

                        <div className="flex-1 flex flex-col items-center max-w-sm mx-auto w-full overflow-y-auto custom-scrollbar pb-4">
                            
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-8 h-8 rounded flex items-center justify-center text-white`} style={{ backgroundColor: themeColor }}>
                                   {isPhonePe ? <Smartphone size={18} /> : <IndianRupee size={18} />}
                                </div>
                                <span className="font-bold text-white text-xl uppercase">{isPhonePe ? 'PhonePe' : 'Digital eRupee'}</span>
                            </div>
                            
                            {/* UPI Copy Section */}
                            <div className="flex items-center justify-center gap-2 mb-4 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                                <span className="text-sm font-mono text-white tracking-wide">{UPI_ID}</span>
                                <button onClick={handleCopyUPI} className="text-gray-400 hover:text-white bg-gray-700/50 p-1.5 rounded-md hover:bg-gray-700 transition-colors">
                                    {copyFeedback ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                            </div>

                            {/* Payment Card - Styled to match screenshot themes */}
                            <div className={`${cardBg} rounded-2xl p-6 w-full shadow-2xl mb-4 relative overflow-hidden flex-shrink-0 text-center`}>
                                {/* Header Text matching screenshots */}
                                {isPhonePe && (
                                    <div className="mb-4">
                                        <div className="text-[#5f259f] font-bold tracking-widest text-sm mb-1">ACCEPTED HERE</div>
                                        <p className={`${subTextColor} text-xs`}>Scan & Pay Using PhonePe App</p>
                                    </div>
                                )}
                                {!isPhonePe && (
                                    <p className={`${subTextColor} text-sm mb-4`}>Scan this QR to pay through Digital Rupee</p>
                                )}
                                
                                {/* QR Code Image Container */}
                                <div className="mx-auto w-full flex justify-center mb-4 relative min-h-[200px]">
                                    <img 
                                        src={isPhonePe ? "phonepe_qr.jpg" : "erupee_qr.jpg"}
                                        alt={isPhonePe ? "PhonePe QR" : "Digital Rupee QR"}
                                        className="w-full max-w-[240px] h-auto object-contain rounded-lg" 
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null; 
                                            // Fallback to a working generated QR if file is missing
                                            target.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}`;
                                        }}
                                    />
                                </div>

                                <div className={`font-bold text-xl ${textColor} mb-1 uppercase`}>{BANKING_NAME}</div>
                                {isPhonePe && <div className="text-xs text-gray-500 mb-4">Banking Name: {BANKING_NAME}</div>}

                                <div className={`flex justify-between items-center border-t ${isPhonePe ? 'border-gray-800' : 'border-gray-100'} pt-4`}>
                                   <span className={`${subTextColor} text-xs font-bold uppercase`}>Total Amount</span>
                                   <span className={`text-xl font-bold ${textColor}`}>{selectedPlan.price}</span>
                                </div>
                            </div>

                            {/* --- NEW: UPI DEEP LINK BUTTON --- */}
                            <a 
                                href={upiLink}
                                className={`w-full mb-6 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg ${
                                    isPhonePe 
                                    ? 'bg-[#5f259f] hover:bg-[#4a1c7a] text-white shadow-[#5f259f]/30' 
                                    : 'bg-[#00bfa5] hover:bg-[#008f7a] text-white shadow-[#00bfa5]/30'
                                }`}
                            >
                                <Smartphone size={20} />
                                {isPhonePe ? 'Pay via PhonePe / Any UPI' : 'Pay via UPI App'}
                                <ExternalLink size={16} className="opacity-70" />
                            </a>

                            {/* UTR Verification */}
                            <div className="text-left space-y-2 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase">UTR / Transaction ID</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter 12-digit UTR Number"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value.replace(/\D/g, ''))} // Only numbers
                                    className="w-full bg-[#2b3139] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                                    style={{ borderColor: isProcessing ? themeColor : '#4b5563' }}
                                    maxLength={12}
                                />
                                <p className="text-[10px] text-gray-500">Check your banking app for the UTR reference number.</p>
                            </div>

                            <button 
                                onClick={handleConfirmPayment}
                                disabled={isProcessing || orderId.length < 10}
                                className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                                    isProcessing || orderId.length < 10 
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                    : 'hover:brightness-110'
                                }`}
                                style={{ backgroundColor: isProcessing || orderId.length < 10 ? undefined : themeColor }}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Verify Payment'}
                            </button>
                        </div>
                    </div>
                );
            }

            // --- METHOD SELECTION STATE ---
            return (
                <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-10 duration-300">
                    <button 
                        onClick={() => setPaymentView('LIST')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-bold"
                    >
                        <ArrowLeft size={16} /> Back to Plans
                    </button>

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-white/10 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Crown size={100} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Upgrade to {selectedPlan.name}</h2>
                        <p className="text-sm text-gray-400 mb-4">Complete your purchase to unlock exclusive features.</p>
                        <div className="flex items-end gap-1">
                            <span className="text-3xl font-bold text-primary">{selectedPlan.price}</span>
                            <span className="text-sm text-gray-500 mb-1">Total to pay</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Select Payment Method</h3>
                    
                    <div className="space-y-3">
                        {/* Indian Payment Methods */}
                        {paymentRegion === 'INDIAN' ? (
                            <>
                                <button 
                                    onClick={() => goToQrScreen('PHONEPE')}
                                    className="w-full bg-[#1e2026] hover:bg-[#2b2f36] border border-[#5f259f]/30 hover:border-[#5f259f] p-4 rounded-xl flex items-center justify-between group transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 bg-[#5f259f] text-white rounded-lg flex items-center justify-center">
                                            <Smartphone size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm">PhonePe</div>
                                            <div className="text-xs text-gray-500">UPI Payment</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-600 group-hover:text-[#5f259f] transition-colors" />
                                </button>
                            </>
                        ) : (
                            /* Global Payment Methods */
                            <>
                                {/* Binance Pay (Original) */}
                                <button 
                                    onClick={() => { setGlobalMethod('CRYPTO_ADDRESS'); goToQrScreen(); }}
                                    className="w-full bg-[#1e2026] hover:bg-[#2b2f36] border border-[#F0B90B]/30 hover:border-[#F0B90B] p-4 rounded-xl flex items-center justify-between group transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 bg-[#F0B90B] text-black rounded-lg flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#F0B90B"/>
                                                <path d="M10.605 6.648l1.396 1.396 1.396-1.396-1.396-1.395-1.396 1.395zm-3.95 3.95L8.05 12l-1.395 1.396-1.396-1.395L6.655 10.6l1.396-1.396-1.396-1.396 1.396-1.395L9.447 9.2l-2.791 2.791zm3.95 3.951l1.396 1.396 1.396-1.396-1.396-1.395-1.396 1.395zm3.95-3.95L15.95 12l1.396 1.396 1.395-1.395L17.345 10.6l-1.395-1.396 1.395-1.396-1.395-1.395L14.553 9.2l2.791 2.791z" fill="black"/> 
                                                <path d="M12 10.5l-1.5 1.5 1.5 1.5 1.5-1.5-1.5-1.5z" fill="black"/>
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm">Binance Pay</div>
                                            <div className="text-xs text-gray-500">Scan QR Code (USDT)</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-600 group-hover:text-[#F0B90B] transition-colors" />
                                </button>

                                {/* NEW: Binance ID Method */}
                                <button 
                                    onClick={() => { setGlobalMethod('BINANCE_ID'); goToQrScreen(); }}
                                    className="w-full bg-[#1e2026] hover:bg-[#2b2f36] border border-[#F0B90B]/30 hover:border-[#F0B90B] p-4 rounded-xl flex items-center justify-between group transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 bg-[#F0B90B] text-black rounded-lg flex items-center justify-center font-bold text-lg">
                                             ID
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm">Binance ID</div>
                                            <div className="text-xs text-gray-500">Send to UID</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-600 group-hover:text-[#F0B90B] transition-colors" />
                                </button>

                                <button disabled className="w-full bg-[#1e2026] opacity-50 border border-white/5 p-4 rounded-xl flex items-center justify-between cursor-not-allowed">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-700 text-gray-400 rounded-lg flex items-center justify-center">
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-gray-400 text-sm">Credit Card</div>
                                            <div className="text-xs text-gray-600">Unavailable</div>
                                        </div>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )
        }

        // ======================= LIST VIEW =======================
        const globalPlans = [
          { 
            name: 'Free', 
            price: '$0', 
            period: '/mo', 
            originalPrice: null,
            features: ['20 Trades for Day', 'Basic Support'], 
            value: 'Free', 
            color: 'gray' 
          },
          { 
            name: 'Standard', 
            price: '$10', 
            originalPrice: '$15', 
            period: '/1 month', 
            features: ['100 Trades for Day', 'Full Access'], 
            value: 'Standard', 
            color: 'blue' 
          },
          { 
            name: 'Premium', 
            price: '$20', 
            originalPrice: '$30', 
            period: '/3 months', 
            features: ['100 Trades for Day', '12 Hours Support Team', 'Priority Signals'], 
            value: 'Premium', 
            color: 'violet' 
          },
          { 
            name: 'Ultimate', 
            price: '$40', 
            originalPrice: '$50', 
            period: '/5 months', 
            features: ['150 Trades for Day', '24 Hours Support Team', 'VIP Mentoring'], 
            value: 'Ultimate', 
            color: 'amber' 
          },
        ];

        const indianPlans = [
          { 
            name: 'Free', 
            price: '₹0', 
            period: '/mo', 
            originalPrice: null, 
            features: ['20 Trades for Day', 'Basic Support'], 
            value: 'Free', 
            color: 'gray' 
          },
          { 
            name: 'Standard', 
            price: '₹100', 
            originalPrice: '₹500', 
            period: '/1 month', 
            features: ['100 Trades for Day', 'Full Access'], 
            value: 'Standard', 
            color: 'blue' 
          },
          { 
            name: 'Premium', 
            price: '₹500', 
            originalPrice: '₹1000', 
            period: '/3 months', 
            features: ['100 Trades for Day', '12 Hours Support Team', 'Priority Signals'], 
            value: 'Premium', 
            color: 'violet' 
          },
          { 
            name: 'Ultimate', 
            price: '₹1500', 
            originalPrice: '₹5000', 
            period: '/5 months', 
            features: ['150 Trades for Day', '24 Hours Support Team', 'VIP Mentoring'], 
            value: 'Ultimate', 
            color: 'amber' 
          },
        ];

        const plans = paymentRegion === 'INDIAN' ? indianPlans : globalPlans;
        
        return (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300 pb-10">
            <div className="text-center mb-2 md:mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-white">Choose Your Plan</h3>
                <p className="text-xs md:text-sm text-gray-400 mt-1">Unlock higher trading limits and dedicated support.</p>
            </div>

            {/* Region Toggle */}
            <div className="flex justify-center mb-4">
                <div className="bg-gray-800 p-1 rounded-lg flex items-center border border-gray-700">
                    <button 
                        onClick={() => setPaymentRegion('GLOBAL')}
                        className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                            paymentRegion === 'GLOBAL' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Globe size={14} /> Global (USD)
                    </button>
                    <button 
                        onClick={() => setPaymentRegion('INDIAN')}
                        className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                            paymentRegion === 'INDIAN' ? 'bg-[#ff9933] text-black shadow' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <IndianRupee size={14} /> Indian (INR)
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((plan) => {
                const isActive = user.plan === plan.name;
                const borderColor = isActive ? 'border-primary ring-1 ring-primary' : 'border-white/10 hover:border-white/20';
                const bg = isActive ? 'bg-blue-900/10' : 'bg-gray-800/20';
                const isOffer = !!plan.originalPrice;
                
                return (
                  <div key={plan.name} className={`p-4 md:p-5 rounded-xl border ${borderColor} ${bg} transition-all relative overflow-hidden group`}>
                    {isActive && <div className="absolute top-0 right-0 bg-primary text-white text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">CURRENT</div>}
                    {isOffer && !isActive && <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">OFFER</div>}
                    
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gray-800 border border-white/10 ${
                                    plan.value === 'Ultimate' ? 'text-amber-400' : 
                                    plan.value === 'Premium' ? 'text-purple-400' :
                                    plan.value === 'Standard' ? 'text-blue-400' : 'text-gray-400'
                                }`}>
                                    {plan.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base">{plan.name}</h4>
                                    <div className="flex flex-col">
                                       <div className="flex items-baseline gap-2">
                                          <span className="text-xl font-bold text-white">{plan.price}</span>
                                          {plan.originalPrice && (
                                            <span className="text-xs text-gray-500 line-through decoration-red-500">{plan.originalPrice}</span>
                                          )}
                                       </div>
                                       <span className="text-[10px] text-gray-500">{plan.period}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 mb-4">
                            {plan.features.map((feat, i) => (
                                <div key={i} className="flex items-start gap-2 text-[11px] md:text-xs text-gray-300">
                                    <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => initiateUpgrade(plan)}
                            disabled={isActive}
                            className={`w-full py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all mt-auto ${
                                isActive 
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-black hover:bg-gray-200 shadow-lg'
                            }`}
                        >
                            {isActive ? 'Active Plan' : 'Select Plan'}
                        </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'BILLING':
        return (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-10">
             <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Payment Method</p>
                        <div className="flex items-center gap-3 mt-2">
                             <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                                <span className="text-blue-900 font-extrabold text-xs italic font-serif">VISA</span>
                             </div>
                             <div>
                                 <p className="text-lg font-mono text-white tracking-widest">•••• 4242</p>
                                 <p className="text-[10px] text-gray-500">Expires 12/25</p>
                             </div>
                        </div>
                    </div>
                    <button className="text-[10px] md:text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors font-bold">
                        Update
                    </button>
                </div>
             </div>

             <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-base md:text-lg font-bold text-white">Billing History</h3>
                    <button className="text-xs text-primary font-bold hover:underline">Download All</button>
                </div>
                <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
                    {[
                      { id: '#INV-001', date: 'Oct 24, 2023', amount: '$29.00', status: 'Paid' },
                      { id: '#INV-002', date: 'Sep 24, 2023', amount: '$29.00', status: 'Paid' },
                      { id: '#INV-003', date: 'Aug 24, 2023', amount: '$29.00', status: 'Paid' },
                    ].map((inv, i) => (
                       <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">
                           <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-gray-500">
                                  <CreditCard size={14} />
                               </div>
                               <div>
                                   <p className="text-sm font-bold text-white">{inv.amount}</p>
                                   <p className="text-xs text-gray-500">{inv.date}</p>
                               </div>
                           </div>
                           <div className="text-right">
                               <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{inv.status}</span>
                               <p className="text-[10px] text-gray-600 font-mono mt-1">{inv.id}</p>
                           </div>
                       </div>
                    ))}
                </div>
             </div>
          </div>
        );

      case 'SETTINGS':
        const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
        return (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300 pb-10">
             <div className="bg-gray-800/20 border border-white/5 rounded-xl p-4 md:p-5">
                <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Palette size={16} className="text-primary" /> Appearance
                </h3>
                <div className="flex gap-4">
                    {THEME_COLORS.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => handleSettingChange('primaryColor', color.value)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                localSettings.primaryColor === color.value 
                                ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' 
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        >
                            {localSettings.primaryColor === color.value && <Check size={12} className="text-white" />}
                        </button>
                    ))}
                </div>
             </div>

             <div className="bg-gray-800/20 border border-white/5 rounded-xl p-4 md:p-5">
                <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Volume2 size={16} className="text-primary" /> System Sounds
                </h3>
                <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg border border-white/5">
                    <button 
                         onClick={() => handleSettingChange('soundVolume', localSettings.soundVolume === 0 ? 0.5 : 0)}
                         className="p-2 bg-gray-800 rounded-md hover:text-white text-gray-400"
                    >
                        {localSettings.soundVolume > 0 ? <Volume2 size={18} /> : <X size={18} />}
                    </button>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={localSettings.soundVolume}
                        onChange={(e) => handleSettingChange('soundVolume', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-mono font-bold text-gray-300 w-8 text-right">
                        {Math.round(localSettings.soundVolume * 100)}%
                    </span>
                </div>
             </div>

             <div className="bg-gray-800/20 border border-white/5 rounded-xl p-4 md:p-5">
                <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-primary" /> Trading Configuration
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase">
                            <span>Auto-Switch Mode</span>
                            <span className="text-primary">{localSettings.autoRotation}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                        {(['SEQUENTIAL', 'RANDOM', 'NONE'] as const).map((mode) => (
                            <button
                            key={mode}
                            onClick={() => handleSettingChange('autoRotation', mode)}
                            className={`px-2 py-2 rounded text-[10px] font-bold border transition-all ${
                                localSettings.autoRotation === mode 
                                ? 'bg-primary/20 border-primary text-primary' 
                                : 'bg-gray-800/50 border-white/5 text-gray-500 hover:bg-gray-800'
                            }`}
                            >
                            {mode}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase">
                            <span>Min Signal Strength</span>
                            <span className="text-primary">{localSettings.minSignalStrength}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="50" 
                            max="95" 
                            step="1"
                            value={localSettings.minSignalStrength}
                            onChange={(e) => handleSettingChange('minSignalStrength', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>
             </div>

             {/* Save Button */}
             <div className="flex justify-end pt-2">
                <button 
                   onClick={handleSaveSettings}
                   disabled={!hasChanges}
                   className={`px-6 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg ${
                      hasChanges 
                        ? 'bg-primary hover:bg-blue-600 text-white shadow-blue-900/20 translate-y-0' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                   }`}
                >
                   <Save size={16} /> Save Settings
                </button>
             </div>
             
             {/* Logout Button Mobile/Settings Area */}
             <button 
                onClick={onLogout}
                className="w-full mt-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 flex items-center justify-center gap-2 transition-colors md:hidden"
            >
                <LogOut size={16} /> Sign Out
            </button>
          </div>
        );

      case 'ABOUT':
        return (
            <div className="flex flex-col h-full animate-in fade-in duration-300 pb-10">
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-transparent to-gray-900/30 rounded-xl border border-white/5">
                    <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
                        <Shield size={40} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Quotex Pro Dashboard</h2>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8">
                        Advanced algorithmic trading assistance system with real-time market synchronization.
                    </p>
                    <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
                        <div className="text-center">
                            <div className="text-lg font-bold text-white">v5.5.0</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Version</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-500">Stable</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Build</div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-center">
                     <p className="text-[10px] text-gray-600">
                        © 2023 Quotex Pro Enterprise. All rights reserved.<br/>
                        Unauthorized redistribution is prohibited.
                     </p>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full h-full md:h-[650px] md:max-w-4xl bg-[#0F1115] border-0 md:border border-gray-800 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#0A0C10]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-gray-600">
                {user.avatarInitials}
             </div>
             <span className="font-bold text-white text-sm">{user.username}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Horizontal Navigation */}
        <div className="md:hidden flex overflow-x-auto p-2 gap-2 bg-[#0A0C10] border-b border-gray-800 no-scrollbar">
           {menuItems.map((item) => (
              <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                   activeTab === item.id 
                     ? 'bg-primary text-white shadow-lg shadow-blue-900/20' 
                     : 'bg-gray-800/50 text-gray-400 border border-transparent'
                 }`}
              >
                 {item.icon} {item.label}
              </button>
           ))}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 bg-[#0A0C10] border-r border-gray-800 flex-col">
          <div className="p-6 border-b border-gray-800/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="font-bold text-white">Q</span>
              </div>
              Account
            </h2>
          </div>
          
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-blue-900/20 translate-x-1' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                {activeTab === item.id && <ChevronRight size={14} className="animate-in slide-in-from-left-2" />}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800/50">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-gray-600">
                    {user.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{user.username}</div>
                    <div className="text-[10px] text-gray-500 truncate">Online</div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={onLogout}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-lg transition-colors text-xs border border-red-500/20 flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg transition-colors text-xs border border-gray-700"
                >
                  Close Dashboard
                </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0F1115] relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="p-4 md:p-10 max-w-2xl mx-auto h-full">
                {renderTabContent()}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;