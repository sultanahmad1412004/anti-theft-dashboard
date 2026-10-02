import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Smartphone, 
  UserCheck, 
  CreditCard, 
  Map, 
  RefreshCw,
  TrendingUp,
  Crown,
  Camera,
  Radio,
  Clock,
  Download,
  Layers,
  Code2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  BellRing,
  Activity,
  Eye,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchAdminUsers, 
  fetchAdminDevices, 
  fetchAdminGuestUsers, 
  subscribeAdminDevices,
  subscribeAdminUsers,
  subscribeAdminGuestUsers,
  isDeviceOnline, 
  formatTimeAgo, 
  getTimestampSeconds 
} from '../../services/deviceService';
import { UserProfile, DeviceRecord, GuestUserRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { MultiDeviceMap } from '../../components/map/MultiDeviceMap';
import { LiveActivityRadar } from '../../components/activity/LiveActivityRadar';

interface DeviceTransitionEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  appName?: string;
  appDetail?: string;
  screenState?: string;
  sirenActive?: boolean;
  timestamp: string;
  label: string;
}

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [guests, setGuests] = useState<GuestUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityTab, setActivityTab] = useState<'users' | 'devices' | 'screenshots'>('users');
  const [transitionFeed, setTransitionFeed] = useState<DeviceTransitionEvent[]>(() => {
    try {
      const saved = sessionStorage.getItem('admin_transition_feed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time listener subscriptions: Budget-friendly & 0 manual refresh required
  useEffect(() => {
    setLoading(true);

    // 1. Real-time sub-second device fleet stream (costs 1 read per modified device doc)
    const unsubDevices = subscribeAdminDevices((liveDevices) => {
      setDevices((prevDevices) => {
        // Detect state changes for in-browser transition feed
        const newEvents: DeviceTransitionEvent[] = [];
        liveDevices.forEach((dev) => {
          const prev = prevDevices.find((p) => p.device_id === dev.device_id);
          const hasChanged = !prev || 
            prev.current_app_name !== dev.current_app_name ||
            prev.current_app_detail !== dev.current_app_detail ||
            prev.screen_state !== dev.screen_state ||
            prev.siren_active !== dev.siren_active;

          if (hasChanged && (dev.current_app_name || dev.screen_state || dev.siren_active)) {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            let desc = dev.current_app_name || 'System Activity';
            if (dev.current_app_detail) desc += ` → ${dev.current_app_detail}`;
            if (dev.screen_state === 'on') desc += ' (Display Active)';
            if (dev.siren_active) desc += ' [SIREN ALARM]';

            newEvents.push({
              id: `${dev.device_id}-${Date.now()}`,
              deviceId: dev.device_id,
              deviceName: dev.device_name || dev.model || 'Device',
              appName: dev.current_app_name,
              appDetail: dev.current_app_detail,
              screenState: dev.screen_state,
              sirenActive: dev.siren_active,
              timestamp: timeStr,
              label: desc
            });
          }
        });

        if (newEvents.length > 0) {
          setTransitionFeed((prevFeed) => {
            const merged = [...newEvents, ...prevFeed.filter((p) => !newEvents.some((e) => e.deviceId === p.deviceId))].slice(0, 8);
            try {
              sessionStorage.setItem('admin_transition_feed', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }

        return liveDevices;
      });

      setLoading(false);
    }, isDemoMode);

    // 2. Real-time users stream
    const unsubUsers = subscribeAdminUsers((liveUsers) => {
      setUsers(liveUsers);
    }, isDemoMode);

    // 3. Real-time guest users stream
    const unsubGuests = subscribeAdminGuestUsers((liveGuests) => {
      setGuests(liveGuests);
    }, isDemoMode);

    return () => {
      unsubDevices();
      unsubUsers();
      unsubGuests();
    };
  }, [isDemoMode]);

  const handleManualResync = async () => {
    setLoading(true);
    try {
      const [u, d, g] = await Promise.all([
        fetchAdminUsers(isDemoMode),
        fetchAdminDevices(isDemoMode),
        fetchAdminGuestUsers(isDemoMode)
      ]);
      setUsers(u);
      setDevices(d);
      setGuests(g);
    } catch (err) {
      console.error('Manual resync error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations for requested metrics:
  const onlineNowCount = devices.filter((d) => isDeviceOnline(d.last_active)).length;
  const active24hCount = devices.filter((d) => {
    const sec = getTimestampSeconds(d.last_active);
    if (!sec) return false;
    return (Date.now() / 1000 - sec) < 86400;
  }).length;
  const subscribedUsersCount = users.filter((u) => u.subscription).length;
  const screenshotsCapturedCount = devices.filter((d) => !!d.latest_screenshot).length;

  // Recent 10 users signed up (sorted by createdAt or fallback)
  const recentUsers = [...users].sort((a, b) => {
    const secA = getTimestampSeconds(a.createdAt) || 0;
    const secB = getTimestampSeconds(b.createdAt) || 0;
    return secB - secA;
  }).slice(0, 10);

  // Recent 10 devices registered
  const recentDevices = [...devices].sort((a, b) => {
    const secA = getTimestampSeconds(a.registered_at) || 0;
    const secB = getTimestampSeconds(b.registered_at) || 0;
    return secB - secA;
  }).slice(0, 10);

  // Recent 10 screenshots captured
  const recentScreenshots = devices.filter(d => !!d.latest_screenshot).sort((a, b) => {
    const secA = getTimestampSeconds(a.latest_screenshot_time) || 0;
    const secB = getTimestampSeconds(b.latest_screenshot_time) || 0;
    return secB - secA;
  }).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-red-500/30">
              <Crown className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Admin Dashboard Overview
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-gradient-to-r dark:from-red-500/20 dark:to-amber-500/20 border border-red-300 dark:border-red-500/40 text-red-700 dark:text-amber-300">
              Root Authority
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-mono">
            Direct access to all registered users, device nodes, guest telemetry, and system controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE SYNC ACTIVE</span>
          </div>

          <Button
            onClick={handleManualResync}
            isLoading={loading}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Manual Re-sync
          </Button>
        </div>
      </div>

      {/* QUICK ACTIONS PANEL */}
      <Card variant="default" className="p-4 bg-slate-100 dark:bg-gradient-to-r dark:from-[#111927] dark:to-[#1E293B] border border-slate-200 dark:border-[#334155]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" /> QUICK ROOT ACTIONS
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Full Read/Write Admin Mode</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            to="/admin/users"
            className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer shadow-xs"
          >
            <Users className="w-4 h-4 text-blue-500 dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-blue-600 dark:group-hover:text-blue-300">Manage Users</p>
            <p className="text-[10px] text-slate-500">{users.length} registered</p>
          </Link>

          <Link
            to="/admin/devices"
            className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF]">Fleet Devices</p>
            <p className="text-[10px] text-slate-500">{devices.length} hardware</p>
          </Link>

          <Link
            to="/admin/map"
            className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer shadow-xs"
          >
            <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-emerald-600 dark:group-hover:text-emerald-300">Global Map</p>
            <p className="text-[10px] text-slate-500">Live GPS radar</p>
          </Link>

          <Link
            to="/admin/raw-editor"
            className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer shadow-xs"
          >
            <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-purple-600 dark:group-hover:text-purple-300">Raw Editor</p>
            <p className="text-[10px] text-slate-500">Direct Firestore</p>
          </Link>

          <Link
            to="/admin/bulk-ops"
            className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer shadow-xs"
          >
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-amber-600 dark:group-hover:text-amber-300">Bulk Ops</p>
            <p className="text-[10px] text-slate-500">Multi-doc sync</p>
          </Link>

          <Link
            to="/admin/export"
            className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-teal-600 dark:group-hover:text-teal-300">Export Data</p>
            <p className="text-[10px] text-slate-500">JSON & CSV</p>
          </Link>
        </div>
      </Card>

      {/* STATS CARDS: All 7 requested metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
        {/* 1. Total Users */}
        <Link to="/admin/users" className="block group">
          <Card variant="default" hoverEffect className="p-4 border-t-2 border-t-blue-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">TOTAL USERS</span>
              <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0] group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {loading ? '—' : users.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Firestore users</p>
          </Card>
        </Link>

        {/* 2. Total Devices */}
        <Link to="/admin/devices" className="block group">
          <Card variant="default" hoverEffect className="p-4 border-t-2 border-t-[#00E5FF]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">TOTAL DEVICES</span>
              <Smartphone className="w-3.5 h-3.5 text-cyan-500 dark:text-[#00E5FF]" />
            </div>
            <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0] group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF]">
              {loading ? '—' : devices.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">All subcollections</p>
          </Card>
        </Link>

        {/* 3. Total Guest Users */}
        <Link to="/admin/guest-users" className="block group">
          <Card variant="default" hoverEffect className="p-4 border-t-2 border-t-purple-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">GUEST USERS</span>
              <UserCheck className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0] group-hover:text-purple-600 dark:group-hover:text-purple-400">
              {loading ? '—' : guests.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Secondary tokens</p>
          </Card>
        </Link>

        {/* 4. Subscribed Users */}
        <Link to="/admin/subscriptions" className="block group">
          <Card variant="default" hoverEffect className="p-4 border-t-2 border-t-emerald-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">SUBSCRIBED</span>
              <CreditCard className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
              {loading ? '—' : subscribedUsersCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">${subscribedUsersCount}/yr ARR</p>
          </Card>
        </Link>

        {/* 5. Active Devices (<24h) */}
        <div className="block">
          <Card variant="default" className="p-4 border-t-2 border-t-amber-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">ACTIVE (&lt;24H)</span>
              <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold font-heading text-amber-600 dark:text-amber-300">
              {loading ? '—' : active24hCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Recent heartbeat</p>
          </Card>
        </div>

        {/* 6. Total Screenshots */}
        <div className="block">
          <Card variant="default" className="p-4 border-t-2 border-t-rose-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">SCREENSHOTS</span>
              <Camera className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            </div>
            <p className="text-2xl font-extrabold font-heading text-rose-600 dark:text-rose-300">
              {loading ? '—' : screenshotsCapturedCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Captures stored</p>
          </Card>
        </div>

        {/* 7. Devices Online Right Now (<5min) */}
        <div className="block">
          <Card variant="default" className="p-4 border-t-2 border-t-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">ONLINE NOW</span>
              <Radio className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            </div>
            <p className="text-2xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
              {loading ? '—' : onlineNowCount}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">&lt; 5m heartbeat</p>
          </Card>
        </div>
      </div>

      {/* 2-COLUMN LOWER LAYOUT: Left (Global Radar & System Streams) + Right (Live Foreground & Screen Activity Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Map Radar & System Tables */}
        <div className="lg:col-span-8 space-y-6">
          {/* Global Map Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading">
                  Worldwide Device Transponder Radar
                </h2>
              </div>
              <Link
                to="/admin/map"
                className="text-xs text-cyan-600 dark:text-[#00E5FF] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Open Interactive Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <Skeleton className="h-72 rounded-2xl" />
            ) : (
              <MultiDeviceMap devices={devices} height="320px" />
            )}
          </div>

          {/* RECENT ACTIVITY SECTION (Last 10 users, Last 10 devices, Last 10 screenshots) */}
          <Card variant="default" className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-[#334155]/60">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading">
                  Recent System Activity Stream
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Audit trails for newest users, registered hardware nodes, and optical surveillance frames
                </p>
              </div>

              {/* Activity Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border border-slate-200 dark:border-[#334155]">
                <button
                  onClick={() => setActivityTab('users')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activityTab === 'users'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Last 10 Users ({recentUsers.length})
                </button>
                <button
                  onClick={() => setActivityTab('devices')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activityTab === 'devices'
                      ? 'bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Last 10 Devices ({recentDevices.length})
                </button>
                <button
                  onClick={() => setActivityTab('screenshots')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activityTab === 'screenshots'
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Last 10 Screenshots ({recentScreenshots.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            ) : activityTab === 'users' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#334155]/60">
                    <tr>
                      <th className="pb-2.5 font-semibold">User</th>
                      <th className="pb-2.5 font-semibold">Email</th>
                      <th className="pb-2.5 font-semibold">Subscription</th>
                      <th className="pb-2.5 font-semibold">UID</th>
                      <th className="pb-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#334155]/40 text-slate-800 dark:text-[#E2E8F0]">
                    {recentUsers.map((u) => (
                      <tr 
                        key={u.uid} 
                        onClick={() => navigate(`/admin/users/${u.uid}`)}
                        className="hover:bg-cyan-50/60 dark:hover:bg-cyan-950/25 transition-colors cursor-pointer group"
                        title="Click to inspect user profile"
                      >
                        <td className="py-3 font-medium flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] group-hover:scale-110 transition-transform">
                            {u.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF] transition-colors">{u.full_name}</span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-[#94A3B8] font-mono">{u.email}</td>
                        <td className="py-3">
                          <Badge variant={u.subscription ? 'success' : 'neutral'} size="sm">
                            {u.subscription ? 'Pro ($1/yr)' : 'Free'}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-400 dark:text-slate-500">{u.uid.slice(0, 10)}...</td>
                        <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/admin/users/${u.uid}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            Inspect <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activityTab === 'devices' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#334155]/60">
                    <tr>
                      <th className="pb-2.5 font-semibold">Device Name</th>
                      <th className="pb-2.5 font-semibold">Hardware</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold">Last Ping</th>
                      <th className="pb-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#334155]/40 text-slate-800 dark:text-[#E2E8F0]">
                    {recentDevices.map((d) => {
                      const online = isDeviceOnline(d.last_active);
                      return (
                        <tr 
                          key={d.device_id} 
                          onClick={() => navigate(`/admin/devices/${d.device_id}`)}
                          className="hover:bg-cyan-50/60 dark:hover:bg-cyan-950/25 transition-colors cursor-pointer group"
                          title="Click to manage device"
                        >
                          <td className="py-3 font-medium flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF] group-hover:scale-110 transition-transform" />
                            <span className="group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF] transition-colors">{d.device_name}</span>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-[#94A3B8] font-mono">
                            {d.manufacturer} {d.model} (v{d.os_version})
                          </td>
                          <td className="py-3">
                            <Badge variant={online ? 'success' : 'neutral'} size="sm">
                              {online ? 'Online' : 'Offline'}
                            </Badge>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-[#94A3B8] font-mono">
                            {formatTimeAgo(d.last_active)}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/admin/devices/${d.device_id}`}
                              className="text-xs text-cyan-600 dark:text-[#00E5FF] hover:underline font-medium inline-flex items-center gap-1"
                            >
                              Control <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {recentScreenshots.length > 0 ? (
                  recentScreenshots.map((d) => (
                    <div key={d.device_id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
                      <div className="aspect-9/16 rounded-lg overflow-hidden bg-black relative group">
                        <img
                          src={d.latest_screenshot}
                          alt={d.device_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Link
                            to={`/admin/devices/${d.device_id}`}
                            className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-semibold"
                          >
                            Inspect
                          </Link>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-900 dark:text-[#E2E8F0] truncate">{d.device_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{formatTimeAgo(d.latest_screenshot_time)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 col-span-5 text-center py-6">No screenshots captured yet.</p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (4 cols): Real-Time Current Device Activities & Screen State Monitor */}
        <div className="lg:col-span-4 space-y-4">
          <LiveActivityRadar devices={devices} compact />
        </div>
      </div>
    </div>
  );
};
