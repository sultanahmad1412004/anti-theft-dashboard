import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  BellRing, 
  UserPlus, 
  Smartphone, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  CheckCheck, 
  Trash2, 
  Radio, 
  ExternalLink, 
  Clock, 
  Play,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  AdminNotification, 
  getStoredNotifications, 
  markAsRead, 
  markAllAsRead, 
  clearAllNotifications, 
  playNotificationRingtone, 
  isSoundEnabled, 
  setSoundEnabled,
  addNotification
} from '../../services/notificationService';
import toast from 'react-hot-toast';

export const AdminNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>(getStoredNotifications());
  const [soundActive, setSoundActive] = useState<boolean>(isSoundEnabled());
  const [filter, setFilter] = useState<'all' | 'unread' | 'user_signup' | 'new_device' | 'siren_alert'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getStoredNotifications());
    };
    const handleSoundChange = () => {
      setSoundActive(isSoundEnabled());
    };

    window.addEventListener('admin_notifications_updated', handleUpdate);
    window.addEventListener('admin_sound_setting_changed', handleSoundChange);

    return () => {
      window.removeEventListener('admin_notifications_updated', handleUpdate);
      window.removeEventListener('admin_sound_setting_changed', handleSoundChange);
    };
  }, []);

  const toggleSound = () => {
    const newState = !soundActive;
    setSoundEnabled(newState);
    setSoundActive(newState);
    if (newState) {
      playNotificationRingtone('signup');
      toast.success('Ringtone Audio Alerts Enabled');
    } else {
      toast('Ringtone Audio Alerts Muted', { icon: '🔇' });
    }
  };

  const handleTestRingtone = (type: 'signup' | 'siren') => {
    playNotificationRingtone(type);
    toast.success(`Playing test ${type === 'signup' ? 'Signup Chime' : 'Emergency Siren'}`);
  };

  const handleAddSampleNotification = () => {
    addNotification({
      type: 'user_signup',
      title: '🎉 New User Signup',
      message: `Demo signup test (${new Date().toLocaleTimeString()}). Ringtone played successfully!`,
      targetId: 'demo-user-id'
    });
    toast.success('Sample notification generated with chime!');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'user_signup') return n.type === 'user_signup';
    if (filter === 'new_device') return n.type === 'new_device';
    if (filter === 'siren_alert') return n.type === 'siren_alert';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'user_signup':
        return <UserPlus className="w-5 h-5 text-emerald-500" />;
      case 'new_device':
        return <Smartphone className="w-5 h-5 text-cyan-500" />;
      case 'siren_alert':
        return <BellRing className="w-5 h-5 text-rose-500 animate-bounce" />;
      case 'lockdown':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] border border-cyan-500/30">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Admin Dashboard Notifications
            </h1>
            <Badge variant="cyan" size="sm">
              Real-Time Sound Alert
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-sans">
            Instant audible ringtone whenever a new Android handset user signs up, registers hardware, or triggers sirens.
          </p>
        </div>

        {/* Audio Ringtone Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={toggleSound}
            variant={soundActive ? 'cyan' : 'outline'}
            size="sm"
            leftIcon={soundActive ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          >
            {soundActive ? 'Ringtone ON' : 'Ringtone Muted'}
          </Button>

          <Button
            onClick={() => handleTestRingtone('signup')}
            variant="outline"
            size="sm"
            leftIcon={<Play className="w-3.5 h-3.5 text-cyan-500" />}
          >
            Test Signup Chime
          </Button>

          <Button
            onClick={() => handleTestRingtone('siren')}
            variant="outline"
            size="sm"
            leftIcon={<Play className="w-3.5 h-3.5 text-rose-500" />}
          >
            Test Siren
          </Button>
        </div>
      </div>

      {/* Info Banner for Real-time Auto-Detection */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131826] border border-slate-200 dark:border-[#252B3D] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-sans">
            <strong>Active Listening Engine:</strong> The dashboard continuously monitors Firebase for newly created user credentials and incoming device telemetry, automatically chiming on arrival.
          </span>
        </div>
        <button
          onClick={handleAddSampleNotification}
          className="shrink-0 text-cyan-600 dark:text-[#00E5FF] hover:underline font-mono text-[11px] font-semibold"
        >
          + Send Test Chime Notification
        </button>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#111927] border border-slate-200 dark:border-[#1F2937] text-xs font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'unread'
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('user_signup')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'user_signup'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Signups
          </button>
          <button
            onClick={() => setFilter('new_device')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'new_device'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Devices
          </button>
          <button
            onClick={() => setFilter('siren_alert')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'siren_alert'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Siren Alarms
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={() => {
                markAllAsRead();
                toast.success('Marked all as read');
              }}
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            >
              Mark All Read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              onClick={() => {
                clearAllNotifications();
                toast.success('Notification feed cleared');
              }}
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            >
              Clear Feed
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card variant="default" className="p-0 overflow-hidden border border-slate-200 dark:border-[#1F2937]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-sans">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No notifications matching your filter
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Incoming user accounts, device link events, and siren alerts will automatically populate here and ring aloud in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-[#1F2937]">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer group ${
                  item.read
                    ? 'bg-white dark:bg-[#111927] hover:bg-slate-50 dark:hover:bg-[#162032]'
                    : 'bg-cyan-50/50 dark:bg-[#132338]/60 hover:bg-cyan-100/50 dark:hover:bg-[#162940]'
                }`}
              >
                {/* Icon box */}
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  item.type === 'siren_alert'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                    : item.type === 'user_signup'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] border border-cyan-500/30'
                }`}>
                  {getIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading truncate">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    {item.targetId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'user_signup') {
                            navigate('/admin/users');
                          } else {
                            navigate('/admin/devices');
                          }
                        }}
                        className="text-cyan-600 dark:text-[#00E5FF] hover:underline flex items-center gap-0.5"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
