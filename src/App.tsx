import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts & Guards
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';
import { ContactPage } from './pages/public/ContactPage';
import { DownloadPage } from './pages/public/DownloadPage';
import { FaqPage } from './pages/public/FaqPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// User Dashboard Pages
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { MyDevicesPage } from './pages/dashboard/MyDevicesPage';
import { DeviceDetailPage } from './pages/dashboard/DeviceDetailPage';
import { SubscriptionPage } from './pages/dashboard/SubscriptionPage';
import { AccountPage } from './pages/dashboard/AccountPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminDevicesPage } from './pages/admin/AdminDevicesPage';
import { AdminDeviceDetailPage } from './pages/admin/AdminDeviceDetailPage';
import { AdminGuestUsersPage } from './pages/admin/AdminGuestUsersPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminRawEditorPage } from './pages/admin/AdminRawEditorPage';
import { AdminBulkOpsPage } from './pages/admin/AdminBulkOpsPage';
import { AdminExportPage } from './pages/admin/AdminExportPage';
import { AdminDangerPage } from './pages/admin/AdminDangerPage';
import { GodModeHubPage } from './pages/admin/GodModeHubPage';
import { AdminManagementPage } from './pages/admin/AdminManagementPage';
import { AdminAppLinkPage } from './pages/admin/AdminAppLinkPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1E293B',
                color: '#E2E8F0',
                border: '1px solid #334155',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#0F172A',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#0F172A',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/download" element={<DownloadPage />} />

            {/* Protected User Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardOverviewPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/devices"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MyDevicesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/device/:deviceId"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DeviceDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/device/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DeviceDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/devices/:deviceId"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DeviceDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/devices/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DeviceDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/track"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/dashboard/subscription"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SubscriptionPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/account"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AccountPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminOverviewPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/app-link"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminAppLinkPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminUsersPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users/:uid"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminUserDetailPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/devices"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDevicesPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/devices/:deviceId"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDeviceDetailPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/devices/:id"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDeviceDetailPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/guest-users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminGuestUsersPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/subscriptions"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminSubscriptionsPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/map"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminMapPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminLogsPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminNotificationsPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/raw-editor"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminRawEditorPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bulk-ops"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminBulkOpsPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/export"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminExportPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/danger"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDangerPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* God Mode Sub-System Routes */}
            <Route
              path="/admin/god-mode"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <GodModeHubPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/god-mode/admins"
              element={
                <AdminRoute superAdminOnly>
                  <AdminLayout>
                    <AdminManagementPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/god-mode/raw-editor"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminRawEditorPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/god-mode/danger"
              element={
                <AdminRoute superAdminOnly>
                  <AdminLayout>
                    <AdminDangerPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
