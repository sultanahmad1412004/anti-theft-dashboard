import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DOWNLOAD_CONFIG } from '../config/downloadConfig';
import { DownloadAppConfig } from '../types';

export const DEFAULT_DOWNLOAD_CONFIG: DownloadAppConfig = {
  mediafireUrl: DOWNLOAD_CONFIG.MEDIAFIRE_URL,
  version: DOWNLOAD_CONFIG.VERSION,
  size: DOWNLOAD_CONFIG.SIZE,
  releaseDate: DOWNLOAD_CONFIG.RELEASE_DATE,
  packageName: DOWNLOAD_CONFIG.PACKAGE_NAME,
  minAndroid: DOWNLOAD_CONFIG.MIN_ANDROID,
  sha256: DOWNLOAD_CONFIG.SHA256,
  changelog: [
    'Sub-15ms live Firestore command listeners',
    'MediaProjection screen capture integration',
    'Emergency siren override with max decibel trigger',
    'Dynamic quick settings and shutdown protection shield'
  ]
};

/**
 * Fetch download app configuration from Firestore system_config/download_config
 * Falls back to DEFAULT_DOWNLOAD_CONFIG if not yet populated.
 */
export async function getDownloadAppConfig(): Promise<DownloadAppConfig> {
  try {
    const configDocRef = doc(db, 'system_config', 'download_config');
    const snap = await getDoc(configDocRef);
    if (snap.exists()) {
      return {
        ...DEFAULT_DOWNLOAD_CONFIG,
        ...snap.data()
      } as DownloadAppConfig;
    }
  } catch (error) {
    console.warn('Failed to fetch download config from Firestore:', error);
  }
  return DEFAULT_DOWNLOAD_CONFIG;
}

/**
 * Subscribe to real-time updates for download app configuration
 */
export function subscribeToDownloadAppConfig(
  callback: (config: DownloadAppConfig) => void
): () => void {
  try {
    const configDocRef = doc(db, 'system_config', 'download_config');
    const unsubscribe = onSnapshot(
      configDocRef,
      (snap) => {
        if (snap.exists()) {
          callback({
            ...DEFAULT_DOWNLOAD_CONFIG,
            ...snap.data()
          } as DownloadAppConfig);
        } else {
          callback(DEFAULT_DOWNLOAD_CONFIG);
        }
      },
      (error) => {
        console.warn('Download config listener warning:', error);
        callback(DEFAULT_DOWNLOAD_CONFIG);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error starting download config subscription:', err);
    callback(DEFAULT_DOWNLOAD_CONFIG);
    return () => {};
  }
}

/**
 * Update the download app configuration in Firestore (Admin God Dashboard only)
 */
export async function updateDownloadAppConfig(
  config: Partial<DownloadAppConfig>,
  adminEmail: string
): Promise<void> {
  const configDocRef = doc(db, 'system_config', 'download_config');
  await setDoc(
    configDocRef,
    {
      ...config,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    },
    { merge: true }
  );
}
