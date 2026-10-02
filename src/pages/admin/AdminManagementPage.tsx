import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  Crown, 
  ShieldCheck, 
  Mail, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminRecord } from '../../types';
import { 
  fetchAdmins, 
  createAdminViaSecondaryApp, 
  removeAdmin, 
  updateAdminStatus 
} from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

export const AdminManagementPage: React.FC = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Admin Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'superadmin'>('admin');
  const [creating, setCreating] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<AdminRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await fetchAdmins();
      setAdmins(data);
    } catch {
      toast.error('Failed to load administrator list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      toast.error('Please enter both email and password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreating(true);
    try {
      const created = await createAdminViaSecondaryApp(
        newEmail,
        newPassword,
        newRole,
        currentUser?.uid || 'superadmin'
      );
      toast.success(`Admin account for ${created.email} provisioned with role "${created.role}"`);
      setIsAddOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('admin');
      loadAdmins();
    } catch (err: any) {
      console.error('Create admin error:', err);
      toast.error(err?.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.uid === currentUser?.uid) {
      toast.error('You cannot delete your own active administrator account');
      return;
    }

    setDeleting(true);
    try {
      await removeAdmin(deleteTarget.uid);
      toast.success(`Revoked admin privileges for ${deleteTarget.email}`);
      setDeleteTarget(null);
      loadAdmins();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove admin');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (admin: AdminRecord) => {
    if (admin.uid === currentUser?.uid) {
      toast.error('You cannot deactivate your own account');
      return;
    }
    const newStatus = !admin.isActive;
    try {
      await updateAdminStatus(admin.uid, newStatus);
      toast.success(`Admin status updated for ${admin.email}`);
      setAdmins(prev => prev.map(a => a.uid === admin.uid ? { ...a, isActive: newStatus } : a));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase()) ||
    a.uid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-red-950 via-slate-900 to-amber-950 border border-red-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-red-500 via-amber-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 shrink-0">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  Admin Dashboard: Administrator Management
                </h1>
                <Badge variant="danger" size="sm">
                  Super Admin Only
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Create and revoke privileged dashboard administrator access stored securely in <code className="font-mono text-amber-300">admins/&#123;uid&#125;</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdmins}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
            >
              Add New Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Statistics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email, role, or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#161D2F] border border-slate-200 dark:border-[#252B3D] text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Total Admins: <strong className="text-slate-900 dark:text-white">{admins.length}</strong></span>
          <span>•</span>
          <span>Super Admins: <strong className="text-amber-500">{admins.filter(a => a.role === 'superadmin').length}</strong></span>
        </div>
      </div>

      {/* Admin List Table */}
      <Card variant="default" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-12 p-4">
            <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Administrator Records Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Add your first secondary administrator or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#161D2F] border-b border-slate-200 dark:border-[#252B3D] text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Role Clearance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">UID / Added By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredAdmins.map((adm) => {
                  const isCurrent = adm.uid === currentUser?.uid;
                  return (
                    <tr key={adm.uid} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            adm.role === 'superadmin' 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/30'
                          }`}>
                            {adm.role === 'superadmin' ? <Crown className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </div>
                          <div>
                            <span>{adm.email}</span>
                            {isCurrent && (
                              <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                                Current Session
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={adm.role === 'superadmin' ? 'warning' : 'danger'} size="sm">
                          {adm.role === 'superadmin' ? 'SUPER ADMIN (FULL)' : 'ADMIN (LIMITED)'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(adm)}
                          disabled={isCurrent}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-colors ${
                            adm.isActive
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                          } ${isCurrent ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          title={isCurrent ? 'Cannot deactivate self' : 'Click to toggle status'}
                        >
                          {adm.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {adm.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <div title={adm.uid}>
                          {adm.uid.substring(0, 10)}...
                        </div>
                        <div className="text-[10px] text-slate-400">
                          by: {adm.addedBy ? adm.addedBy.substring(0, 8) : 'system'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isCurrent}
                          onClick={() => setDeleteTarget(adm)}
                          className="px-2.5 py-1 text-xs"
                          title={isCurrent ? 'Cannot delete self' : 'Revoke admin access'}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Admin Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161D2F] border border-slate-200 dark:border-[#252B3D] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Provision New Admin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Creates Firebase Auth credentials & stores in <code className="text-red-400">admins/&#123;uid&#125;</code>.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-[#252B3D] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Secure Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-[#252B3D] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role Clearance Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                    newRole === 'admin'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-200 dark:border-[#252B3D] hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={newRole === 'admin'}
                      onChange={() => setNewRole('admin')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                      Admin (Standard)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      View all telemetry, users, devices, and send remote commands.
                    </span>
                  </label>

                  <label className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                    newRole === 'superadmin'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-200 dark:border-[#252B3D] hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="superadmin"
                      checked={newRole === 'superadmin'}
                      onChange={() => setNewRole('superadmin')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      Super Admin
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Privileged Admin access: Danger zone, raw Firestore editor, and manage admins.
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={creating}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Provision Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161D2F] border border-slate-200 dark:border-[#252B3D] rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
              Revoke Administrator Access?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{deleteTarget.email}</strong> from the <code className="text-red-400">admins</code> collection? They will lose all admin clearance.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRemoveAdmin}
                isLoading={deleting}
                className="bg-red-600 text-white"
              >
                Confirm Revoke
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
