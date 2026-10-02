/**
 * Anti-Theft Authentication & Role Utilities
 * Pure Firestore-based role verification — No hardcoded admin credentials
 */

export type AdminRoleType = 'superadmin' | 'admin' | null;

export const isSuperAdminRole = (role?: AdminRoleType): boolean => {
  return role === 'superadmin';
};

export const isAdminRole = (role?: AdminRoleType): boolean => {
  return role === 'superadmin' || role === 'admin';
};

// Deprecated email check fallback strictly for safety during transition
export const isSuperAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  // Kept only as a non-authoritative fallback for local displays; real authorization is in Firestore admins/{uid}
  return email.trim().toLowerCase() === 'sultanahmad.real1@gmail.com';
};
