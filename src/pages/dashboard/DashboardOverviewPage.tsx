import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Search,
  Radio,
  Clock,
  ShieldCheck,
  RefreshCw,
  LayoutDashboard,
  Shield,
  CreditCard,
  ChevronRight,
  Activity,
  AlertCircle,
  MapPin,
  TrendingUp,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DeviceRecord } from '../../types';
import { subscribeToUserDevices, isDeviceOnline, formatTimeAgo } from '../../services/deviceService';
import { DeviceCard } from '../../components/device/DeviceCard';
import { FleetOverviewMap } from '../../components/map/FleetOverviewMap';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { fadeInUp, staggerContainer } from '../../utils/animations';

export const DashboardOverviewPage: React.FC = () => {
  const { currentUser, userRecord } = useAuth();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);
    // Real-time Firestore onSnapshot listener
    const unsubscribe = subscribeToUserDevices(
      currentUser.uid,
      (fetchedDevices) => {
        setDevices(fetchedDevices);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const onlineDevices = devices.filter((d) => isDeviceOnline(d.last_active));
  const onlineCount = onlineDevices.length;
  const qsBlockedCount = devices.filter((d) => d.quick_settings_block).length;
  const shutdownProtectedCount = devices.filter((d) => d.shutdown_protection).length;

  const filteredDevices = devices.filter((d) => 
    (d.device_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPro = Boolean(userRecord?.subscription);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-7 max-w-6xl font-sans"
    >
      {/* Top Banner / Welcome with Layered Depth */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30 shadow-xs">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <h1 className="text-heading-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <Badge variant="cyan" pulse size="sm">
              Live Link
            </Badge>
          </div>
          <p className="text-body-sm text-slate-500 dark:text-slate-400 mt-1 font-normal font-sans">
            Real-time anti-theft command and telemetry terminal for your registered Android devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/devices"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-display font-semibold text-body-sm glass-surface elevate-3d text-slate-800 dark:text-white hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-all shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
            <span>Manage All Devices</span>
          </Link>
        </div>
      </motion.div>

      {/* Fleet Telemetry Metrics Row - Enhanced 3D Glass Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Devices */}
        <div className="p-5 rounded-2xl glass-surface elevate-3d flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-slate-500 dark:text-slate-400 font-mono tracking-tight">TOTAL HANDSETS</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              {loading ? '—' : devices.length}
            </p>
            <span className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">
              Linked to account
            </span>
          </div>
        </div>

        {/* Online Now */}
        <div className="p-5 rounded-2xl glass-surface elevate-3d flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-slate-500 dark:text-slate-400 font-mono tracking-tight">ONLINE NOW</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-emerald-600 dark:text-[#10B981] flex items-center gap-2">
              {loading ? '—' : onlineCount}
            </p>
            <span className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">
              Foreground transponders
            </span>
          </div>
        </div>

        {/* Active Shields */}
        <div className="p-5 rounded-2xl glass-surface elevate-3d flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-slate-500 dark:text-slate-400 font-mono tracking-tight">ACTIVE SHIELDS</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-heading text-cyan-600 dark:text-[#00E5FF]">
              {loading ? '—' : `${qsBlockedCount + shutdownProtectedCount}`}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">
              Active lockscreen hooks
            </span>
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="p-5 rounded-2xl glass-surface elevate-3d flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-tight">TIER STATUS</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="mt-1">
              <Badge variant={isPro ? 'cyan' : 'neutral'} size="sm">
                {isPro ? 'PRO ($1/YR)' : 'FREE BASIC'}
              </Badge>
            </div>
            <Link to="/dashboard/subscription" className="text-[11px] text-cyan-600 dark:text-[#00E5FF] hover:underline block mt-1.5 font-mono">
              Manage license →
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Fleet Live GPS Map on OpenStreetMap - Enhanced 3D Glass Container */}
      {devices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Fleet Location Radar (OpenStreetMap)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Live labels pinned above transponder coordinates
            </span>
          </div>

          <div className="glass-surface elevate-3d p-2 rounded-3xl">
            <FleetOverviewMap devices={devices} height="370px" />
          </div>
        </div>
      )}

      {/* Main Devices Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Registered Devices
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Direct WebSocket cards transponding to Firebase Firestore.
            </p>
          </div>

          {devices.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search devices..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs glass-surface text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
          )}
        </div>

        {/* Device Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : devices.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 px-4 rounded-3xl glass-surface max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-md">
              <Smartphone className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
              No devices registered yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Install Anti-Theft on your Android mobile device and sign in with your credentials to link your handset.
            </p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl glass-surface">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No registered devices match your search query &quot;{searchTerm}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <DeviceCard
                key={device.device_id}
                device={device}
                uid={currentUser?.uid || ''}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
