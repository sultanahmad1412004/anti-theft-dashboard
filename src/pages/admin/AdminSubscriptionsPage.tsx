import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  DollarSign, 
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchAdminUsers, 
  subscribeAdminUsers,
  updateUserSubscription 
} from '../../services/deviceService';
import { UserProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

export const AdminSubscriptionsPage: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers(isDemoMode);
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAdminUsers((liveUsers) => {
      setUsers(liveUsers);
      setLoading(false);
    }, isDemoMode);

    return () => unsubscribe();
  }, [isDemoMode]);

  const handleToggleSub = async (user: UserProfile) => {
    const newStatus = !user.subscription;
    try {
      await updateUserSubscription(user.uid, newStatus, isDemoMode);
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, subscription: newStatus } : u))
      );
      toast.success(`User subscription updated to ${newStatus ? 'PRO' : 'FREE'}`);
    } catch {
      toast.error('Failed to modify subscription status');
    }
  };

  const proCount = users.filter((u) => u.subscription).length;
  const totalRevenue = proCount * 1.0;

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Subscription & License Revenue
            </h1>
            <Badge variant="cyan" size="sm">
              $1.00 / User / Year
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Track paid licenses, annual renewals, and grant administrative licenses.
          </p>
        </div>

        <Button
          onClick={loadUsers}
          isLoading={loading}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Subscriptions
        </Button>
      </div>

      {/* Revenue Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">ANNUAL RUN RATE (ARR)</span>
          <p className="text-3xl font-extrabold font-heading text-emerald-600 dark:text-[#10B981] mt-1">
            ${loading ? '—' : totalRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Based on $1.00/yr per Pro account</p>
        </Card>

        <Card variant="default" className="p-5 border-l-4 border-l-cyan-500">
          <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">ACTIVE PRO SUBSCRIBERS</span>
          <p className="text-3xl font-extrabold font-heading text-cyan-600 dark:text-[#00E5FF] mt-1">
            {loading ? '—' : proCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {users.length > 0 ? ((proCount / users.length) * 100).toFixed(0) : 0}% fleet conversion
          </p>
        </Card>

        <Card variant="default" className="p-5 border-l-4 border-l-slate-400 dark:border-l-slate-600">
          <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">FREE BASIC ACCOUNTS</span>
          <p className="text-3xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0] mt-1">
            {loading ? '—' : users.length - proCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Eligible for 1-click Pro upgrade</p>
        </Card>
      </div>

      {/* Search Filter */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search subscriber by email or name..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Subscribers Table */}
      <Card variant="default" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A0F1D] text-slate-600 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#1F2937]">
                <tr>
                  <th className="p-4 font-semibold">Subscriber Account</th>
                  <th className="p-4 font-semibold">Current Tier</th>
                  <th className="p-4 font-semibold">Annual Fee</th>
                  <th className="p-4 font-semibold">Next Renewal</th>
                  <th className="p-4 font-semibold text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937] text-slate-800 dark:text-[#E2E8F0]">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 dark:text-[#E2E8F0]">{u.full_name || 'Mobile App User'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono">{u.email}</p>
                    </td>

                    <td className="p-4">
                      <Badge variant={u.subscription ? 'cyan' : 'neutral'} size="sm">
                        {u.subscription ? 'Pro Plan ($1/yr)' : 'Basic Free Tier'}
                      </Badge>
                    </td>

                    <td className="p-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {u.subscription ? '$1.00' : '$0.00'}
                    </td>

                    <td className="p-4 text-slate-500 dark:text-[#94A3B8] font-mono text-[11px]">
                      {u.subscription ? 'Sept 2027 (Active)' : 'N/A'}
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        onClick={() => handleToggleSub(u)}
                        variant={u.subscription ? 'outline' : 'cyan'}
                        size="sm"
                      >
                        {u.subscription ? 'Revoke Pro' : 'Grant Pro ($1/Yr)'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            No subscribers found matching filter.
          </div>
        )}
      </Card>
    </div>
  );
};
