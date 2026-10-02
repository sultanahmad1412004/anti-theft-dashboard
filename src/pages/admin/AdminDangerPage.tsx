import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Flame, 
  Skull, 
  ShieldAlert, 
  CheckCircle2, 
  Smartphone, 
  Users, 
  CreditCard, 
  Camera,
  Lock
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  dangerDeleteAllGuestUsers, 
  dangerDeleteInactiveDevices, 
  dangerResetAllSubscriptions, 
  dangerClearAllScreenshots, 
  dangerWipeAllNonAdminData 
} from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

type DangerType = 'guests' | 'inactive_devices' | 'subscriptions' | 'screenshots' | 'nuclear';

export const AdminDangerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeAction, setActiveAction] = useState<DangerType | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const openAction = (type: DangerType) => {
    setActiveAction(type);
    setConfirmInput('');
  };

  const closeAction = () => {
    setActiveAction(null);
    setConfirmInput('');
  };

  const handleExecute = async () => {
    if (!activeAction) return;

    if (activeAction === 'nuclear' && confirmInput !== 'DELETE ALL DATA FOREVER') {
      toast.error('You must type the confirmation phrase exactly');
      return;
    }

    if (activeAction !== 'nuclear' && confirmInput !== 'CONFIRM') {
      toast.error('You must type CONFIRM to proceed');
      return;
    }

    setIsExecuting(true);
    try {
      if (activeAction === 'guests') {
        const count = await dangerDeleteAllGuestUsers();
        toast.success(`Purged ${count} guest tracking token(s)`);
      } else if (activeAction === 'inactive_devices') {
        const count = await dangerDeleteInactiveDevices(30);
        toast.success(`Removed ${count} inactive hardware node(s) (>30d)`);
      } else if (activeAction === 'subscriptions') {
        const count = await dangerResetAllSubscriptions();
        toast.success(`Reset ${count} active subscription(s) to free tier`);
      } else if (activeAction === 'screenshots') {
        const count = await dangerClearAllScreenshots();
        toast.success(`Cleared optical screenshot frames from ${count} device(s)`);
      } else if (activeAction === 'nuclear') {
        const res = await dangerWipeAllNonAdminData(currentUser?.email || undefined);
        toast.success(`Wiped ${res.usersDeleted} user accounts & ${res.guestsDeleted} guest sessions`);
      }
      closeAction();
    } catch (e: any) {
      toast.error(`Execution error: ${e.message || 'Failed'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with High-Voltage Warning */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/70 via-red-900/40 to-slate-900 border-2 border-red-600/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40">
                <Skull className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-red-100">
                    Admin Dashboard Danger Zone
                  </h1>
                  <Badge variant="danger" size="sm">ROOT ACCESS ONLY</Badge>
                </div>
                <p className="text-xs sm:text-sm text-red-300 font-mono mt-0.5">
                  Irreversible destructive operations affecting all live Firestore documents.
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-red-300 bg-red-950/80 px-3 py-1.5 rounded-lg border border-red-800">
              Admin: {currentUser?.email || 'Authenticated Super Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Destructive Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action 1: Purge Guests */}
        <Card variant="default" className="p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> GUEST SESSIONS PURGE
              </span>
              <Badge variant="neutral" size="sm">Soft Cleanup</Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete All Guest Users</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Removes all documents from <span className="font-mono text-amber-600 dark:text-amber-300">guest_users</span>. Active secondary search tokens will be terminated immediately.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
              onClick={() => openAction('guests')}
            >
              Purge Guest Documents
            </Button>
          </div>
        </Card>

        {/* Action 2: Purge Inactive Devices */}
        <Card variant="default" className="p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> FLEET PRUNING
              </span>
              <Badge variant="neutral" size="sm">Stale Nodes</Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Prune Offline Devices (&gt; 30 Days)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deletes devices that have not sent a location or telemetry heartbeat within the past 30 days to optimize database read indexes.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
              onClick={() => openAction('inactive_devices')}
            >
              Prune Stale Devices
            </Button>
          </div>
        </Card>

        {/* Action 3: Reset Subscriptions */}
        <Card variant="default" className="p-5 border-l-4 border-l-orange-500 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> BILLING OVERRIDE
              </span>
              <Badge variant="danger" size="sm">Financial</Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset All Subscriptions to Free</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Iterates through all registered users and sets <span className="font-mono text-orange-600 dark:text-orange-300">subscription: false</span>. All Pro licenses are revoked.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-orange-600 dark:text-orange-400 border-orange-500/40 hover:bg-orange-500/10"
              onClick={() => openAction('subscriptions')}
            >
              Reset All Subscriptions
            </Button>
          </div>
        </Card>

        {/* Action 4: Clear Screenshots */}
        <Card variant="default" className="p-5 border-l-4 border-l-orange-500 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> STORAGE RECLAMATION
              </span>
              <Badge variant="danger" size="sm">Media</Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear All Screenshots &amp; Photos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deletes cached image URLs and base64 frames across all devices to free bandwidth and sanitize surveillance storage.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-orange-600 dark:text-orange-400 border-orange-500/40 hover:bg-orange-500/10"
              onClick={() => openAction('screenshots')}
            >
              Flush All Screenshots
            </Button>
          </div>
        </Card>
      </div>

      {/* The Nuclear Option */}
      <Card variant="default" className="p-6 border-2 border-red-500/80 bg-gradient-to-b from-red-50 dark:from-red-950/40 to-white dark:to-slate-950 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-mono text-xs font-bold">
              <Flame className="w-4 h-4" /> LEVEL 5 NUCLEAR PROTOCOL
            </div>
            <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
              Wipe All Non-Admin Application Data
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Permanently purges <strong>all regular user accounts</strong>, <strong>all subcollection devices</strong>, and <strong>all guest tokens</strong> from the Firestore database. Authenticated Super Admins in the <span className="font-mono text-amber-600 dark:text-amber-300">admins</span> collection are retained.
            </p>
          </div>

          <Button
            variant="danger"
            size="lg"
            className="w-full md:w-auto shrink-0 bg-red-600 hover:bg-red-700 text-white font-black px-6 shadow-xl shadow-red-600/30"
            onClick={() => openAction('nuclear')}
            leftIcon={<Flame className="w-5 h-5" />}
          >
            Initiate Nuclear Wipe
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(activeAction)}
        onClose={closeAction}
        title={activeAction === 'nuclear' ? '☣️ INITIATE SYSTEM NUCLEAR PURGE' : 'Confirm Destructive Action'}
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-[#94A3B8]">
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300 font-mono text-xs space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> CRITICAL WARNING
            </p>
            <p>
              {activeAction === 'nuclear'
                ? 'This will completely erase all registered users and devices across the entire system. Only your Super Admin profile will be kept.'
                : 'This action permanently mutates or deletes live documents in the production database.'}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1.5">
              {activeAction === 'nuclear' ? (
                <span>Type <strong className="text-red-600 dark:text-red-400">DELETE ALL DATA FOREVER</strong> to confirm:</span>
              ) : (
                <span>Type <strong className="text-red-600 dark:text-red-400">CONFIRM</strong> to authorize:</span>
              )}
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={activeAction === 'nuclear' ? 'DELETE ALL DATA FOREVER' : 'CONFIRM'}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-500/50 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-red-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#334155]">
            <Button
              variant="outline"
              size="sm"
              onClick={closeAction}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isExecuting}
              disabled={activeAction === 'nuclear' ? confirmInput !== 'DELETE ALL DATA FOREVER' : confirmInput !== 'CONFIRM'}
              onClick={handleExecute}
            >
              Execute Destruction
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
