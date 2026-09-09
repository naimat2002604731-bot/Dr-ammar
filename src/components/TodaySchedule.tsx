import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Plus,
  Calendar,
  Utensils,
  Check,
  Undo2,
  MoreHorizontal,
  Fingerprint,
  Bell,
} from 'lucide-react';
import { Medication, DoseLog } from '../types';
import { FORM_LABELS, MEAL_TIMING_LABELS } from '../data/presetMedications';
import { MedicationIcon } from './MedicationIcon';

interface TodayScheduleProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  onLogDose: (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped') => Promise<void>;
  onOpenAddMed: () => void;
  onOpenAudit: () => void;
  onOpenNotifications?: () => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  medications,
  doseLogs,
  onLogDose,
  onOpenAddMed,
  onOpenNotifications,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Long-press and Quick Context Menu state
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [pressingKey, setPressingKey] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (activeMenuKey) {
        const target = e.target as HTMLElement;
        if (!target.closest('.quick-context-menu-container')) {
          setActiveMenuKey(null);
        }
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeMenuKey]);

  const handlePressStart = (key: string, e: React.TouchEvent | React.MouseEvent) => {
    // Avoid triggering on buttons inside the card
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('.long-press-trigger-zone')) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    startPosRef.current = { x: clientX, y: clientY };
    setPressingKey(key);

    timerRef.current = setTimeout(() => {
      setActiveMenuKey(key);
      setPressingKey(null);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch (_) {}
      }
    }, 450);
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressingKey(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPosRef.current) return;
    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - startPosRef.current.x);
    const diffY = Math.abs(touch.clientY - startPosRef.current.y);
    if (diffX > 12 || diffY > 12) {
      handlePressEnd();
    }
  };

  // Flatten all scheduled dose items for today
  interface ScheduledItem {
    medication: Medication;
    time: string;
    log?: DoseLog;
    timePeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  }

  const items: ScheduledItem[] = [];

  medications.forEach((med) => {
    // Check if within treatment duration if not chronic
    if (!med.isChronic && med.durationDays && med.startDate) {
      const start = new Date(med.startDate).getTime();
      const now = new Date(todayStr).getTime();
      if (!isNaN(start) && !isNaN(now)) {
        const elapsedDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        if (elapsedDays > med.durationDays || elapsedDays < 0) {
          return; // out of range
        }
      }
    }

    (med.times || []).forEach((t) => {
      const hour = parseInt(t.split(':')[0], 10);
      let period: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
      if (hour >= 5 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 22) period = 'evening';
      else period = 'night';

      const log = doseLogs.find(
        (l) => l.medicationId === med.id && l.date === todayStr && l.scheduledTime === t
      );

      items.push({
        medication: med,
        time: t,
        log,
        timePeriod: period,
      });
    });
  });

  // Sort by time
  items.sort((a, b) => a.time.localeCompare(b.time));

  const totalDoses = items.length;
  const takenDoses = items.filter((i) => i.log?.status === 'taken').length;
  const pendingDoses = items.filter((i) => !i.log || i.log.status === 'pending').length;

  const handleTake = async (medId: string, time: string) => {
    setActiveMenuKey(null);
    await onLogDose(medId, time, 'taken');
    // If this completes all doses for today, celebrate!
    if (takenDoses + 1 >= totalDoses && totalDoses > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#38bdf8', '#fbbf24'],
      });
    }
  };

  const handleSkip = async (medId: string, time: string) => {
    setActiveMenuKey(null);
    await onLogDose(medId, time, 'skipped');
  };

  const periodTitles: Record<string, { title: string; icon: string; color: string; badgeBg: string }> = {
    morning: { title: 'الصباح (الفجر - الظهيرة)', icon: '🌅', color: 'text-amber-700', badgeBg: 'bg-amber-50 border-amber-200' },
    afternoon: { title: 'الظهيرة والعصر', icon: '☀️', color: 'text-blue-700', badgeBg: 'bg-blue-50 border-blue-200' },
    evening: { title: 'المساء والمغرب', icon: '🌇', color: 'text-indigo-700', badgeBg: 'bg-indigo-50 border-indigo-200' },
    night: { title: 'الليل وقبل النوم', icon: '🌙', color: 'text-purple-700', badgeBg: 'bg-purple-50 border-purple-200' },
  };

  const groupedByPeriod = {
    morning: items.filter((i) => i.timePeriod === 'morning'),
    afternoon: items.filter((i) => i.timePeriod === 'afternoon'),
    evening: items.filter((i) => i.timePeriod === 'evening'),
    night: items.filter((i) => i.timePeriod === 'night'),
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      {/* Daily Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 sm:p-6 shadow-md border border-blue-500/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date().toLocaleDateString('ar-EG', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Cairo']">
              جدول جرعاتك اليومية
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              {totalDoses === 0
                ? 'لا توجد أدوية مجدولة اليوم. اضغط لإضافة أدويتك.'
                : pendingDoses === 0
                ? '🎉 أحسنت! لقد أخذت جميع جرعاتك المجدولة اليوم بانتظام.'
                : `لديك ${pendingDoses} جرعة متبقية اليوم.`}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-xl font-extrabold text-white leading-none">
                {takenDoses}/{totalDoses}
              </span>
              <span className="text-[10px] text-blue-100 mt-1 font-medium">الجرعات</span>
            </div>
          </div>
        </div>

        {/* Progress & Quick stats */}
        {totalDoses > 0 && (
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-4">
            <div className="flex-1 bg-black/20 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-300 to-teal-200 rounded-full transition-all duration-700"
                style={{ width: `${Math.round((takenDoses / totalDoses) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-200">
              {Math.round((takenDoses / totalDoses) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Quick interaction helper notice */}
      {items.length > 0 && (
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-medium flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>اضغط مطولاً على أي بطاقة لفتح قائمة الإجراءات السريعة</span>
          </span>

          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-3 h-3 text-blue-600" />
              <span>إعدادات الإشعارات والتنبيه الصوتي</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-['Cairo']">
            ابدأ بتسجيل أدويتك وعلاجاتك
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            أدخل اسم الدواء، نوعه، مقدار الجرعة، جدول الأوقات ومدة العلاج، وسيقوم الدكتور عمار
            بتنظيمها وتذكيرك بها يومياً.
          </p>
          <button
            onClick={onOpenAddMed}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-md shadow-blue-200 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة أول دواء الآن
          </button>
        </div>
      ) : (
        /* Doses by Period */
        <div className="space-y-6">
          {(Object.keys(groupedByPeriod) as (keyof typeof groupedByPeriod)[]).map((period) => {
            const periodItems = groupedByPeriod[period];
            if (periodItems.length === 0) return null;
            const meta = periodTitles[period];

            return (
              <div key={period} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-lg">{meta.icon}</span>
                  <h3 className={`text-xs font-bold ${meta.color} font-['Cairo']`}>
                    {meta.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 mr-auto font-medium">
                    {periodItems.length} جرعة
                  </span>
                </div>

                <div className="space-y-2.5">
                  {periodItems.map((item, idx) => {
                    const isTaken = item.log?.status === 'taken';
                    const isSkipped = item.log?.status === 'skipped';
                    const med = item.medication;
                    const cardKey = `${med.id}-${item.time}-${idx}`;
                    const isPressing = pressingKey === cardKey;
                    const isMenuOpen = activeMenuKey === cardKey;

                    return (
                      <div
                        key={cardKey}
                        className="relative quick-context-menu-container"
                      >
                        <div
                          onMouseDown={(e) => handlePressStart(cardKey, e)}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handlePressEnd}
                          onTouchStart={(e) => handlePressStart(cardKey, e)}
                          onTouchEnd={handlePressEnd}
                          onTouchCancel={handlePressEnd}
                          onTouchMove={handleTouchMove}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setActiveMenuKey(cardKey);
                          }}
                          className={`select-none rounded-2xl p-4 transition-all duration-200 border cursor-pointer relative overflow-hidden ${
                            isPressing
                              ? 'scale-[0.985] ring-2 ring-blue-500 bg-blue-50/70 border-blue-400'
                              : isMenuOpen
                              ? 'ring-2 ring-blue-500 bg-blue-50/40 border-blue-400 shadow-md'
                              : isTaken
                              ? 'border-emerald-200 bg-emerald-50/50 shadow-xs'
                              : isSkipped
                              ? 'border-slate-200 bg-slate-50 opacity-70'
                              : 'border-slate-200 bg-white hover:border-blue-300 shadow-sm'
                          }`}
                        >
                          {/* Long Press Visual Feedback Fill Bar */}
                          {isPressing && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-[pulse_0.45s_ease-in-out_infinite]" />
                          )}

                          <div className="flex items-start justify-between gap-3">
                            {/* Medication icon and info */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                                  isTaken
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                                    : 'bg-blue-50 border-blue-200 text-blue-600'
                                }`}
                              >
                                <MedicationIcon form={med.form} className="w-5 h-5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4
                                    className={`text-sm font-bold truncate ${
                                      isTaken ? 'text-emerald-800 line-through' : 'text-slate-900'
                                    }`}
                                  >
                                    {med.name}
                                  </h4>
                                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                                    {FORM_LABELS[med.form]?.ar}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                                  <span className="font-semibold text-blue-700">
                                    {med.dosage}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <Utensils className="w-3 h-3 text-amber-500" />
                                    {MEAL_TIMING_LABELS[med.mealTiming]}
                                  </span>
                                </div>

                                {med.notes && (
                                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 italic">
                                    💡 {med.notes}
                                  </p>
                                )}

                                {/* Remaining pills alert if low */}
                                {typeof med.remainingPills === 'number' && med.remainingPills <= 5 && (
                                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    متبقي {med.remainingPills} فقط في العبوة (يرجى إعادة الشراء)
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Time & Action buttons */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-slate-800">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{item.time}</span>
                              </div>

                              {/* Standard action buttons */}
                              {isTaken ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-xl">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    تم أخذها
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSkip(med.id, item.time);
                                    }}
                                    title="تراجع أو تعديل"
                                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] cursor-pointer"
                                  >
                                    <Undo2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : isSkipped ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                    تم التخطي
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTake(med.id, item.time);
                                    }}
                                    className="text-blue-600 hover:underline text-[11px] font-semibold cursor-pointer"
                                  >
                                    أخذت الآن؟
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTake(med.id, item.time);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    أخذ الجرعة
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSkip(med.id, item.time);
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs py-1.5 px-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                                    title="تخطي هذه الجرعة"
                                  >
                                    تخطي
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuKey(isMenuOpen ? null : cardKey);
                                    }}
                                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                                    title="قائمة الإجراءات السريعة"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Inline Quick Action Context Menu (Pop-down/Pop-up without modal dialog) */}
                        {isMenuOpen && (
                          <div className="mt-2 p-2 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 animate-fadeIn z-30 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-200">
                              <Fingerprint className="w-4 h-4 text-blue-400" />
                              <span>إجراء سريع ({med.name} - {item.time}):</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTake(med.id, item.time)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                                <span>تم أخذها الآن</span>
                              </button>

                              <button
                                onClick={() => handleSkip(med.id, item.time)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium py-1.5 px-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>تخطي</span>
                              </button>

                              <button
                                onClick={() => setActiveMenuKey(null)}
                                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors text-xs cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add New Medication Button */}
      <div className="pt-2 flex items-center justify-center">
        <button
          onClick={onOpenAddMed}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          إضافة دواء جديد إلى الجدول
        </button>
      </div>
    </div>
  );
};

