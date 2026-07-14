import { useState } from 'react';
import { Bell, Mail, MessageSquare, Check, Trash2, X } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({ notifications, onMarkRead, onClearAll }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">$</div>;
      case 'offer':
        return <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><MessageSquare className="h-4 w-4" /></div>;
      case 'listing':
        return <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">V</div>;
      case 'review':
        return <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">★</div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">i</div>;
    }
  };

  return (
    <div className="relative" id="notification-center-root">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer focus:outline-none"
        aria-label="Toggle notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 min-w-5 px-1 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden font-sans">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                  Multi-Channel Simulation Active
                </span>
              </div>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      onClearAll();
                    }}
                    className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Clear All"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="text-xs">No notifications yet</p>
                  <p className="text-[10px] text-gray-400 mt-1">Actions on vehicles will generate alerts</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 flex gap-3 transition-colors hover:bg-slate-50 relative ${
                      !notification.read ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {getTypeIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <p className={`text-xs text-gray-900 ${!notification.read ? 'font-bold' : 'font-medium'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[9px] text-gray-400 font-mono flex-shrink-0">
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 whitespace-normal break-words leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Sub-delivery badges */}
                      <div className="flex gap-2 mt-2 font-mono text-[9px] text-gray-400">
                        <span className="flex items-center gap-0.5 bg-gray-50 px-1 rounded text-emerald-600 font-medium border border-gray-100">
                          <Check className="h-2 w-2" /> In-App Delivered
                        </span>
                        <span className="flex items-center gap-0.5 bg-gray-50 px-1 rounded text-blue-600 font-medium border border-gray-100">
                          <Mail className="h-2 w-2" /> Email Sent
                        </span>
                        <span className="flex items-center gap-0.5 bg-gray-50 px-1 rounded text-indigo-600 font-medium border border-gray-100">
                          <Check className="h-2 w-2" /> SMS Delivered
                        </span>
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <button 
                        onClick={() => onMarkRead(notification.id)}
                        className="self-center p-1 bg-white hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-full cursor-pointer shadow-sm ml-1"
                        title="Mark read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-gray-100 text-center text-[10px] text-gray-400 font-mono">
              Delivery channels configured with AWS SNS & SES models
            </div>
          </div>
        </>
      )}
    </div>
  );
}
