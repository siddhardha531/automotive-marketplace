import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Vehicle, User, Review, Transaction, AppNotification, AWSMetrics 
} from './types';
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_REVIEWS } from './data';

import Navbar from './components/Navbar';
import BuyerPortal from './components/BuyerPortal';
import SellerPortal from './components/SellerPortal';
import AWSArchitectureConsole from './components/AWSArchitectureConsole';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import { Cloud, ShieldCheck, Mail, Heart, ExternalLink } from 'lucide-react';

const LOCAL_STORAGE_PREFIX = 'aws_vehicle_marketplace_';

const GUEST_USER: User = {
  id: 'usr_guest',
  name: 'Guest Explorer',
  email: 'guest@awsvehicles.com',
  role: 'buyer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  balance: 0
};

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'browse' | 'sell' | 'aws' | 'admin' | 'profile'>('browse');

  // Application Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('usr_buyer');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`);
    return saved ? saved === 'true' : true;
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  // AWS Simulation States
  const [awsMetrics, setAwsMetrics] = useState<AWSMetrics>({
    cpuUtilization: 14,
    activeEc2Instances: 1,
    rdsConnections: 6,
    s3StorageBytes: 25165824, // 24 MB initial
    backupStatus: 'Completed',
    lastBackupTime: 'Yesterday at 04:00 AM',
    scaleOutEnabled: true,
    ddosPrevention: 'Active'
  });

  const [awsLogs, setAwsLogs] = useState<string[]>([
    '[IAM Security] Session credentials handshake with AWS Cognito complete.',
    '[System Security] AWS Shield Standard active on public Route 53 zone.',
    '[Database Tier] Multi-AZ synchronization active for AWS RDS instance.',
    '[AWS S3 Storage] Media staging bucket loaded (25.17 MB).',
    '[AWS Backup] Target snapshot vault running daily check.'
  ]);

  // Method to append logs in CloudWatch
  const addAwsLog = useCallback((msg: string) => {
    setAwsLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg}`]);
  }, []);

  // 1. Initial State Loading & Synchronization
  useEffect(() => {
    // Load Vehicles
    const savedVehicles = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}vehicles`);
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    } else {
      setVehicles(INITIAL_VEHICLES);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}vehicles`, JSON.stringify(INITIAL_VEHICLES));
    }

    // Load Users
    const savedUsers = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(INITIAL_USERS));
    }

    // Load Reviews
    const savedReviews = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}reviews`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reviews`, JSON.stringify(INITIAL_REVIEWS));
    }

    // Load Transactions
    const savedTransactions = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}transactions`);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    // Load Notifications
    const savedNotifications = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifications`);
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      const initialAlerts: AppNotification[] = [
        {
          id: 'notif_welcome',
          userId: 'usr_buyer',
          title: 'Welcome to AWS Market',
          message: 'Secure your second-hand car buying and selling sessions using AWS Multi-AZ Escrow mechanics.',
          type: 'system',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
      setNotifications(initialAlerts);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify(initialAlerts));
    }
  }, []);

  // Sync back to localstorage on change
  useEffect(() => {
    if (vehicles.length > 0) localStorage.setItem(`${LOCAL_STORAGE_PREFIX}vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    if (users.length > 0) localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (reviews.length > 0) localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reviews`, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Find current logged in user details
  const currentUser = useMemo(() => {
    if (!isLoggedIn) return GUEST_USER;
    return users.find(u => u.id === currentUserId) || INITIAL_USERS[0];
  }, [users, currentUserId, isLoggedIn]);

  // Dynamic user switching & Cognito Authentication
  const handleSwitchUser = (id: string) => {
    setCurrentUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`, 'true');
    addAwsLog(`[IAM Auth] Switched active session and verified credentials for ID: ${id}`);
  };

  const handleLogin = (id: string) => {
    setCurrentUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`, 'true');
    setShowLoginModal(false);
    addAwsLog(`[IAM Auth] Successful handshake with AWS Cognito User Pool. Auth token generated for UID ${id}.`);
    
    const matchedUser = users.find(u => u.id === id) || INITIAL_USERS.find(u => u.id === id) || GUEST_USER;
    triggerNotification(
      id,
      'AWS Cognito: Sign In Successful',
      `Welcome back, ${matchedUser.name}! Secure escrow mechanics are fully online for your session.`,
      'system'
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`, 'false');
    setCurrentTab('browse');
    addAwsLog('[IAM Auth] Terminated AWS Cognito User Pool token. Dynamic session variables flushed.');
  };

  // Deposit/Simulate money modifications
  const handleUpdateBalance = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, balance: u.balance + amount };
      }
      return u;
    }));
  };

  // Add notification
  const triggerNotification = useCallback((userId: string, title: string, message: string, type: any) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // 2. Escrow Payment & Verification Transactions
  const handleInitiateEscrow = (vehicleId: string, amount: number, sellerId: string, sellerName: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      addAwsLog(`[IAM Security] Blocked unauthenticated attempt to lock funds in Escrow for vehicle ID ${vehicleId}.`);
      return;
    }

    // Lock buyer's money
    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        return { ...u, balance: u.balance - amount };
      }
      return u;
    }));

    // Update vehicle status
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, status: 'pending' };
      }
      return v;
    }));

    // Create a new Transaction object
    const targetVehicle = vehicles.find(v => v.id === vehicleId)!;
    const newTxId = `tx_${Date.now().toString().slice(-6)}`;
    const newTx: Transaction = {
      id: newTxId,
      vehicleId,
      vehicleDetails: {
        make: targetVehicle.make,
        model: targetVehicle.model,
        year: targetVehicle.year
      },
      buyerId: currentUserId,
      buyerName: currentUser.name,
      sellerId,
      sellerName,
      amount,
      status: 'escrow_pending',
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Send notifications to buyer and seller
    triggerNotification(
      currentUserId,
      'Escrow Funds Locked Securely',
      `You successfully deposited $${amount.toLocaleString()} to secure the purchase of ${targetVehicle.year} ${targetVehicle.make} ${targetVehicle.model}. Funds will stay locked in Escrow until you receive and verify the vehicle.`,
      'payment'
    );

    triggerNotification(
      sellerId,
      'New Escrow Secure Offer received!',
      `A buyer (${currentUser.name}) locked $${amount.toLocaleString()} in AWS escrow for your ${targetVehicle.make} ${targetVehicle.model}. Verify vehicle shipping credentials now.`,
      'offer'
    );

    // Update AWS Storage and log
    setAwsMetrics(prev => ({
      ...prev,
      s3StorageBytes: prev.s3StorageBytes + 150000 // simulate file writing
    }));

    addAwsLog(`[Escrow Engine] Locked secure transaction ${newTxId}. Amount: $${amount.toLocaleString()}. Locked buyer wallet ID: ${currentUserId}.`);
  };

  // Release Escrow to Seller
  const handleReleaseEscrow = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    // Release money to seller
    setUsers(prev => prev.map(u => {
      if (u.id === tx.sellerId) {
        return { ...u, balance: u.balance + tx.amount };
      }
      return u;
    }));

    // Mark transaction as complete
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'released' };
      }
      return t;
    }));

    // Mark vehicle as sold
    setVehicles(prev => prev.map(v => {
      if (v.id === tx.vehicleId) {
        return { ...v, status: 'sold' };
      }
      return v;
    }));

    // Send notifications
    triggerNotification(
      tx.buyerId,
      'Escrow Funds Disbursed',
      `The secure escrow transaction for ${tx.vehicleDetails.year} ${tx.vehicleDetails.make} ${tx.vehicleDetails.model} was successfully finalized and $${tx.amount.toLocaleString()} was transferred to seller.`,
      'payment'
    );

    triggerNotification(
      tx.sellerId,
      'Escrow Funds Released to Wallet',
      `Success! Escrow released $${tx.amount.toLocaleString()} to your liquid wallet balance for your ${tx.vehicleDetails.make} sales transaction.`,
      'payment'
    );

    addAwsLog(`[Escrow Engine] Released ledger tx ${txId}. Disbursed $${tx.amount.toLocaleString()} directly to seller ID ${tx.sellerId}.`);
  };

  // Refund Escrow to Buyer
  const handleRefundEscrow = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    // Refund money to buyer
    setUsers(prev => prev.map(u => {
      if (u.id === tx.buyerId) {
        return { ...u, balance: u.balance + tx.amount };
      }
      return u;
    }));

    // Update transaction status
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'refunded' };
      }
      return t;
    }));

    // Release vehicle lock
    setVehicles(prev => prev.map(v => {
      if (v.id === tx.vehicleId) {
        return { ...v, status: 'available' };
      }
      return v;
    }));

    // Send notifications
    triggerNotification(
      tx.buyerId,
      'Escrow Funds Refunded',
      `Your escrow payment of $${tx.amount.toLocaleString()} for the ${tx.vehicleDetails.make} has been fully refunded back into your liquid balance.`,
      'payment'
    );

    triggerNotification(
      tx.sellerId,
      'Transaction Refunded',
      `The escrow payment of $${tx.amount.toLocaleString()} has been returned to the buyer. Your listing is available for sale again.`,
      'payment'
    );

    addAwsLog(`[Escrow Engine] Refunded ledger tx ${txId}. Restored $${tx.amount.toLocaleString()} back to buyer ID ${tx.buyerId}.`);
  };

  // 3. User Reviews
  const handleAddReview = (targetUserId: string, rating: number, comment: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      addAwsLog(`[IAM Security] Blocked unauthenticated attempt to submit a seller review.`);
      return;
    }

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      reviewerName: currentUser.name,
      reviewerId: currentUserId,
      targetUserId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);

    // Notify seller
    triggerNotification(
      targetUserId,
      'New Seller Review Added!',
      `You received a new ${rating}-star review from buyer ${currentUser.name}: "${comment.slice(0, 40)}..."`,
      'review'
    );
  };

  // 4. Vehicle listings (Create, Update, Delete)
  const handleAddVehicle = (newVeh: Omit<Vehicle, 'id' | 'createdAt' | 'status'>) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      addAwsLog(`[IAM Security] Blocked unauthenticated attempt to create a vehicle listing.`);
      return;
    }

    const fresh: Vehicle = {
      ...newVeh,
      id: `veh_${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
      status: 'available'
    };

    setVehicles(prev => [fresh, ...prev]);
    
    // Broadcast notifications to all buyers
    users.forEach(u => {
      if (u.role === 'buyer') {
        triggerNotification(
          u.id,
          'New Listing Published',
          `Check out the newly listed ${fresh.year} ${fresh.make} ${fresh.model} located in ${fresh.location} for $${fresh.price.toLocaleString()}!`,
          'listing'
        );
      }
    });
  };

  const handleUpdateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, ...updated };
      }
      return v;
    }));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    addAwsLog(`[Inventory Policy] Removed vehicle listing ID ${id}. S3 asset storage freed.`);
  };

  // Moderation removals
  const handleFlagVehicle = (id: string, reason: string) => {
    addAwsLog(`[Moderation Policy] Flagged vehicle listing ID ${id} as violating terms. Reason: ${reason}.`);
    alert(`Vehicle ID ${id} flagged. Admin reviews are pending.`);
  };

  // Admin Broadcast
  const handleBroadcastAlert = (title: string, message: string) => {
    users.forEach(u => {
      triggerNotification(u.id, `📢 Broadcast: ${title}`, message, 'system');
    });
  };

  // Notification management
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) return { ...n, read: true };
      return n;
    }));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleSetTab = (tab: 'browse' | 'sell' | 'aws' | 'admin' | 'profile') => {
    if (!isLoggedIn && tab !== 'browse' && tab !== 'profile') {
      setShowLoginModal(true);
      addAwsLog(`[IAM Security] Blocked unauthenticated attempt to access route: /${tab}`);
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Banner alert */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold text-center border-b border-amber-600 flex justify-center items-center gap-1.5 font-mono">
        <ShieldCheck className="h-4 w-4" />
        <span>SECURED AWS DEPLOYMENT: Sandbox escrow payments are live. Sign in via AWS Cognito to explore permissions.</span>
      </div>

      {/* Main Navbar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        currentUser={currentUser}
        notifications={notifications.filter(n => n.userId === currentUserId)}
        onMarkRead={handleMarkRead}
        onClearAll={handleClearAll}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentTab === 'browse' && (
          <BuyerPortal 
            vehicles={vehicles}
            reviews={reviews}
            currentUser={currentUser}
            onInitiateEscrow={handleInitiateEscrow}
            onAddReview={handleAddReview}
            addLog={addAwsLog}
          />
        )}

        {currentTab === 'sell' && (
          <SellerPortal 
            vehicles={vehicles}
            currentUserId={currentUserId}
            currentUserName={currentUser.name}
            currentUserEmail={currentUser.email}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            addLog={addAwsLog}
          />
        )}

        {currentTab === 'aws' && (
          <AWSArchitectureConsole 
            metrics={awsMetrics}
            setMetrics={setAwsMetrics}
            logs={awsLogs}
            addLog={addAwsLog}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel 
            vehicles={vehicles}
            users={users}
            transactions={transactions}
            onRemoveVehicle={handleDeleteVehicle}
            onFlagVehicle={handleFlagVehicle}
            onReleaseEscrow={handleReleaseEscrow}
            onRefundEscrow={handleRefundEscrow}
            onBroadcastAlert={handleBroadcastAlert}
            addLog={addAwsLog}
          />
        )}

        {currentTab === 'profile' && (
          <UserProfile 
            currentUser={currentUser}
            users={users}
            onSwitchUser={handleSwitchUser}
            onUpdateBalance={handleUpdateBalance}
            addLog={addAwsLog}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            onLogin={handleLogin}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="h-5 w-5 text-[#FF9900]" />
              <span className="font-extrabold text-white text-sm">AWS AutoMarket</span>
            </div>
            <p className="leading-relaxed">
              Highly secure cloud native second-hand vehicle e-commerce, built directly for Amazon Web Services (AWS) deployments. Powered by serverless microservices and multi-AZ data replication.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Compliance & Legals</h3>
            <ul className="space-y-2 font-mono text-[10px]">
              <li>● GDPR Compliant Customer Repositories</li>
              <li>● Multi-Sig AWS Key Escrow Protection</li>
              <li>● AWS CloudTrail Security Logs Active</li>
              <li>● Zero-Trust Identity Session Credentials</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3 font-mono">Infrastructure Stack</h3>
            <p className="mb-3">
              Deployments replicated securely across EC2 auto-scaling nodes, S3 distributed media caches, and RDS high-availability database engines.
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 font-mono text-[9px]">EC2 / ECS</span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 font-mono text-[9px]">S3 Bucket</span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 font-mono text-[9px]">RDS PostgreSQL</span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 font-mono text-[9px]">KMS Encryption</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} AWS Second-Hand Vehicles Marketplace. All rights reserved.
          </div>
          <div className="flex gap-4 font-mono text-[10px] items-center">
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> System Health: Optimal
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-gray-500">GDPR & AWS Best Practice Certified</span>
          </div>
        </div>
      </footer>

      {/* AWS Cognito Secure Sign-In Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-[#FF9900]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white block">AWS Cognito User Pools</h3>
                  <span className="text-[10px] text-gray-400 font-mono block -mt-1 uppercase tracking-wider font-semibold">Federated Secure Sign-In</span>
                </div>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Cancel Sign-In"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              <div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Welcome to AWS AutoMarket. You are currently in Guest Explorer mode. To initiate escrow deposits, publish vehicle listings, or access developer consoles, please authenticate your session.
                </p>
              </div>

              {/* Instant Persona Selection */}
              <div className="space-y-3">
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                  ⚡ 1-Click Persona Sign-In (Recommended)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleLogin(u.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#FF9900] hover:bg-amber-500/5 text-left cursor-pointer transition-all hover:scale-[1.01]"
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
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-mono uppercase">Or Enter Manual Credentials</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleLogin('usr_buyer');
              }} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cognito Username / Email</label>
                  <input 
                    type="email" 
                    placeholder="siddusamarla14@gmail.com" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-sans"
                    defaultValue="siddusamarla14@gmail.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-bold text-slate-600 uppercase tracking-wider">Password</label>
                    <a href="#forgot" onClick={(e) => {
                      e.preventDefault();
                      alert('Cognito recovery dispatched! Check your mail inbox.');
                    }} className="text-[10px] font-bold text-[#FF9900] hover:underline">Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••••••" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-sans"
                    defaultValue="hunter2password"
                    required
                  />
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
            </div>

            {/* Footer info */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between items-center">
              <span>REGION: us-east-1</span>
              <span>cognito-idp.us-east-1.amazonaws.com</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
