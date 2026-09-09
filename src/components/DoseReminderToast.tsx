import React from 'react';
import { Bell, Check, X, Clock, Utensils, Volume2 } from 'lucide-react';
import { Medication } from '../types';
import { MedicationIcon } from './MedicationIcon';
import { FORM_LABELS, MEAL_TIMING_LABELS } from '../data/presetMedications';

interface DoseReminderToastProps {
  medication: Medication;
  scheduledTime: string;
  onTake: () => void;
  onSkip: () => void;
  onDismiss: () => void;
}

export const DoseReminderToast: React.FC<DoseReminderToastProps> = ({
  medication,
  scheduledTime,
  onTake,
  onSkip,
  onDismiss,
}) => {
  return (
    <div className="fixed top-4 left-4 right-4 max-w-lg mx-auto z-50 animate-bounce-short shadow-2xl rounded-2xl bg-white border-2 border-blue-500 p-4">
      <div className="flex items-start gap-3">
        {/* Animated icon indicator */}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <MedicationIcon form={medication.form} className="w-6 h-6" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white items-center justify-center">
              <Bell className="w-2.5 h-2.5 text-white" />
            </span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                تنبيه جرعة الآن
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-blue-600" />
                {scheduledTime}
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
            {medication.name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
            <span className="font-semibold text-blue-700">{medication.dosage}</span>
            <span>•</span>
            <span className="text-slate-700">{FORM_LABELS[medication.form]?.ar}</span>
            {medication.mealTiming && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                  <Utensils className="w-3 h-3 text-amber-500" />
                  {MEAL_TIMING_LABELS[medication.mealTiming]}
                </span>
              </>
            )}
          </div>

          {medication.notes && (
            <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
              💡 {medication.notes}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
            <button
              onClick={onTake}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-md shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>تم أخذ الجرعة الآن</span>
            </button>

            <button
              onClick={onSkip}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              تخطي
            </button>

            <button
              onClick={onDismiss}
              className="text-slate-500 hover:text-slate-800 text-xs py-2 px-2 rounded-xl transition-all cursor-pointer"
            >
              تذكير لاحقاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
