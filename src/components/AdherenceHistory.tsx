import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Filter,
  Check,
} from 'lucide-react';
import { DoseLog, Medication, UserProfile } from '../types';
import { FORM_LABELS } from '../data/presetMedications';
import { MedicationIcon } from './MedicationIcon';

interface AdherenceHistoryProps {
  user: UserProfile | null;
  medications: Medication[];
  doseLogs: DoseLog[];
}

export const AdherenceHistory: React.FC<AdherenceHistoryProps> = ({
  user,
  medications,
  doseLogs,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'taken' | 'skipped'>('all');
  const [copiedReport, setCopiedReport] = useState(false);

  // Calculate past 7 days stats
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const logs = doseLogs.filter((l) => l.date === dateStr);
    const taken = logs.filter((l) => l.status === 'taken').length;
    const total = logs.length;
    const percent = total > 0 ? Math.round((taken / total) * 100) : 100;

    return {
      dateStr,
      dayName: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
      dayNumber: d.getDate(),
      taken,
      total,
      percent,
      isToday: i === 6,
    };
  });

  const totalLogsCount = doseLogs.length;
  const totalTaken = doseLogs.filter((l) => l.status === 'taken').length;
  const overallRate = totalLogsCount > 0 ? Math.round((totalTaken / totalLogsCount) * 100) : 100;

  // Generate Doctor's Clinical Adherence Report
  const handleCopyReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    const medsListStr = medications.map((m, idx) => 
      `${idx + 1}. ${m.name} (${m.dosage}) - ${m.times.join(', ')} - ${m.mealTiming === 'before_meal' ? 'قبل الأكل' : 'بعد الأكل'}`
    ).join('\n');

    const reportText = `📋 تقرير الالتزام الدوائي لمراجع عيادة دكتور عمار
----------------------------------------
المريض: ${user?.displayName || user?.username || 'غير محدد'}
تاريخ استخراج التقرير: ${today}
معدل الالتزام الكلي: ${overallRate}%
إجمالي الجرعات المسجلة: ${totalLogsCount} (المأخوذة: ${totalTaken} | المتخطاة: ${totalLogsCount - totalTaken})
الأيام الملتزم بها خلال الأسبوع الأخير: ${past7Days.filter((d) => d.percent >= 80).length} من 7 أيام

قائمة الأدوية الموصوفة (${medications.length}):
${medsListStr || 'لا توجد أدوية مسجلة'}

ملاحظة: هذا التقرير تم استخراجه آلياً لمساعدة الطبيب المعالج في تقييم مدى انتظام المريض على الخطة العلاجية.`;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch (_) {}
  };

  // Filter logs list
  const filteredLogs = [...doseLogs]
    .filter((l) => (filterStatus === 'all' ? true : l.status === filterStatus))
    .sort((a, b) => {
      // Sort newest first
      const dateA = `${a.date} ${a.scheduledTime}`;
      const dateB = `${b.date} ${b.scheduledTime}`;
      return dateB.localeCompare(dateA);
    });

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      {/* Top Clinical Report Action */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">
              تقرير الالتزام للطبيب المعالج
            </h3>
            <p className="text-xs text-slate-600">
              ملخص دقيق لنسبة التزامك وأدويتك الحالية لمشاركتها مع طبيبك أثناء المراجعة
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyReport}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all shadow-md shadow-blue-200 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          {copiedReport ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>تم النسخ بنجاح!</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>نسخ التقرير الطبي</span>
            </>
          )}
        </button>
      </div>

      {/* Adherence Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>معدل الالتزام الكلي</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Cairo']">
            {overallRate}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
            تم أخذ {totalTaken} من {totalLogsCount} جرعة مسجلة
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>أيام الالتزام</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 font-['Cairo']">
            {past7Days.filter((d) => d.percent >= 80).length} أيام
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">خلال الأسبوع الأخير</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>الأدوية النشطة</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Cairo']">
            {medications.length} أدوية
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">متابعة مستمرة</p>
        </div>
      </div>

      {/* 7-Day Adherence Calendar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 font-['Cairo'] mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          الالتزام خلال الأيام السبعة الأخيرة
        </h3>

        <div className="grid grid-cols-7 gap-2 text-center">
          {past7Days.map((d, idx) => (
            <div
              key={idx}
              className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center justify-between transition-all ${
                d.isToday
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500">{d.dayName}</span>
              <span className="text-sm font-bold my-1">{d.dayNumber}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  d.total === 0
                    ? 'bg-slate-200 text-slate-500'
                    : d.percent >= 80
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {d.total === 0 ? '-' : `${d.percent}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dose Logs History List */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            سجل الجرعات التفصيلي
          </h3>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer border transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterStatus('taken')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer border transition-all ${
                filterStatus === 'taken'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              تم أخذها
            </button>
            <button
              onClick={() => setFilterStatus('skipped')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer border transition-all ${
                filterStatus === 'skipped'
                  ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              تم التخطي
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            لا توجد سجلات جرعات مطابقة حتى الآن.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const isTaken = log.status === 'taken';

              return (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isTaken
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <MedicationIcon form={log.form} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{log.medicationName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>الجرعة: {log.dosage}</span>
                        <span>•</span>
                        <span>{log.date}</span>
                        <span>•</span>
                        <span className="font-mono">{log.scheduledTime}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border shrink-0 ${
                      isTaken
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isTaken ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        تم الأخذ
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        تخطي
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
