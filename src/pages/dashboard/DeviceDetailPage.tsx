import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  ArrowLeft, 
  VolumeX, 
  ShieldAlert, 
  PowerOff, 
  Activity, 
  Clock, 
  Copy, 
  Check, 
  Calendar, 
  Trash2, 
  AlertTriangle,
  Radio,
  Lock,
  Sparkles,
  Camera,
  MapPin,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DeviceRecord } from '../../types';
import { 
  subscribeToDevice, 
  isDeviceOnline, 
  formatTimeAgo, 
  formatTimestampDate, 
  updateDeviceToggle, 
  requestLocationUpdate,
  deleteUserDevice 
} from '../../services/deviceService';
import { LocationCard } from '../../components/device/LocationCard';
import { ScreenshotViewer } from '../../components/device/ScreenshotViewer';
import { Toggle } from '../../components/common/Toggle';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const DeviceDetailPage: React.FC = () => {
  const { deviceId, id } = useParams<{ deviceId?: string; id?: string }>();
  const targetDeviceId = deviceId || id;
  const { currentUser, userRecord, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const isPro = Boolean(userRecord?.subscription);

  const [device, setDevice] = useState<DeviceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Danger Zone confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid || !targetDeviceId) return;

    setLoading(true);
    const unsubscribe = subscribeToDevice(
      currentUser.uid,
      targetDeviceId,
      (fetchedDevice) => {
        setDevice(fetchedDevice);
        setLoading(false);
        // If device has responded to location request (request_location is now false or updated)
        if (fetchedDevice && fetchedDevice.request_location === false) {
          setIsRequestingLocation(false);
        }
      },
      isDemoMode
    );

    return () => unsubscribe();
  }, [currentUser?.uid, targetDeviceId, isDemoMode]);

  // Synchronize requesting state with device.request_location
  useEffect(() => {
    if (device?.request_location) {
      setIsRequestingLocation(true);
    }
  }, [device?.request_location]);

  // Handle optimistic toggle updates with error rollback
  const handleToggle = async (
    key: 'silent_mode' | 'quick_settings_block' | 'shutdown_protection' | 'siren_active',
    newValue: boolean
  ) => {
    if (!currentUser?.uid || !targetDeviceId || !device) return;

    if ((key === 'silent_mode' || key === 'siren_active') && !isPro) {
      toast.error('Remote Audio & Siren Controls are Pro features ($1/yr). Upgrade to unlock.');
      return;
    }

    const previousValue = device[key];
    // Optimistic update
    setDevice(prev => prev ? { ...prev, [key]: newValue } : null);
    setUpdatingKey(key);

    try {
      await updateDeviceToggle(currentUser.uid, targetDeviceId, key, newValue, isDemoMode);
      const label = key === 'silent_mode' 
        ? 'Silent Mode' 
        : key === 'quick_settings_block' 
        ? 'Quick Settings Block' 
        : key === 'siren_active'
        ? 'Emergency Siren Alarm'
        : 'Shutdown Protection';
      toast.success(`${label} turned ${newValue ? 'ON' : 'OFF'}`);
    } catch {
      // Rollback on error
      setDevice(prev => prev ? { ...prev, [key]: previousValue } : null);
      toast.error('Failed to sync remote switch. Rolling back.');
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleFetchLiveLocation = async () => {
    if (!currentUser?.uid || !targetDeviceId) return;
    setIsRequestingLocation(true);
    try {
      await requestLocationUpdate(currentUser.uid, targetDeviceId, isDemoMode);
      toast.success('Location update signal broadcasted to device');
    } catch {
      setIsRequestingLocation(false);
      toast.error('Failed to broadcast location request');
    }
  };

  const copyDeviceId = () => {
    if (!targetDeviceId) return;
    navigator.clipboard.writeText(targetDeviceId);
    setCopiedId(true);
    toast.success('Device ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDeleteDevice = async () => {
    if (!currentUser?.uid || !targetDeviceId || !device) return;
    if (deleteConfirmInput.trim() !== device.device_name.trim()) {
      toast.error('Device name does not match');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserDevice(currentUser.uid, targetDeviceId, isDemoMode);
      toast.success(`Device "${device.device_name}" successfully removed`);
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete device');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] p-8 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-[#E2E8F0]">
          Device Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 mb-6">
          The requested device record (ID: {targetDeviceId}) is not registered in your account.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0F172A] text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const online = isDeviceOnline(device.last_active);
  const truncatedId = device.device_id.length > 14
    ? `${device.device_id.substring(0, 8)}...${device.device_id.substring(device.device_id.length - 4)}`
    : device.device_id;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 rounded-xl bg-white dark:bg-[#1E293B] text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-[#334155]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-[#E2E8F0]">
            {device.device_name || 'Protected Device'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
            Remote telemetry and command management terminal
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          SECTION 1: Device Info Card
          - Device name, model, manufacturer, OS version
          - Device ID (truncated with copy button)
          - Registered date
          - Last active time
         ───────────────────────────────────────────────────────── */}
      <Card variant="default" hoverEffect className="p-6 elevate-3d">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              online
                ? 'bg-cyan-50 dark:bg-[#00E5FF]/10 border-cyan-300 dark:border-[#00E5FF]/40 text-cyan-600 dark:text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}>
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-[#E2E8F0]">
                  {device.device_name || 'N/A'}
                </h2>
                <Badge variant={online ? 'success' : 'neutral'} pulse={online} size="sm">
                  {online ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-0.5">
                {device.manufacturer || 'N/A'} • {device.model || 'N/A'} • Android {device.os_version || 'N/A'}
              </p>
            </div>
          </div>

          {/* Truncated Device ID with Copy Button */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl neumorphic-well text-xs font-mono text-slate-700 dark:text-[#E2E8F0] flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500">ID:</span>
              <span title={device.device_id}>{truncatedId}</span>
              <button
                type="button"
                onClick={copyDeviceId}
                className="text-cyan-600 dark:text-[#00E5FF] hover:text-cyan-700 cursor-pointer p-0.5"
                title="Copy Full Device ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] uppercase tracking-wider font-mono">
              Model & OS
            </span>
            <span className="font-semibold text-slate-800 dark:text-[#E2E8F0] mt-0.5 block">
              {device.model || 'N/A'} (Android {device.os_version || 'N/A'})
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] uppercase tracking-wider font-mono">
              Manufacturer
            </span>
            <span className="font-semibold text-slate-800 dark:text-[#E2E8F0] mt-0.5 block">
              {device.manufacturer || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] uppercase tracking-wider font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-600 dark:text-[#00E5FF]" />
              Registered Date
            </span>
            <span className="font-semibold text-slate-800 dark:text-[#E2E8F0] mt-0.5 block">
              {formatTimestampDate(device.registered_at)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] uppercase tracking-wider font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-600 dark:text-[#00E5FF]" />
              Last Active Time
            </span>
            <span className="font-semibold text-slate-800 dark:text-[#E2E8F0] mt-0.5 block">
              {formatTimeAgo(device.last_active)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] uppercase tracking-wider font-mono flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Screen Display State
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${device.screen_state === 'on' ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              <span className={`font-semibold text-xs uppercase tracking-wide ${device.screen_state === 'on' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                {device.screen_state === 'on' ? 'Screen Active (ON)' : 'Screen Standby (OFF)'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Foreground Application Telemetry (If detected) */}
        {(device.current_app_name || device.current_app_detail) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-slate-50/80 dark:bg-black/20 p-3 rounded-xl border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-cyan-600 dark:text-[#00E5FF] font-bold">Foreground App:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold">
                {device.current_app_name || 'System Launcher'}
              </span>
              {device.current_app_detail && (
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  ({device.current_app_detail})
                </span>
              )}
            </div>
            {device.last_activity_time && (
              <span className="text-slate-400 text-[11px]">
                Updated: {formatTimeAgo(device.last_activity_time)}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* ─────────────────────────────────────────────────────────
          SECTION 2: Live Location Card
         ───────────────────────────────────────────────────────── */}
      {isPro ? (
        <LocationCard
          location={device.location}
          deviceName={device.device_name}
          isOnline={online}
          onRequestLocation={handleFetchLiveLocation}
          isRequestingLocation={isRequestingLocation}
        />
      ) : (
        <Card variant="default" className="p-6 relative overflow-hidden border-cyan-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Live GPS Location & Telemetry Tracking
                  </h3>
                  <Badge variant="cyan" size="sm">
                    <Lock className="w-3 h-3 mr-1" />
                    Pro Only
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Sub-second live device positioning, geographic coordinates, altitude, speed, and heading are unlocked on the Pro plan ($1.00/year).
                </p>
              </div>
            </div>
            <Link to="/dashboard/subscription" className="shrink-0">
              <Button variant="primary" size="sm" className="bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0A0E1A] font-bold">
                Upgrade to Pro — $1/year
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────
          SECTION 3: Device Controls Card
         ───────────────────────────────────────────────────────── */}
      <Card variant="default" className="p-6">
        <div className="pb-4 mb-5 border-b border-slate-200 dark:border-white/5">
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-[#E2E8F0]">
            Device Controls
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Real-time defensive switches synchronized with the phone foreground service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Silent Mode */}
          <div className="p-5 rounded-2xl neumorphic-well elevate-3d flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <VolumeX className="w-5 h-5" />
                </div>
                <Toggle
                  id="toggle-silent-detail"
                  checked={device.silent_mode}
                  onChange={(val) => handleToggle('silent_mode', val)}
                  isLoading={updatingKey === 'silent_mode'}
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading">
                  Silent Mode
                </h4>
                {!isPro && (
                  <Badge variant="neutral" size="sm" className="text-[10px]">
                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                    Pro Only
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                Remotely toggle device ringtone to silent or audible state.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Current Status:</span>
              <span className={`font-semibold ${device.silent_mode ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'}`}>
                {device.silent_mode ? 'Muted Silently' : 'Audible Ringer'}
              </span>
            </div>
          </div>

          {/* Emergency Siren Alarm */}
          <div className={`p-5 rounded-2xl neumorphic-well elevate-3d flex flex-col justify-between transition-all ${
            device.siren_active ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20' : ''
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  device.siren_active
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 animate-pulse'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  <BellRing className={`w-5 h-5 ${device.siren_active ? 'animate-bounce' : ''}`} />
                </div>
                <Toggle
                  id="toggle-siren-detail"
                  checked={Boolean(device.siren_active)}
                  onChange={(val) => handleToggle('siren_active', val)}
                  isLoading={updatingKey === 'siren_active'}
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading">
                  Emergency Siren
                </h4>
                {!isPro && (
                  <Badge variant="neutral" size="sm" className="text-[10px]">
                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                    Pro Only
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                Triggers an ultra-loud alarm siren at 100% volume, bypassing physical ringer switches.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Current Status:</span>
              <span className={`font-semibold ${device.siren_active ? 'text-amber-600 dark:text-amber-400 font-bold animate-pulse' : 'text-slate-500'}`}>
                {device.siren_active ? 'BLARING ON' : 'Standby / Silent'}
              </span>
            </div>
          </div>

          {/* Quick Settings Block */}
          <div className="p-5 rounded-2xl neumorphic-well elevate-3d flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <Toggle
                  id="toggle-qs-detail"
                  checked={device.quick_settings_block}
                  onChange={(val) => handleToggle('quick_settings_block', val)}
                  isLoading={updatingKey === 'quick_settings_block'}
                />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-1">
                Quick Settings Block
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                Prevents toggling Airplane Mode, WiFi, or Data when the device is locked.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Current Status:</span>
              <span className={`font-semibold ${device.quick_settings_block ? 'text-cyan-600 dark:text-[#00E5FF]' : 'text-slate-500'}`}>
                {device.quick_settings_block ? 'Curtain Locked' : 'Unlocked'}
              </span>
            </div>
          </div>

          {/* Shutdown Protection */}
          <div className="p-5 rounded-2xl neumorphic-well elevate-3d flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center border border-red-500/30">
                  <PowerOff className="w-5 h-5" />
                </div>
                <Toggle
                  id="toggle-shutdown-detail"
                  checked={device.shutdown_protection}
                  onChange={(val) => handleToggle('shutdown_protection', val)}
                  isLoading={updatingKey === 'shutdown_protection'}
                />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-1">
                Shutdown Protection
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                Prevents unauthorized power off and reboots from the lock screen.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Current Status:</span>
              <span className={`font-semibold ${device.shutdown_protection ? 'text-red-500 dark:text-red-400' : 'text-slate-500'}`}>
                {device.shutdown_protection ? 'Power-Off Blocked' : 'Unprotected'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────
          SECTION 4: Remote Screenshot Card
         ───────────────────────────────────────────────────────── */}
      {isPro ? (
        <ScreenshotViewer
          uid={currentUser?.uid || ''}
          deviceId={targetDeviceId || ''}
          latestScreenshot={device.latest_screenshot}
          latestScreenshotTime={device.latest_screenshot_time}
          screenshotStatus={device.screenshot_status}
          isCapturing={device.capture_screenshot}
          isDemo={isDemoMode}
        />
      ) : (
        <Card variant="default" className="p-6 relative overflow-hidden border-cyan-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30 shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Remote Photographic Screenshot Capture
                  </h3>
                  <Badge variant="cyan" size="sm">
                    <Lock className="w-3 h-3 mr-1" />
                    Pro Only
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Remotely trigger encrypted screen captures and review perpetrator activity from your web console on the Pro plan ($1.00/year).
                </p>
              </div>
            </div>
            <Link to="/dashboard/subscription" className="shrink-0">
              <Button variant="primary" size="sm" className="bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0A0E1A] font-bold">
                Upgrade to Pro — $1/year
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────
          SECTION 5: Danger Zone
          - Unregister / Delete Device
          - Confirmation modal with device name typing required
         ───────────────────────────────────────────────────────── */}
      <Card variant="default" className="p-6 border-red-200 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold font-heading text-red-600 dark:text-red-400">
                Danger Zone
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Unregister and permanently delete this device record from your account. This action cannot be undone.
            </p>
          </div>

          <Button
            onClick={() => {
              setDeleteConfirmInput('');
              setIsDeleteModalOpen(true);
            }}
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Unregister Device
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-red-200 dark:border-red-900/60 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-[#E2E8F0]">
                Unregister & Delete Device
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                This will permanently delete <strong className="text-slate-900 dark:text-white">&quot;{device.device_name}&quot;</strong> from your cloud dashboard.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                To confirm deletion, please type the device name exactly:
              </p>
              <p className="font-mono font-bold text-slate-900 dark:text-cyan-400 mt-1 select-all">
                {device.device_name}
              </p>
            </div>

            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Type device name to confirm"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteDevice}
                isLoading={isDeleting}
                disabled={deleteConfirmInput.trim() !== device.device_name.trim()}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
