import { UserProfile, Medication, DoseLog, ChatMessage } from '../types';

export interface LocalUserStore {
  profile: UserProfile;
  medications: Medication[];
  doseLogs: DoseLog[];
  chatHistory: ChatMessage[];
  cachedAt: string;
}

export interface StorageTelemetry {
  status: string;
  health: string;
  engine: string;
  latency: string;
  zeroLagEngine: boolean;
  dataProtection: string;
  metrics: {
    totalUsers: number;
    totalMedications: number;
    totalDoseLogs: number;
    totalChatMessages: number;
    diskSizeBytes: number;
    backupSnapshotsCount: number;
    uptimeSeconds: number;
    lastFlushTime: string;
    isDirty: boolean;
  };
}

const CACHE_PREFIX = 'dr_ammar_offline_store_';

/**
 * Save user data to browser local mirror for 0-ms instant hydration & offline resilience
 */
export function saveLocalMirror(
  username: string,
  data: {
    profile: UserProfile;
    medications: Medication[];
    doseLogs: DoseLog[];
    chatHistory: ChatMessage[];
  }
): void {
  try {
    const key = `${CACHE_PREFIX}${username.toLowerCase()}`;
    const payload: LocalUserStore = {
      ...data,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Could not save local cache mirror:', err);
  }
}

/**
 * Retrieve local mirror for 0-ms instant launch
 */
export function getLocalMirror(username: string): LocalUserStore | null {
  try {
    const key = `${CACHE_PREFIX}${username.toLowerCase()}`;
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as LocalUserStore;
  } catch (err) {
    console.warn('Could not read local cache mirror:', err);
    return null;
  }
}

/**
 * Remove local cache mirror on user logout
 */
export function clearLocalMirror(username: string): void {
  try {
    const key = `${CACHE_PREFIX}${username.toLowerCase()}`;
    localStorage.removeItem(key);
  } catch (_) {}
}

/**
 * Fetch live storage engine telemetry and latency stats
 */
export async function fetchStorageStatus(): Promise<StorageTelemetry> {
  const start = performance.now();
  const res = await fetch('/api/storage/status');
  const pingMs = Math.round(performance.now() - start);
  if (!res.ok) {
    throw new Error('فشل جلب حالة سيرفرات التخزين');
  }
  const data = await res.json();
  return {
    ...data,
    realPingMs: pingMs,
  };
}

/**
 * Download a standalone offline JSON backup file
 */
export function downloadUserBackupFile(username: string, data: any): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `doctor_ammar_backup_${username}_${new Date().toISOString().split('T')[0]}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
