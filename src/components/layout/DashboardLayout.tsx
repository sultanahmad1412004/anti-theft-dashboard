import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Smartphone, 
  CreditCard, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';
import toast from 'react-hot-toast';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userRecord, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Devices', path: '/dashboard/devices', icon: Smartphone },
    { label: 'Subscription', path: '/dashboard/subscription', icon: CreditCard },
    { label: 'Account', path: '/dashboard/account', icon: User },
  ];

  const isPro = Boolean(userRecord?.subscription);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-800 dark:text-[#E2E8F0] flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-[#111927]/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-30 sticky top-0 transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-base tracking-wider text-slate-900 dark:text-white">
            Anti<span className="text-cyan-600 dark:text-[#00E5FF]">-Theft</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar: Dashboard, My Devices, Subscription, Account, Sign Out */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/80 dark:bg-[#111927]/85 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 shadow-lg dark:shadow-[5px_0_30px_rgba(0,0,0,0.5)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-200/80 dark:border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 dark:border-[#00E5FF]/40 flex items-center justify-center text-cyan-600 dark:text-[#00E5FF] shadow-md shadow-cyan-500/15">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-black tracking-wider text-slate-900 dark:text-white text-base">
                Anti<span className="text-cyan-600 dark:text-[#00E5FF]">-Theft</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight">
                Android Control Center
              </p>
            </div>
          </div>

          {/* Nav links with 3D tactile elevation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={`${item.label}-${index}`}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-[#00E5FF] dark:to-cyan-400 text-white dark:text-[#0B0F17] shadow-lg shadow-cyan-500/25 dark:shadow-[0_4px_15px_rgba(0,229,255,0.3)] translate-x-1'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Sign Out at bottom of sidebar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/5 space-y-3">
          <div className="p-3 rounded-2xl neumorphic-well">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[130px]">
                {userRecord?.full_name || 'Anti-Theft User'}
              </span>
              <Badge variant={isPro ? 'cyan' : 'neutral'} size="sm">
                {isPro ? 'PRO' : 'FREE'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
              {currentUser?.email || 'N/A'}
            </p>
          </div>

          {/* Theme & Sign Out Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700/60"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium transition-colors cursor-pointer border border-red-500/20"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
