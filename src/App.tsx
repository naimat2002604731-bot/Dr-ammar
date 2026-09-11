import React, { useState, useEffect, useRef } from 'react';
import { MedicalBackground } from './components/MedicalBackground';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { TodaySchedule } from './components/TodaySchedule';
import { MedicationList } from './components/MedicationList';
import { DoctorAmmarChat } from './components/DoctorAmmarChat';
import { AdherenceHistory } from './components/AdherenceHistory';
import { UserProfileTab } from './components/UserProfileTab';
import { AddMedicationModal } from './components/AddMedicationModal';
import { AuthModal } from './components/AuthModal';
import { MedicationAuditModal } from './components/MedicationAuditModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { DoseReminderToast } from './components/DoseReminderToast';
import { UserProfile, Medication, DoseLog, ChatMessage, MedicalAuditReport } from './types';
import {
  saveLocalMirror,
  getLocalMirror,
  clearLocalMirror,
} from './services/storageService';
import {
  getNotificationPermission,
  NotificationPermissionStatus,
  checkDueDoses,
  playMedicalChime,
  triggerVibration,
  sendBrowserNotification,
  getDoseNotificationContent,
} from './utils/notificationService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [auditReport, setAuditReport] = useState<MedicalAuditReport | null>(null);

  // Modals & State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Notification status and active reminder toast
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>(
    getNotificationPermission()
  );
  const [activeDueDose, setActiveDueDose] = useState<{
    medication: Medication;
    scheduledTime: string;
    key: string;
  } | null>(null);

  // Track doses already notified during this day/session to avoid duplicate spamming
  const notifiedDosesRef = useRef<Set<string>>(new Set());

  // Initial load with 0ms instant hydration from local mirror cache
  useEffect(() => {
    const savedUser = localStorage.getItem('dr_ammar_username');
    if (savedUser && savedUser !== 'ahmed') {
      // 1. Instant 0-ms hydration from local mirror cache
      const cached = getLocalMirror(savedUser);
      if (cached && cached.profile) {
        setUser(cached.profile);
        setMedications(cached.medications || []);
        setDoseLogs(cached.doseLogs || []);
        setChatHistory(cached.chatHistory || []);
        setInitialLoading(false);
      }
      // 2. Concurrently fetch freshest updates from enterprise server
      fetchUserData(savedUser);
    } else {
      localStorage.removeItem('dr_ammar_username');
      setInitialLoading(false);
      setIsAuthOpen(true);
    }
  }, []);

  // Dose Alarm Schedule Checker: runs every 15 seconds to check if any scheduled dose is due
  useEffect(() => {
    if (medications.length === 0) return;

    const checkInterval = setInterval(() => {
      const dueItems = checkDueDoses(medications, doseLogs, notifiedDosesRef.current);

      if (dueItems.length > 0) {
        const item = dueItems[0];
        notifiedDosesRef.current.add(item.key);

        // Play pleasant medical chime and vibrate
        playMedicalChime();
        triggerVibration();

        // Native browser notification
        const content = getDoseNotificationContent(item.medication, item.scheduledTime);
        sendBrowserNotification(content.title, {
          body: content.body,
          tag: item.key,
          onClick: () => {
            setCurrentTab('today');
          },
        });

        // Set in-app floating reminder banner
        setActiveDueDose(item);
      }
    }, 15000);

    return () => clearInterval(checkInterval);
  }, [medications, doseLogs]);

  const fetchUserData = async (username: string) => {
    setIsSyncing(true);
    try {
      // Login or fetch user by username from enterprise server
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.data) {
        setUser(data.data.profile);
        setMedications(data.data.medications || []);
        setDoseLogs(data.data.doseLogs || []);
        setChatHistory(data.data.chatHistory || []);
        localStorage.setItem('dr_ammar_username', data.data.profile.username);
        // Save to high-speed local mirror
        saveLocalMirror(data.data.profile.username, {
          profile: data.data.profile,
          medications: data.data.medications || [],
          doseLogs: data.data.doseLogs || [],
          chatHistory: data.data.chatHistory || [],
        });
      }
    } catch (err) {
      console.error('Failed to sync user data:', err);
    } finally {
      setIsSyncing(false);
      setInitialLoading(false);
    }
  };

  // Auth / Switch user
  const handleLogin = async (userData: {
    username: string;
    displayName: string;
    pin?: string;
    age?: number;
    gender?: 'male' | 'female';
    allergies?: string[];
    chronicDiseases?: string[];
  }) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');

      setUser(data.data.profile);
      setMedications(data.data.medications || []);
      setDoseLogs(data.data.doseLogs || []);
      setChatHistory(data.data.chatHistory || []);
      localStorage.setItem('dr_ammar_username', data.data.profile.username);

      saveLocalMirror(data.data.profile.username, {
        profile: data.data.profile,
        medications: data.data.medications || [],
        doseLogs: data.data.doseLogs || [],
        chatHistory: data.data.chatHistory || [],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSwitchUser = async (targetUsername: string) => {
    await fetchUserData(targetUsername);
  };

  const handleLogout = () => {
    if (user?.username) {
      clearLocalMirror(user.username);
    }
    localStorage.removeItem('dr_ammar_username');
    setUser(null);
    setMedications([]);
    setDoseLogs([]);
    setChatHistory([]);
    setIsAuthOpen(true);
  };

  // Restore user data from backup file
  const handleRestoreUserData = async (userBackup: any) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/storage/restore/${user.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userBackup }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشلت استعادة البيانات');

      if (data.data) {
        setUser(data.data.profile);
        setMedications(data.data.medications || []);
        setDoseLogs(data.data.doseLogs || []);
        setChatHistory(data.data.chatHistory || []);
        saveLocalMirror(user.username, {
          profile: data.data.profile,
          medications: data.data.medications || [],
          doseLogs: data.data.doseLogs || [],
          chatHistory: data.data.chatHistory || [],
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Save / Update Medication (Optimistic 0ms update + background sync)
  const handleSaveMedication = async (medData: Partial<Medication>) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsSyncing(true);
    const targetId = editingMedication?.id || medData.id;
    try {
      if (targetId) {
        // Update existing
        const res = await fetch(`/api/medications/${user.username}/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medData),
        });
        const data = await res.json();
        if (data.medication) {
          setMedications((prev) => {
            const next = prev.map((m) => (m.id === targetId ? data.medication : m));
            saveLocalMirror(user.username, { profile: user, medications: next, doseLogs, chatHistory });
            return next;
          });
        }
      } else {
        // Add new
        const res = await fetch(`/api/medications/${user.username}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medData),
        });
        const data = await res.json();
        if (data.medication) {
          setMedications((prev) => {
            const next = [...prev, data.medication];
            saveLocalMirror(user.username, { profile: user, medications: next, doseLogs, chatHistory });
            return next;
          });
        }
      }
      setEditingMedication(null);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick refill pill stock
  const handleQuickRefill = async (medId: string, count: number) => {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;
    const current = med.remainingPills ?? 0;
    await handleSaveMedication({ id: medId, remainingPills: current + count });
  };

  // Delete Medication (Optimistic 0ms update + background sync)
  const handleDeleteMedication = async (medId: string) => {
    if (!user) return;
    // 0ms Optimistic UI update
    setMedications((prev) => {
      const next = prev.filter((m) => m.id !== medId);
      saveLocalMirror(user.username, { profile: user, medications: next, doseLogs, chatHistory });
      return next;
    });

    setIsSyncing(true);
    try {
      await fetch(`/api/medications/${user.username}/${medId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Log Dose (Taken or Skipped) - High-Speed Optimistic 0ms Update
  const handleLogDose = async (
    medicationId: string,
    scheduledTime: string,
    status: 'taken' | 'skipped'
  ) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const targetMed = medications.find((m) => m.id === medicationId);

    // 1. Optimistic instant in-memory update (0ms UI latency)
    const optimisticLog: DoseLog = {
      id: `log-opt-${Date.now()}`,
      medicationId,
      medicationName: targetMed ? targetMed.name : 'دواء',
      form: targetMed ? targetMed.form : 'tablet',
      dosage: targetMed ? targetMed.dosage : '1',
      scheduledTime,
      date: todayStr,
      takenAt: status === 'taken' ? new Date().toISOString() : undefined,
      status,
      notes: '',
    };

    setDoseLogs((prev) => {
      const filtered = prev.filter(
        (l) =>
          !(
            l.medicationId === medicationId &&
            l.date === todayStr &&
            l.scheduledTime === scheduledTime
          )
      );
      const nextLogs = [...filtered, optimisticLog];
      return nextLogs;
    });

    if (status === 'taken' && targetMed && typeof targetMed.remainingPills === 'number' && targetMed.remainingPills > 0) {
      setMedications((prev) =>
        prev.map((m) =>
          m.id === medicationId
            ? { ...m, remainingPills: Math.max(0, (m.remainingPills || 1) - 1) }
            : m
        )
      );
    }

    // 2. Background enterprise synchronization
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/dose-logs/${user.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId,
          scheduledTime,
          date: todayStr,
          status,
        }),
      });
      const data = await res.json();
      if (data.log) {
        setDoseLogs((prev) => {
          const filtered = prev.filter(
            (l) =>
              !(
                l.medicationId === medicationId &&
                l.date === todayStr &&
                l.scheduledTime === scheduledTime
              )
          );
          const next = [...filtered, data.log];
          saveLocalMirror(user.username, { profile: user, medications, doseLogs: next, chatHistory });
          return next;
        });
      }
      if (data.medication) {
        setMedications((prev) => {
          const next = prev.map((m) => (m.id === data.medication.id ? data.medication : m));
          saveLocalMirror(user.username, { profile: user, medications: next, doseLogs, chatHistory });
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Chat with Dr. Ammar AI
  const handleSendMessage = async (text: string): Promise<string> => {
    if (!user) {
      setIsAuthOpen(true);
      return 'يرجى تسجيل الدخول أولاً للمتابعة مع الدكتور عمار.';
    }
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username,
        message: text,
        history: chatHistory,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل الاتصال بالدكتور عمار');
    return data.text;
  };

  // Audit Medications
  const handleRefreshAudit = async (): Promise<MedicalAuditReport | null> => {
    if (!user) return null;
    const res = await fetch('/api/medications-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username }),
    });
    const data = await res.json();
    if (data.report) {
      setAuditReport(data.report);
      return data.report;
    }
    return null;
  };

  // Update Profile
  const handleUpdateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/user/${user.username}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.profile) {
        setUser(data.profile);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Direct consultation from a medication card
  const handleConsultMedication = (med: Medication) => {
    const prompt = `مرحباً دكتور عمار، أود استشارتك بخصوص دواء "${med.name}" (${med.dosage}) الذي أتناوله ${med.mealTiming === 'before_meal' ? 'قبل الأكل' : 'بعد الأكل'}. ما هي أهم نصائحك وموانع الاستعمال وأي تفاعلات يجب أن أحذر منها؟`;
    setChatInitialPrompt(prompt);
    setCurrentTab('chat');
  };

  // Calculate pending doses for badge
  const todayStr = new Date().toISOString().split('T')[0];
  let pendingCount = 0;
  medications.forEach((med) => {
    med.times.forEach((t) => {
      const log = doseLogs.find(
        (l) => l.medicationId === med.id && l.date === todayStr && l.scheduledTime === t
      );
      if (!log || log.status === 'pending') {
        pendingCount++;
      }
    });
  });

  // Handle test notification from settings modal
  const handleTriggerTestNotification = () => {
    const testMed = medications[0] || {
      id: 'test-dose',
      name: 'تنبيه موعد الدواء (تجريبي)',
      dosage: 'الجرعة المحددة',
      form: 'tablet',
      mealTiming: 'after_meal',
      times: ['12:00'],
      isChronic: false,
      startDate: todayStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveDueDose({
      medication: testMed as Medication,
      scheduledTime: 'الآن',
      key: `test-${Date.now()}`,
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-['Tajawal',sans-serif] selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Ambient Medical Canvas & Lighting */}
      <MedicalBackground />

      {/* Floating In-App Dose Reminder Toast Alert */}
      {activeDueDose && (
        <DoseReminderToast
          medication={activeDueDose.medication}
          scheduledTime={activeDueDose.scheduledTime}
          onTake={async () => {
            if (activeDueDose.medication.id !== 'test-dose' && user) {
              await handleLogDose(activeDueDose.medication.id, activeDueDose.scheduledTime, 'taken');
            }
            setActiveDueDose(null);
          }}
          onSkip={async () => {
            if (activeDueDose.medication.id !== 'test-dose' && user) {
              await handleLogDose(activeDueDose.medication.id, activeDueDose.scheduledTime, 'skipped');
            }
            setActiveDueDose(null);
          }}
          onDismiss={() => setActiveDueDose(null)}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          user={user}
          medications={medications}
          doseLogs={doseLogs}
          onOpenProfile={() => setIsAuthOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenChat={() => setCurrentTab('chat')}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          isSyncing={isSyncing}
        />

        {/* Tab Content Body */}
        <main className="flex-1 p-3 sm:p-4 pt-4">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-spin text-xl font-bold shadow-2xs">
                ✚
              </div>
              <p className="text-sm font-bold text-slate-700 font-['Cairo']">
                جاري الاتصال بعيادة الدكتور عمار السحابية...
              </p>
            </div>
          ) : (
            <>
              {currentTab === 'today' && (
                <TodaySchedule
                  medications={medications}
                  doseLogs={doseLogs}
                  onLogDose={handleLogDose}
                  onQuickRefill={handleQuickRefill}
                  onOpenAddMed={() => {
                    setEditingMedication(null);
                    setIsAddMedOpen(true);
                  }}
                  onOpenAudit={() => setIsAuditOpen(true)}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                />
              )}

              {currentTab === 'medications' && (
                <MedicationList
                  medications={medications}
                  onOpenAddMed={() => {
                    setEditingMedication(null);
                    setIsAddMedOpen(true);
                  }}
                  onEditMed={(med) => {
                    setEditingMedication(med);
                    setIsAddMedOpen(true);
                  }}
                  onDeleteMed={handleDeleteMedication}
                  onConsultMed={handleConsultMedication}
                  onQuickRefill={handleQuickRefill}
                />
              )}

              {currentTab === 'chat' && (
                <DoctorAmmarChat
                  user={user}
                  medications={medications}
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  onOpenAudit={() => setIsAuditOpen(true)}
                  initialPrompt={chatInitialPrompt}
                />
              )}

              {currentTab === 'history' && (
                <AdherenceHistory
                  user={user}
                  medications={medications}
                  doseLogs={doseLogs}
                />
              )}

              {currentTab === 'profile' && (
                <UserProfileTab
                  user={user}
                  medications={medications}
                  doseLogs={doseLogs}
                  chatHistory={chatHistory}
                  onUpdateProfile={handleUpdateProfile}
                  onRestoreUserData={handleRestoreUserData}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </main>

        {/* Mobile Navigation Bar */}
        <Navigation
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab !== 'chat') setChatInitialPrompt('');
          }}
          pendingDosesCount={pendingCount}
        />
      </div>

      {/* Modals with Clean Conditional Mount */}
      {isAuthOpen && (
        <AuthModal
          currentUser={user}
          isOpen={true}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {isAddMedOpen && (
        <AddMedicationModal
          isOpen={true}
          onClose={() => {
            setIsAddMedOpen(false);
            setEditingMedication(null);
          }}
          onSave={handleSaveMedication}
          editingMedication={editingMedication}
        />
      )}

      {isAuditOpen && (
        <MedicationAuditModal
          isOpen={true}
          onClose={() => setIsAuditOpen(false)}
          user={user}
          medications={medications}
          onRefreshAudit={handleRefreshAudit}
          initialReport={auditReport}
        />
      )}

      {isNotificationsOpen && (
        <NotificationSettingsModal
          isOpen={true}
          onClose={() => setIsNotificationsOpen(false)}
          permissionStatus={permissionStatus}
          onPermissionChange={(status) => setPermissionStatus(status)}
          medications={medications}
          onTriggerTestNotification={handleTriggerTestNotification}
        />
      )}
    </div>
  );
}
