export type MedicationForm =
  | 'tablet' // حبوب / أقراص
  | 'capsule' // كبسولات
  | 'syrup' // شراب / سائل
  | 'injection' // حقن
  | 'ointment' // مرهم / كريم
  | 'drops' // قطرات
  | 'inhaler' // بخاخ / استنشاق
  | 'suppository' // تحاميل
  | 'patch' // رقعة جلدية
  | 'effervescent' // فوار
  | 'other'; // أخرى

export type MealTiming =
  | 'before_meal' // قبل الأكل
  | 'after_meal' // بعد الأكل
  | 'with_meal' // مع الأكل
  | 'empty_stomach' // على معدة فارغة
  | 'before_bed' // قبل النوم
  | 'as_needed'; // عند اللزوم

export type FrequencyType =
  | 'once_daily' // مرة واحدة يومياً
  | 'twice_daily' // مرتان يومياً (كل 12 ساعة)
  | 'three_times_daily' // ثلاث مرات يومياً (كل 8 ساعات)
  | 'four_times_daily' // أربع مرات يومياً (كل 6 ساعات)
  | 'every_other_day' // يوم بعد يوم
  | 'weekly' // أسبوعياً
  | 'as_needed'; // عند اللزوم

export interface Medication {
  id: string;
  name: string; // اسم الدواء
  genericName?: string; // الاسم العلمي
  form: MedicationForm; // نوع الدواء
  dosage: string; // مقدار الجرعة (مثال: 500 ملغ، 1 قرص، 5 مل)
  frequency: FrequencyType; // تكرار الجرعة
  times: string[]; // أوقات الجرعات اليومية، مثلاً ["08:00", "20:00"]
  mealTiming: MealTiming; // التوقيت بالنسبة للطعام
  startDate: string; // تاريخ البدء بتنسيق YYYY-MM-DD
  durationDays?: number; // مدة العلاج بالأيام (مثلاً 7، 10، 30) أو undefined للمزمن
  isChronic: boolean; // علاج مزمن مستمر
  endDate?: string; // تاريخ انتهاء العلاج
  remainingPills?: number; // الكمية المتبقية
  totalPills?: number; // إجمالي العبوة
  color?: string; // لون مميز للبطاقة
  notes?: string; // تعليمات إضافية أو ملاحظات الطبيب
  prescribedBy?: string; // اسم الطبيب المعالج
  createdAt: string;
  updatedAt: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  form: MedicationForm;
  dosage: string;
  scheduledTime: string; // مثلاً "08:00"
  date: string; // YYYY-MM-DD
  takenAt?: string; // ISO timestamp
  status: 'taken' | 'skipped' | 'pending';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  referencedMedications?: string[];
}

export interface UserProfile {
  username: string;
  displayName: string;
  pin?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  allergies?: string[];
  chronicDiseases?: string[];
  lastLogin?: string;
  createdAt: string;
}

export interface UserData {
  profile: UserProfile;
  medications: Medication[];
  doseLogs: DoseLog[];
  chatHistory: ChatMessage[];
}

export interface MedicalAuditReport {
  overallAssessment: string;
  potentialInteractions: {
    severity: 'high' | 'moderate' | 'low';
    drugs: string[];
    description: string;
    recommendation: string;
  }[];
  timingTips: string[];
  dietaryPrecautions: string[];
  doctorAdvice: string;
}
