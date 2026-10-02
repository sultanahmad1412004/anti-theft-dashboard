import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRecord, AdminRecord } from '../types';

export type AdminRole = 'superadmin' | 'admin' | null;

interface AuthContextType {
  currentUser: User | null;
  userRecord: UserRecord | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminRole: AdminRole;
  adminRecord: AdminRecord | null;
  loading: boolean;
  isDemoMode: boolean; // Kept for interface backward compatibility, always false
  login: (email: string, pass: string) => Promise<{
    isAdmin: boolean;
    isSuperAdmin: boolean;
    role: AdminRole;
    user: User;
  }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateLocalProfile: (name: string) => void;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Firestore-based admin check: reads admins/{uid}
  const checkAdminStatus = async (uid: string, email?: string | null): Promise<{
    isAdmin: boolean;
    isSuperAdmin: boolean;
    role: AdminRole;
    adminRecord: AdminRecord | null;
  }> => {
    try {
      const adminDocRef = doc(db, 'admins', uid);
      const snap = await getDoc(adminDocRef);

      if (snap.exists()) {
        const data = snap.data();
        const role = (data.role as AdminRole) || 'admin';
        const active = data.isActive !== false;

        if (active) {
          const rec: AdminRecord = {
            uid,
            email: data.email || email || '',
            role: role === 'superadmin' ? 'superadmin' : 'admin',
            addedBy: data.addedBy || 'system',
            addedAt: data.addedAt || null,
            isActive: true
          };
          return {
            isAdmin: true,
            isSuperAdmin: role === 'superadmin',
            role,
            adminRecord: rec
          };
        }
      } else if (email && email.trim().toLowerCase() === 'sultanahmad.real1@gmail.com') {
        // Initial setup for Sultan Ahmad: seed super admin record in admins/{uid}
        const superAdminDoc = {
          email: email.trim(),
          role: 'superadmin',
          addedBy: 'initial_setup',
          addedAt: serverTimestamp(),
          isActive: true
        };
        try {
          await setDoc(adminDocRef, superAdminDoc);
        } catch (e) {
          console.warn('Auto-seed superadmin doc error:', e);
        }
        const rec: AdminRecord = {
          uid,
          email: email.trim(),
          role: 'superadmin',
          addedBy: 'initial_setup',
          addedAt: null,
          isActive: true
        };
        return {
          isAdmin: true,
          isSuperAdmin: true,
          role: 'superadmin',
          adminRecord: rec
        };
      }
    } catch (err) {
      console.warn('Admin check error:', err);
    }

    return {
      isAdmin: false,
      isSuperAdmin: false,
      role: null,
      adminRecord: null
    };
  };

  // Real Firestore user profile fetch
  const fetchUserProfile = async (uid: string, email: string): Promise<UserRecord | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return { uid, ...userSnap.data() } as UserRecord;
      }
    } catch (err) {
      console.warn('User doc fetch failed:', err);
    }

    // Clean profile default
    return {
      uid,
      full_name: email.split('@')[0],
      email,
      createdAt: null,
      subscription: false,
      subscription_start: null,
      subscription_end: null
    };
  };

  useEffect(() => {
    // Clear any legacy demo flags
    localStorage.removeItem('project101_demo_mode');
    localStorage.removeItem('project101_demo_role');

    let userUnsub: (() => void) | null = null;
    let adminUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (userUnsub) {
        userUnsub();
        userUnsub = null;
      }
      if (adminUnsub) {
        adminUnsub();
        adminUnsub = null;
      }

      if (user) {
        setCurrentUser(user);

        // 1. Check admin status
        const adminData = await checkAdminStatus(user.uid, user.email);
        setIsAdmin(adminData.isAdmin);
        setIsSuperAdmin(adminData.isSuperAdmin);
        setAdminRole(adminData.role);
        setAdminRecord(adminData.adminRecord);

        // 2. Real-time Firestore snapshot listener on users/{uid}
        const userDocRef = doc(db, 'users', user.uid);
        userUnsub = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setUserRecord({ uid: user.uid, ...snap.data() } as UserRecord);
          } else {
            setUserRecord({
              uid: user.uid,
              full_name: (user.email || '').split('@')[0],
              email: user.email || '',
              createdAt: null,
              subscription: false,
              subscription_start: null,
              subscription_end: null
            });
          }
        }, (err) => {
          console.warn('Real-time user snapshot error:', err);
        });

        // 3. Real-time Firestore snapshot listener on admins/{uid}
        const adminDocRef = doc(db, 'admins', user.uid);
        adminUnsub = onSnapshot(adminDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const role = (data.role as AdminRole) || 'admin';
            const active = data.isActive !== false;
            if (active) {
              setIsAdmin(true);
              setIsSuperAdmin(role === 'superadmin');
              setAdminRole(role);
              setAdminRecord({
                uid: user.uid,
                email: data.email || user.email || '',
                role: role === 'superadmin' ? 'superadmin' : 'admin',
                addedBy: data.addedBy || 'system',
                addedAt: data.addedAt || null,
                isActive: true
              });
            }
          }
        }, (err) => {
          console.warn('Real-time admin snapshot error:', err);
        });
      } else {
        setCurrentUser(null);
        setUserRecord(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        setAdminRecord(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (userUnsub) userUnsub();
      if (adminUnsub) adminUnsub();
    };
  }, []);

  const refreshAdminStatus = async () => {
    if (!currentUser) return;
    const adminData = await checkAdminStatus(currentUser.uid, currentUser.email);
    setIsAdmin(adminData.isAdmin);
    setIsSuperAdmin(adminData.isSuperAdmin);
    setAdminRole(adminData.role);
    setAdminRecord(adminData.adminRecord);
  };

  const login = async (email: string, pass: string): Promise<{
    isAdmin: boolean;
    isSuperAdmin: boolean;
    role: AdminRole;
    user: User;
  }> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      setCurrentUser(user);

      // Check Firestore: admins/{user.uid}
      const adminData = await checkAdminStatus(user.uid, user.email);
      setIsAdmin(adminData.isAdmin);
      setIsSuperAdmin(adminData.isSuperAdmin);
      setAdminRole(adminData.role);
      setAdminRecord(adminData.adminRecord);

      const profile = await fetchUserProfile(user.uid, user.email || '');
      setUserRecord(profile);

      return {
        isAdmin: adminData.isAdmin,
        isSuperAdmin: adminData.isSuperAdmin,
        role: adminData.role,
        user
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserRecord(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setAdminRole(null);
    setAdminRecord(null);
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateLocalProfile = (name: string) => {
    setUserRecord((prev) => (prev ? { ...prev, full_name: name } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRecord,
        isAdmin,
        isSuperAdmin,
        adminRole,
        adminRecord,
        loading,
        isDemoMode: false,
        login,
        logout,
        resetPassword,
        updateLocalProfile,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
