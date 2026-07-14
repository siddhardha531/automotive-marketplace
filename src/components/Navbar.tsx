import { Cloud, Search, Tag, ShieldCheck, User, Bell, Key, LogIn, LogOut } from 'lucide-react';
import { User as UserType, AppNotification } from '../types';
import NotificationCenter from './NotificationCenter';

interface NavbarProps {
  currentTab: 'browse' | 'sell' | 'aws' | 'admin' | 'profile';
  setCurrentTab: (tab: 'browse' | 'sell' | 'aws' | 'admin' | 'profile') => void;
  currentUser: UserType;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentUser,
  notifications,
  onMarkRead,
  onClearAll,
  isLoggedIn,
  onLogout,
  onLoginClick
}: NavbarProps) {
  
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md font-sans" id="navbar-root">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setCurrentTab('browse')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="h-10 w-10 bg-[#FF9900]/10 rounded-xl flex items-center justify-center border border-[#FF9900]/30 shadow-inner">
              <Cloud className="h-6 w-6 text-[#FF9900]" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">AWS Vehicle</span>
              <span className="text-[10px] text-gray-400 font-mono block -mt-1 uppercase tracking-wider font-semibold">E-Commerce Marketplace</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-1 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setCurrentTab('browse')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'browse' ? 'bg-[#FF9900] text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Browse Listings
            </button>
            
            <button
              onClick={() => setCurrentTab('sell')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'sell' ? 'bg-[#FF9900] text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              Sell Vehicles
            </button>

            <button
              onClick={() => setCurrentTab('aws')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'aws' ? 'bg-[#FF9900] text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Cloud className="h-3.5 w-3.5" />
              AWS Cloud Console
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'admin' ? 'bg-[#FF9900] text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Operations
            </button>
          </div>

          {/* Right Area: Wallet summary, notifications, Profile Switching link */}
          <div className="flex items-center gap-4">
            
            {/* Wallet quick summary */}
            {isLoggedIn && (
              <div className="hidden sm:flex flex-col items-end font-mono text-xs">
                <span className="text-[9px] text-gray-400">LIQUID BALANCE</span>
                <span className="font-bold text-emerald-400">{formatPrice(currentUser.balance)}</span>
              </div>
            )}

            {/* Notification Center Dropdown */}
            <NotificationCenter 
              notifications={notifications}
              onMarkRead={onMarkRead}
              onClearAll={onClearAll}
            />

            {/* Profile Avatar Trigger */}
            <div 
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer hover:opacity-80 transition-opacity p-1.5 rounded-lg ${
                currentTab === 'profile' ? 'bg-slate-800' : ''
              }`}
              title={isLoggedIn ? "Manage profile & wallets" : "Sign in to AWS AutoMarket"}
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="h-8 w-8 rounded-full object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-white max-w-[100px] truncate leading-tight">{currentUser.name}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider -mt-0.5 font-semibold font-mono">
                  {isLoggedIn ? currentUser.role : 'GUEST'}
                </p>
              </div>
            </div>

            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans text-gray-300"
                title="Sign out of current AWS session"
              >
                <LogOut className="h-3.5 w-3.5 text-gray-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLoginClick();
                }}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 border border-amber-600 px-3 py-1.5 rounded-lg text-xs font-extrabold text-slate-950 transition-all cursor-pointer font-sans uppercase tracking-wider shadow-sm"
                title="Log In to AWS secure marketplace"
              >
                <LogIn className="h-3.5 w-3.5 text-slate-950" />
                <span>Log In</span>
              </button>
            )}

          </div>

        </div>
      </div>
      
      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex bg-slate-950 border-t border-slate-900 justify-around py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <button 
          onClick={() => setCurrentTab('browse')}
          className={`cursor-pointer ${currentTab === 'browse' ? 'text-[#FF9900]' : 'hover:text-white'}`}
        >
          Browse
        </button>
        <button 
          onClick={() => setCurrentTab('sell')}
          className={`cursor-pointer ${currentTab === 'sell' ? 'text-[#FF9900]' : 'hover:text-white'}`}
        >
          Sell
        </button>
        <button 
          onClick={() => setCurrentTab('aws')}
          className={`cursor-pointer ${currentTab === 'aws' ? 'text-[#FF9900]' : 'hover:text-white'}`}
        >
          AWS
        </button>
        <button 
          onClick={() => setCurrentTab('admin')}
          className={`cursor-pointer ${currentTab === 'admin' ? 'text-[#FF9900]' : 'hover:text-white'}`}
        >
          Admin
        </button>
      </div>
    </nav>
  );
}
