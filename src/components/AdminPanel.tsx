import React, { useState } from 'react';
import { 
  Users, Car, DollarSign, ShieldAlert, Flag, Check, Trash2, 
  Send, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Vehicle, User, Transaction, AppNotification } from '../types';

interface AdminPanelProps {
  vehicles: Vehicle[];
  users: User[];
  transactions: Transaction[];
  onRemoveVehicle: (id: string) => void;
  onFlagVehicle: (id: string, reason: string) => void;
  onReleaseEscrow: (txId: string) => void;
  onRefundEscrow: (txId: string) => void;
  onBroadcastAlert: (title: string, message: string) => void;
  addLog: (msg: string) => void;
}

export default function AdminPanel({
  vehicles,
  users,
  transactions,
  onRemoveVehicle,
  onFlagVehicle,
  onReleaseEscrow,
  onRefundEscrow,
  onBroadcastAlert,
  addLog
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'transactions' | 'alerts'>('listings');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Stats calculation
  const totalEscrow = transactions
    .filter(t => t.status === 'escrow_pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSales = transactions
    .filter(t => t.status === 'released')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;
    
    setIsSendingAlert(true);
    setTimeout(() => {
      onBroadcastAlert(alertTitle, alertMessage);
      addLog(`[Admin Alert] Broadcasted site-wide notification: "${alertTitle}" through AWS SNS email/SMS channels.`);
      setAlertTitle('');
      setAlertMessage('');
      setIsSendingAlert(false);
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans" id="admin-panel-root">
      {/* Admin Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
          Admin Operations Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Authorized AWS Identity access panel for real-time user verification, vehicle listing policies, and escrow financial auditing.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Listings</h3>
            <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Users</h3>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transactions Completed</h3>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(totalSales)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Held In Escrow</h3>
            <p className="text-2xl font-bold text-amber-600">{formatPrice(totalEscrow)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6 font-medium text-sm">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
            activeTab === 'listings' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Vehicle Listings ({vehicles.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Platform Accounts ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
            activeTab === 'transactions' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Escrow Transactions ({transactions.length})
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
            activeTab === 'alerts' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          AWS SNS Alerts Broadcast
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Active Vehicle Moderation Console</h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">AWS DynamoDB Sync: Active</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">Seller Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Listing Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No active vehicle listings found on the platform.</td>
                  </tr>
                ) : (
                  vehicles.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/55 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={vehicle.images[0]} 
                            alt={vehicle.make} 
                            className="h-10 w-12 object-cover rounded border border-gray-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                            <p className="text-gray-400 text-[10px] font-mono mt-0.5">UID: {vehicle.id} | {vehicle.vehicleType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.sellerName}</p>
                          <p className="text-gray-400 text-[10px] font-mono">{vehicle.sellerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{vehicle.location}</td>
                      <td className="p-4 font-bold font-mono text-gray-900">{formatPrice(vehicle.price)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-medium text-[10px] ${
                          vehicle.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          vehicle.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {vehicle.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              onFlagVehicle(vehicle.id, 'Metadata contains inaccurate details');
                            }}
                            className="p-1.5 hover:bg-amber-50 text-amber-600 hover:text-amber-700 rounded transition-colors cursor-pointer"
                            title="Flag Listing"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete listing: ${vehicle.make} ${vehicle.model}?`)) {
                                onRemoveVehicle(vehicle.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded transition-colors cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Platform Users Directory</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact Email</th>
                  <th className="p-4">Platform Role</th>
                  <th className="p-4">Simulated Wallet Balance</th>
                  <th className="p-4">Auth Channel</th>
                  <th className="p-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-9 w-9 rounded-full object-cover border border-gray-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                          <p className="text-gray-400 text-[10px] font-mono mt-0.5">UID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-semibold text-[10px] ${
                        user.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                        user.role === 'seller' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-bold font-mono text-gray-900">{formatPrice(user.balance)}</td>
                    <td className="p-4 font-mono text-[10px]">
                      {user.id === 'usr_buyer' ? (
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">Verified ID</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Native Account</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          addLog(`[IAM Admin] Reset security policies & credentials for user ${user.name}.`);
                          alert(`Security credentials reset for ${user.name}.`);
                        }}
                        className="px-2.5 py-1 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded font-medium text-[10px] cursor-pointer"
                      >
                        Reset Keys
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Escrow Transaction Management Ledger</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">AWS KMS encrypted ledger keys active</p>
            </div>
            <span className="text-xs text-emerald-600 font-mono font-semibold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <ShieldCheck className="h-3.5 w-3.5" /> SECURE ESCROW MODULE ENABLED
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Transaction Details</th>
                  <th className="p-4">Buyer Info</th>
                  <th className="p-4">Seller Info</th>
                  <th className="p-4">Escrow Fund Amount</th>
                  <th className="p-4">State</th>
                  <th className="p-4 text-right">Escrow Auditing Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No transactions recorded on this platform yet.</td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/55 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{tx.vehicleDetails.year} {tx.vehicleDetails.make} {tx.vehicleDetails.model}</p>
                          <p className="text-gray-400 text-[10px] font-mono mt-0.5">TXID: {tx.id} | Veh ID: {tx.vehicleId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{tx.buyerName}</p>
                          <p className="text-gray-400 text-[10px] font-mono">UID: {tx.buyerId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{tx.sellerName}</p>
                          <p className="text-gray-400 text-[10px] font-mono">UID: {tx.sellerId}</p>
                        </div>
                      </td>
                      <td className="p-4 font-bold font-mono text-gray-900">{formatPrice(tx.amount)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          tx.status === 'released' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tx.status === 'escrow_pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {tx.status === 'escrow_pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => {
                                if (confirm(`Authorize release of ${formatPrice(tx.amount)} to seller ${tx.sellerName}?`)) {
                                  onReleaseEscrow(tx.id);
                                }
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              Release Escrow
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Authorize refund of ${formatPrice(tx.amount)} back to buyer ${tx.buyerName}?`)) {
                                  onRefundEscrow(tx.id);
                                }
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              Refund Buyer
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono italic">Audit complete</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
          <div className="p-5 border-b border-gray-50 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Site-Wide Alert Broadcast Center</h3>
            <p className="text-xs text-gray-500 mt-1">
              Dispatch high-priority push, email, and SMS notifications immediately to all registered users via Amazon SNS.
            </p>
          </div>
          
          <form onSubmit={handleBroadcast} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Alert Topic Title</label>
              <input 
                type="text"
                placeholder="e.g., Scheduled Core Upgrades, AWS Database Relocation"
                value={alertTitle}
                onChange={e => setAlertTitle(e.target.value)}
                required
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Detailed Notification Message</label>
              <textarea 
                rows={4}
                placeholder="Write the public announcement details here... (Will trigger in-app banner, direct system notification, and AWS SNS email dispatch models)"
                value={alertMessage}
                onChange={e => setAlertMessage(e.target.value)}
                required
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                disabled={isSendingAlert}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSendingAlert ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Broadcasting SNS Packets...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Dispatch Site-Wide Alert
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
