import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Key, 
  ShieldCheck, 
  Clock, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const AccountPage: React.FC = () => {
  const { currentUser, userRecord, logout, resetPassword } = useAuth();
  const [sendingReset, setSendingReset] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleSendResetEmail = async () => {
    if (!currentUser?.email) return;
    setSendingReset(true);
    try {
      await resetPassword(currentUser.email);
      toast.success(`Password reset email sent to ${currentUser.email}`);
    } catch {
      toast.error('Failed to dispatch password reset email');
    } finally {
      setSendingReset(false);
    }
  };

  const copyUid = () => {
    if (!currentUser?.uid) return;
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedUid(true);
    toast.success('UID copied to clipboard');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#334155]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
          Account & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Identity profile linked to your Anti-Theft mobile account.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card variant="default" className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-200 dark:border-[#334155]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-[#00E5FF] text-2xl font-bold font-heading shadow-xs">
            {(userRecord?.full_name || currentUser?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-[#E2E8F0]">
                {userRecord?.full_name || currentUser?.email?.split('@')[0]}
              </h2>
              <Badge variant={userRecord?.subscription ? 'cyan' : 'neutral'} size="sm">
                {userRecord?.subscription ? 'Pro Member' : 'Standard Member'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-1">
              {currentUser?.email}
            </p>
          </div>
        </div>

        {/* Identity Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] mb-1 font-mono">
              <span>USER ID (UID)</span>
              <button
                type="button"
                onClick={copyUid}
                className="text-cyan-600 dark:text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedUid ? <Check className="w-3 h-3 text-emerald-600 dark:text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUid ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-slate-900 dark:text-[#E2E8F0] truncate">
              {currentUser?.uid || '—'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono block mb-1">
              SECURITY STATUS
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-[#10B981]">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3 Firebase Encrypted</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Password & Credential Management */}
      <Card variant="surface2" className="p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2 flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
          Password & Authentication Credentials
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed mb-6">
          Need to change or recover your password? Trigger a secure reset link to your registered mobile account email.
        </p>

        <Button
          onClick={handleSendResetEmail}
          isLoading={sendingReset}
          variant="outline"
          size="sm"
          leftIcon={<Mail className="w-4 h-4" />}
        >
          Send Password Reset Link to {currentUser?.email}
        </Button>
      </Card>

      {/* Sign Out Card */}
      <Card variant="default" className="p-6 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/10">
        <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 font-heading mb-1">
          Sign Out of Companion Session
        </h3>
        <p className="text-xs text-slate-600 dark:text-[#94A3B8] mb-4">
          Terminates your current browser session. Your mobile device continues to transpond telemetry to Firestore in the background.
        </p>
        <Button
          onClick={() => logout()}
          variant="danger"
          size="sm"
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out of Account
        </Button>
      </Card>
    </div>
  );
};
