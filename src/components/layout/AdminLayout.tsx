import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Smartphone, 
  UserCheck, 
  CreditCard, 
  Map as MapIcon, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Database, 
  BarChart3, 
  Crown, 
  Code2, 
  Layers, 
  Download, 
  DownloadCloud, 
  AlertTriangle,
  Bell,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  getStoredNotifications, 
  addNotification 
} from '../../services/notificationService';
import { 
  subscribeAdminUsers, 
  subscribeAdminDevices 
} from '../../services/deviceService';
import toast from 'react-hot-toast';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { currentUser, userRecord, isSuperAdmin, adminRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Track initial snapshot to avoid ringing on page load for old items
  const initialUsersLoadedRef = React.useRef(false);
  const knownUserIdsRef = React.useRef<Set<string>>(new Set());
  const initialDevicesLoadedRef = React.useRef(false);
  const knownDeviceIdsRef = React.useRef<Set<string>>(new Set());
  const knownSirenStatesRef = React.useRef<Map<string, boolean>>(new Map());

  // Update unread count
  useEffect(() => {
    const updateUnread = () => {
      const list = getStoredNotifications();
      setUnreadCount(list.filter((n) => !n.read).length);
    };
    updateUnread();

    window.addEventListener('admin_notifications_updated', updateUnread);
    return () => window.removeEventListener('admin_notifications_updated', updateUnread);
  }, []);

  // Real-time Firestore Listeners for Instant Alerts (Signup, Device Link, Siren Blare)
  useEffect(() => {
    // 1. User signups listener
    const unsubUsers = subscribeAdminUsers((users) => {
      if (!initialUsersLoadedRef.current) {
        users.forEach((u) => knownUserIdsRef.current.add(u.uid));
        initialUsersLoadedRef.current = true;
        return;
      }

      // Check for new users
      users.forEach((u) => {
        if (!knownUserIdsRef.current.has(u.uid)) {
          knownUserIdsRef.current.add(u.uid);
          addNotification({
            type: 'user_signup',
            title: '🎉 New User Registered',
            message: `${u.email || u.full_name || 'New mobile account'} has registered an Anti-Theft handset.`,
            targetId: u.uid
          });
          toast.success(`🎉 New User Registered: ${u.email || u.full_name}`);
        }
      });
    });

    // 2. Devices and Siren Alert listener
    const unsubDevices = subscribeAdminDevices((devices) => {
      if (!initialDevicesLoadedRef.current) {
        devices.forEach((d) => {
          knownDeviceIdsRef.current.add(d.device_id);
          knownSirenStatesRef.current.set(d.device_id, Boolean(d.siren_active));
        });
        initialDevicesLoadedRef.current = true;
        return;
      }

      devices.forEach((d) => {
        // New device linked
        if (!knownDeviceIdsRef.current.has(d.device_id)) {
          knownDeviceIdsRef.current.add(d.device_id);
          addNotification({
            type: 'new_device',
            title: '📱 New Android Handset Linked',
            message: `${d.device_name || d.model} (${d.manufacturer || 'Android'}) has linked to cloud telemetry.`,
            targetId: d.device_id
          });
          toast(`📱 New Device Linked: ${d.device_name || d.model}`, { icon: '📱' });
        }

        // Siren alarm turned on
        const prevSiren = knownSirenStatesRef.current.get(d.device_id);
        const currSiren = Boolean(d.siren_active);
        if (!prevSiren && currSiren) {
          addNotification({
            type: 'siren_alert',
            title: '🚨 EMERGENCY SIREN TRIGGERED',
            message: `Emergency siren is blaring on ${d.device_name || d.model}! Bypassing silent mode at 100% volume.`,
            targetId: d.device_id
          });
          toast.error(`🚨 Emergency Siren Triggered on ${d.device_name || d.model}`);
        }
        knownSirenStatesRef.current.set(d.device_id, currSiren);
      });
    });

    return () => {
      unsubUsers();
      unsubDevices();
    };
  }, []);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out securely');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const adminNavItems = [
    { label: 'Overview', path: '/admin', icon: BarChart3 },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadCount },
    { label: 'App Link & APK', path: '/admin/app-link', icon: DownloadCloud },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Devices', path: '/admin/devices', icon: Smartphone },
    { label: 'Guest Users', path: '/admin/guest-users', icon: UserCheck },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Global Map', path: '/admin/map', icon: MapIcon },
    { label: 'God Mode Hub', path: '/admin/god-mode', icon: Crown, godMode: true },
    ...(isSuperAdmin ? [{ label: 'Manage Admins', path: '/admin/god-mode/admins', icon: Users, godMode: true }] : []),
    { label: 'Raw Editor', path: '/admin/god-mode/raw-editor', icon: Code2 },
    { label: 'Bulk Operations', path: '/admin/bulk-ops', icon: Layers },
    { label: 'Activity Logs', path: '/admin/logs', icon: Layers },
    { label: 'Export', path: '/admin/export', icon: Download },
    { label: 'Danger Zone', path: '/admin/god-mode/danger', icon: AlertTriangle, danger: true },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0F1D] text-slate-800 dark:text-[#E2E8F0] flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#111927] border-b border-slate-200 dark:border-[#1F2937] z-30 sticky top-0 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-red-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
            <Crown className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-sm tracking-wider bg-linear-to-r from-red-500 via-amber-500 to-red-500 dark:from-red-400 dark:via-amber-300 dark:to-red-400 bg-clip-text text-transparent">
            ADMIN DASHBOARD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" aria-label="Toggle Menu">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#111927] border-r border-slate-200 dark:border-[#1F2937] flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-[#1F2937] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 via-red-600 to-amber-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-sm tracking-wider text-slate-900 dark:text-[#E2E8F0]">
                  PROJECT-101
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-linear-to-r from-red-500/20 to-amber-500/20 dark:from-red-500/30 dark:to-amber-500/30 border border-red-500/30 dark:border-red-500/40 text-red-600 dark:text-amber-300 uppercase tracking-wider">
                  ADMIN DASHBOARD
                </span>
              </div>
              <p className="text-[10px] text-red-500 dark:text-red-400 font-mono flex items-center gap-1 mt-0.5">
                <span>{currentUser?.email ? currentUser.email.split('@')[0] : 'admin'}</span>
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {adminNavItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? item.danger
                        ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-500/30 dark:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : 'bg-linear-to-r from-red-600 to-red-700 text-white font-semibold shadow-md shadow-red-500/20 dark:shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                      : item.danger
                      ? 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#E2E8F0] hover:bg-slate-100 dark:hover:bg-[#1E293B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : item.danger ? 'text-red-500 dark:text-red-400' : 'text-red-500/80 dark:text-red-400/80'}`} />
                  <span className={`flex-1 ${item.danger ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1F2937] space-y-3">
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-[#94A3B8] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              Direct Firestore Engine
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">ACTIVE</span>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white dark:bg-[#0A0F1D] border-b border-slate-200 dark:border-[#1F2937] transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* ADMIN DASHBOARD Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-gradient-to-r dark:from-red-950/80 dark:via-amber-950/60 dark:to-red-950/80 border border-red-200 dark:border-red-500/50 shadow-xs dark:shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-bold font-heading uppercase tracking-wider text-red-600 dark:bg-gradient-to-r dark:from-amber-300 dark:via-amber-200 dark:to-red-300 dark:bg-clip-text dark:text-transparent">
                👑 {isSuperAdmin ? 'ADMIN DASHBOARD' : 'STAFF ADMIN'}
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 animate-pulse ml-1" />
            </div>

            <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">
              {currentUser?.email || 'admin@anti-theft'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              aria-label="Toggle Theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0]">
                  {userRecord?.full_name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Admin')}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center justify-end gap-1 font-medium">
                  <Crown className="w-2.5 h-2.5" /> {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-red-500/30">
                {currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : 'AD'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

