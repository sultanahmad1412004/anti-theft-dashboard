import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  Search, 
  RefreshCw, 
  Filter,
  ChevronRight,
  Shield,
  User,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchAdminDevices, 
  subscribeAdminDevices,
  isDeviceOnline, 
  formatTimeAgo, 
  formatTimestampDate 
} from '../../services/deviceService';
import { DeviceRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

export const AdminDevicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDevices(isDemoMode);
      setDevices(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fleet devices');
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
    const matchesSearch =
      (d.device_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.device_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.owner_email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const online = isDeviceOnline(d.last_active);
    if (statusFilter === 'online') return matchesSearch && online;
    if (statusFilter === 'offline') return matchesSearch && !online;
    return matchesSearch;
  });

  const onlineCount = devices.filter((d) => isDeviceOnline(d.last_active)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Hardware Fleet Directory
            </h1>
            <Badge variant="cyan" size="sm">
              {devices.length} Handsets
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Global registered Android devices linked to Firebase Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadDevices}
            isLoading={loading}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Fleet
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">TOTAL REGISTERED</span>
          <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
            {devices.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ONLINE NOW</span>
          <p className="text-2xl font-extrabold font-heading text-emerald-600 dark:text-[#10B981] mt-1 flex items-center gap-2">
            <span>{onlineCount}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">OFFLINE SLEEP</span>
          <p className="text-2xl font-extrabold font-heading text-slate-500 dark:text-slate-400 mt-1">
            {devices.length - onlineCount}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search device name, model, UID, owner..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
          >
            <option value="all">All Devices</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
          </select>
        </div>
      </div>

      {/* Clean Devices Table — No GPS coordinates or toggle clutter in rows */}
      <Card variant="default" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : filteredDevices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A0F1D] text-slate-600 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#1F2937]">
                <tr>
                  <th className="p-4 font-semibold">Device / Hardware</th>
                  <th className="p-4 font-semibold">Owner Account</th>
                  <th className="p-4 font-semibold">Status / Heartbeat</th>
                  <th className="p-4 font-semibold">Registered</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937] text-slate-800 dark:text-[#E2E8F0]">
                {filteredDevices.map((d) => {
                  const online = isDeviceOnline(d.last_active);

                  return (
                    <tr 
                      key={d.device_id} 
                      onClick={() => navigate(`/admin/devices/${d.device_id}`)}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      {/* Device Hardware */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                            online 
                              ? 'bg-cyan-500/15 text-cyan-600 dark:text-[#00E5FF] border border-cyan-500/30' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}>
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF] transition-colors text-sm">
                              {d.device_name}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono mt-0.5">
                              {d.manufacturer || 'Android'} {d.model || ''} • OS {d.os_version || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owner Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{d.owner_email || d.owner_uid || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Status / Ping */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge variant={online ? 'success' : 'neutral'} pulse={online} size="sm">
                            {online ? 'Online' : 'Offline'}
                          </Badge>
                          <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono">
                            {formatTimeAgo(d.last_active)}
                          </p>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="p-4 font-mono text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        {formatTimeAgo(d.registered_at)}
                      </td>

                      {/* Manage Button */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/admin/devices/${d.device_id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-[#00E5FF] dark:hover:text-[#0B0F17] text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 text-xs font-semibold transition-all shadow-xs"
                        >
                          <span>Manage Device</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            No devices matching criteria.
          </div>
        )}
      </Card>
    </div>
  );
};
