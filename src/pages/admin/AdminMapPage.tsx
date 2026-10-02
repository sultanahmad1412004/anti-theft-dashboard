import React, { useState, useEffect } from 'react';
import { Map as MapIcon, RefreshCw, Smartphone, Filter, Radio, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminDevices, subscribeAdminDevices, isDeviceOnline } from '../../services/deviceService';
import { DeviceRecord } from '../../types';
import { MultiDeviceMap } from '../../components/map/MultiDeviceMap';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

export const AdminMapPage: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDevices(isDemoMode);
      setDevices(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load global radar points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAdminDevices((liveDevices) => {
      setDevices(liveDevices);
      setLoading(false);
    }, isDemoMode);

    return () => unsubscribe();
  }, [isDemoMode]);

  const filteredDevices = devices.filter((d) => {
    const online = isDeviceOnline(d.last_active);
    if (filter === 'online') return online;
    if (filter === 'offline') return !online;
    return true;
  });

  const onlineCount = devices.filter((d) => isDeviceOnline(d.last_active)).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Global Device Radar
            </h1>
            <Badge variant="cyan" pulse size="sm">
              OpenStreetMap Native
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Real-time geospatial visualization of all registered Android hardware nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-[#94A3B8]">
            <Radio className="w-3.5 h-3.5 text-emerald-500 dark:text-[#10B981] animate-pulse" />
            <span>{onlineCount} Online Transponders</span>
          </div>

          <Button
            onClick={loadDevices}
            isLoading={loading}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Coordinates
          </Button>
        </div>
      </div>

      {/* Filter Switcher */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-slate-500 dark:text-[#94A3B8]">Display Mode:</span>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-white font-semibold'
              : 'bg-white dark:bg-[#111927] border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Nodes ({devices.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('online')}
          className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            filter === 'online'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-white font-semibold'
              : 'bg-white dark:bg-[#111927] border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Active Transponders ({onlineCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('offline')}
          className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            filter === 'offline'
              ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold'
              : 'bg-white dark:bg-[#111927] border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Offline Nodes ({devices.length - onlineCount})
        </button>
      </div>

      {/* Main Map Canvas */}
      {loading ? (
        <Skeleton className="h-[550px] rounded-2xl" />
      ) : (
        <MultiDeviceMap
          devices={filteredDevices}
          height="550px"
        />
      )}
    </div>
  );
};
