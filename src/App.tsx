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
import { 
  Cloud, ShieldCheck, Mail, Heart, ExternalLink, Eye, EyeOff, 
  Lock, Server, ShieldAlert, KeyRound, Fingerprint, ArrowLeft, AlertCircle, X,
  Plus, User as UserIcon, Wallet, CreditCard
} from 'lucide-react';

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
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS.map(u => ({ ...u, password: 'hunter2password' }));
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}current_user_id`) || '';
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`);
    return saved ? saved === 'true' : false; // Default to false (Guest mode initially)
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginMfaStep, setLoginMfaStep] = useState<boolean>(false);
  const [loginPendingUserId, setLoginPendingUserId] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [mfaInputCode, setMfaInputCode] = useState<string>('552901');

  // Redesigned Auth Form state variables
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpPhone, setSignUpPhone] = useState<string>('');
  const [signUpRole, setSignUpRole] = useState<'buyer' | 'seller'>('buyer');
  const [signUpBalance, setSignUpBalance] = useState<number>(100000);
  const [authError, setAuthError] = useState<string>('');
  
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
      try {
        const parsed = JSON.parse(savedVehicles);
        if (Array.isArray(parsed)) {
          // Update details of existing initial vehicles if they have been updated in INITIAL_VEHICLES
          const initialVehiclesMap = new Map(INITIAL_VEHICLES.map(v => [v.id, v]));
          let updated = false;
          const syncedList = parsed.map((v: Vehicle) => {
            const initial = initialVehiclesMap.get(v.id);
            if (initial) {
              const imagesChanged = JSON.stringify(v.images) !== JSON.stringify(initial.images);
              const priceChanged = v.price !== initial.price;
              const modelChanged = v.model !== initial.model;
              const makeChanged = v.make !== initial.make;
              if (imagesChanged || priceChanged || modelChanged || makeChanged) {
                updated = true;
                return {
                  ...v,
                  images: initial.images,
                  price: initial.price,
                  model: initial.model,
                  make: initial.make,
                  description: initial.description
                };
              }
            }
            return v;
          });

          // Sync any new initial vehicles that are not in local storage yet
          const savedIds = new Set(syncedList.map((v: Vehicle) => v.id));
          const newVehicles = INITIAL_VEHICLES.filter(v => !savedIds.has(v.id));
          if (newVehicles.length > 0 || updated) {
            const merged = [...syncedList, ...newVehicles];
            setVehicles(merged);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}vehicles`, JSON.stringify(merged));
          } else {
            setVehicles(syncedList);
          }
        } else {
          setVehicles(INITIAL_VEHICLES);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}vehicles`, JSON.stringify(INITIAL_VEHICLES));
        }
      } catch (e) {
        setVehicles(INITIAL_VEHICLES);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}vehicles`, JSON.stringify(INITIAL_VEHICLES));
      }
    } else {
      setVehicles(INITIAL_VEHICLES);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}vehicles`, JSON.stringify(INITIAL_VEHICLES));
    }

    // Load Users
    const savedUsers = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) {
          setUsers(parsed);
        } else {
          const seeded = INITIAL_USERS.map(u => ({ ...u, password: 'hunter2password' }));
          setUsers(seeded);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(seeded));
        }
      } catch (e) {
        const seeded = INITIAL_USERS.map(u => ({ ...u, password: 'hunter2password' }));
        setUsers(seeded);
      }
    } else {
      const seeded = INITIAL_USERS.map(u => ({ ...u, password: 'hunter2password' }));
      setUsers(seeded);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(seeded));
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
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(users));
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
    return users.find(u => u.id === currentUserId) || GUEST_USER;
  }, [users, currentUserId, isLoggedIn]);

  // Dynamic user switching & Cognito Authentication
  const handleSwitchUser = (id: string) => {
    setCurrentUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`, 'true');
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user_id`, id);
    addAwsLog(`[IAM Auth] Switched active session and verified credentials for ID: ${id}`);
  };

  const handleStartLogin = (id: string) => {
    setLoginPendingUserId(id);
    setLoginMfaStep(true);
    addAwsLog(`[IAM Auth] MFA Challenge requested for Cognito login of User ID: ${id}. Verification code dispatched.`);
  };

  const handleLogin = (id: string) => {
    setCurrentUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`, 'true');
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user_id`, id);
    setShowLoginModal(false);
    setLoginMfaStep(false);
    setLoginPendingUserId('');
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
    setCurrentUserId('');
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}is_logged_in`, 'false');
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}current_user_id`);
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

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addAwsLog(`[IAM User Pool] Updated Cognito profile details for ${updatedUser.name}.`);
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
            onUpdateBalance={handleUpdateBalance}
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
            onLogin={handleStartLogin}
            onRegister={(newUser) => setUsers(prev => [...prev, newUser])}
            onUpdateUser={handleUpdateUser}
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

      {/* AWS Cognito Secure Sign-In & Sign-Up Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 backdrop-blur-md font-sans">
          <div className="bg-white rounded-2xl border border-slate-200/85 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row h-auto md:h-[620px] animate-scale-up">
            
            {/* Left Column: Tech branding and AWS Console Status */}
            <div className="md:w-5/12 bg-slate-950 text-slate-100 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-[#FF9900]/10 rounded-xl flex items-center justify-center border border-[#FF9900]/30 shadow-inner">
                    <Cloud className="h-6 w-6 text-[#FF9900] animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-black tracking-tight text-white block">AWS Cognito</span>
                    <span className="text-[9px] text-gray-400 font-mono block -mt-1 uppercase tracking-wider font-bold">Identity Provider</span>
                  </div>
                </div>
 
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Security Status</h4>
                  
                  <div className="space-y-3 font-mono text-[10px]">
                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-slate-300">Cognito User Pool</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase">Active</span>
                    </div>
 
                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-300">WAF Protection</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase">Strict</span>
                    </div>
 
                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#FF9900]" />
                        <span className="text-slate-300">MFA Challenge</span>
                      </div>
                      <span className="text-[9px] text-[#FF9900] font-bold uppercase">Enforced</span>
                    </div>
                  </div>
                </div>
 
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#FF9900] font-bold text-[11px] font-mono">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Zero-Trust Assurance</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Identity validation utilizes cryptographically signed JSON Web Tokens (JWT) verified via Route 53 resolvers.
                  </p>
                </div>
              </div>
 
              <div className="hidden md:block pt-6 border-t border-slate-900 text-[9px] text-slate-500 font-mono space-y-1">
                <p>AUTHORIZATION COMPLIANCE: SOC2 Type II</p>
                <p>FEDERATION KEY: KMS-HSM-SEC-V2</p>
              </div>
            </div>
 
            {/* Right Column: Dynamic Form Content */}
            <div className="flex-1 flex flex-col justify-between bg-white overflow-hidden">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-slate-900">
                    {loginMfaStep ? "Multi-Factor Authentication" : authMode === 'signin' ? "Sign In to AWS AutoMarket" : "Create AWS Cognito Account"}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {loginMfaStep 
                      ? "Verify secure passcode via Cognito MFA" 
                      : authMode === 'signin' 
                        ? "Access your secure vehicle wallet & escrow listings" 
                        : "Register a secure new identity with custom wallet balance"}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginMfaStep(false);
                    setLoginPendingUserId('');
                    setAuthError('');
                  }}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                  title="Close login portal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
 
              {/* Form / MFA Container */}
              <div className="flex-grow overflow-y-auto">
                {!loginMfaStep && (
                  /* Mode Tabs Selection */
                  <div className="flex border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthError('');
                      }}
                      className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                        authMode === 'signin' 
                          ? 'border-[#FF9900] text-slate-900 bg-amber-500/5' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError('');
                      }}
                      className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                        authMode === 'signup' 
                          ? 'border-[#FF9900] text-slate-900 bg-amber-500/5' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Sign Up (Registration)
                    </button>
                  </div>
                )}

                <div className="p-8 space-y-6">
                  {authError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 leading-normal animate-scale-up">
                      <AlertCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{authError}</span>
                        {authError.includes('not registered') && (
                          <button 
                            type="button"
                            onClick={() => {
                              setAuthMode('signup');
                              setAuthError('');
                            }}
                            className="block font-bold text-[#FF9900] hover:underline mt-1 cursor-pointer"
                          >
                            Switch to Sign Up page now &rarr;
                          </button>
                        )}
                        {authError.includes('already registered') && (
                          <button 
                            type="button"
                            onClick={() => {
                              setAuthMode('signin');
                              setAuthError('');
                            }}
                            className="block font-bold text-[#FF9900] hover:underline mt-1 cursor-pointer"
                          >
                            Switch to Sign In page now &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {!loginMfaStep ? (
                    authMode === 'signin' ? (
                      /* Sign In Form */
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!signInEmail.trim() || !signInPassword) {
                          setAuthError('Please enter your email and password.');
                          return;
                        }
                        const foundUser = users.find(u => u.email.toLowerCase() === signInEmail.trim().toLowerCase());
                        if (!foundUser) {
                          setAuthError('This email is not registered with our Cognito User Pool. Please switch to the Sign Up tab to register first.');
                          return;
                        }
                        const userPassword = foundUser.password || 'hunter2password';
                        if (userPassword !== signInPassword) {
                          setAuthError('Invalid credentials. Please verify your Cognito password and try again.');
                          return;
                        }
                        setAuthError('');
                        handleStartLogin(foundUser.id);
                      }} className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cognito Username / Email</label>
                          <input 
                            type="email" 
                            required
                            placeholder="username@example.com" 
                            value={signInEmail}
                            onChange={e => setSignInEmail(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2.5 font-sans focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block font-bold text-slate-600 uppercase tracking-wider">Password</label>
                            <a href="#forgot" onClick={(e) => {
                              e.preventDefault();
                              alert('AWS Cognito recovery challenge dispatched! Check your mail inbox.');
                            }} className="text-[10px] font-bold text-[#FF9900] hover:underline">Forgot password?</a>
                          </div>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              required
                              placeholder="••••••••••••" 
                              value={signInPassword}
                              onChange={e => setSignInPassword(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2.5 pr-10 font-sans focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
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
                      /* Sign Up Form */
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword || !signUpPhone.trim()) {
                          setAuthError('Please complete all fields to sign up.');
                          return;
                        }
                        const exists = users.some(u => u.email.toLowerCase() === signUpEmail.trim().toLowerCase());
                        if (exists) {
                          setAuthError('This email is already registered. Please switch to the Sign In tab.');
                          return;
                        }
                        
                        // Proceed to create
                        const newUserId = 'usr_' + Date.now();
                        const newUser: User = {
                          id: newUserId,
                          name: signUpName.trim(),
                          email: signUpEmail.trim().toLowerCase(),
                          password: signUpPassword,
                          role: signUpRole,
                          avatar: signUpRole === 'buyer' 
                            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' 
                            : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
                          balance: signUpBalance
                        };
                        
                        setUsers(prev => [...prev, newUser]);
                        setAuthError('');
                        
                        // Pre-fill sign in email to make next sign in seamless if needed, but go to MFA directly
                        setSignInEmail(signUpEmail.trim());
                        handleStartLogin(newUserId);
                      }} className="space-y-4 text-xs">
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input 
                              type="text" 
                              required
                              placeholder="John Doe" 
                              value={signUpName}
                              onChange={e => setSignUpName(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2.5 font-sans focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cognito Username / Email</label>
                            <input 
                              type="email" 
                              required
                              placeholder="john@example.com" 
                              value={signUpEmail}
                              onChange={e => setSignUpEmail(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2.5 font-sans focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">MFA Mobile Phone</label>
                            <input 
                              type="tel" 
                              required
                              placeholder="+1 (555) 019-9201" 
                              value={signUpPhone}
                              onChange={e => setSignUpPhone(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2.5 font-mono focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cognito Password</label>
                            <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                placeholder="••••••••••••" 
                                value={signUpPassword}
                                onChange={e => setSignUpPassword(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-2.5 pr-10 font-sans focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
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
                              className="w-full border border-slate-200 rounded-lg p-2.5 font-sans bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                            >
                              <option value="buyer">Buyer (Secure Vehicle Wallet)</option>
                              <option value="seller">Seller (Escrow & Inventory Manager)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Starting Wallet Balance (USD)</label>
                            <input 
                              type="number" 
                              required
                              min={0}
                              max={10000000}
                              value={signUpBalance}
                              onChange={e => setSignUpBalance(Number(e.target.value))}
                              className="w-full border border-slate-200 rounded-lg p-2.5 font-mono focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full bg-[#FF9900] hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Plus className="h-4 w-4 text-slate-950" />
                            Register & Send MFA Code
                          </button>
                        </div>
                      </form>
                    )
                  ) : (
                    /* MFA Verification Step */
                    <div className="space-y-6">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
                        <Fingerprint className="h-5 w-5 text-[#FF9900] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">MFA Handshake Required</p>
                          <p className="mt-1 leading-relaxed text-amber-700">
                            AWS Cognito User Pools requires verifying this login request. We've dispatched a secure passcode to your verified authentication device.
                          </p>
                        </div>
                      </div>
 
                      <div className="space-y-4">
                        <div className="text-center">
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Verification Passcode</span>
                          <div className="mt-3 flex justify-center gap-2">
                            <input 
                              type="text" 
                              maxLength={6}
                              value={mfaInputCode}
                              onChange={e => setMfaInputCode(e.target.value)}
                              className="w-full max-w-[200px] border-2 border-slate-300 rounded-xl p-3 text-center font-mono text-2xl font-bold tracking-widest focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
                              placeholder="000000"
                              required
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-2">
                            Enter simulated token: <span className="font-bold text-[#FF9900] hover:underline cursor-pointer" onClick={() => setMfaInputCode('552901')}>552901</span> (Click to autofill)
                          </p>
                        </div>
 
                        <div className="space-y-2.5">
                          <button
                            onClick={() => handleLogin(loginPendingUserId)}
                            className="w-full bg-[#FF9900] hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                          >
                            <KeyRound className="h-4 w-4 text-slate-950" />
                            Verify & Access Console
                          </button>
 
                          <button
                            onClick={() => {
                              setLoginMfaStep(false);
                              setLoginPendingUserId('');
                            }}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Credentials
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
 
              {/* Right Footer info */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-[9px] text-slate-400 font-mono flex justify-between items-center">
                <span>GATEWAY: cognito-idp.us-east-1.amazonaws.com</span>
                <span>ZONE: us-east-1a</span>
              </div>
            </div>
 
          </div>
        </div>
      )}

    </div>
  );
}
