import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  query,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DeviceRecord, UserRecord, GuestUserRecord, ActivityLog } from '../types';

let localActivityLogs: ActivityLog[] = [];

/**
 * Real-time listener for a user's devices: users/{uid}/devices
 */
export function subscribeToUserDevices(
  uid: string,
  arg2: boolean | ((devices: DeviceRecord[]) => void),
  arg3?: ((devices: DeviceRecord[]) => void) | boolean
): () => void {
  const callback = typeof arg2 === 'function' ? arg2 : (typeof arg3 === 'function' ? arg3 : () => {});

  if (!uid) {
    callback([]);
    return () => {};
  }

  try {
    const devicesColRef = collection(db, 'users', uid, 'devices');
    const unsubscribe = onSnapshot(
      devicesColRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback([]);
          return;
        }
        const devices: DeviceRecord[] = snapshot.docs.map((docSnap) => ({
          device_id: docSnap.id,
          ...docSnap.data()
        } as DeviceRecord));
        callback(devices);
      },
      (error) => {
        console.warn('Firestore devices listener error:', error);
        callback([]);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error initiating devices listener:', err);
    callback([]);
    return () => {};
  }
}

/**
 * Real-time listener for a single device: users/{uid}/devices/{deviceId}
 */
export function subscribeToSingleDevice(
  uid: string,
  deviceId: string,
  _isDemo: boolean,
  callback: (device: DeviceRecord | null) => void
): () => void {
  if (!uid || !deviceId) {
    callback(null);
    return () => {};
  }

  try {
    const deviceDocRef = doc(db, 'users', uid, 'devices', deviceId);
    const unsubscribe = onSnapshot(
      deviceDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ device_id: docSnap.id, ...docSnap.data() } as DeviceRecord);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.warn('Firestore single device listener error:', error);
        callback(null);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error initiating single device listener:', err);
    callback(null);
    return () => {};
  }
}

/**
 * Update device controls (silent_mode, quick_settings_block, shutdown_protection, siren_active)
 */
export async function updateDeviceToggle(
  uid: string,
  deviceId: string,
  key: 'silent_mode' | 'quick_settings_block' | 'shutdown_protection' | 'siren_active',
  value: boolean,
  _isDemo?: boolean
): Promise<void> {
  const deviceDocRef = doc(db, 'users', uid, 'devices', deviceId);
  await updateDoc(deviceDocRef, {
    [key]: value
  });

  logActivity({
    type: 'COMMAND',
    deviceId,
    userEmail: uid,
    action: `Switch ${key} toggled to ${value ? 'ACTIVE' : 'OFF'}`,
    status: 'SUCCESS'
  });
}

/**
 * Trigger remote emergency siren on device
 * Updates siren_active: true / false in Firestore users/{uid}/devices/{deviceId}
 */
export async function triggerDeviceSiren(
  uid: string,
  deviceId: string,
  active: boolean,
  _isDemo?: boolean
): Promise<void> {
  const deviceDocRef = doc(db, 'users', uid, 'devices', deviceId);
  await updateDoc(deviceDocRef, {
    siren_active: active
  });

  logActivity({
    type: 'COMMAND',
    deviceId,
    userEmail: uid,
    action: `Emergency Siren turned ${active ? 'BLARING ON' : 'STANDBY OFF'}`,
    status: 'SUCCESS'
  });
}

/**
 * Trigger remote screenshot capture
 * Sends: capture_screenshot: true, capture_request_time: serverTimestamp(), screenshot_status: "In progress..."
 */
export async function triggerScreenshotCapture(
  uid: string,
  deviceId: string,
  _isDemo?: boolean
): Promise<void> {
  const deviceDocRef = doc(db, 'users', uid, 'devices', deviceId);
  await updateDoc(deviceDocRef, {
    capture_screenshot: true,
    capture_request_time: serverTimestamp(),
    screenshot_status: 'In progress...'
  });

  logActivity({
    type: 'SCREENSHOT',
    deviceId,
    userEmail: uid,
    action: 'Requested remote screenshot capture command',
    status: 'PENDING'
  });
}

/**
 * Request live location update from device
 * Sends: request_location: true, request_location_time: serverTimestamp()
 */
export async function requestLocationUpdate(
  uid: string,
  deviceId: string,
  _isDemo?: boolean
): Promise<void> {
  const deviceDocRef = doc(db, 'users', uid, 'devices', deviceId);
  await updateDoc(deviceDocRef, {
    request_location: true,
    request_location_time: serverTimestamp()
  });

  logActivity({
    type: 'COMMAND',
    deviceId,
    userEmail: uid,
    action: 'Transmitted request_location signal',
    status: 'PENDING'
  });
}

/**
 * Delete a user's device from users/{uid}/devices/{deviceId}
 */
export async function deleteUserDevice(
  uid: string,
  deviceId: string,
  _isDemo?: boolean
): Promise<void> {
  const deviceDocRef = doc(db, 'users', uid, 'devices', deviceId);
  await deleteDoc(deviceDocRef);

  logActivity({
    type: 'COMMAND',
    deviceId,
    userEmail: uid,
    action: `Permanently removed device ${deviceId}`,
    status: 'SUCCESS'
  });
}

// ─────────────────────────────────────────────────────────
// ADMIN SERVICES (100% REAL FIRESTORE)
// ─────────────────────────────────────────────────────────

export async function fetchAdminAllUsers(_isDemo = false): Promise<UserRecord[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(query(usersCol, limit(100)));
    if (!snap.empty) {
      return snap.docs.map(d => ({
        uid: d.id,
        ...d.data()
      } as UserRecord));
    }
  } catch (err) {
    console.warn('Fetch all users error:', err);
  }
  return [];
}

export async function fetchAdminAllDevices(_isDemo = false): Promise<DeviceRecord[]> {
  try {
    const users = await fetchAdminAllUsers(false);
    const allDevices: DeviceRecord[] = [];
    for (const u of users) {
      try {
        const dSnap = await getDocs(collection(db, 'users', u.uid, 'devices'));
        dSnap.forEach(docSnap => {
          allDevices.push({
            device_id: docSnap.id,
            ...docSnap.data(),
            owner_uid: u.uid,
            owner_email: u.email
          } as DeviceRecord);
        });
      } catch {
        // Skip user subcollection if inaccessible
      }
    }
    return allDevices;
  } catch (err) {
    console.warn('Error loading admin all devices:', err);
  }
  return [];
}

/**
 * Real-time listener for ALL devices across the fleet using collectionGroup('devices').
 * Budget-friendly & Spark plan safe:
 * - Single snapshot query (not N queries) with limit(50).
 * - Fires only when a device changes, billed 1 read per modified document.
 */
export function subscribeAdminDevices(
  callback: (devices: DeviceRecord[]) => void,
  _isDemo = false
): () => void {
  try {
    const q = query(collectionGroup(db, 'devices'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const devices: DeviceRecord[] = [];
        snapshot.forEach((docSnap) => {
          const ownerUid = docSnap.ref.parent.parent?.id;
          devices.push({
            device_id: docSnap.id,
            ...docSnap.data(),
            owner_uid: ownerUid
          } as DeviceRecord);
        });
        callback(devices);
      },
      (err) => {
        console.warn('CollectionGroup devices listener error, falling back:', err);
        fetchAdminAllDevices(false).then(callback).catch(() => callback([]));
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error attaching admin devices listener:', err);
    fetchAdminAllDevices(false).then(callback).catch(() => callback([]));
    return () => {};
  }
}

/**
 * Real-time listener for registered users with limit(50)
 */
export function subscribeAdminUsers(
  callback: (users: UserRecord[]) => void,
  _isDemo = false
): () => void {
  try {
    const q = query(collection(db, 'users'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users: UserRecord[] = [];
        snapshot.forEach((d) => {
          users.push({
            uid: d.id,
            ...d.data()
          } as UserRecord);
        });
        callback(users);
      },
      (err) => {
        console.warn('Admin users listener error:', err);
        fetchAdminAllUsers(false).then(callback).catch(() => callback([]));
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error attaching admin users listener:', err);
    return () => {};
  }
}

/**
 * Real-time listener for guest users with limit(50)
 */
export function subscribeAdminGuestUsers(
  callback: (guests: GuestUserRecord[]) => void,
  _isDemo = false
): () => void {
  try {
    const q = query(collection(db, 'guest_users'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const guests: GuestUserRecord[] = [];
        snapshot.forEach((d) => {
          guests.push({
            guest_id: d.id,
            ...d.data()
          } as GuestUserRecord);
        });
        callback(guests);
      },
      (err) => {
        console.warn('Admin guests listener error:', err);
        fetchAdminGuestUsers(false).then(callback).catch(() => callback([]));
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error attaching admin guests listener:', err);
    return () => {};
  }
}

export async function fetchAdminGuestUsers(_isDemo = false): Promise<GuestUserRecord[]> {
  try {
    const guestsCol = collection(db, 'guest_users');
    const snap = await getDocs(query(guestsCol, limit(100)));
    if (!snap.empty) {
      return snap.docs.map(d => ({
        guest_id: d.id,
        ...d.data()
      } as GuestUserRecord));
    }
  } catch (err) {
    console.warn('Fetch guest users error:', err);
  }
  return [];
}

export async function adminUpdateUser(uid: string, updates: Partial<UserRecord>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, updates as any);
  } catch (err) {
    console.warn('Firestore adminUpdateUser error:', err);
  }
}

export async function adminDeleteUser(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Firestore adminDeleteUser error:', err);
  }
}

export async function adminUpdateDevice(
  ownerUid: string,
  deviceId: string,
  updates: Partial<DeviceRecord>
): Promise<void> {
  try {
    const dRef = doc(db, 'users', ownerUid, 'devices', deviceId);
    await updateDoc(dRef, updates as any);
  } catch (err) {
    console.warn('Firestore adminUpdateDevice error:', err);
  }
}

export async function adminDeleteDevice(ownerUid: string, deviceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', ownerUid, 'devices', deviceId));
  } catch (err) {
    console.warn('Firestore adminDeleteDevice error:', err);
  }
}

export async function adminDeleteGuestUser(guestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'guest_users', guestId));
  } catch (err) {
    console.warn('Firestore adminDeleteGuestUser error:', err);
  }
}

export async function adminExtendSubscription(uid: string, days: number): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  const current = userDoc.exists() ? (userDoc.data() as UserRecord) : null;
  const nowSec = Math.floor(Date.now() / 1000);
  const startSec = current?.subscription_start ? getTimestampSeconds(current.subscription_start) : nowSec;
  const currentEndSec = current?.subscription_end ? getTimestampSeconds(current.subscription_end) : nowSec;
  const baseSec = currentEndSec > nowSec ? currentEndSec : nowSec;
  const newEndSec = baseSec + (days * 86400);

  const updates = {
    subscription: true,
    subscription_start: { seconds: startSec, nanoseconds: 0 } as any,
    subscription_end: { seconds: newEndSec, nanoseconds: 0 } as any
  };

  await adminUpdateUser(uid, updates);
}

export function fetchActivityLogs(): ActivityLog[] {
  return [...localActivityLogs];
}

export function logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  const newEntry: ActivityLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };
  localActivityLogs = [newEntry, ...localActivityLogs.slice(0, 99)];
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

export function isDeviceOnline(lastActive: any): boolean {
  if (!lastActive) return false;
  const lastActiveSec = getTimestampSeconds(lastActive);
  const nowSec = Math.floor(Date.now() / 1000);
  // Online if active within last 5 minutes (300 seconds)
  return (nowSec - lastActiveSec) < 300;
}

export function getTimestampSeconds(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val instanceof Timestamp) return val.seconds;
  if (typeof val.seconds === 'number') return val.seconds;
  if (typeof val === 'string') return Math.floor(new Date(val).getTime() / 1000);
  if (val instanceof Date) return Math.floor(val.getTime() / 1000);
  return 0;
}

export function formatTimeAgo(val: any): string {
  const sec = getTimestampSeconds(val);
  if (!sec) return 'N/A';
  const diff = Math.floor(Date.now() / 1000) - sec;
  if (diff < 60) return `${Math.max(1, diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export function formatTimestampDate(val: any): string {
  const sec = getTimestampSeconds(val);
  if (!sec) return 'N/A';
  const d = new Date(sec * 1000);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ─────────────────────────────────────────────────────────
// ALIASES & COMPATIBILITY EXPORTS
// ─────────────────────────────────────────────────────────

export const fetchAdminUsers = fetchAdminAllUsers;
export const fetchAdminDevices = fetchAdminAllDevices;

export function subscribeToDevice(
  uid: string,
  deviceId: string,
  callback: (device: DeviceRecord | null) => void,
  isDemo?: boolean
): () => void {
  return subscribeToSingleDevice(uid, deviceId, !!isDemo, callback);
}

export async function updateUserSubscription(
  uid: string,
  status: boolean,
  _isDemo = false
): Promise<void> {
  const now = new Date();
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  if (status) {
    await adminUpdateUser(uid, {
      subscription: true,
      subscription_start: serverTimestamp(),
      subscription_end: Timestamp.fromDate(nextYear)
    });
  } else {
    await adminUpdateUser(uid, {
      subscription: false,
      subscription_end: serverTimestamp()
    });
  }
}

export async function deleteUserRecord(uid: string, _isDemo = false): Promise<void> {
  await adminDeleteUser(uid);
}
