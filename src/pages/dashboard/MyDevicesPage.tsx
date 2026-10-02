import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Search,
  Filter,
  RefreshCw,
  Clock,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DeviceRecord } from '../../types';
import { subscribeToUserDevices, isDeviceOnline } from '../../services/deviceService';
import { DeviceCard } from '../../components/device/DeviceCard';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';

export const MyDevicesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);
    // Real-time Firestore listener
    const unsubscribe = subscribeToUserDevices(
      currentUser.uid,
      (fetchedDevices) => {
        setDevices(fetchedDevices);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const onlineCount = devices.filter((d) => isDeviceOnline(d.last_active)).length;

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      (d.device_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isOnline = isDeviceOnline(d.last_active);
    if (filterMode === 'online') return isOnline;
    if (filterMode === 'offline') return !isOnline;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with 3D Depth */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              My Devices
            </h1>
            <Badge variant="cyan" pulse size="sm">
              Live Fleet
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, inspect, and command all your registered Android handsets.
          </p>
        </div>

        {/* Counts */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl glass-surface elevate-3d text-xs font-mono shadow-xs">
            <span className="text-slate-400 dark:text-slate-500">Total:</span>{' '}
            <span className="font-bold text-slate-900 dark:text-white">{loading ? '—' : devices.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl glass-surface elevate-3d text-xs font-mono flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 dark:text-slate-500">Online:</span>{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{loading ? '—' : onlineCount}</span>
          </div>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by device name, model, manufacturer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs glass-surface text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 glass-surface p-1 rounded-2xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({devices.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('online')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              filterMode === 'online'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Online ({onlineCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('offline')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              filterMode === 'offline'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Offline ({devices.length - onlineCount})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl glass-surface max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
            <Smartphone className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            No devices registered
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Install the companion application on your handset to start managing.
          </p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl glass-surface">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No devices match your search &quot;{searchTerm}&quot;.
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
  );
};
