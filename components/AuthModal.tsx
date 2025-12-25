import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  onAuthSuccess: (user: UserProfile, isNewUser: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up for first time
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-switch to login if user profile exists
  useEffect(() => {
    const existingProfile = localStorage.getItem('quotex_user_profile');
    if (existingProfile) {
        setIsLogin(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      if (!formData.email || !formData.password || (!isLogin && !formData.username)) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Simple login simulation check against stored data or generic success
        const storedUser = localStorage.getItem('quotex_user_profile');
        if (storedUser) {
           const parsed = JSON.parse(storedUser);
           
           // For this specific request, we just update the auth state
           const userProfile: UserProfile = {
            username: parsed.username, 
            email: formData.email, // update email to current if changed
            plan: parsed.plan || 'Free',
            avatarInitials: parsed.username.slice(0, 2).toUpperCase()
          };
          onAuthSuccess(userProfile, false); // Existing user -> No forced splash
        } else {
             // Fallback if no local profile found but user tries to login
             const newUser: UserProfile = {
                username: 'Trader',
                email: formData.email,
                plan: 'Free',
                avatarInitials: 'T'
             };
             onAuthSuccess(newUser, true); // Treated as new if not found -> Force Splash
        }
      } else {
        // Sign Up Mode
        const newUser: UserProfile = {
            username: formData.username,
            email: formData.email,
            plan: 'Free',
            avatarInitials: formData.username.slice(0, 2).toUpperCase()
        };
        // Explicitly passing true for new registration -> Force Splash
        onAuthSuccess(newUser, true);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0e17] p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-panel border border-panel-border rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 text-center bg-gradient-to-b from-gray-900 to-panel">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform rotate-3">
               <TrendingUp size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Quotex Pro</h1>
            <p className="text-gray-400 text-sm">Professional Trading Dashboard</p>
        </div>

        {/* Form */}
        <div className="p-8 pt-2">
            <div className="flex justify-center mb-8">
               <div className="bg-gray-800 p-1 rounded-lg flex text-sm font-bold">
                  <button 
                     onClick={() => setIsLogin(true)}
                     className={`px-6 py-2 rounded-md transition-all ${isLogin ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                     Sign In
                  </button>
                  <button 
                     onClick={() => setIsLogin(false)}
                     className={`px-6 py-2 rounded-md transition-all ${!isLogin ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                     Sign Up
                  </button>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               {!isLogin && (
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-3.5 text-gray-500" />
                        <input 
                           type="text" 
                           placeholder="Enter your username"
                           className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                           value={formData.username}
                           onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                      </div>
                   </div>
               )}

               <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-gray-500" />
                    <input 
                       type="email" 
                       placeholder="Enter your email"
                       className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-500" />
                    <input 
                       type="password" 
                       placeholder="••••••••"
                       className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                       value={formData.password}
                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
               </div>

               {error && (
                 <p className="text-red-500 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg">{error}</p>
               )}

               <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/50 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
               >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isLogin ? 'Access Dashboard' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
               </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
               <Shield size={14} className="text-green-500" />
               <span>Secure 256-bit Encrypted Connection</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;