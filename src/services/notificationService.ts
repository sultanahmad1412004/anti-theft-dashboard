/**
 * Real-Time Admin Notification Engine & Audio Ringtone Synthesizer
 */

export interface AdminNotification {
  id: string;
  type: 'user_signup' | 'new_device' | 'siren_alert' | 'lockdown' | 'system';
  title: string;
  message: string;
  targetId?: string;
  timestamp: string; // ISO string
  read: boolean;
}

const STORAGE_KEY = 'project101_admin_notifications';
const SOUND_SETTING_KEY = 'project101_admin_ringtone_enabled';

/**
 * High-fidelity Web Audio API Ringtone Synthesizer
 * Plays an unmistakable, crisp, professional dual-tone security chime
 * without relying on external network MP3 files.
 */
export function playNotificationRingtone(type: 'signup' | 'siren' | 'device' | 'default' = 'default') {
  if (!isSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'siren') {
      // Urgent siren ping (high pitch wobble)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.45);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === 'signup') {
      // Pleasant, bright ascending 3-note chime (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.28, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });
    } else {
      // Default modern notification ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.warn('Audio ringtone playback not allowed yet by browser gesture:', err);
  }
}

export function isSoundEnabled(): boolean {
  const val = localStorage.getItem(SOUND_SETTING_KEY);
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_SETTING_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('admin_sound_setting_changed'));
}

export function getStoredNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(list: AdminNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100))); // keep max 100
    window.dispatchEvent(new Event('admin_notifications_updated'));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function addNotification(
  notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>
): AdminNotification {
  const current = getStoredNotifications();
  const newEntry: AdminNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    read: false
  };

  const updated = [newEntry, ...current];
  saveNotifications(updated);

  // Play appropriate ringtone
  if (notif.type === 'user_signup') {
    playNotificationRingtone('signup');
  } else if (notif.type === 'siren_alert') {
    playNotificationRingtone('siren');
  } else {
    playNotificationRingtone('default');
  }

  return newEntry;
}

export function markAsRead(id: string) {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllAsRead() {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function clearAllNotifications() {
  saveNotifications([]);
}
