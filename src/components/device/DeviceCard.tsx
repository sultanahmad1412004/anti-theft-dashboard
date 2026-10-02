import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  VolumeX, 
  ShieldAlert, 
  PowerOff, 
  ChevronRight, 
  Clock 
} from 'lucide-react';
import { DeviceRecord } from '../../types';
import { Toggle } from '../common/Toggle';
import { isDeviceOnline, formatTimeAgo, updateDeviceToggle } from '../../services/deviceService';
import toast from 'react-hot-toast';

interface DeviceCardProps {
  device: DeviceRecord;
  uid: string;
  isDemo?: boolean;
  baseLinkPath?: string;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  uid,
  isDemo = false,
  baseLinkPath = '/dashboard/device'
}) => {
  const [updating, setUpdating] = useState<string | null>(null);
  const online = isDeviceOnline(device.last_active);

  const handleToggle = async (
    key: 'silent_mode' | 'quick_settings_block' | 'shutdown_protection',
    newValue: boolean
  ) => {
    setUpdating(key);
    try {
      await updateDeviceToggle(uid, device.device_id, key, newValue, isDemo);
      const label = key === 'silent_mode' 
        ? 'Silent Mode' 
        : key === 'quick_settings_block' 
        ? 'Quick Settings Block' 
        : 'Shutdown Protection';
      toast.success(`${label} ${newValue ? 'Enabled' : 'Disabled'} for ${device.device_name}`);
    } catch {
      toast.error('Failed to sync remote command');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="glass-surface elevate-3d rounded-2xl flex flex-col justify-between overflow-hidden group">
      {/* Card Header with 3D Depth */}
      <div className="p-5 border-b border-slate-200/80 dark:border-white/5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              online 
                ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-400/40 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10' 
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {device.device_name || 'Unnamed Device'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {device.model || 'Unknown'} • Android {device.os_version || 'N/A'}
              </p>
            </div>
          </div>

          {/* Online status tag */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
            online
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Manufacturer and Last Active time */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 font-mono">
          <span>{device.manufacturer || 'N/A'}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTimeAgo(device.last_active)}
          </span>
        </div>
      </div>

      {/* Recessed Neumorphic Toggle Well */}
      <div className="p-4 space-y-2.5 neumorphic-well mx-3 my-3 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Silent Mode</span>
          </div>
          <Toggle
            id={`toggle-silent-${device.device_id}`}
            checked={device.silent_mode}
            onChange={(val) => handleToggle('silent_mode', val)}
            isLoading={updating === 'silent_mode'}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Quick Settings Block</span>
          </div>
          <Toggle
            id={`toggle-qs-${device.device_id}`}
            checked={device.quick_settings_block}
            onChange={(val) => handleToggle('quick_settings_block', val)}
            isLoading={updating === 'quick_settings_block'}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PowerOff className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Shutdown Protection</span>
          </div>
          <Toggle
            id={`toggle-shutdown-${device.device_id}`}
            checked={device.shutdown_protection}
            onChange={(val) => handleToggle('shutdown_protection', val)}
            isLoading={updating === 'shutdown_protection'}
            size="sm"
          />
        </div>
      </div>

      {/* Card Action Link */}
      <div className="p-4 pt-1">
        <Link
          to={`${baseLinkPath}/${device.device_id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-[#00E5FF] dark:hover:text-[#0B0F17] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white transition-all shadow-xs group"
        >
          <span>View Device Console</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
