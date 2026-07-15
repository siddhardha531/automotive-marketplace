import React, { useState } from 'react';
import { 
  User, Mail, Shield, ShieldCheck, Key, LogIn, Lock, 
  Plus, Check, RefreshCw, Smartphone, Facebook, Chrome
} from 'lucide-react';
import { User as UserType } from '../types';

interface UserProfileProps {
  currentUser: UserType;
  users: UserType[];
  onSwitchUser: (id: string) => void;
  onUpdateBalance: (id: string, amount: number) => void;
  addLog: (msg: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogin?: (id: string) => void;
}

export default function UserProfile({
  currentUser,
  users,
  onSwitchUser,
  onUpdateBalance,
  addLog,
  isLoggedIn = true,
  onLogout,
  onLogin
}: UserProfileProps) {
  // Auth simulation states
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'buyer' | 'seller'>('buyer');
  const [regPassword, setRegPassword] = useState('');

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorPhone, setTwoFactorPhone] = useState('+1 (555) 987-6543');
  
  // Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Wallet deposit state
  const [depositAmount, setDepositAmount] = useState(10000);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    
    // Simulate user creation (just notifying and logging since it is a demo environment)
    addLog(`[IAM Sign-Up] Created new registered AWS Cognito User Account for "${regName}" (${regEmail}) with role ${regRole}.`);
    alert(`Account created successfully! Switched to your new ${regRole} profile.`);
    
    // We can simulate log-in by mimicking switching user
    onSwitchUser('usr_buyer'); // switch to buyer as base
    setIsRegistering(false);
    setRegName('');
    setRegEmail('');
    setRegPassword('');
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoverySent(true);
    addLog(`[IAM Auth] Dispatched AWS SES password recovery token link to ${recoveryEmail}.`);
    setTimeout(() => {
      setRecoverySent(false);
      setRecoveryEmail('');
      alert(`Recovery link dispatched successfully to ${recoveryEmail}! Check your inbox.`);
    }, 2000);
  };

  const toggle2FA = () => {
    if (is2FAEnabled) {
      setIs2FAEnabled(false);
      addLog('[IAM Security] Deactivated Two-Factor Authentication (2FA) for current session.');
    } else {
      setShow2FAModal(true);
    }
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setIs2FAEnabled(true);
    setShow2FAModal(false);
    addLog(`[IAM Security] Configured multi-factor SMS token validation to secondary backup line ${twoFactorPhone}.`);
    alert('Two-factor authentication (2FA) enabled successfully!');
  };

  const handleDeposit = () => {
    onUpdateBalance(currentUser.id, depositAmount);
    addLog(`[Payment Gateway] Verified ACH/Stripe credit transaction. Deposited $${depositAmount.toLocaleString()} to wallet balance.`);
    alert(`Simulated deposit of $${depositAmount.toLocaleString()} completed successfully!`);
  };

  const handleThirdPartyLogin = (provider: 'Google' | 'Facebook') => {
    addLog(`[IAM OAuth] Handshaked public credentials profile with ${provider} secure OAuth API.`);
    alert(`Successfully authenticated via ${provider}! Logged in as ${currentUser.name}.`);
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-sans" id="user-profile-logged-out">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Cognito Header */}
          <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#FF9900]/10 border border-[#FF9900]/30 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#FF9900]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight leading-tight">AWS Cognito User Pools</h3>
                <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider font-semibold">Guarded Route Access Identity Gate</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono font-bold text-[9px] rounded-md tracking-wider">
              IAM CHALLENGE
            </span>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Quick Selector */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-[#FF9900]" />
                  Select Demo Active Profile
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Toggle instant token creation using any preloaded AWS marketplace demo personas:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => onLogin ? onLogin(u.id) : onSwitchUser(u.id)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-[#FF9900] hover:bg-amber-500/5 text-left cursor-pointer transition-all hover:scale-[1.01] bg-slate-50"
                  >
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="h-10 w-10 rounded-full object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate leading-tight">{u.name}</div>
                      <div className="text-[9px] font-mono uppercase text-gray-400 mt-0.5">{u.role}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#FF9900] text-slate-600 font-extrabold text-[10px] rounded-lg tracking-wide uppercase transition-colors">
                      Log In
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Credentials Form / Signup */}
            <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-[#FF9900]" />
                  Cognito Identity Auth
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authenticate using standard credentials or register secure mock federated email accounts below.
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (onLogin) onLogin('usr_buyer');
              }} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Cognito Username / Email</label>
                  <input 
                    type="email" 
                    placeholder="siddusamarla14@gmail.com" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                    defaultValue="siddusamarla14@gmail.com"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                    defaultValue="hunter2password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4 text-[#FF9900]" />
                  Secure Sign-In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans" id="user-profile-root">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile details & wallets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-gray-50 pb-4 mb-4">
              My Profile Details
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="h-20 w-20 rounded-full object-cover border border-gray-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{currentUser.name}</h3>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full font-mono uppercase w-fit mx-auto sm:mx-0">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="h-3 w-3" />
                  {currentUser.email}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">UID: {currentUser.id}</p>
              </div>
            </div>

            {/* Profile Security Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-1">
                    <Shield className="h-4 w-4 text-amber-500" />
                    Two-Factor Auth (2FA)
                  </h4>
                  <p className="text-gray-500 mt-0.5">Protect high-value checkouts</p>
                </div>
                <button 
                  onClick={toggle2FA}
                  className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer transition-colors ${
                    is2FAEnabled 
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' 
                      : 'bg-slate-200 hover:bg-slate-300 text-gray-700'
                  }`}
                >
                  {is2FAEnabled ? 'Active' : 'Enable'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-1">
                    <Smartphone className="h-4 w-4 text-amber-500" />
                    AWS Verified Account
                  </h4>
                  <p className="text-gray-500 mt-0.5">IAM token verification complete</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded text-[9px] font-mono">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Secure Escrow Wallet */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-gray-50 pb-4 mb-4 flex justify-between items-center">
              <span>Secure Escrow Wallet</span>
              <span className="text-xs text-amber-600 font-mono font-medium">Stripe Sandbox Integration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Available Checkout Funds</span>
                <p className="text-3xl font-extrabold font-mono text-white mt-1">{formatPrice(currentUser?.balance ?? 0)}</p>
                <p className="text-[9px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                  <Check className="h-3 w-3" /> Fully Liquid Escrow Ready
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deposit Sim Funds</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(parseInt(e.target.value) || 0)}
                      className="flex-1 border border-gray-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none"
                    />
                    <button 
                      onClick={handleDeposit}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Deposit
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-mono leading-tight">
                  Simulate deposits to fund high-value vehicles in escrow before initiating purchases.
                </p>
              </div>
            </div>
          </div>

          {/* DEMO TOOL: Switch Accounts */}
          <div className="bg-slate-50 border border-amber-200/50 p-6 rounded-xl">
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">Demo Mode Role Switcher</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              To test the escrow system complete flow, you can toggle between a buyer (to buy a car) and sellers (to see their funds arrive or manage listings) or the administrator (to release funds or flag vehicles).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u.id);
                    addLog(`[Demo Switch] Signed into session with profile: "${u.name}" (${u.role.toUpperCase()}).`);
                  }}
                  className={`p-3.5 rounded-lg border-2 text-center transition-all cursor-pointer ${
                    currentUser.id === u.id 
                      ? 'bg-amber-500/10 border-amber-500 font-bold text-amber-950 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-gray-300 text-slate-700'
                  }`}
                >
                  <img 
                    src={u.avatar} 
                    alt={u.name} 
                    className="h-10 w-10 rounded-full mx-auto mb-2 object-cover border border-gray-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate font-semibold">{u.name}</div>
                  <div className="text-[9px] font-mono uppercase text-gray-400 mt-0.5">{u.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auth simulations (Reg / Recover / 2FA) */}
        <div className="space-y-6">
          {/* Third party / email register simulation */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-gray-50 pb-3">
              {isRegistering ? 'Cognito Federated Signup' : 'Cognito Secure Identity Auth'}
            </h3>

            {isRegistering ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-500 uppercase tracking-wider mb-1">Account Purpose</label>
                  <select 
                    value={regRole} 
                    onChange={e => setRegRole(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="buyer">Buy Second-Hand Vehicles</option>
                    <option value="seller">Sell Second-Hand Vehicles</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg cursor-pointer hover:bg-slate-800 text-xs transition-colors"
                >
                  Confirm Cloud Register
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-1">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsRegistering(false)} className="text-amber-500 font-bold hover:underline cursor-pointer">Log In</button>
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500 leading-relaxed">
                  Authenticate your identity using Google, Facebook, or Cognito User Pool credentials.
                </p>

                {/* Third Party buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleThirdPartyLogin('Google')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-[11px] text-gray-700 cursor-pointer transition-colors"
                  >
                    <Chrome className="h-3.5 w-3.5 text-red-500" />
                    Google Auth
                  </button>
                  <button 
                    onClick={() => handleThirdPartyLogin('Facebook')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-[11px] text-gray-700 cursor-pointer transition-colors"
                  >
                    <Facebook className="h-3.5 w-3.5 text-blue-600" />
                    Facebook Auth
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <span className="block text-center text-gray-400 text-[10px] mb-2 font-mono uppercase">Or Cognito native registration</span>
                  <button 
                    onClick={() => setIsRegistering(true)}
                    className="w-full py-2 border border-dashed border-gray-300 hover:border-gray-400 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    Draft Email Credentials Registration
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password recovery simulation */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-amber-500" />
              Cognito Password Recovery
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Input your email below to send a secured password recovery link via Amazon SES.
            </p>

            <form onSubmit={handleRecovery} className="space-y-2">
              <input 
                type="email" 
                placeholder="Enter registered email address..."
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg p-2.5"
              />
              <button 
                type="submit"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-lg cursor-pointer transition-colors"
              >
                Send Recovery Instructions
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-xs font-sans">
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Smartphone className="h-6 w-6 text-amber-500" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Two-Factor Auth Setup</h3>
                <p className="text-gray-400 text-[10px]">Configure secure SMS verification code models</p>
              </div>
            </div>

            <form onSubmit={handleConfirm2FA} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">SMS Phone Number Line</label>
                <input 
                  type="text" 
                  value={twoFactorPhone}
                  onChange={e => setTwoFactorPhone(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg p-2.5 font-mono text-slate-900"
                />
              </div>
              
              <div className="p-3 bg-amber-50 text-amber-800 rounded-lg leading-relaxed">
                Every purchase transaction or balance withdrawal will request a temporary secure pin dispatched to this phone line.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Activate SMS MFA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
