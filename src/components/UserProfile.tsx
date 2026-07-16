import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, ShieldCheck, Key, LogIn, Lock, 
  Plus, Check, RefreshCw, Smartphone, Facebook, Chrome,
  ShieldAlert, Eye, EyeOff, AlertCircle, X, Edit3, Save
 } from 'lucide-react';
import { User as UserType } from '../types';
import { DEFAULT_AVATAR } from '../data';

interface UserProfileProps {
  currentUser: UserType;
  users: UserType[];
  onSwitchUser: (id: string) => void;
  onUpdateBalance: (id: string, amount: number) => void;
  addLog: (msg: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogin?: (id: string) => void;
  onRegister?: (newUser: UserType) => void;
  onUpdateUser?: (updatedUser: UserType) => void;
}

export default function UserProfile({
  currentUser,
  users,
  onSwitchUser,
  onUpdateBalance,
  addLog,
  isLoggedIn = true,
  onLogout,
  onLogin,
  onRegister,
  onUpdateUser
}: UserProfileProps) {
  // Redesigned profile page auth fields (completely empty by default)
  const [profileAuthMode, setProfileAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpRole, setSignUpRole] = useState<'buyer' | 'seller'>('buyer');
  const [signUpBalance, setSignUpBalance] = useState<number>(100000);
  const [showPassword, setShowPassword] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editError, setEditError] = useState('');

  // Sync profile editing inputs when current user changes
  useEffect(() => {
    setEditName(currentUser.name);
    setEditEmail(currentUser.email);
    setEditAvatar(currentUser.avatar);
    setEditError('');
  }, [currentUser]);

  // Switch account verification states
  const [switchEmailInput, setSwitchEmailInput] = useState('');
  const [switchPasswordInput, setSwitchPasswordInput] = useState('');
  const [switchError, setSwitchError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      setEditError('Name and Email fields are required.');
      return;
    }
    const emailExists = users.some(u => u.id !== currentUser.id && u.email.toLowerCase() === editEmail.trim().toLowerCase());
    if (emailExists) {
      setEditError('This email is already registered by another account.');
      return;
    }

    const updated = {
      ...currentUser,
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      avatar: editAvatar.trim() || DEFAULT_AVATAR,
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setIsEditingProfile(false);
    setEditError('');
    addLog(`[IAM User Pool] Successfully saved updated profile details for "${updated.name}".`);
    alert('Cognito user profile has been successfully updated.');
  };

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorPhone, setTwoFactorPhone] = useState('+1 (555) 987-6543');
  
  // Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Wallet deposit state
  const [depositAmount, setDepositAmount] = useState(10000);

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
      <div className="max-w-4xl mx-auto px-4 py-12 font-sans animate-fade-in" id="user-profile-logged-out">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xl overflow-hidden">
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

          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left side: Secure Cloud Stack info */}
            <div className="md:col-span-2 p-8 bg-slate-50/50 space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#FF9900]" />
                  Secure IAM Stack
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your identity is secured by multi-region Cognito replicas, strict Web Application Firewall (WAF) policies, and hardware-backed KMS cryptographic key wraps.
                </p>
              </div>

              <div className="space-y-3 font-mono text-[10px]">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>COGNITO REGION</span>
                    <span className="text-[#FF9900]">us-east-1</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-sans">Multi-AZ replicated secure user directories.</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>ESCROW PROTECTION</span>
                    <span className="text-emerald-600">Strict</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-sans">Sandbox transaction wallet is dynamically bound to verified JWT claims.</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl text-[11px] text-slate-600 space-y-1.5">
                <span className="font-bold text-slate-800 block">🔒 High-Availability Cluster</span>
                <p className="text-slate-500 leading-relaxed">
                  To explore seller portals, inventory lists, or buyer features, configure your secure sandbox account.
                </p>
              </div>
            </div>

            {/* Right side: Redesigned Credentials form */}
            <div className="md:col-span-3 flex flex-col bg-white overflow-hidden">
              {/* Mode Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50/20">
                <button
                  type="button"
                  onClick={() => {
                    setProfileAuthMode('signin');
                    setProfileError('');
                  }}
                  className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    profileAuthMode === 'signin' 
                      ? 'border-[#FF9900] text-slate-900 bg-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileAuthMode('signup');
                    setProfileError('');
                  }}
                  className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    profileAuthMode === 'signup' 
                      ? 'border-[#FF9900] text-slate-900 bg-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="p-8 space-y-6">
                {profileError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 leading-normal animate-scale-up">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{profileError}</span>
                      {profileError.includes('not registered') && (
                        <button 
                          type="button"
                          onClick={() => {
                            setProfileAuthMode('signup');
                            setProfileError('');
                          }}
                          className="block font-bold text-[#FF9900] hover:underline mt-1 cursor-pointer"
                        >
                          Create a new account now &rarr;
                        </button>
                      )}
                      {profileError.includes('already registered') && (
                        <button 
                          type="button"
                          onClick={() => {
                            setProfileAuthMode('signin');
                            setProfileError('');
                          }}
                          className="block font-bold text-[#FF9900] hover:underline mt-1 cursor-pointer"
                        >
                          Sign in with your email now &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {profileAuthMode === 'signin' ? (
                  /* Sign In View */
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!signInEmail.trim() || !signInPassword) {
                      setProfileError('Please enter both your email and password.');
                      return;
                    }
                    const foundUser = users.find(u => u.email.toLowerCase() === signInEmail.trim().toLowerCase());
                    if (!foundUser) {
                      setProfileError('This email is not registered. Please switch to the Create Account tab.');
                      return;
                    }
                    const userPassword = foundUser.password || 'hunter2password';
                    if (userPassword !== signInPassword) {
                      setProfileError('Invalid credentials. Please verify your password and try again.');
                      return;
                    }
                    setProfileError('');
                    if (onLogin) onLogin(foundUser.id);
                  }} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cognito Email / Username</label>
                      <input 
                        type="email" 
                        required
                        placeholder="username@example.com" 
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-slate-50"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block font-bold text-slate-600 uppercase tracking-wider">Password</label>
                        <a href="#forgot" onClick={(e) => {
                          e.preventDefault();
                          alert('SES recovery link sent! Check your email inbox.');
                        }} className="text-[10px] font-bold text-[#FF9900] hover:underline">Forgot?</a>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          placeholder="••••••••••••" 
                          value={signInPassword}
                          onChange={e => setSignInPassword(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 pr-10 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="h-4 w-4 text-[#FF9900]" />
                        Secure Sign-In
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Sign Up / Registration View */
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword || !signUpPhone.trim()) {
                      setProfileError('Please complete all fields.');
                      return;
                    }
                    const exists = users.some(u => u.email.toLowerCase() === signUpEmail.trim().toLowerCase());
                    if (exists) {
                      setProfileError('This email is already registered. Please use the Sign In tab.');
                      return;
                    }

                    const newUserId = 'usr_' + Date.now();
                    const newUser: UserType = {
                      id: newUserId,
                      name: signUpName.trim(),
                      email: signUpEmail.trim().toLowerCase(),
                      role: signUpRole,
                      avatar: DEFAULT_AVATAR,
                      balance: signUpBalance,
                      password: signUpPassword
                    };

                    if (onRegister) onRegister(newUser);
                    setProfileError('');
                    addLog(`[IAM Sign-Up] Registered new Cognito identity account for "${signUpName}" (${signUpEmail}).`);
                    
                    // Directly trigger MFA verification
                    if (onLogin) onLogin(newUserId);
                  }} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Your full name" 
                          value={signUpName}
                          onChange={e => setSignUpName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cognito Email</label>
                        <input 
                          type="email" 
                          required
                          placeholder="your@email.com" 
                          value={signUpEmail}
                          onChange={e => setSignUpEmail(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">MFA Mobile Phone</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="+1 (555) 012-3456" 
                          value={signUpPhone}
                          onChange={e => setSignUpPhone(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-slate-50 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            placeholder="••••••••••••" 
                            value={signUpPassword}
                            onChange={e => setSignUpPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2.5 pr-10 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-slate-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Account Role</label>
                        <select 
                          value={signUpRole}
                          onChange={e => setSignUpRole(e.target.value as 'buyer' | 'seller')}
                          className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                        >
                          <option value="buyer">Buyer (Secure Escrow Wallet)</option>
                          <option value="seller">Seller (Inventory Manager)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Wallet Balance (USD)</label>
                        <input 
                          type="number" 
                          required
                          min={0}
                          value={signUpBalance}
                          onChange={e => setSignUpBalance(Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-slate-50 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#FF9900] hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4 text-slate-950" />
                        Register & Verify Cognito MFA
                      </button>
                    </div>
                  </form>
                )}
              </div>
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
            <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                My Profile Details
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-950 font-bold text-xs rounded-lg hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {editError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                    <span>{editError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Avatar Image URL</label>
                  <input 
                    type="url" 
                    value={editAvatar}
                    onChange={e => setEditAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditName(currentUser.name);
                      setEditEmail(currentUser.email);
                      setEditAvatar(currentUser.avatar);
                    }}
                    className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white font-extrabold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                  >
                    <Save className="h-4 w-4 text-[#FF9900]" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
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
            )}

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

          {/* SECURE: Switch Accounts */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-[#FF9900]" />
              Switch to Another Account
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              To toggle accounts and test the escrow flow, please verify the Cognito credentials of the target profile. No other account names or user profiles are listed here to ensure strict identity privacy.
            </p>

            {switchError && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-lg flex items-center gap-2 text-xs text-rose-800 font-medium mb-4">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span>{switchError}</span>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!switchEmailInput.trim() || !switchPasswordInput) {
                setSwitchError('Please enter both email and password.');
                return;
              }
              const foundTarget = users.find(u => u.email.toLowerCase() === switchEmailInput.trim().toLowerCase());
              if (!foundTarget) {
                setSwitchError('No user account found with this email.');
                return;
              }
              const expectedPassword = (foundTarget as any).password || 'hunter2password';
              if (switchPasswordInput !== expectedPassword) {
                setSwitchError('Invalid credentials. Password verification failed.');
                return;
              }

              // Successful verification!
              onSwitchUser(foundTarget.id);
              addLog(`[IAM Auth] Switched session after verifying Cognito credentials for: "${foundTarget.name}".`);
              setSwitchEmailInput('');
              setSwitchPasswordInput('');
              setSwitchError('');
              alert(`Successfully authenticated and switched active session to ${foundTarget.name}!`);
            }} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Target Account Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. robert.j@awsvehicles.com"
                    value={switchEmailInput}
                    onChange={e => {
                      setSwitchEmailInput(e.target.value);
                      setSwitchError('');
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-white font-sans text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Cognito Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••••••"
                    value={switchPasswordInput}
                    onChange={e => {
                      setSwitchPasswordInput(e.target.value);
                      setSwitchError('');
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none bg-white font-sans text-xs"
                  />
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4 text-[#FF9900]" />
                  Authenticate & Switch Account
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Auth simulations & Cognito Session Info */}
        <div className="space-y-6">
          {/* Active Session JWT Metadata */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-[#FF9900]" />
              Active IAM Credentials
            </h3>
            
            <p className="text-gray-500 leading-relaxed">
              Dynamically assigned AWS security credentials for this session:
            </p>

            <div className="space-y-2.5 font-mono text-[9px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="font-extrabold text-slate-800 uppercase block">Cognito ID Token</span>
                <span className="text-slate-400 block break-all leading-tight mt-0.5">eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eysubWFpbCI6ImN1cnJlbnRVc2VyIn0...</span>
              </div>
              <div className="border-t border-slate-200/50 pt-2">
                <span className="font-extrabold text-slate-800 uppercase block">OAuth Token Scope</span>
                <span className="text-[#FF9900] block mt-0.5">openid email aws.cognito.signin.user.admin</span>
              </div>
              <div className="border-t border-slate-200/50 pt-2">
                <span className="font-extrabold text-slate-800 uppercase block">Session TTL Remaining</span>
                <span className="text-emerald-600 block mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  59 minutes (Auto-Renews)
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button 
                onClick={onLogout}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 rounded-lg cursor-pointer text-[11px] uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                Sign Out Session
              </button>
            </div>
          </div>

          {/* Password recovery simulation */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-[#FF9900]" />
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
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#FF9900]"
              />
              <button 
                type="submit"
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold py-2 rounded-lg cursor-pointer transition-colors"
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
