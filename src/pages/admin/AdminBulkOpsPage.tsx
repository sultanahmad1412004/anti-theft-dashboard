import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Users, 
  Smartphone, 
  CheckSquare, 
  Square, 
  Trash2, 
  CreditCard, 
  Bell, 
  ShieldAlert, 
  Radio, 
  Camera, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { 
  fetchAdminUsers, 
  fetchAdminDevices, 
  isDeviceOnline,
  formatTimeAgo 
} from '../../services/deviceService';
import { 
  bulkSetSubscription, 
  bulkSendCommandToDevices, 
  bulkDeleteUsers, 
  bulkDeleteDevices 
} from '../../services/adminService';
import { UserProfile, DeviceRecord } from '../../types';
import toast from 'react-hot-toast';

export const AdminBulkOpsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'devices'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Selected sets
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(new Set());

  // Confirm modals
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const [dangerAction, setDangerAction] = useState<'delete_users' | 'delete_devices' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, d] = await Promise.all([
        fetchAdminUsers(false),
        fetchAdminDevices(false)
      ]);
      setUsers(u);
      setDevices(d);
    } catch (e) {
      toast.error('Failed to load fleet & user lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered views
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDevices = devices.filter(d => 
    d.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.device_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection toggle helpers
  const toggleSelectUser = (uid: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const toggleSelectAllUsers = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.uid)));
    }
  };

  const toggleSelectDevice = (deviceId: string) => {
    setSelectedDeviceIds(prev => {
      const next = new Set(prev);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  };

  const toggleSelectAllDevices = () => {
    if (selectedDeviceIds.size === filteredDevices.length) {
      setSelectedDeviceIds(new Set());
    } else {
      setSelectedDeviceIds(new Set(filteredDevices.map(d => d.device_id)));
    }
  };

  // Bulk Actions for Users
  const handleBulkSubscription = async (grant: boolean) => {
    if (selectedUserIds.size === 0) return;
    setIsProcessing(true);
    try {
      const count = await bulkSetSubscription(Array.from(selectedUserIds), grant);
      toast.success(`Updated ${count} user(s) to ${grant ? 'PRO' : 'FREE'}`);
      loadData();
    } catch {
      toast.error('Bulk subscription update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportUsers = (format: 'json' | 'csv') => {
    const selected = users.filter(u => selectedUserIds.has(u.uid));
    if (selected.length === 0) {
      toast.error('No users selected');
      return;
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `users_export_${Date.now()}.json`);
    } else {
      const headers = ['uid', 'email', 'full_name', 'subscription'];
      const rows = selected.map(u => [u.uid, u.email, u.full_name || '', u.subscription ? 'PRO' : 'FREE']);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `users_export_${Date.now()}.csv`);
    }
    toast.success(`Exported ${selected.length} user(s)`);
  };

  // Bulk Actions for Devices
  const handleBulkDeviceCommand = async (cmd: 'ring' | 'lock' | 'track' | 'screenshot') => {
    if (selectedDeviceIds.size === 0) return;
    setIsProcessing(true);
    const targets = devices
      .filter(d => selectedDeviceIds.has(d.device_id))
      .map(d => ({ owner_uid: d.owner_uid, device_id: d.device_id }));

    try {
      const count = await bulkSendCommandToDevices(targets, cmd);
      toast.success(`Dispatched ${cmd.toUpperCase()} to ${count} device(s)`);
      loadData();
    } catch {
      toast.error(`Command ${cmd} failed`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportDevices = (format: 'json' | 'csv') => {
    const selected = devices.filter(d => selectedDeviceIds.has(d.device_id));
    if (selected.length === 0) {
      toast.error('No devices selected');
      return;
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `devices_export_${Date.now()}.json`);
    } else {
      const headers = ['device_id', 'device_name', 'model', 'battery_level', 'owner_uid'];
      const rows = selected.map(d => [d.device_id, d.device_name, d.model, d.battery_level ?? '', d.owner_uid]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `devices_export_${Date.now()}.csv`);
    }
    toast.success(`Exported ${selected.length} device(s)`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Danger Confirm Action
  const executeDangerDelete = async () => {
    setIsProcessing(true);
    try {
      if (dangerAction === 'delete_users') {
        const count = await bulkDeleteUsers(Array.from(selectedUserIds));
        toast.success(`Cascade deleted ${count} user(s)`);
        setSelectedUserIds(new Set());
      } else if (dangerAction === 'delete_devices') {
        const targets = devices
          .filter(d => selectedDeviceIds.has(d.device_id))
          .map(d => ({ owner_uid: d.owner_uid, device_id: d.device_id }));
        const count = await bulkDeleteDevices(targets);
        toast.success(`Deleted ${count} device(s)`);
        setSelectedDeviceIds(new Set());
      }
      setDangerModalOpen(false);
      setDangerAction(null);
      loadData();
    } catch {
      toast.error('Bulk deletion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Fleet Bulk Operations Engine
            </h1>
            <Badge variant="amber" size="sm">Multi-Doc Ops</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-mono">
            Execute batch modifications across multiple users and hardware nodes simultaneously.
          </p>
        </div>

        <Button
          onClick={loadData}
          isLoading={loading}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Lists
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab('users');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Target Users ({users.length})</span>
            {selectedUserIds.size > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-900 text-blue-200 text-[10px]">
                {selectedUserIds.size}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('devices');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Target Devices ({devices.length})</span>
            {selectedDeviceIds.size > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-900 text-cyan-200 text-[10px]">
                {selectedDeviceIds.size}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Action Toolbar for Selected Items */}
      {activeTab === 'users' ? (
        <Card variant="default" className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAllUsers}
              className="text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              {selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
              <span>Select All ({selectedUserIds.size} selected)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={selectedUserIds.size === 0 || isProcessing}
              onClick={() => handleBulkSubscription(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" /> Grant Pro ($1/yr)
            </button>

            <button
              disabled={selectedUserIds.size === 0 || isProcessing}
              onClick={() => handleBulkSubscription(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              Revoke Pro
            </button>

            <button
              disabled={selectedUserIds.size === 0}
              onClick={() => handleExportUsers('json')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono disabled:opacity-40 cursor-pointer"
              title="Export Selected JSON"
            >
              JSON
            </button>

            <button
              disabled={selectedUserIds.size === 0}
              onClick={() => handleExportUsers('csv')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono disabled:opacity-40 cursor-pointer"
              title="Export Selected CSV"
            >
              CSV
            </button>

            <button
              disabled={selectedUserIds.size === 0 || isProcessing}
              onClick={() => {
                setDangerAction('delete_users');
                setDangerModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedUserIds.size})
            </button>
          </div>
        </Card>
      ) : (
        <Card variant="default" className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAllDevices}
              className="text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              {selectedDeviceIds.size === filteredDevices.length && filteredDevices.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
              <span>Select All ({selectedDeviceIds.size} selected)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={selectedDeviceIds.size === 0 || isProcessing}
              onClick={() => handleBulkDeviceCommand('ring')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" /> Sound Alarm
            </button>

            <button
              disabled={selectedDeviceIds.size === 0 || isProcessing}
              onClick={() => handleBulkDeviceCommand('lock')}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Lock QS
            </button>

            <button
              disabled={selectedDeviceIds.size === 0 || isProcessing}
              onClick={() => handleBulkDeviceCommand('track')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" /> Ping GPS
            </button>

            <button
              disabled={selectedDeviceIds.size === 0 || isProcessing}
              onClick={() => handleBulkDeviceCommand('screenshot')}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" /> Capture Cam
            </button>

            <button
              disabled={selectedDeviceIds.size === 0}
              onClick={() => handleExportDevices('json')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono disabled:opacity-40 cursor-pointer"
              title="Export Selected JSON"
            >
              JSON
            </button>

            <button
              disabled={selectedDeviceIds.size === 0 || isProcessing}
              onClick={() => {
                setDangerAction('delete_devices');
                setDangerModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedDeviceIds.size})
            </button>
          </div>
        </Card>
      )}

      {/* Target Table */}
      <Card variant="default" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A0F1D] text-slate-600 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#1F2937]">
                <tr>
                  <th className="p-3 w-10"></th>
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Subscription</th>
                  <th className="p-3 font-semibold">UID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937] text-slate-800 dark:text-[#E2E8F0]">
                {filteredUsers.map(u => {
                  const isSelected = selectedUserIds.has(u.uid);
                  return (
                    <tr 
                      key={u.uid} 
                      onClick={() => toggleSelectUser(u.uid)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                    >
                      <td className="p-3 text-center">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                        )}
                      </td>
                      <td className="p-3 font-semibold">{u.full_name || 'Mobile User'}</td>
                      <td className="p-3 font-mono text-slate-500 dark:text-[#94A3B8]">{u.email}</td>
                      <td className="p-3">
                        <Badge variant={u.subscription ? 'success' : 'neutral'} size="sm">
                          {u.subscription ? 'Pro' : 'Free'}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400 dark:text-slate-500">{u.uid}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A0F1D] text-slate-600 dark:text-[#94A3B8] font-mono border-b border-slate-200 dark:border-[#1F2937]">
                <tr>
                  <th className="p-3 w-10"></th>
                  <th className="p-3 font-semibold">Device</th>
                  <th className="p-3 font-semibold">Model / OS</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Last Active</th>
                  <th className="p-3 font-semibold">Device ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937] text-slate-800 dark:text-[#E2E8F0]">
                {filteredDevices.map(d => {
                  const isSelected = selectedDeviceIds.has(d.device_id);
                  const online = isDeviceOnline(d.last_active);
                  return (
                    <tr 
                      key={d.device_id} 
                      onClick={() => toggleSelectDevice(d.device_id)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${isSelected ? 'bg-cyan-50 dark:bg-cyan-950/30' : ''}`}
                    >
                      <td className="p-3 text-center">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                        )}
                      </td>
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
                        <span>{d.device_name}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 dark:text-[#94A3B8]">{d.model} (v{d.os_version})</td>
                      <td className="p-3">
                        <Badge variant={online ? 'success' : 'neutral'} size="sm">
                          {online ? 'Online' : 'Offline'}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-slate-500 dark:text-[#94A3B8]">{formatTimeAgo(d.last_active)}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400 dark:text-slate-500">{d.device_id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Danger Modal */}
      <Modal
        isOpen={dangerModalOpen}
        onClose={() => setDangerModalOpen(false)}
        title="Confirm Bulk Deletion"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-[#94A3B8]">
          <p>
            You are about to permanently delete{' '}
            <strong className="text-slate-900 dark:text-white">
              {dangerAction === 'delete_users'
                ? `${selectedUserIds.size} User Account(s) (with all their device subcollections)`
                : `${selectedDeviceIds.size} Hardware Device(s)`}
            </strong>
          </p>

          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300 font-mono text-[11px] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> IRREVERSIBLE OPERATION:
            </p>
            <p>Documents will be erased from Firestore and cannot be recovered.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#334155]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDangerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isProcessing}
              onClick={executeDangerDelete}
            >
              Confirm Bulk Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
