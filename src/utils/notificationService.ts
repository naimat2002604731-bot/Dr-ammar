import { Medication, DoseLog } from '../types';
import { FORM_LABELS, MEAL_TIMING_LABELS } from '../data/presetMedications';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

// Audio Context Singleton for medical chime
let audioCtx: AudioContext | null = null;

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermissionStatus => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
};

export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
};

/**
 * Play a soothing, harmonic medical dual-tone chime using Web Audio API
 */
export const playMedicalChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Tone 1: Gentle root note (E5 = 659.25 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3); // Glide up to A5

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.8);

    // Tone 2: Harmonic warm bell (B5 = 987.77 Hz)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77, now + 0.15);

    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.15);
    osc2.stop(now + 1.2);
  } catch (e) {
    console.warn('Audio chime playback error:', e);
  }
};

/**
 * Trigger local device vibration if supported
 */
export const triggerVibration = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (_) {}
  }
};

/**
 * Send a native browser notification
 */
export const sendBrowserNotification = (
  title: string,
  options: NotificationOptions & { onClick?: () => void }
): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      icon: '/icon.png',
      badge: '/icon.png',
      tag: options.tag || 'dr-ammar-dose',
      body: options.body,
      silent: false,
      ...options,
    });

    if (options.onClick) {
      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    return true;
  } catch (err) {
    console.warn('Native notification failed (possibly inside iframe):', err);
    return false;
  }
};

export interface DueDoseItem {
  medication: Medication;
  scheduledTime: string;
  key: string;
}

/**
 * Check if there are scheduled doses due right now (or in current minute)
 */
export const checkDueDoses = (
  medications: Medication[],
  doseLogs: DoseLog[],
  alreadyNotifiedKeys: Set<string>
): DueDoseItem[] => {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const todayStr = now.toISOString().split('T')[0];

  const dueItems: DueDoseItem[] = [];

  medications.forEach((med) => {
    // Check if active (e.g. start date <= today and not past duration)
    if (med.startDate && med.startDate > todayStr) {
      return;
    }

    med.times.forEach((time) => {
      // Check if time matches current clock minute
      if (time === currentTimeStr) {
        const doseKey = `${med.id}-${todayStr}-${time}`;

        // Check if already notified in this session/minute
        if (alreadyNotifiedKeys.has(doseKey)) {
          return;
        }

        // Check if already taken or skipped
        const existingLog = doseLogs.find(
          (l) =>
            l.medicationId === med.id &&
            l.date === todayStr &&
            l.scheduledTime === time &&
            (l.status === 'taken' || l.status === 'skipped')
        );

        if (!existingLog) {
          dueItems.push({
            medication: med,
            scheduledTime: time,
            key: doseKey,
          });
        }
      }
    });
  });

  return dueItems;
};

/**
 * Format a friendly notification body
 */
export const getDoseNotificationContent = (med: Medication, scheduledTime: string) => {
  const formText = FORM_LABELS[med.form]?.ar || 'جرعة';
  const timingText = MEAL_TIMING_LABELS[med.mealTiming] || '';

  return {
    title: `تذكير دكتور عمار: موعد دواء ${med.name} 💊`,
    body: `حان موعد تناول ${formText} (${med.dosage}) الساعة ${scheduledTime}. ${timingText ? `التوقيت: ${timingText}.` : ''} اضغط لتأكيد الجرعة.`,
  };
};
