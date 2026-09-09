import React, { useState, useEffect } from 'react';
import {
  Pill,
  Clock,
  Calendar,
  Sparkles,
  Check,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  HelpCircle,
  FileText,
  Utensils,
} from 'lucide-react';
import {
  Medication,
  MedicationForm,
  MealTiming,
  FrequencyType,
} from '../types';
import {
  PRESET_MEDICATIONS,
  FORM_LABELS,
  MEAL_TIMING_LABELS,
  FREQUENCY_LABELS,
  PresetMedication,
} from '../data/presetMedications';
import { MedicationIcon } from './MedicationIcon';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medData: Partial<Medication>) => Promise<void>;
  editingMedication?: Medication | null;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedication,
}) => {
  const [name, setName] = useState(editingMedication?.name || '');
  const [genericName, setGenericName] = useState(editingMedication?.genericName || '');
  const [form, setForm] = useState<MedicationForm>(editingMedication?.form || 'tablet');
  const [dosage, setDosage] = useState(editingMedication?.dosage || '');
  const [frequency, setFrequency] = useState<FrequencyType>(editingMedication?.frequency || 'once_daily');
  const [times, setTimes] = useState<string[]>(editingMedication?.times || ['08:00']);
  const [mealTiming, setMealTiming] = useState<MealTiming>(editingMedication?.mealTiming || 'after_meal');
  const [startDate, setStartDate] = useState(
    editingMedication?.startDate || new Date().toISOString().split('T')[0]
  );
  const [isChronic, setIsChronic] = useState(editingMedication?.isChronic ?? false);
  const [durationDays, setDurationDays] = useState<number | string>(
    editingMedication?.durationDays ?? ''
  );
  const [remainingPills, setRemainingPills] = useState<string>(
    editingMedication?.remainingPills !== undefined ? String(editingMedication.remainingPills) : ''
  );
  const [totalPills, setTotalPills] = useState<string>(
    editingMedication?.totalPills !== undefined ? String(editingMedication.totalPills) : ''
  );
  const [notes, setNotes] = useState(editingMedication?.notes || '');
  const [prescribedBy, setPrescribedBy] = useState(editingMedication?.prescribedBy || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMedication) {
      setName(editingMedication.name || '');
      setGenericName(editingMedication.genericName || '');
      setForm(editingMedication.form || 'tablet');
      setDosage(editingMedication.dosage || '');
      setFrequency(editingMedication.frequency || 'once_daily');
      setTimes(editingMedication.times || ['08:00']);
      setMealTiming(editingMedication.mealTiming || 'after_meal');
      setStartDate(editingMedication.startDate || new Date().toISOString().split('T')[0]);
      setIsChronic(editingMedication.isChronic ?? false);
      setDurationDays(editingMedication.durationDays ?? '');
      setRemainingPills(editingMedication.remainingPills !== undefined ? String(editingMedication.remainingPills) : '');
      setTotalPills(editingMedication.totalPills !== undefined ? String(editingMedication.totalPills) : '');
      setNotes(editingMedication.notes || '');
      setPrescribedBy(editingMedication.prescribedBy || '');
    } else {
      setName('');
      setGenericName('');
      setForm('tablet');
      setDosage('');
      setFrequency('once_daily');
      setTimes(['08:00']);
      setMealTiming('after_meal');
      setStartDate(new Date().toISOString().split('T')[0]);
      setIsChronic(false);
      setDurationDays('');
      setRemainingPills('');
      setTotalPills('');
      setNotes('');
      setPrescribedBy('');
      setError('');
    }
  }, [editingMedication, isOpen]);

  // Frequency to default times map
  const updateTimesForFrequency = (freq: FrequencyType) => {
    setFrequency(freq);
    switch (freq) {
      case 'once_daily':
        setTimes(['08:00']);
        break;
      case 'twice_daily':
        setTimes(['08:00', '20:00']);
        break;
      case 'three_times_daily':
        setTimes(['08:00', '14:00', '20:00']);
        break;
      case 'four_times_daily':
        setTimes(['06:00', '12:00', '18:00', '00:00']);
        break;
      case 'every_other_day':
      case 'weekly':
        setTimes(['09:00']);
        break;
      case 'as_needed':
        setTimes(['08:00', '20:00']);
        break;
    }
  };

  const handleApplyPreset = (preset: PresetMedication) => {
    setName(preset.name);
    setGenericName(preset.genericName);
    setForm(preset.form);
    setDosage(preset.defaultDosage);
    setFrequency(preset.defaultFrequency);
    setTimes(preset.defaultTimes);
    setMealTiming(preset.defaultMealTiming);
    setIsChronic(preset.isChronic);
    if (preset.commonDurationDays) {
      setDurationDays(preset.commonDurationDays);
    }
    setNotes(preset.notes);
    setShowPresets(false);
  };

  // AI Smart Suggestion
  const handleAiAutoFill = async () => {
    if (!name.trim()) {
      setError('يرجى كتابة اسم الدواء أولاً ليقوم دكتور عمار باستخراج تفاصيله');
      return;
    }
    setError('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: name }),
      });
      const data = await res.json();
      if (data.suggestion) {
        const s = data.suggestion;
        if (s.name) setName(s.name);
        if (s.genericName) setGenericName(s.genericName);
        if (s.form) setForm(s.form);
        if (s.defaultDosage) setDosage(s.defaultDosage);
        if (s.defaultFrequency) setFrequency(s.defaultFrequency);
        if (s.defaultTimes) setTimes(s.defaultTimes);
        if (s.defaultMealTiming) setMealTiming(s.defaultMealTiming);
        if (s.isChronic !== undefined) setIsChronic(s.isChronic);
        if (s.commonDurationDays) setDurationDays(s.commonDurationDays);
        if (s.notes) setNotes(s.notes);
      }
    } catch (err: any) {
      setError('تعذر استخراج البيانات بالذكاء الاصطناعي حالياً');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTimeChange = (index: number, val: string) => {
    const next = [...times];
    next[index] = val;
    setTimes(next);
  };

  const addTimeSlot = () => {
    setTimes([...times, '12:00']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length <= 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الدواء');
      return;
    }
    if (times.length === 0) {
      setError('يرجى تحديد وقت واحد على الأقل للجرعة');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        genericName: genericName.trim(),
        form,
        dosage: dosage.trim(),
        frequency,
        times,
        mealTiming,
        startDate,
        isChronic,
        durationDays: isChronic ? undefined : Number(durationDays) || 7,
        remainingPills: remainingPills ? Number(remainingPills) : undefined,
        totalPills: totalPills ? Number(totalPills) : undefined,
        notes: notes.trim(),
        prescribedBy: prescribedBy.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الدواء');
    } finally {
      setLoading(false);
    }
  };

  // Filter presets by search
  const filteredPresets = PRESET_MEDICATIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
                {editingMedication ? 'تعديل بيانات الدواء' : 'إضافة دواء جديد'}
              </h2>
              <p className="text-xs text-slate-500">
                حدد اسم الدواء ونوعه وجدول جرعاته ومدة العلاج
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick presets picker toggle */}
        {!editingMedication && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="w-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                اختر من قائمة الأدوية الشائعة (بانادول، أوجمنتين، كونكور، جلوكوفاج...)
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                {showPresets ? 'إخفاء' : 'عرض'}
              </span>
            </button>

            {showPresets && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 max-h-48 overflow-y-auto">
                <input
                  type="text"
                  placeholder="ابحث عن دواء أو مسكن أو مضاد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 mb-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-right p-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all text-xs text-slate-700 flex items-center justify-between cursor-pointer shadow-2xs"
                    >
                      <div className="truncate">
                        <p className="font-bold text-blue-700 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{p.genericName}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded shrink-0 mr-1 border border-slate-200">
                        {p.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Medication Name & AI Auto-fill */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                اسم الدواء <span className="text-blue-600">*</span>
              </label>

              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={aiLoading}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3 h-3 text-blue-600 ${aiLoading ? 'animate-spin' : 'animate-pulse'}`} />
                {aiLoading ? 'جاري الاستخراج...' : 'ملء ذكي بـ د. عمار'}
              </button>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أوجمنتين 1 جم أو Augmentin 1g"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
              required
            />
          </div>

          {/* Scientific / Generic Name */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              الاسم العلمي أو الغرض من الاستخدام (اختياري)
            </label>
            <input
              type="text"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              placeholder="مثال: أموكسيسيلين (مضاد حيوي للالتهاب)"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
            />
          </div>

          {/* 2. Medication Type / Form (نوع الدواء) */}
          <div>
            <label className="font-semibold text-slate-700 block mb-2">
              نوع الدواء (الشكل الصيدلاني) <span className="text-blue-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(FORM_LABELS) as MedicationForm[]).map((f) => {
                const isSelected = form === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm(f)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MedicationIcon
                      form={f}
                      className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}
                    />
                    <span className="truncate">{FORM_LABELS[f].ar}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Dosage Amount & Relation to Food */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                مقدار الجرعة (الكمية / التركيز) <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="مثال: قرص واحد، 5 مل، 500 ملغ"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Utensils className="w-3 h-3 text-blue-600" />
                التوقيت بالنسبة للطعام
              </label>
              <select
                value={mealTiming}
                onChange={(e) => setMealTiming(e.target.value as MealTiming)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
              >
                {(Object.keys(MEAL_TIMING_LABELS) as MealTiming[]).map((mt) => (
                  <option key={mt} value={mt}>
                    {MEAL_TIMING_LABELS[mt]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Dosage Schedule (Frequency & Times) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div>
              <label className="font-semibold text-slate-900 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                جدول وتكرار الجرعة
              </label>
              <select
                value={frequency}
                onChange={(e) => updateTimesForFrequency(e.target.value as FrequencyType)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-medium shadow-2xs"
              >
                {(Object.keys(FREQUENCY_LABELS) as FrequencyType[]).map((fq) => (
                  <option key={fq} value={fq}>
                    {FREQUENCY_LABELS[fq]}
                  </option>
                ))}
              </select>
            </div>

            {/* Times Selector */}
            <div>
              <label className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                مواعيد أخذ الجرعات اليومية:
              </label>
              <div className="flex flex-wrap gap-2">
                {times.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-white border border-blue-200 rounded-xl px-2.5 py-1 shadow-2xs"
                  >
                    <input
                      type="time"
                      value={t}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      className="bg-transparent text-blue-700 font-mono text-xs font-semibold focus:outline-none cursor-pointer"
                    />
                    {times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(idx)}
                        className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="bg-white hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Plus className="w-3 h-3 text-blue-600" />
                  إضافة وقت آخر
                </button>
              </div>
            </div>
          </div>

          {/* 5. Treatment Duration (مدة العلاج) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                مدة العلاج
              </label>

              {/* Chronic treatment toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isChronic}
                  onChange={(e) => setIsChronic(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium text-blue-700">علاج مزمن مستمر (طويل الأمد)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1 font-medium">تاريخ البدء</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {!isChronic && (
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 font-medium">
                    مدة الكورس العلاجي (بالأيام)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      placeholder="مثال: 7 أو 10"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                    <span className="text-slate-500 whitespace-nowrap font-medium">يوم</span>
                  </div>
                </div>
              )}
            </div>

            {!isChronic && Number(durationDays) > 0 && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
                ينتهي الكورس العلاجي بتاريخ تقريبي:{' '}
                <strong className="text-emerald-800">
                  {new Date(
                    new Date(startDate).getTime() + Number(durationDays) * 24 * 60 * 60 * 1000
                  ).toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
              </p>
            )}
          </div>

          {/* 6. Pill Inventory & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1 font-medium">
                الكمية المتبقية في العبوة
              </label>
              <input
                type="number"
                value={remainingPills}
                onChange={(e) => setRemainingPills(e.target.value)}
                placeholder="20"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1 font-medium">
                الطبيب المعالج (اختياري)
              </label>
              <input
                type="text"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                placeholder="د. أحمد / عيادة الباطنية"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1 font-medium">
              ملاحظات إضافية أو تحذيرات
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تجنب شرب القهوة مع الدواء، احفظه في الثلاجة..."
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {editingMedication ? 'حفظ التعديلات' : 'إضافة الدواء إلى خطتي'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
