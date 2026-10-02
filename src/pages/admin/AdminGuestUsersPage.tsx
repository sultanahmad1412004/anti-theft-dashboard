import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  RefreshCw, 
  Search, 
  Clock, 
  Trash2, 
  ShieldAlert, 
  Calendar,
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchAdminGuestUsers, 
  subscribeAdminGuestUsers, 
  formatTimeAgo 
} from '../../services/deviceService';
import { GuestUserRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

export const AdminGuestUsersPage: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [guests, setGuests] = useState<GuestUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadGuests = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminGuestUsers(isDemoMode);
      setGuests(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch guest sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAdminGuestUsers((liveGuests) => {
      setGuests(liveGuests);
      setLoading(false);
    }, isDemoMode);

    return () => unsubscribe();
  }, [isDemoMode]);

  const filteredGuests = guests.filter(
    (g) =>
      (g.guest_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.device_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.device_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Guest Users & Devices
            </h1>
            <Badge variant="cyan" size="sm">
              {guests.length} Registered
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Real-time Firestore records from the <code className="font-mono text-cyan-600 dark:text-[#00E5FF]">guest_users</code> collection.
          </p>
        </div>

        <Button
          onClick={loadGuests}
          isLoading={loading}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Guests
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search device name, ID, model..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Guest Table */}
      <Card variant="default" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : filteredGuests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A0F1D] text-slate-600 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#1F2937]">
                <tr>
                  <th className="p-4 font-semibold">Device</th>
                  <th className="p-4 font-semibold">Device ID</th>
                  <th className="p-4 font-semibold">OS Version</th>
                  <th className="p-4 font-semibold">Quick Settings Block</th>
                  <th className="p-4 font-semibold">Last Active</th>
                  <th className="p-4 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937] text-slate-800 dark:text-[#E2E8F0]">
                {filteredGuests.map((g) => (
                  <tr key={g.guest_id || g.device_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <div>
                        <span className="font-bold">{g.device_name || g.model || 'Unknown Device'}</span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {g.manufacturer ? `${g.manufacturer} • ` : ''}{g.model || ''}
                        </p>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-cyan-600 dark:text-[#00E5FF]">
                      {g.device_id || g.guest_id}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {g.os_version || 'Android'}
                    </td>

                    <td className="p-4">
                      <Badge variant={g.quick_settings_block ? 'success' : 'neutral'} size="sm">
                        {g.quick_settings_block ? 'Curtain Locked' : 'Unlocked'}
                      </Badge>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-500 dark:text-[#94A3B8]">
                      {formatTimeAgo(g.last_active)}
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      {g.location?.latitude && g.location?.longitude ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {g.location.latitude.toFixed(4)}, {g.location.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-slate-400">No Fix</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            No guest users currently registered in Firestore.
          </div>
        )}
      </Card>
    </div>
  );
};
