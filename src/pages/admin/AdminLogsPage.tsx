import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Filter, 
  Smartphone, 
  Radio, 
  BellRing, 
  Clock, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  Wifi, 
  ChevronRight,
  Sparkles,
  Camera
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  formatTimeAgo, 
  subscribeAdminDevices, 
  isDeviceOnline, 
  getTimestampSeconds
} from '../../services/deviceService';
import { DeviceRecord } from '../../types';
import toast from 'react-hot-toast';

export const AdminLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [screenFilter, setScreenFilter] = useState<'all' | 'screen_on' | 'screen_off' | 'siren_active'>('all');
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAdminDevices((incoming) => {
      setDevices(incoming);
      setLoading(false);
      setLastRefreshed(new Date());
    });

    return () => unsubscribe();
  }, []);

  // Filtered devices
  const filteredDevices = devices.filter((dev) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      !searchTerm ||
      (dev.device_name && dev.device_name.toLowerCase().includes(term)) ||
      (dev.model && dev.model.toLowerCase().includes(term)) ||
      (dev.device_id && dev.device_id.toLowerCase().includes(term)) ||
      (dev.current_app_name && dev.current_app_name.toLowerCase().includes(term)) ||
      (dev.current_app_detail && dev.current_app_detail.toLowerCase().includes(term)) ||
      (dev.owner_email && dev.owner_email.toLowerCase().includes(term));

    if (!matchSearch) return false;

    // Screen filter
    if (screenFilter === 'screen_on' && dev.screen_state !== 'on') return false;
    if (screenFilter === 'screen_off' && dev.screen_state === 'on') return false;
    if (screenFilter === 'siren_active' && !dev.siren_active) return false;

    // Online filter
    const isOnline = isDeviceOnline(dev.last_active);
    if (onlineFilter === 'online' && !isOnline) return false;
    if (onlineFilter === 'offline' && isOnline) return false;

    return true;
  });

  const screenOnCount = devices.filter((d) => d.screen_state === 'on').length;
  const sirenActiveCount = devices.filter((d) => d.siren_active).length;
  const onlineCount = devices.filter((d) => isDeviceOnline(d.last_active)).length;

  const exportTelemetryJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(devices, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `antitheft_radar_telemetry_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('Exported Live Telemetry JSON');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] border border-cyan-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Live Activity Radar Rows
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY STREAM
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-sans">
            Real-time accessibility radar displaying active foreground applications, lockscreen state, siren alarms, and hardware heartbeats in direct tabular rows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportTelemetryJson}
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Radar JSON
          </Button>
        </div>
      </div>

      {/* Live Metrics Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Connected Handsets</span>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black font-display text-slate-900 dark:text-white">{devices.length}</p>
            <span className="text-xs font-mono text-emerald-500">{onlineCount} Online</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Screen Active</span>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400">{screenOnCount}</p>
            <span className="text-xs font-mono text-slate-400">of {devices.length} ON</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Siren Alarms</span>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-black font-display ${sirenActiveCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
              {sirenActiveCount}
            </p>
            <span className="text-xs font-mono text-slate-400">{sirenActiveCount > 0 ? 'Blaring' : 'Normal'}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Sync Engine</span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-500">Sub-Second Delta</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search device, active app, owner..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111927] p-1 text-xs font-mono">
            <button
              onClick={() => setScreenFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                screenFilter === 'all'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Screens
            </button>
            <button
              onClick={() => setScreenFilter('screen_on')}
              className={`px-3 py-1 rounded-lg transition-all ${
                screenFilter === 'screen_on'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ● Screen ON ({screenOnCount})
            </button>
            <button
              onClick={() => setScreenFilter('screen_off')}
              className={`px-3 py-1 rounded-lg transition-all ${
                screenFilter === 'screen_off'
                  ? 'bg-slate-700 text-white font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ○ Screen OFF
            </button>
            <button
              onClick={() => setScreenFilter('siren_active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                screenFilter === 'siren_active'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🚨 Siren Active
            </button>
          </div>

          <div className="flex rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111927] p-1 text-xs font-mono">
            <button
              onClick={() => setOnlineFilter('all')}
              className={`px-2.5 py-1 rounded-lg ${onlineFilter === 'all' ? 'bg-cyan-500/20 text-cyan-600 dark:text-[#00E5FF] font-semibold' : 'text-slate-400'}`}
            >
              All Network
            </button>
            <button
              onClick={() => setOnlineFilter('online')}
              className={`px-2.5 py-1 rounded-lg ${onlineFilter === 'online' ? 'bg-emerald-500/20 text-emerald-500 font-semibold' : 'text-slate-400'}`}
            >
              Online Only
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Live Activity Radar Table (Rows Format) */}
      <Card variant="default" className="p-0 overflow-hidden border border-slate-200 dark:border-[#1F2937] shadow-lg">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 font-mono space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
            <p>Connecting to Real-Time Telemetry Stream...</p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="p-16 text-center space-y-3 font-sans">
            <Smartphone className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No devices matched radar filters
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ensure mobile devices have granted Accessibility Service permission to stream foreground applications in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-[#111927] text-slate-500 dark:text-[#94A3B8] border-b border-slate-200 dark:border-[#1F2937]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Android Handset / Node</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Screen State</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Active Foreground App</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Window Detail</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Siren Alarm</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Last Activity</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937]">
                {filteredDevices.map((dev) => {
                  const isOnline = isDeviceOnline(dev.last_active);
                  const isScreenOn = dev.screen_state === 'on';

                  return (
                    <tr 
                      key={dev.device_id}
                      onClick={() => navigate(`/admin/devices/${dev.device_id}`)}
                      className="hover:bg-cyan-50/40 dark:hover:bg-[#162238] transition-colors cursor-pointer group"
                    >
                      {/* Device & Hardware Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span 
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#111927] ${
                                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`} 
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF] transition-colors text-sm font-heading">
                                {dev.device_name || dev.model}
                              </span>
                              {dev.manufacturer && (
                                <span className="text-[10px] text-slate-400 uppercase font-mono">
                                  {dev.manufacturer}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-mono">{dev.device_id.slice(0, 14)}...</span>
                              {dev.owner_email && (
                                <span>• {dev.owner_email.split('@')[0]}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Screen State */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                          isScreenOn
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isScreenOn ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                          {isScreenOn ? 'SCREEN ON' : 'SCREEN OFF'}
                        </span>
                      </td>

                      {/* Foreground App Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 dark:bg-cyan-950/60 text-cyan-700 dark:text-[#00E5FF] border border-cyan-500/20 font-semibold max-w-[170px] truncate" title={dev.current_app_name}>
                            {dev.current_app_name || 'System Launcher'}
                          </span>
                        </div>
                      </td>

                      {/* Active Window Detail */}
                      <td className="py-3.5 px-4 whitespace-nowrap max-w-xs">
                        <span className="text-slate-600 dark:text-slate-300 truncate block text-[11px]" title={dev.current_app_detail}>
                          {dev.current_app_detail || '—'}
                        </span>
                      </td>

                      {/* Siren Alarm */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {dev.siren_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold animate-pulse">
                            <BellRing className="w-3.5 h-3.5 animate-bounce" />
                            SIREN BLARING
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">
                            Muted
                          </span>
                        )}
                      </td>

                      {/* Last Activity Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatTimeAgo(dev.last_activity_time || dev.last_active)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <Button
                            onClick={() => navigate(`/admin/devices/${dev.device_id}`)}
                            variant="cyan"
                            size="sm"
                            className="text-[11px] py-1 px-3 h-7"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
