import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import { db, firebaseConfig } from '../lib/firebase';
import { 
  fetchAdminUsers, 
  fetchAdminDevices, 
  fetchAdminGuestUsers, 
  getTimestampSeconds, 
  adminUpdateUser, 
  adminDeleteUser,
  adminUpdateDevice,
  adminDeleteDevice,
  adminDeleteGuestUser
} from './deviceService';
import { UserProfile, DeviceRecord, GuestUserRecord, AdminRecord } from '../types';

/**
 * ─────────────────────────────────────────────────────────
 * ADMIN ROLE & PERMISSION MANAGEMENT (Pure Firestore admins/{uid})
 * ─────────────────────────────────────────────────────────
 */

export async function checkAdminRole(uid: string): Promise<{
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: 'superadmin' | 'admin' | null;
  adminRecord: AdminRecord | null;
}> {
  if (!uid) return { isAdmin: false, isSuperAdmin: false, role: null, adminRecord: null };
  try {
    const adminRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminRef);
    if (snap.exists()) {
      const data = snap.data();
      const role = data.role as 'superadmin' | 'admin';
      const isActive = data.isActive !== false;
      if (isActive && (role === 'superadmin' || role === 'admin')) {
        const record: AdminRecord = {
          uid,
          email: data.email || '',
          role,
          addedBy: data.addedBy || '',
          addedAt: data.addedAt || null,
          isActive: true
        };
        return {
          isAdmin: true,
          isSuperAdmin: role === 'superadmin',
          role,
          adminRecord: record
        };
      }
    }
  } catch (err) {
    console.warn('Error reading admins/{uid}:', err);
  }
  return { isAdmin: false, isSuperAdmin: false, role: null, adminRecord: null };
}

export async function fetchAdmins(): Promise<AdminRecord[]> {
  try {
    const colRef = collection(db, 'admins');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        email: data.email || '',
        role: data.role || 'admin',
        addedBy: data.addedBy || '',
        addedAt: data.addedAt || null,
        isActive: data.isActive !== false
      } as AdminRecord;
    });
  } catch (err) {
    console.warn('fetchAdmins error:', err);
    return [];
  }
}

/**
 * Super Admin adds a new admin:
 * 1. Creates Firebase Auth user via secondary app instance (does not log out current super admin)
 * 2. Creates Firestore document in admins/{newUid}
 * 3. Creates corresponding users/{newUid} record for system consistency
 */
export async function createAdminViaSecondaryApp(
  email: string,
  pass: string,
  role: 'superadmin' | 'admin',
  addedByUid: string
): Promise<AdminRecord> {
  const secondaryAppName = `AdminCreateApp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), pass);
    const newUid = cred.user.uid;

    const adminRef = doc(db, 'admins', newUid);
    const adminDocData = {
      email: cred.user.email || email.trim(),
      role,
      addedBy: addedByUid,
      addedAt: serverTimestamp(),
      isActive: true
    };
    await setDoc(adminRef, adminDocData);

    // Keep users/{newUid} in sync so system lookups work smoothly
    try {
      const userRef = doc(db, 'users', newUid);
      await setDoc(userRef, {
        uid: newUid,
        full_name: email.split('@')[0],
        email: email.trim(),
        createdAt: serverTimestamp(),
        subscription: true,
        subscription_start: serverTimestamp(),
        subscription_end: Timestamp.fromDate(new Date(Date.now() + 3650 * 86400000))
      }, { merge: true });
    } catch (e) {
      console.warn('Sync to users/{newUid} non-fatal:', e);
    }

    return {
      uid: newUid,
      email: cred.user.email || email.trim(),
      role,
      addedBy: addedByUid,
      addedAt: new Date().toISOString(),
      isActive: true
    };
  } finally {
    try {
      await secondarySignOut(secondaryAuth);
      await deleteApp(secondaryApp);
    } catch (e) {
      console.warn('Secondary app cleanup non-fatal:', e);
    }
  }
}

export async function removeAdmin(uid: string): Promise<void> {
  const adminRef = doc(db, 'admins', uid);
  await deleteDoc(adminRef);
}

export async function updateAdminStatus(uid: string, isActive: boolean): Promise<void> {
  const adminRef = doc(db, 'admins', uid);
  await updateDoc(adminRef, { isActive });
}

/**
 * Raw Document Operations for Admin Dashboard Raw Editor
 */
export async function getRawDocument(collectionPath: string, docId: string): Promise<any> {
  try {
    const docRef = doc(db, collectionPath, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data();
  } catch (err) {
    console.error('getRawDocument error:', err);
    throw err;
  }
}

export async function saveRawDocument(
  collectionPath: string, 
  docId: string, 
  data: any, 
  merge = true
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, data, { merge });
  } catch (err) {
    console.error('saveRawDocument error:', err);
    throw err;
  }
}

export async function deleteRawDocument(collectionPath: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('deleteRawDocument error:', err);
    throw err;
  }
}

export async function listCollectionDocs(collectionPath: string): Promise<Array<{ id: string; data: any }>> {
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, data: d.data() }));
  } catch (err) {
    console.error('listCollectionDocs error:', err);
    throw err;
  }
}

/**
 * Bulk Operations
 */
export async function bulkSetSubscription(uids: string[], isSubscribed: boolean): Promise<number> {
  let count = 0;
  for (const uid of uids) {
    try {
      await adminUpdateUser(uid, { subscription: isSubscribed });
      count++;
    } catch (e) {
      console.warn(`Failed to update sub for ${uid}`, e);
    }
  }
  return count;
}

export async function bulkSendCommandToDevices(
  devices: Array<{ owner_uid: string; device_id: string }>,
  command: 'ring' | 'lock' | 'track' | 'screenshot'
): Promise<number> {
  let count = 0;
  for (const dev of devices) {
    try {
      const updates: any = {};
      if (command === 'ring') updates.siren_active = true;
      if (command === 'lock') updates.quick_settings_block = true;
      if (command === 'track') updates.request_location_update = true;
      if (command === 'screenshot') {
        updates.screenshot_request = true;
        updates.screenshot_status = 'Pending';
      }
      await adminUpdateDevice(dev.owner_uid, dev.device_id, updates);
      count++;
    } catch (e) {
      console.warn(`Failed command for ${dev.device_id}`, e);
    }
  }
  return count;
}

export async function bulkDeleteUsers(uids: string[]): Promise<number> {
  let count = 0;
  for (const uid of uids) {
    try {
      await adminDeleteUser(uid);
      count++;
    } catch (e) {
      console.warn(`Failed to delete user ${uid}`, e);
    }
  }
  return count;
}

export async function bulkDeleteDevices(devices: Array<{ owner_uid: string; device_id: string }>): Promise<number> {
  let count = 0;
  for (const dev of devices) {
    try {
      await adminDeleteDevice(dev.owner_uid, dev.device_id);
      count++;
    } catch (e) {
      console.warn(`Failed to delete device ${dev.device_id}`, e);
    }
  }
  return count;
}

/**
 * Danger Zone Operations
 */
export async function dangerDeleteAllGuestUsers(): Promise<number> {
  const guests = await fetchAdminGuestUsers(false);
  let count = 0;
  for (const g of guests) {
    try {
      const id = g.guest_id || g.device_id;
      if (id) {
        await adminDeleteGuestUser(id);
        count++;
      }
    } catch (e) {
      console.warn('Error deleting guest user', e);
    }
  }
  return count;
}

export async function dangerDeleteInactiveDevices(daysThreshold = 30): Promise<number> {
  const devices = await fetchAdminDevices(false);
  const cutoffSec = Math.floor(Date.now() / 1000) - (daysThreshold * 86400);
  let count = 0;

  for (const d of devices) {
    const sec = getTimestampSeconds(d.last_active);
    if (!sec || sec < cutoffSec) {
      try {
        await adminDeleteDevice(d.owner_uid, d.device_id);
        count++;
      } catch (e) {
        console.warn(`Failed to delete inactive device ${d.device_id}`, e);
      }
    }
  }
  return count;
}

export async function dangerResetAllSubscriptions(): Promise<number> {
  const users = await fetchAdminUsers(false);
  let count = 0;
  for (const u of users) {
    if (u.subscription) {
      try {
        await adminUpdateUser(u.uid, { subscription: false });
        count++;
      } catch (e) {
        console.warn(`Failed reset sub for ${u.uid}`, e);
      }
    }
  }
  return count;
}

export async function dangerClearAllScreenshots(): Promise<number> {
  const devices = await fetchAdminDevices(false);
  let count = 0;
  for (const d of devices) {
    if (d.latest_screenshot) {
      try {
        await adminUpdateDevice(d.owner_uid || '', d.device_id, {
          latest_screenshot: null,
          screenshot_status: 'Cleared'
        });
        count++;
      } catch (e) {
        console.warn(`Failed clear screenshot for ${d.device_id}`, e);
      }
    }
  }
  return count;
}

export async function dangerWipeAllNonAdminData(preserveEmail?: string): Promise<{ usersDeleted: number; guestsDeleted: number }> {
  const users = await fetchAdminUsers(false);
  const guests = await fetchAdminGuestUsers(false);
  const admins = await fetchAdmins();
  const adminEmails = new Set(admins.map(a => a.email.toLowerCase()));
  const adminUids = new Set(admins.map(a => a.uid));

  if (preserveEmail) {
    adminEmails.add(preserveEmail.toLowerCase());
  }

  let usersDeleted = 0;
  let guestsDeleted = 0;

  for (const g of guests) {
    const id = g.guest_id || g.device_id;
    if (id) {
      await adminDeleteGuestUser(id);
      guestsDeleted++;
    }
  }

  for (const u of users) {
    // Preserve any admin account
    if (adminUids.has(u.uid) || (u.email && adminEmails.has(u.email.toLowerCase()))) {
      continue;
    }
    await adminDeleteUser(u.uid);
    usersDeleted++;
  }

  return { usersDeleted, guestsDeleted };
}
