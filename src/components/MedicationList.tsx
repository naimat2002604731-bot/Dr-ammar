import React, { useState } from 'react';
import {
  Pill,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  Bot,
  CheckCircle,
  Activity,
  FileText,
  UserCheck,
  Utensils,
  Hourglass,
} from 'lucide-react';
import { Medication } from '../types';
import { FORM_LABELS, MEAL_TIMING_LABELS, FREQUENCY_LABELS } from '../data/presetMedications';
import { MedicationIcon } from './MedicationIcon';

interface MedicationListProps {
  medications: Medication[];
  onOpenAddMed: () => void;
  onEditMed: (med: Medication) => void;
  onDeleteMed: (medId: string) => Promise<void>;
  onConsultMed: (med: Medication) => void;
}

export const MedicationList: React.FC<MedicationListProps> = ({
  medications,
  onOpenAddMed,
  onEditMed,
  onDeleteMed,
  onConsultMed,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'chronic' | 'temporary' | 'low_stock'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(search.toLowerCase())) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'chronic') return m.isChronic;
    if (filter === 'temporary') return !m.isChronic;
    if (filter === 'low_stock')
      return typeof m.remainingPills === 'number' && m.remainingPills <= 5;

    return true;
  });

  const getDurationProgress = (med: Medication) => {
    if (med.isChronic || !med.durationDays) return null;
    const start = new Date(med.startDate).getTime();
    const now = new Date().getTime();
    const elapsedDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    const totalDays = med.durationDays;
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    const percent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    return {
      elapsedDays,
      totalDays,
      remainingDays,
      percent,
      isFinished: elapsedDays >= totalDays,
    };
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            سجل أدويتي وعلاجاتي
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إجمالي الأدوية المسجلة: <strong className="text-blue-700">{medications.length}</strong>
          </p>
        </div>

        <button
          onClick={onOpenAddMed}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          إضافة دواء جديد
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن اسم الدواء أو المادة الفعالة أو الطبيب..."
            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            الكل ({medications.length})
          </button>
          <button
            onClick={() => setFilter('chronic')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'chronic'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            علاجات مزمنة ({medications.filter((m) => m.isChronic).length})
          </button>
          <button
            onClick={() => setFilter('temporary')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'temporary'
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            علاجات محددة المدة ({medications.filter((m) => !m.isChronic).length})
          </button>
          <button
            onClick={() => setFilter('low_stock')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'low_stock'
                ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            قارب على النفاد (
            {
              medications.filter(
                (m) => typeof m.remainingPills === 'number' && m.remainingPills <= 5
              ).length
            }
            )
          </button>
        </div>
      </div>

      {/* Medication Cards List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 shadow-sm">
          <Pill className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">لم يتم العثور على أدوية مطابقة</p>
          <p className="text-xs text-slate-500 mt-1">جرّب تغيير كلمات البحث أو أضف دواءً جديداً.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((med) => {
            const prog = getDurationProgress(med);

            return (
              <div
                key={med.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-blue-300 transition-all duration-300 shadow-sm relative overflow-hidden group"
              >
                {/* Top card bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                      <MedicationIcon form={med.form} className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 font-['Cairo'] truncate">
                          {med.name}
                        </h3>
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                          {FORM_LABELS[med.form]?.ar || med.form}
                        </span>
                        {med.isChronic ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                            علاج مزمن مستمر
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                            كورس لمدة {med.durationDays || 7} أيام
                          </span>
                        )}
                      </div>

                      {med.genericName && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {med.genericName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onEditMed(med)}
                      className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
                      title="تعديل الدواء"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(med.id)}
                      className="p-2 text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
                      title="حذف الدواء"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Overlay if active */}
                {deleteConfirmId === med.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-700">
                    <span>هل أنت متأكد من حذف هذا الدواء؟</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteMed(med.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-xl cursor-pointer"
                      >
                        نعم، احذف
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-xl cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  {/* Dose & Frequency */}
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">
                        الجرعة: {med.dosage}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {FREQUENCY_LABELS[med.frequency]}
                      </p>
                    </div>
                  </div>

                  {/* Meal Timing */}
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <Utensils className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">التوقيت مع الطعام</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {MEAL_TIMING_LABELS[med.mealTiming]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daily Times Badges */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-500">مواعيد اليوم:</span>
                  {med.times.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs px-2.5 py-0.5 rounded-lg font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Treatment Duration Progress (مدة العلاج) */}
                {prog && (
                  <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        مدة الكورس العلاجي:
                      </span>
                      <span className="text-emerald-700 font-bold">
                        {prog.isFinished
                          ? 'اكتملت مدة العلاج 🎉'
                          : `متبقي ${prog.remainingDays} يوم من أصل ${prog.totalDays}`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>بدأ: {med.startDate}</span>
                      <span>انقضى: {prog.elapsedDays} يوم</span>
                    </div>
                  </div>
                )}

                {/* Stock & Doctor Notes */}
                {(med.notes || typeof med.remainingPills === 'number') && (
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-xs flex-wrap">
                    {med.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex-1 truncate">
                        📝 {med.notes}
                      </p>
                    )}

                    {typeof med.remainingPills === 'number' && (
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold shrink-0 ${
                          med.remainingPills <= 5
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        الكمية المتبقية: {med.remainingPills}
                      </span>
                    )}
                  </div>
                )}

                {/* Quick Doctor Ammar Consult for this Medication */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {med.prescribedBy ? `الطبيب: ${med.prescribedBy}` : 'مسجل في عيادة دكتور عمار'}
                  </span>

                  <button
                    onClick={() => onConsultMed(med)}
                    className="text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 font-semibold"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    استشر د. عمار حول هذا الدواء
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
