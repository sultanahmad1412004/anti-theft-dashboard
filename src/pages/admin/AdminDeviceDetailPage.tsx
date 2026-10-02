import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { JsonCodeEditor } from '../../components/common/JsonCodeEditor';
import { 
  Smartphone, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  VolumeX, 
  PowerOff, 
  Camera, 
  Save, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Code2,
  Radio,
  Calendar,
  UserCheck,
  ZoomIn,
  Download,
  AlertTriangle,
  BellRing,
  Activity
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toggle } from '../../components/common/Toggle';
import { DeviceMap } from '../../components/map/DeviceMap';
import { 
  fetchAdminDevices, 
  adminUpdateDevice, 
  adminDeleteDevice, 
  isDeviceOnline, 
  formatTimeAgo,
  formatTimestampDate,
  triggerScreenshotCapture,
  requestLocationUpdate
} from '../../services/deviceService';
import { DeviceRecord } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

export const AdminDeviceDetailPage: React.FC = () => {
  const { deviceId, id } = useParams<{ deviceId?: string; id?: string }>();
  const targetDeviceId = deviceId || id;
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [device, setDevice] = useState<DeviceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [deviceName, setDeviceName] = useState('');
  const [ownerUid, setOwnerUid] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Toggles
  const [silentMode, setSilentMode] = useState(false);
  const [qsBlock, setQsBlock] = useState(false);
  const [shutdownProtect, setShutdownProtect] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);

  // Raw JSON
  const [rawJson, setRawJson] = useState('{}');
  const [isSavingRaw, setIsSavingRaw] = useState(false);

  // Lightbox modal for screenshot
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDevice = async () => {
    if (!targetDeviceId) return;
    setLoading(true);
    try {
      const allDevices = await fetchAdminDevices(false);
      const found = allDevices.find(d => d.device_id === targetDeviceId);
      if (found) {
        setDevice(found);
        setDeviceName(found.device_name);
        setOwnerUid(found.owner_uid || '');
        setSilentMode(Boolean(found.silent_mode));
        setQsBlock(Boolean(found.quick_settings_block));
        setShutdownProtect(Boolean(found.shutdown_protection));
        setSirenActive(Boolean(found.siren_active));
        setRawJson(JSON.stringify(found, null, 2));
      } else {
        toast.error('Device not found');
      }
    } catch {
      toast.error('Failed to load device details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevice();
  }, [targetDeviceId]);

  const handleToggle = async (
    key: 'silent_mode' | 'quick_settings_block' | 'shutdown_protection' | 'siren_active',
    val: boolean
  ) => {
    if (!device) return;
    try {
      if (key === 'silent_mode') setSilentMode(val);
      if (key === 'quick_settings_block') setQsBlock(val);
      if (key === 'shutdown_protection') setShutdownProtect(val);
      if (key === 'siren_active') setSirenActive(val);

      await adminUpdateDevice(device.owner_uid, device.device_id, { [key]: val });
      const label = key === 'siren_active' ? 'Emergency Siren' : key;
      toast.success(`${label} turned ${val ? 'ON' : 'OFF'}`);
    } catch {
      toast.error('Failed to update toggle');
    }
  };

  const handleCommand = async (cmd: 'screenshot' | 'track') => {
    if (!device) return;
    try {
      if (cmd === 'screenshot') {
        await triggerScreenshotCapture(device.owner_uid || '', device.device_id, false);
        toast.success('Remote screenshot capture requested');
      } else if (cmd === 'track') {
        await requestLocationUpdate(device.owner_uid || '', device.device_id, false);
        toast.success('Live location update requested');
      }
      setTimeout(loadDevice, 1500);
    } catch {
      toast.error(`Failed to execute command`);
    }
  };

  const handleSaveInfo = async () => {
    if (!device) return;
    setIsSaving(true);
    try {
      await adminUpdateDevice(device.owner_uid, device.device_id, {
        device_name: deviceName,
        owner_uid: ownerUid
      });
      toast.success('Device info saved');
      loadDevice();
    } catch {
      toast.error('Failed to save device updates');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRawJson = async () => {
    if (!device) return;
    try {
      const parsed = JSON.parse(rawJson);
      setIsSavingRaw(true);
      await adminUpdateDevice(device.owner_uid, device.device_id, parsed);
      toast.success('Raw JSON updated in Firestore');
      loadDevice();
    } catch (e: any) {
      toast.error(`Invalid JSON: ${e.message}`);
    } finally {
      setIsSavingRaw(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!device) return;
    setIsDeleting(true);
    try {
      await adminDeleteDevice(device.owner_uid, device.device_id);
      toast.success('Device removed from fleet');
      navigate('/admin/devices');
    } catch {
      toast.error('Failed to delete device');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Device record not found.</p>
        <Link to="/admin/devices" className="text-cyan-600 dark:text-[#00E5FF] hover:underline text-xs">
          Return to Fleet Directory
        </Link>
      </div>
    );
  }

  const online = isDeviceOnline(device.last_active);
  const lat = device.location?.latitude;
  const lng = device.location?.longitude;
  const hasLocation = Boolean(lat && lng);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/devices"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                {device.device_name}
              </h1>
              <Badge variant={online ? 'success' : 'neutral'} pulse={online} size="sm">
                {online ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              ID: {device.device_id} • {device.manufacturer} {device.model} (Android {device.os_version})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleCommand('track')}
            variant="outline"
            size="sm"
            leftIcon={<Radio className="w-3.5 h-3.5 text-cyan-500" />}
          >
            Request GPS Ping
          </Button>
          <Button
            onClick={() => handleCommand('screenshot')}
            variant="outline"
            size="sm"
            leftIcon={<Camera className="w-3.5 h-3.5 text-purple-500" />}
          >
            Capture Screen
          </Button>
          <Button
            onClick={loadDevice}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reload
          </Button>
        </div>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Location Map & Remote Screenshot */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* OpenStreetMap Location Card */}
          <Card variant="default" className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                    Live OpenStreetMap Location
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {hasLocation ? `${lat?.toFixed(5)}°, ${lng?.toFixed(5)}°` : 'No GPS coordinates reported'}
                  </span>
                </div>
              </div>

              {hasLocation && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-600 dark:text-[#00E5FF] hover:underline font-mono inline-flex items-center gap-1"
                >
                  <span>Open in OSM</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {hasLocation ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <DeviceMap
                  location={device.location}
                  deviceName={device.device_name}
                  isOnline={online}
                  height="340px"
                />
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Device has not reported GPS coordinates yet. Click &quot;Request GPS Ping&quot; to fetch live location.
                </p>
              </div>
            )}
          </Card>

          {/* Remote Screenshot Asset Card */}
          <Card variant="default" className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                    Latest Screen Capture
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Status: {device.screenshot_status || (device.latest_screenshot ? 'Success' : 'No screenshot captured yet')}
                  </span>
                </div>
              </div>

              {device.latest_screenshot && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-cyan-600 dark:text-[#00E5FF] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Enlarge Preview</span>
                </button>
              )}
            </div>

            {device.latest_screenshot ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center max-h-[380px]">
                <img
                  src={device.latest_screenshot}
                  alt={`Screenshot of ${device.device_name}`}
                  className="max-h-[360px] w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setLightboxOpen(true)}
                />
              </div>
            ) : (
              <div className="p-10 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No screenshot uploaded from this device yet. Click &quot;Capture Screen&quot; to trigger silent background capture.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Hardware Telemetry, Remote Controls & Raw Document */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Hardware & Ownership Details */}
          <Card variant="default" className="p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> HARDWARE &amp; IDENTITY
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">REGISTERED</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatTimestampDate(device.registered_at)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">LAST PING</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatTimeAgo(device.last_active)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Device Label</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Owner User UID</label>
                <input
                  type="text"
                  value={ownerUid}
                  onChange={(e) => setOwnerUid(e.target.value)}
                  placeholder="Parent User UID"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={handleSaveInfo}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Identity
                </Button>
              </div>
            </div>
          </Card>

          {/* Remote Lockdown & Security Controls */}
          <Card variant="default" className="p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> LOCKDOWN &amp; SECURITY CONTROLS
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Quick Settings Lock</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Blocks pull-down notification shade</p>
                </div>
                <Toggle
                  id="qs-block-detail"
                  checked={qsBlock}
                  onChange={(val) => handleToggle('quick_settings_block', val)}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Shutdown Protection</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Blocks power off dialog</p>
                </div>
                <Toggle
                  id="shut-protect-detail"
                  checked={shutdownProtect}
                  onChange={(val) => handleToggle('shutdown_protection', val)}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Silent Mode Override</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Forces silent or ringer modes</p>
                </div>
                <Toggle
                  id="silent-mode-detail"
                  checked={silentMode}
                  onChange={(val) => handleToggle('silent_mode', val)}
                />
              </div>

              {/* Emergency Siren Alarm */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                sirenActive
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
              }`}>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BellRing className={`w-3.5 h-3.5 ${sirenActive ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
                    <span>Emergency Siren Override</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sirenActive ? 'Siren blaring at 100% full volume' : 'Remotely blare full-volume alarm'}
                  </p>
                </div>
                <Toggle
                  id="siren-mode-admin-detail"
                  checked={sirenActive}
                  onChange={(val) => handleToggle('siren_active', val)}
                />
              </div>
            </div>
          </Card>

          {/* Live Screen State & Foreground App Diagnostics */}
          <Card variant="default" className="p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Activity className="w-4 h-4" /> LIVE ACTIVITY &amp; DISPLAY TELEMETRY
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Screen Display:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  device.screen_state === 'on'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {device.screen_state === 'on' ? '● Screen ON (Active)' : '○ Screen OFF (Sleep)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Foreground App:</span>
                  <span className="text-cyan-600 dark:text-[#00E5FF] font-bold truncate max-w-[200px]" title={device.current_app_name}>
                    {device.current_app_name || 'Launcher / Idle'}
                  </span>
                </div>
                {device.current_app_detail && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400">Current Window:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[190px]">
                      {device.current_app_detail}
                    </span>
                  </div>
                )}
              </div>

              {device.last_activity_time && (
                <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                  <span>Last Activity Event:</span>
                  <span>{formatTimeAgo(device.last_activity_time)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Raw JSON Document Editor */}
          <Card variant="default" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> RAW FIRESTORE DOCUMENT
              </h3>
              <Button
                variant="outline"
                size="sm"
                isLoading={isSavingRaw}
                onClick={handleSaveRawJson}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save JSON
              </Button>
            </div>

            <div className="rounded-xl overflow-hidden">
              <JsonCodeEditor
                height="220px"
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={rawJson}
                onChange={(val) => setRawJson(val || '{}')}
              />
            </div>
          </Card>

          {/* Danger Zone: Delete Device */}
          <Card variant="default" className="p-5 border-red-500/30">
            <h3 className="text-xs font-mono font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4" /> DANGER ZONE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Permanently purge this hardware node from Firebase Firestore.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Device Record
            </Button>
          </Card>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && device.latest_screenshot && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={device.latest_screenshot}
              alt="Fullscreen Screenshot"
              className="max-h-[80vh] w-auto rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 flex items-center gap-4">
              <a
                href={device.latest_screenshot}
                target="_blank"
                rel="noreferrer"
                download={`screenshot-${device.device_id}.jpg`}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
                <span>Download Asset</span>
              </a>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-mono"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Hardware Deletion"
        description={`Are you sure you want to permanently delete device ${device.device_name} (${device.device_id})? This action cannot be reversed.`}
        confirmText="Permanently Delete"
        confirmVariant="danger"
        isConfirmLoading={isDeleting}
        onConfirm={handleDeleteDevice}
      />
    </div>
  );
};
