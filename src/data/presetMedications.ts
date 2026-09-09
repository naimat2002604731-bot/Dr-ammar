import { MedicationForm, MealTiming, FrequencyType } from '../types';

export interface PresetMedication {
  name: string;
  genericName: string;
  form: MedicationForm;
  defaultDosage: string;
  defaultFrequency: FrequencyType;
  defaultTimes: string[];
  defaultMealTiming: MealTiming;
  commonDurationDays?: number;
  isChronic: boolean;
  category: string;
  notes: string;
}

export const PRESET_MEDICATIONS: PresetMedication[] = [
  {
    name: 'بانادول (Panadol / Paracetamol)',
    genericName: 'باراسيتامول - مسكن للألم وخافض للحرارة',
    form: 'tablet',
    defaultDosage: '500 ملغ (قرص أو قرصان)',
    defaultFrequency: 'three_times_daily',
    defaultTimes: ['08:00', '14:00', '20:00'],
    defaultMealTiming: 'after_meal',
    commonDurationDays: 3,
    isChronic: false,
    category: 'مسكنات وخافض حرارة',
    notes: 'يؤخذ عند اللزوم، لا تتجاوز 4000 ملغ في اليوم الواحد تجنباً لإجهاد الكبد.',
  },
  {
    name: 'أوجمنتين (Augmentin)',
    genericName: 'أموكسيسيلين + كلافولانات البوتاسيوم - مضاد حيوي واسع المجال',
    form: 'tablet',
    defaultDosage: '1000 ملغ (1 قرص)',
    defaultFrequency: 'twice_daily',
    defaultTimes: ['08:00', '20:00'],
    defaultMealTiming: 'with_meal',
    commonDurationDays: 7,
    isChronic: false,
    category: 'مضادات حيوية',
    notes: 'يجب إكمال كامل الكورس العلاجي حتى لو تحسنت الأعراض لتجنب مقاومة البكتيريا.',
  },
  {
    name: 'كونكور (Concor / Bisoprolol)',
    genericName: 'بيسوبرولول - منظم لضربات القلب وخافض لضغط الدم',
    form: 'tablet',
    defaultDosage: '5 ملغ (1 قرص)',
    defaultFrequency: 'once_daily',
    defaultTimes: ['08:00'],
    defaultMealTiming: 'before_meal',
    isChronic: true,
    category: 'القلب والضغط',
    notes: 'يؤخذ صباحاً في نفس الموعد يومياً، لا تتوقف عن تناوله فجأة دون استشارة الطبيب.',
  },
  {
    name: 'جلوكوفاج (Glucophage / Metformin)',
    genericName: 'ميتفورمين - منظم سكر الدم لمرضى السكري',
    form: 'tablet',
    defaultDosage: '500 ملغ (1 قرص)',
    defaultFrequency: 'twice_daily',
    defaultTimes: ['08:30', '20:30'],
    defaultMealTiming: 'with_meal',
    isChronic: true,
    category: 'الغدد والسكري',
    notes: 'يفضل تناوله أثناء أو بعد الوجبة مباشرة لتقليل اضطرابات الجهاز الهضمي.',
  },
  {
    name: 'نيكسيوم (Nexium / Esomeprazole)',
    genericName: 'إيزوميبرازول - مثبط مضخة البروتون لعلاج حموضة وقرحة المعدة',
    form: 'capsule',
    defaultDosage: '40 ملغ (كبسولة واحدة)',
    defaultFrequency: 'once_daily',
    defaultTimes: ['07:30'],
    defaultMealTiming: 'before_meal',
    commonDurationDays: 14,
    isChronic: false,
    category: 'الجهاز الهضمي',
    notes: 'يؤخذ على معدة فارغة قبل الإفطار بـ 30 دقيقة على الأقل.',
  },
  {
    name: 'فينتولين (Ventolin / Salbutamol)',
    genericName: 'سالبوتامول - موسع للشعب الهوائية وبخاخ للربو',
    form: 'inhaler',
    defaultDosage: 'بختان (2 Puffs)',
    defaultFrequency: 'as_needed',
    defaultTimes: ['08:00', '20:00'],
    defaultMealTiming: 'as_needed',
    isChronic: true,
    category: 'الجهاز التنفسي',
    notes: 'يجب رج البخاخ جيداً قبل الاستخدام، والمضمضة بالماء بعد الاستعمال.',
  },
  {
    name: 'ليبيتور (Lipitor / Atorvastatin)',
    genericName: 'أتورفاستاتين - خافض للكوليسترول والدهون الثلاثية',
    form: 'tablet',
    defaultDosage: '20 ملغ (قرص واحد)',
    defaultFrequency: 'once_daily',
    defaultTimes: ['21:00'],
    defaultMealTiming: 'before_bed',
    isChronic: true,
    category: 'الدهون والكوليسترول',
    notes: 'يُفضل تناوله مساءً قبل النوم، وتجنب شرب عصير الجريب فروت أثناء فترة العلاج.',
  },
  {
    name: 'أوميغا 3 وفيتامين د (Omega 3 & Vit D3)',
    genericName: 'مكمل غذائي لصحة العظام والمناعة والقلب',
    form: 'capsule',
    defaultDosage: '1 كبسولة',
    defaultFrequency: 'once_daily',
    defaultTimes: ['13:00'],
    defaultMealTiming: 'after_meal',
    isChronic: true,
    category: 'فيتامينات ومكملات',
    notes: 'يؤخذ مع وجبة تحتوي على دهون صحية لزيادة امتصاص فيتامين د في الجسم.',
  }
];

export const FORM_LABELS: Record<MedicationForm, { ar: string; icon: string }> = {
  tablet: { ar: 'أقراص / حبوب', icon: 'Pill' },
  capsule: { ar: 'كبسولات', icon: 'Capsule' },
  syrup: { ar: 'شراب / سائل', icon: 'FlaskConical' },
  injection: { ar: 'حقن / إبرة', icon: 'Syringe' },
  ointment: { ar: 'مرهم / كريم', icon: 'Sparkles' },
  drops: { ar: 'قطرات (عين/أذن)', icon: 'Droplets' },
  inhaler: { ar: 'بخاخ / استنشاق', icon: 'Wind' },
  suppository: { ar: 'تحاميل', icon: 'ShieldPlus' },
  patch: { ar: 'رقعة / لصقة', icon: 'Square' },
  effervescent: { ar: 'فوار', icon: 'Activity' },
  other: { ar: 'أخرى', icon: 'CircleDot' },
};

export const MEAL_TIMING_LABELS: Record<MealTiming, string> = {
  before_meal: 'قبل الأكل (على الريق أو بنصف ساعة)',
  after_meal: 'بعد الأكل مباشرة',
  with_meal: 'أثناء تناول الطعام',
  empty_stomach: 'على معدة فارغة',
  before_bed: 'قبل النوم',
  as_needed: 'عند اللزوم / الحاجة',
};

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  once_daily: 'مرة واحدة يومياً (كل 24 ساعة)',
  twice_daily: 'مرتان يومياً (كل 12 ساعة)',
  three_times_daily: '3 مرات يومياً (كل 8 ساعات)',
  four_times_daily: '4 مرات يومياً (كل 6 ساعات)',
  every_other_day: 'يوم بعد يوم',
  weekly: 'مرة واحدة أسبوعياً',
  as_needed: 'عند اللزوم (حسب الحاجة والألم)',
};
