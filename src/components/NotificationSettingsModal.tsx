import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  Shield,
  Smartphone,
  Play,
} from 'lucide-react';
import { Medication } from '../types';
import {
  NotificationPermissionStatus,
  requestNotificationPermission,
  playMedicalChime,
  triggerVibration,
  sendBrowserNotification,
  getDoseNotificationContent,
} from '../utils/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionStatus: NotificationPermissionStatus;
  onPermissionChange: (status: NotificationPermissionStatus) => void;
  medications: Medication[];
  onTriggerTestNotification: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  permissionStatus,
  onPermissionChange,
  medications,
  onTriggerTestNotification,
}) => {
  const [testing, setTesting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    setRequesting(true);
    try {
      const status = await requestNotificationPermission();
      onPermissionChange(status);
    } finally {
      setRequesting(false);
    }
  };

  const handleTestNotification = () => {
    setTesting(true);
    playMedicalChime();
    triggerVibration();

    // Trigger test native browser notification
    const testMed = medications[0] || {
      id: 'test',
      name: 'تنبيه موعد الجرعة (تجريبي)',
      dosage: 'الجرعة المحددة',
      form: 'tablet',
      mealTiming: 'after_meal',
      times: ['12:00'],
    };

    const content = getDoseNotificationContent(testMed as Medication, 'الآن');
    sendBrowserNotification(content.title, {
      body: content.body,
      tag: 'dr-ammar-test',
      onClick: () => {
        setTestNotificationFeedback('تم النقر على إشعار التذكير بنجاح! يعمل نظام التنبيهات بامتياز.');
        setTimeout(() => setTestNotificationFeedback(null), 4000);
      },
    });

    // Also trigger in-app test callback
    onTriggerTestNotification();
    setTestNotificationFeedback('تم إرسال تنبيه تجريبي مع نغمة التنبيه الطبية والاهتزاز!');
    setTimeout(() => setTestNotificationFeedback(null), 4000);

    setTimeout(() => {
      setTesting(false);
    }, 1200);
  };

  // Aggregate all reminder times
  const allScheduledTimes: { time: string; medName: string; dosage: string }[] = [];
  medications.forEach((med) => {
    med.times.forEach((time) => {
      allScheduledTimes.push({
        time,
        medName: med.name,
        dosage: med.dosage,
      });
    });
  });
  allScheduledTimes.sort((a, b) => a.time.localeCompare(b.time));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
                نظام إشعارات وتنبيهات الجرعات
              </h2>
              <p className="text-xs text-slate-500">
                تنبيهات صوتية وإشعارات للمتصفح في مواعيد الأدوية بدقة
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

        <div className="space-y-4 text-xs">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border ${
              permissionStatus === 'granted'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : permissionStatus === 'denied'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50/80 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {permissionStatus === 'granted' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : permissionStatus === 'denied' ? (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <h3 className="font-bold text-sm font-['Cairo']">
                  {permissionStatus === 'granted'
                    ? 'إشعارات المتصفح مفعلة بنجاح ✅'
                    : permissionStatus === 'denied'
                    ? 'الإشعارات محظورة في إعدادات المتصفح'
                    : 'إذن الإشعارات غير مفعل بعد'}
                </h3>
                <p className="mt-1 leading-relaxed text-xs">
                  {permissionStatus === 'granted'
                    ? 'سيرسل لك التطبيق إشعاراً مصحوباً برنة طبية هادئة فور حلول موعد أي جرعة مسجلة.'
                    : permissionStatus === 'denied'
                    ? 'لقد تم حظر الإشعارات مسبقاً في متصفحك. لإعادة تفعيلها، انقر على أيقونة القفل 🔒 بجانب رابط الموقع في شريط العناوين واسمح بالإشعارات.'
                    : 'اضغط على الزر أدناه للسماح للمتصفح بإرسال تنبيهات الجرعات حتى لا تفوتك أي حبة دواء.'}
                </p>

                {permissionStatus !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    disabled={requesting}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {requesting ? 'جاري طلب الإذن...' : 'تفعيل إشعارات المتصفح الآن'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Test Chime and Notification Button */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              اختبار نغمة التنبيه والإشعار التجريبي
            </h4>
            <p className="text-slate-600 leading-relaxed">
              تحقق من عمل الرنة الطبية الهادئة وظهور شريط التنبيه السريع على شاشتك.
            </p>
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <button
                onClick={handleTestNotification}
                disabled={testing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {testing ? 'جاري إصدار التنبيه التجريبي...' : 'تشغيل رنة وإشعار تجريبي 🔔'}
              </button>

              <button
                onClick={() => playMedicalChime()}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                سماع النغمة فقط
              </button>
            </div>

            {testNotificationFeedback && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testNotificationFeedback}</span>
              </div>
            )}
          </div>

          {/* Scheduled Times Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm font-['Cairo'] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                مواعيد التنبيه النشطة اليوم ({allScheduledTimes.length})
              </h4>
              <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                تلقائي
              </span>
            </div>

            {allScheduledTimes.length === 0 ? (
              <p className="text-slate-500 italic py-2 text-center">
                لا توجد مواعيد جرعات مسجلة حالياً. أضف دواءك الأول لتبدأ التنبيهات.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {allScheduledTimes.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.medName}</p>
                      <p className="text-[10px] text-slate-500">{item.dosage}</p>
                    </div>
                    <span className="shrink-0 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-xs px-2 py-1 rounded-lg">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips for Best Reliability */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 text-slate-700 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-blue-900">نصائح لضمان وصول التنبيهات:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                <li>اترك علامة تبويب التطبيق مفتوحة في الخلفية أو مثبتة (Pinned Tab).</li>
                <li>تأكد من عدم تفعيل وضع "عدم الإزعاج" (Do Not Disturb) على هاتفك أو حاسوبك.</li>
                <li>يتم إطلاق نغمة تنبيه لطيفة مع كل موعد جرعة مع شريط تسجيل فوري.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-slate-300"
          >
            تم / إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
