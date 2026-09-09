import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2, Cloud, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: {
    username: string;
    displayName?: string;
    age?: number;
    gender?: 'male' | 'female';
    allergies?: string[];
    chronicDiseases?: string[];
  }) => Promise<void>;
  onSwitchUser: (username: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = username.trim();
    if (!cleanName) {
      setError('يرجى إدخال اسم المستخدم للمتابعة');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await onLogin({
        username: cleanName.toLowerCase(),
        displayName: cleanName,
      });

      setSuccessMsg('تم تسجيل الدخول واسترجاع البيانات بنجاح!');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'تعذر تسجيل الدخول، يرجى المحاولة ثانية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Close Button if user already logged in */}
        {currentUser && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-400 hover:text-slate-900 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer transition-colors"
            title="إغلاق"
          >
            ✕
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-3 border border-blue-400/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Cairo']">
            {currentUser ? 'تبديل أو إدارة الحساب' : 'تسجيل الدخول'}
          </h2>
          <p className="text-xs text-blue-700 mt-1 flex items-center justify-center gap-1 font-semibold">
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            نظام دخول فوري وسحابي باسم المستخدم فقط
          </p>
        </div>

        {/* Informational Guidance */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 mb-5 text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            أدخل <strong>اسم المستخدم الخاص بك</strong> للدخول الفوري. إذا كنت مستخدماً جديداً، سيتم إنشاء ملفك وحفظ أدويتك تلقائياً باسمك.
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 text-center font-medium animate-shake">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl mb-4 flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {/* Form - Username Only */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              اسم المستخدم (Username) <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: mohammed أو sara أو ali2026"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-left dir-ltr shadow-2xs placeholder:text-slate-400"
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              اكتب اسمك أو معرفك المميز. يمكنك استخدامه للدخول من أي جهاز آخر لاسترجاع أدويتك.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-blue-200 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-5 text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>دخول إلى حسابي</span>
              </>
            )}
          </button>
        </form>

        {currentUser && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              أنت مسجل حالياً باسم: <strong className="text-slate-800 font-mono">@{currentUser.username}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
