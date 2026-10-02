import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Smartphone, 
  Trash2, 
  Filter, 
  CalendarPlus, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Edit3,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchAdminUsers, 
  fetchAdminDevices,
  subscribeAdminUsers,
  subscribeAdminDevices,
  updateUserSubscription, 
  deleteUserRecord, 
  formatTimeAgo,
  getTimestampSeconds,
  adminUpdateUser
} from '../../services/deviceService';
import { UserProfile, DeviceRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allDevices, setAllDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, filter, sort, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'subscribed' | 'free' | 'has_devices' | 'no_devices'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'devices_count'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editSub, setEditSub] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadUsersAndDevices = async () => {
    setLoading(true);
    try {
      const [userData, deviceData] = await Promise.all([
        fetchAdminUsers(isDemoMode),
        fetchAdminDevices(isDemoMode)
      ]);
      setUsers(userData);
      setAllDevices(deviceData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubUsers = subscribeAdminUsers((liveUsers) => {
      setUsers(liveUsers);
      setLoading(false);
    }, isDemoMode);

    const unsubDevices = subscribeAdminDevices((liveDevices) => {
      setAllDevices(liveDevices);
    }, isDemoMode);

    return () => {
      unsubUsers();
      unsubDevices();
    };
  }, [isDemoMode]);

  // Map devices per user
  const getUserDeviceCount = (uid: string) => {
    return allDevices.filter(d => d.owner_uid === uid || d.device_id.startsWith(uid.slice(0, 5))).length;
  };

  // Quick Extend Subscription (+30 or +365 days)
  const handleExtendSubscription = async (user: UserProfile, daysToAdd: number) => {
    try {
      const currentEndSec = getTimestampSeconds(user.subscription_end) || Math.floor(Date.now() / 1000);
      const baseSec = Math.max(currentEndSec, Math.floor(Date.now() / 1000));
      const newEndSec = baseSec + (daysToAdd * 86400);

      await adminUpdateUser(user.uid, {
        subscription: true,
        subscription_end: { seconds: newEndSec, nanoseconds: 0 }
      });

      setUsers(prev => prev.map(u => {
        if (u.uid === user.uid) {
          return {
            ...u,
            subscription: true,
            subscription_end: { seconds: newEndSec, nanoseconds: 0 }
          };
        }
        return u;
      }));

      toast.success(`Extended subscription by +${daysToAdd} days for ${user.email}`);
    } catch {
      toast.error('Failed to extend subscription');
    }
  };

  const handleOpenEdit = (user: UserProfile) => {
    setUserToEdit(user);
    setEditName(user.full_name || '');
    setEditSub(Boolean(user.subscription));
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!userToEdit) return;
    setIsSavingEdit(true);
    try {
      await adminUpdateUser(userToEdit.uid, {
        full_name: editName,
        subscription: editSub
      });
      setUsers(prev => prev.map(u => u.uid === userToEdit.uid ? { ...u, full_name: editName, subscription: editSub } : u));
      toast.success('User updated successfully');
      setEditModalOpen(false);
    } catch {
      toast.error('Failed to update user');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUserRecord(userToDelete.uid, isDemoMode);
      setUsers((prev) => prev.filter((u) => u.uid !== userToDelete.uid));
      setAllDevices(prev => prev.filter(d => d.owner_uid !== userToDelete.uid));
      toast.success(`User ${userToDelete.email} and all linked devices deleted (Cascade)`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const devCount = getUserDeviceCount(u.uid);
    if (filterType === 'subscribed') return Boolean(u.subscription);
    if (filterType === 'free') return !u.subscription;
    if (filterType === 'has_devices') return devCount > 0;
    if (filterType === 'no_devices') return devCount === 0;
    return true;
  });

  // Sort logic
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'newest') {
      const secA = getTimestampSeconds(a.createdAt) || 0;
      const secB = getTimestampSeconds(b.createdAt) || 0;
      return secB - secA;
    }
    if (sortBy === 'oldest') {
      const secA = getTimestampSeconds(a.createdAt) || 0;
      const secB = getTimestampSeconds(b.createdAt) || 0;
      return secA - secB;
    }
    if (sortBy === 'name_asc') {
      return (a.full_name || a.email).localeCompare(b.full_name || b.email);
    }
    if (sortBy === 'devices_count') {
      return getUserDeviceCount(b.uid) - getUserDeviceCount(a.uid);
    }
    return 0;
  });

  // Pagination logic (20 per page)
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Users Directory
            </h1>
            <Badge variant="cyan" size="sm">
              {users.length} Total Users
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-mono">
            Direct cascade CRUD controls, subscription overrides, and hardware device linking.
          </p>
        </div>

        <Button
          onClick={loadUsersAndDevices}
          isLoading={loading}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Roster
        </Button>
      </div>

      {/* Filter, Search, and Sort Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, or UID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <select
            value={filterType}
            onChange={(e: any) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] focus:outline-none focus:border-red-500 cursor-pointer font-mono"
          >
            <option value="all">All Users</option>
            <option value="subscribed">Subscribed (Pro $1/yr)</option>
            <option value="free">Free Tier</option>
            <option value="has_devices">Has Devices (&gt; 0)</option>
            <option value="no_devices">No Devices</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3 h-3" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-900 dark:text-[#E2E8F0] focus:outline-none focus:border-red-500 cursor-pointer font-mono"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="devices_count">Device Count (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card variant="default" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A0F1D] text-slate-600 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#1F2937]">
                <tr>
                  <th className="p-3.5 font-semibold">Avatar</th>
                  <th className="p-3.5 font-semibold">Name / Email</th>
                  <th className="p-3.5 font-semibold">Subscription</th>
                  <th className="p-3.5 font-semibold">Devices</th>
                  <th className="p-3.5 font-semibold">Created At</th>
                  <th className="p-3.5 font-semibold">Last Active</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937] text-slate-800 dark:text-[#E2E8F0]">
                {paginatedUsers.map((u) => {
                  const devCount = getUserDeviceCount(u.uid);
                  const createdStr = u.createdAt ? new Date((getTimestampSeconds(u.createdAt) || 0) * 1000).toLocaleDateString() : 'N/A';
                  return (
                    <tr 
                      key={u.uid} 
                      onClick={() => navigate(`/admin/users/${u.uid}`)}
                      className="hover:bg-cyan-50/60 dark:hover:bg-cyan-950/25 transition-all cursor-pointer group"
                      title="Click to view full user profile"
                    >
                      {/* Avatar */}
                      <td className="p-3.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/40 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">
                          {(u.full_name || u.email)[0].toUpperCase()}
                        </div>
                      </td>

                      {/* Name / Email */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-[#E2E8F0] group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF] transition-colors flex items-center gap-1.5">
                          <span className="group-hover:underline">{u.full_name || 'Mobile User'}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity" />
                        </div>
                        <p className="text-slate-500 dark:text-[#94A3B8] font-mono text-[11px]">{u.email}</p>
                      </td>

                      {/* Subscription Badge */}
                      <td className="p-3.5">
                        <Badge variant={u.subscription ? 'success' : 'neutral'} size="sm">
                          {u.subscription ? 'Pro ($1/yr)' : 'Free Tier'}
                        </Badge>
                      </td>

                      {/* Device Count */}
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <Smartphone className="w-3 h-3 text-cyan-600 dark:text-[#00E5FF]" />
                          {devCount}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8] font-mono text-[11px]">
                        {createdStr}
                      </td>

                      {/* Last Active */}
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8] font-mono text-[11px]">
                        {formatTimeAgo(u.subscription_start || u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {/* View */}
                          <Link
                            to={`/admin/users/${u.uid}`}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors"
                            title="View Full Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit Modal */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(u);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Extend +30d */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtendSubscription(u, 30);
                            }}
                            className="px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                            title="Extend Subscription +30 Days"
                          >
                            +30d
                          </button>

                          {/* Quick Extend +365d */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtendSubscription(u, 365);
                            }}
                            className="px-1.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                            title="Extend Subscription +365 Days"
                          >
                            +1yr
                          </button>

                          {/* Delete cascade */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(u);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Delete User (Cascade)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            No users matching criteria.
          </div>
        )}

        {/* Pagination (20 per page) */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 dark:border-[#1F2937] flex items-center justify-between text-xs text-slate-600 dark:text-[#94A3B8] font-mono">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {currentPage} / {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User Profile"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-[#94A3B8] font-mono mb-1">Email Address</label>
            <input
              type="text"
              readOnly
              value={userToEdit?.email || ''}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-900 dark:text-[#E2E8F0] font-mono mb-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-[#E2E8F0] focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-semibold text-slate-900 dark:text-[#E2E8F0]">Pro Subscription Status</p>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Grants unlimited screenshots & remote telemetry</p>
            </div>
            <input
              type="checkbox"
              checked={editSub}
              onChange={(e) => setEditSub(e.target.checked)}
              className="w-4 h-4 accent-red-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSavingEdit}
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cascade Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User Record (Cascade)"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-[#94A3B8]">
          <p>
            Are you sure you want to delete user account <strong className="text-slate-900 dark:text-white">{userToDelete?.email}</strong> (UID: {userToDelete?.uid})?
          </p>
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300 space-y-1">
            <p className="font-bold">⚠️ CASCADE DELETION WARNING:</p>
            <p>
              This will permanently delete the user document from <span className="font-mono">users/{userToDelete?.uid}</span> AND cascade delete all associated devices in its subcollection.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#334155]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={confirmDeleteUser}
            >
              Confirm Cascade Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
