import { Timestamp, FieldValue } from 'firebase/firestore';

export type FirestoreDate = Timestamp | FieldValue | { seconds: number; nanoseconds: number } | string | null;

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  speed: number;
  heading: number;
  timestamp: FirestoreDate;
}

export type ScreenshotStatus =
  | 'Success'
  | 'Screen is off'
  | 'In progress...'
  | 'Permission required'
  | 'File not found'
  | string;

export interface DeviceRecord {
  device_id: string;
  device_name: string;
  model: string;
  manufacturer: string;
  os_version: string;
  registered_at: FirestoreDate;
  last_active: FirestoreDate;
  last_activity_time?: FirestoreDate;
  silent_mode: boolean;
  siren_active?: boolean;
  quick_settings_block: boolean;
  shutdown_protection: boolean;
  current_app_name?: string;
  current_app_detail?: string;
  screen_state?: 'on' | 'off' | string;
  latest_screenshot: string | null;
  latest_screenshot_time: FirestoreDate;
  screenshot_status: ScreenshotStatus | null;
  capture_screenshot: boolean;
  capture_request_time: FirestoreDate;
  request_location?: boolean;
  request_location_time?: FirestoreDate;
  location_status?: string;
  location: DeviceLocation | null;
  // Admin-only view enrichment (not extra stored device fields)
  owner_uid?: string;
  owner_email?: string;
}

export interface DownloadAppConfig {
  mediafireUrl: string;
  version: string;
  size: string;
  releaseDate: string;
  packageName: string;
  minAndroid: string;
  sha256?: string;
  updatedAt?: FirestoreDate;
  updatedBy?: string;
  changelog?: string[];
}

export interface UserRecord {
  uid: string;
  full_name: string;
  email: string;
  createdAt: FirestoreDate;
  silent_mode?: boolean;
  subscription: boolean;
  subscription_start: FirestoreDate;
  subscription_end: FirestoreDate;
  device_count?: number;
}

export type UserProfile = UserRecord;

export interface GuestUserRecord {
  guest_id?: string;
  device_name: string;
  device_id: string;
  model: string;
  manufacturer: string;
  os_version: string;
  created_at: FirestoreDate;
  quick_settings_block: boolean;
  last_active: FirestoreDate;
  location: DeviceLocation | null;
}

export interface AdminRecord {
  uid: string;
  email: string;
  role: 'superadmin' | 'admin';
  addedBy: string;
  addedAt: FirestoreDate;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: Date | string;
  type: 'COMMAND' | 'SECURITY_ALERT' | 'AUTH' | 'SCREENSHOT' | 'SYSTEM';
  deviceId?: string;
  deviceName?: string;
  userEmail: string;
  action: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'BLOCKED';
  details?: string;
}
