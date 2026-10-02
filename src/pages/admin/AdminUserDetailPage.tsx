import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { JsonCodeEditor } from '../../components/common/JsonCodeEditor';
import { 
  Users, 
  ArrowLeft, 
  Smartphone, 
  CreditCard, 
  Calendar, 
  Save, 
  Trash2, 
  RefreshCw, 
  ShieldAlert, 
  Code2, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Battery,
  MapPin,
  Clock
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toggle } from '../../components/common/Toggle';
import { 
  fetchAdminUsers, 
  fetchAdminDevices, 
  adminUpdateUser, 
  deleteUserRecord, 
  isDeviceOnline, 
  formatTimeAgo,
  getTimestampSeconds
} from '../../services/deviceService';
import { UserProfile, DeviceRecord } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

export const AdminUserDetailPage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [userDevices, setUserDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subStartDate, setSubStartDate] = useState('');
  const [subEndDate, setSubEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Raw JSON
  const [rawJson, setRawJson] = useState('{}');
  const [isSavingRaw, setIsSavingRaw] = useState(false);

  // Danger modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUserData = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [allUsers, allDevices] = await Promise.all([
        fetchAdminUsers(false),
        fetchAdminDevices(false)
      ]);

      const foundUser = allUsers.find(u => u.uid === uid);
      if (foundUser) {
        setUser(foundUser);
        setFullName(foundUser.full_name || '');
        setIsSubscribed(Boolean(foundUser.subscription));

        const startSec = getTimestampSeconds(foundUser.subscription_start);
        const endSec = getTimestampSeconds(foundUser.subscription_end);
        setSubStartDate(startSec ? new Date(startSec * 1000).toISOString().slice(0, 16) : '');
        setSubEndDate(endSec ? new Date(endSec * 1000).toISOString().slice(0, 16) : '');

        setRawJson(JSON.stringify(foundUser, null, 2));
      } else {
        toast.error('User not found in database');
      }

      // Filter devices owned by this user
      const owned = allDevices.filter(d => d.owner_uid === uid || d.device_id.startsWith(uid.slice(0, 5)));
      setUserDevices(owned);
    } catch {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [uid]);

  const handleSaveUserInfo = async () => {
    if (!uid) return;
    setIsSaving(true);
    try {
      const updates: any = {
        full_name: fullName,
        subscription: isSubscribed
      };

      if (subStartDate) {
        updates.subscription_start = { seconds: Math.floor(new Date(subStartDate).getTime() / 1000), nanoseconds: 0 };
      }
      if (subEndDate) {
        updates.subscription_end = { seconds: Math.floor(new Date(subEndDate).getTime() / 1000), nanoseconds: 0 };
      }

      await adminUpdateUser(uid, updates);
      toast.success('User details updated in Firestore');
      loadUserData();
    } catch {
      toast.error('Failed to save updates');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRawJson = async () => {
    if (!uid) return;
    try {
      const parsed = JSON.parse(rawJson);
      setIsSavingRaw(true);
      await adminUpdateUser(uid, parsed);
      toast.success('Raw JSON updated in Firestore');
      loadUserData();
    } catch (e: any) {
      toast.error(`Invalid JSON: ${e.message}`);
    } finally {
      setIsSavingRaw(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!uid) return;
    setIsDeleting(true);
    try {
      await deleteUserRecord(uid, false);
      toast.success('User and associated devices cascade deleted');
      navigate('/admin/users');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearSubscription = async () => {
    if (!uid) return;
    try {
      await adminUpdateUser(uid, {
        subscription: false,
        subscription_end: null
      });
      toast.success('Subscription revoked');
      loadUserData();
    } catch {
      toast.error('Failed to clear subscription');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-slate-800 rounded animate-pulse"></div>
        <div className="h-64 bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-400">User not found.</p>
        <Link to="/admin/users" className="text-cyan-400 hover:underline text-xs">
          Return to Users Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold font-heading text-white">
                {user.full_name || 'Mobile User'}
              </h1>
              <Badge variant={user.subscription ? 'success' : 'neutral'} size="sm">
                {user.subscription ? 'Pro License' : 'Free Tier'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">UID: {user.uid}</p>
          </div>
        </div>

        <Button
          onClick={loadUserData}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Reload
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Info Card */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section 1: User Profile Settings */}
          <Card variant="default" className="p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#00E5FF] flex items-center gap-2">
              <Users className="w-4 h-4" /> USER PROFILE &amp; SUBSCRIPTION
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Email Address (Readonly)</label>
                <input
                  type="text"
                  readOnly
                  value={user.email}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Pro Subscription Override</p>
                  <p className="text-[11px] text-slate-400">$1/year unrestricted features</p>
                </div>
                <Toggle
                  id="sub-toggle-detail"
                  checked={isSubscribed}
                  onChange={setIsSubscribed}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Subscription Start</label>
                  <input
                    type="datetime-local"
                    value={subStartDate}
                    onChange={(e) => setSubStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Subscription End</label>
                  <input
                    type="datetime-local"
                    value={subEndDate}
                    onChange={(e) => setSubEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={handleSaveUserInfo}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </div>
          </Card>

          {/* Section 2: Linked Hardware Devices */}
          <Card variant="default" className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#00E5FF] flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> LINKED DEVICES ({userDevices.length})
              </h3>
            </div>

            {userDevices.length > 0 ? (
              <div className="space-y-2.5">
                {userDevices.map(d => {
                  const online = isDeviceOnline(d.last_active);
                  return (
                    <Link
                      key={d.device_id}
                      to={`/admin/devices/${d.device_id}`}
                      className="block p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00E5FF]/50 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#00E5FF]" />
                          <span className="font-semibold text-white group-hover:text-[#00E5FF] transition-colors">
                            {d.device_name}
                          </span>
                        </div>
                        <Badge variant={online ? 'success' : 'neutral'} size="sm">
                          {online ? 'Online' : 'Offline'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                        <span>{d.model} • Android {d.os_version}</span>
                        <span className="text-right">Ping: {formatTimeAgo(d.last_active)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No paired devices registered under this user.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Raw JSON & Danger Zone */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section 3: Raw Fields Editor */}
          <Card variant="default" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-purple-400 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> RAW DOCUMENT SCHEMA
              </h3>
              <Button
                variant="outline"
                size="sm"
                isLoading={isSavingRaw}
                onClick={handleSaveRawJson}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Raw JSON
              </Button>
            </div>

            <div className="h-[280px] rounded-xl overflow-hidden">
              <JsonCodeEditor
                height="100%"
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={rawJson}
                onChange={(v) => setRawJson(v || '{}')}
              />
            </div>
          </Card>

          {/* Section 4: Danger Zone */}
          <Card variant="default" className="p-5 border-2 border-red-500/50 bg-red-950/20 space-y-3">
            <h3 className="text-xs font-mono font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> USER DANGER ZONE
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Revoke Subscription</p>
                  <p className="text-[11px] text-slate-400">Instantly downgrade to free tier</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSubscription}
                  className="text-amber-400 border-amber-500/40"
                >
                  Clear License
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-red-500/30">
                <div>
                  <p className="font-semibold text-red-300">Cascade Delete Account</p>
                  <p className="text-[11px] text-slate-400">Permanently erases user &amp; all {userDevices.length} device subcollections</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete User
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Cascade User Deletion"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p>
            Are you sure you want to permanently delete user <strong className="text-white">{user.email}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-mono text-[11px]">
            ⚠️ This will delete the user record AND cascade-delete all {userDevices.length} associated mobile handsets.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              onClick={handleDeleteUser}
            >
              Confirm Cascade Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
