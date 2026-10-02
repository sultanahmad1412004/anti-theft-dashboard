import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminRouteProps {
  children: React.ReactNode;
  superAdminOnly?: boolean;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, superAdminOnly = false }) => {
  const { currentUser, isAdmin, isSuperAdmin, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentUser) {
      if (!isAdmin) {
        toast.error('Access denied. Administrator clearance required.');
      } else if (superAdminOnly && !isSuperAdmin) {
        toast.error('Super Admin authorization required for God Mode.');
      }
    }
  }, [loading, currentUser, isAdmin, isSuperAdmin, superAdminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <p className="text-sm font-mono text-slate-400">Verifying Admin Credentials in Firestore...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
