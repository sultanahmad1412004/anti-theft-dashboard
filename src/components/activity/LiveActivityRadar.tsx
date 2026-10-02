import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Smartphone, 
  Radio, 
  Volume2, 
  ShieldAlert, 
  ExternalLink, 
  Search, 
  Layers, 
  Monitor, 
  Zap,
  Battery,
  MapPin,
  Clock
} from 'lucide-react';
import { DeviceRecord } from '../../types';
import { formatTimeAgo, isDeviceOnline } from '../../services/deviceService';
import { Badge } from '../common/Badge';

interface LiveActivityRadarProps {
  devices: DeviceRecord[];
  compact?: boolean;
  className?: string;
}

export const LiveActivityRadar: React.FC<LiveActivityRadarProps> = ({
  devices,
  compact = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<'all' | 'screen_on' | 'siren' | 'active_app'>('all');
  const [search, setSearch] = useState('');

  const filtered = devices.filter((dev) => {
    const isScreenOn = dev.screen_state === 'on';
    const hasSiren = Boolean(dev.siren_active);
    const hasApp = Boolean(dev.current_app_name && dev.current_app_name.trim() !== '');

    if (filterMode === 'screen_on' && !isScreenOn) return false;
    if (filterMode === 'siren' && !hasSiren) return false;
    if (filterMode === 'active_app' && !hasApp) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (dev.device_name || '').toLowerCase().includes(q);
      const matchModel = (dev.model || '').toLowerCase().includes(q);
      const matchApp = (dev.current_app_name || '').toLowerCase().includes(q);
      const matchDetail = (dev.current_app_detail || '').toLowerCase().includes(q);
      return matchName || matchModel || matchApp || matchDetail;
    }
    return true;
  });

  const screenOnCount = devices.filter((d) => d.screen_state === 'on').length;
  const sirenCount = devices.filter((d) => d.siren_active).length;
  const activeAppCount = devices.filter((d) => d.current_app_name).length;

  return (
    <div className={`p-5 rounded-3xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-[#252B3D] shadow-xl space-y-4 ${className}`}>
      {/* Top Header with live pulsing radar ring */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-[#1F2937]">
        <div className="flex items-center gap-3">
          {/* Animated Radar Pulse Icon */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 shrink-0">
            <span className="absolute w-8 h-8 rounded-full border border-emerald-400/40 animate-ping pointer-events-none" />
            <Activity className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Live Activity Radar
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                REAL-TIME STREAM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Sub-second Accessibility telemetry: active app names, foreground windows &amp; screen power state.
            </p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1A2234] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
            <strong className="text-emerald-500">{screenOnCount}</strong> Screen ON
          </span>
          {sirenCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold animate-pulse">
              🚨 {sirenCount} Siren Blaring
            </span>
          )}
        </div>
      </div>

      {/* Filter / Search Bar (if not super compact) */}
      {!compact && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-[#131826] p-1 rounded-xl border border-slate-200 dark:border-[#252B3D]">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Nodes ({devices.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('screen_on')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterMode === 'screen_on'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Screen ON ({screenOnCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('active_app')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterMode === 'active_app'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Foreground App ({activeAppCount})
            </button>
            {sirenCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode('siren')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterMode === 'siren'
                    ? 'bg-rose-600 text-white shadow-xs font-semibold'
                    : 'text-rose-500 hover:text-rose-700'
                }`}
              >
                Siren Active ({sirenCount})
              </button>
            )}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search app or device..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#252B3D] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Grid of Live Device Activity Cards */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filtered.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-mono space-y-1">
            <Smartphone className="w-6 h-6 mx-auto text-slate-400 opacity-60" />
            <p>No matching active hardware nodes reporting telemetry</p>
          </div>
        ) : (
          filtered.slice(0, compact ? 5 : 12).map((dev) => {
            const isScreenOn = dev.screen_state === 'on';
            const online = isDeviceOnline(dev.last_active);
            const isSiren = Boolean(dev.siren_active);

            return (
              <div
                key={dev.device_id}
                onClick={() => navigate(`/admin/devices/${dev.device_id}`)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group shadow-xs space-y-2.5 relative overflow-hidden ${
                  isSiren
                    ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/50 hover:border-rose-400 shadow-rose-500/10'
                    : isScreenOn
                    ? 'bg-emerald-500/5 dark:bg-[#131C2D]/70 border-emerald-500/30 hover:border-cyan-500/60'
                    : 'bg-white dark:bg-[#131826]/80 border-slate-200 dark:border-[#252B3D] hover:border-cyan-500/50'
                }`}
              >
                {/* Top Row: Device Name & Screen State */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <Smartphone className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isSiren ? 'text-rose-500 animate-bounce' : isScreenOn ? 'text-emerald-500' : 'text-slate-400'
                    }`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF] transition-colors">
                      {dev.device_name || dev.model || 'Android Handset'}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    isScreenOn
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {isScreenOn ? '● SCREEN ON' : '○ SCREEN OFF'}
                  </span>
                </div>

                {/* Foreground Application & Window Detail Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200/60 dark:border-white/5 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Foreground:</span>
                    <span className="font-bold text-cyan-600 dark:text-[#00E5FF] truncate max-w-[180px]" title={dev.current_app_name}>
                      {dev.current_app_name || 'System Home Screen'}
                    </span>
                  </div>

                  {dev.current_app_detail && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate pt-0.5 border-t border-slate-200/40 dark:border-white/5" title={dev.current_app_detail}>
                      ↳ {dev.current_app_detail}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Hardware specs, siren status, ping */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-2 truncate">
                    {isSiren && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold animate-pulse text-[9px]">
                        SIREN ON
                      </span>
                    )}
                    <span>{dev.manufacturer} {dev.model}</span>
                  </div>
                  <span className="shrink-0">{formatTimeAgo(dev.last_active)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
