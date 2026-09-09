import React from 'react';
import { Stethoscope, RefreshCw, Sparkles, ShieldCheck, HeartPulse, Bell } from 'lucide-react';
import { UserProfile, Medication, DoseLog } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  medications: Medication[];
  doseLogs: DoseLog[];
  onOpenProfile: () => void;
  onOpenAudit: () => void;
  onOpenChat: () => void;
  onOpenNotifications?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  medications,
  doseLogs,
  onOpenProfile,
  onOpenAudit,
  onOpenNotifications,
  isSyncing = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = doseLogs.filter((l) => l.date === todayStr);
  const takenCount = todayLogs.filter((l) => l.status === 'taken').length;

  // Calculate total scheduled doses for today
  let totalDosesToday = 0;
  medications.forEach((med) => {
    totalDosesToday += (med.times || []).length;
  });

  const adherencePercent =
    totalDosesToday > 0 ? Math.min(100, Math.round((takenCount / totalDosesToday) * 100)) : 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        {/* App Branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 border border-blue-500">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 font-['Cairo'] tracking-tight flex items-center gap-1">
                دكتور عمار
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                طبيبك الذكي
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {user ? `مرحباً، ${user.displayName || user.username}` : 'تسجيل الدخول'}
            </p>
          </div>
        </div>

        {/* Quick Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="إعدادات إشعارات وتنبيهات الجرعات"
            >
              <Bell className="w-4 h-4 text-blue-600" />
              {medications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
              )}
            </button>
          )}

          {/* Dr. Ammar AI audit button */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-blue-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="فحص شامل وتفاعلات الأدوية"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="hidden sm:inline">فحص الوصفة</span>
          </button>

          {/* Sync indicator & User Profile */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="إدارة الحساب ومزامنة البيانات"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-xs font-medium max-w-[70px] sm:max-w-[90px] truncate">
              {user ? user.displayName || user.username : 'حسابي'}
            </span>
          </button>
        </div>
      </div>

      {/* Mini daily compliance progress bar */}
      {totalDosesToday > 0 && (
        <div className="max-w-3xl mx-auto mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
            <span>
              جرعات اليوم: <strong className="text-blue-700">{takenCount}</strong> من{' '}
              <strong className="text-slate-700">{totalDosesToday}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${adherencePercent}%` }}
              />
            </div>
            <span className="font-bold text-emerald-600">{adherencePercent}%</span>
          </div>
        </div>
      )}
    </header>
  );
};
