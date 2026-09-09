import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Utensils,
  ShieldCheck,
  Stethoscope,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { MedicalAuditReport, Medication, UserProfile } from '../types';

interface MedicationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  medications: Medication[];
  onRefreshAudit: () => Promise<MedicalAuditReport | null>;
  initialReport?: MedicalAuditReport | null;
}

export const MedicationAuditModal: React.FC<MedicationAuditModalProps> = ({
  isOpen,
  onClose,
  user,
  medications,
  onRefreshAudit,
  initialReport,
}) => {
  const [report, setReport] = useState<MedicalAuditReport | null>(initialReport || null);
  const [loading, setLoading] = useState(!initialReport);

  React.useEffect(() => {
    if (!initialReport && isOpen) {
      loadAudit();
    }
  }, [isOpen]);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const res = await onRefreshAudit();
      if (res) setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: 'high' | 'moderate' | 'low') => {
    switch (severity) {
      case 'high':
        return {
          label: 'تعارض شديد (تنبيه هام)',
          bg: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'moderate':
        return {
          label: 'تداخل متوسط (يحتاج مباعدة)',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'low':
      default:
        return {
          label: 'تداخل خفيف أو ملاحظة',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200 border border-blue-400/30">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
                فحص الوصفة والتفاعلات الدوائية
                <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                  د. عمار AI
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                مراجعة شاملة لـ {medications.length} دواء مسجل للتأكد من سلامة الجرعات والأوقات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-900 font-['Cairo']">
              الدكتور عمار يفحص قائمة أدويتك ويبحث عن أي تفاعلات كيميائية أو غذائية...
            </p>
            <p className="text-xs text-slate-500">يرجى الانتظار لحظات لإعداد التقرير الطبي المفصل</p>
          </div>
        )}

        {/* Content */}
        {!loading && report && (
          <div className="space-y-4 text-xs">
            {/* Overall Assessment */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 shadow-2xs">
              <h3 className="font-bold text-blue-900 mb-1.5 flex items-center gap-1.5 text-sm font-['Cairo']">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                التقييم العام للخطة العلاجية:
              </h3>
              <p className="text-slate-800 leading-relaxed font-medium">{report.overallAssessment}</p>
            </div>

            {/* Potential Drug Interactions */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm font-['Cairo']">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                فحص التفاعلات بين الأدوية ({report.potentialInteractions.length})
              </h3>

              {report.potentialInteractions.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    ممتاز! لم يتم رصد أي تعارض دوائي خطير بين أدويتك الحالية وفق الجرعات المسجلة.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {report.potentialInteractions.map((item, idx) => {
                    const badge = getSeverityBadge(item.severity);
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">
                            {item.drugs.join(' ↔ ')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
                        <p className="text-blue-900 text-[11px] bg-blue-50 p-2 rounded-lg border border-blue-200 font-medium">
                          <strong className="text-blue-700">💡 توصية د. عمار:</strong> {item.recommendation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timing Optimization Tips */}
            {report.timingTips && report.timingTips.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-blue-900 flex items-center gap-1.5 text-sm font-['Cairo']">
                  <Clock className="w-4 h-4 text-blue-600" />
                  نصائح ترتيب مواعيد الجرعات المثالية:
                </h3>
                <ul className="space-y-1.5 text-slate-700 font-medium">
                  {report.timingTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dietary & Lifestyle Precautions */}
            {report.dietaryPrecautions && report.dietaryPrecautions.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-amber-900 flex items-center gap-1.5 text-sm font-['Cairo']">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  محاذير الطعام والمشروبات (التداخلات الغذائية):
                </h3>
                <ul className="space-y-1.5 text-slate-700 font-medium">
                  {report.dietaryPrecautions.map((prec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">⚠️</span>
                      <span>{prec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Doctor Ammar Personal Closing Message */}
            {report.doctorAdvice && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900">
                <p className="font-bold text-emerald-800 mb-1 font-['Cairo']">
                  رسالة وتوجيه من الدكتور عمار:
                </p>
                <p className="italic leading-relaxed">{report.doctorAdvice}</p>
              </div>
            )}

            {/* Refresh Action */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={loadAudit}
                className="text-xs text-slate-600 hover:text-blue-700 flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                إعادة فحص وتحديث التقرير
              </button>

              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-200 active:scale-95"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
