import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ShieldAlert,
  Stethoscope,
  Pill,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, Medication, UserProfile } from '../types';

interface DoctorAmmarChatProps {
  user: UserProfile | null;
  medications: Medication[];
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<string>;
  onOpenAudit: () => void;
  initialPrompt?: string;
}

export const DoctorAmmarChat: React.FC<DoctorAmmarChatProps> = ({
  user,
  medications,
  chatHistory,
  onSendMessage,
  onOpenAudit,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const quickQuestions = [
    'هل هناك أي تعارض أو تفاعل بين أدويتي الحالية؟',
    'ماذا أفعل إذا نسيت موعد تناول إحدى الجرعات؟',
    'هل شرب القهوة أو الشاي يؤثر على فاعلية أدويتي؟',
    'ما هي أفضل الأطعمة التي تزيد من امتصاص علاجي؟',
    'هل يمكنني تناول مسكن ألم (مثل الباراسيتامول) مع خطتي الحالية؟',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const doctorReply = await onSendMessage(text);
      const doctorMsg: ChatMessage = {
        id: `msg-${Date.now()}-d`,
        sender: 'doctor',
        text: doctorReply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, doctorMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'doctor',
        text: 'عذراً، حدث خطأ أثناء معالجة الاستشارة. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speech cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to Speech in Arabic
  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;

    // Prefer native Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to render doctor formatted text (handling **bold** and bullet lists)
  const renderMessageContent = (content: string, isDoctorMessage: boolean) => {
    if (!isDoctorMessage) {
      return <span>{content}</span>;
    }
    const lines = content.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, lIdx) => {
          const isBullet = /^[*-]\s+/.test(line);
          const cleanLine = isBullet ? line.replace(/^[*-]\s+/, '') : line;
          const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

          const formattedLine = (
            <span key={lIdx}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-bold text-slate-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </span>
          );

          if (isBullet) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pr-1 my-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          return (
            <div key={lIdx} className={line.trim() === '' ? 'h-2' : ''}>
              {formattedLine}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-145px)] max-w-3xl mx-auto pb-24 animate-fadeIn" id="doctor-ammar-chat-container">
      {/* Top Doctor Info Card */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 mb-3 border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-emerald-200/50 border border-emerald-400/30">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 font-['Cairo'] text-sm sm:text-base">
                العيادة الذكية: الدكتور عمار
              </h2>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                متاح للإجابة الطبية
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              استشاري الطب السريري والتفاعلات الدوائية • مطلع على {medications.length} دواء في خطتك
            </p>
          </div>
        </div>

        <button
          id="chat-open-audit-btn"
          onClick={onOpenAudit}
          className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          فحص دوائي شامل
        </button>
      </div>

      {/* Patient Medications Awareness Strip */}
      {medications.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 mb-3 text-xs text-slate-700 flex items-center justify-between gap-2 overflow-x-auto shadow-2xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold text-emerald-800">أدويتك الحالية بالعيادة:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {medications.map((m) => (
              <span
                key={m.id}
                className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 whitespace-nowrap font-medium"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2" id="chat-messages-stream">
        {messages.length === 0 && (
          <div className="flex gap-2.5 sm:gap-3 justify-start items-start animate-fadeIn">
            {/* Dr. Ammar Avatar */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs border border-emerald-300/40">
              <Stethoscope className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>

            {/* Dr. Ammar Message Bubble (Calm Greenish Gray) */}
            <div className="max-w-[88%] sm:max-w-[78%] bg-gradient-to-b from-emerald-50/80 via-emerald-50/40 to-slate-50 border border-emerald-200/70 text-slate-800 rounded-3xl rounded-tr-xs p-4 text-xs sm:text-sm leading-relaxed shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-100 text-[11px] text-emerald-800 font-bold">
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>د. عمار (استشاري الأدوية)</span>
                </div>
                <span className="text-[10px] text-emerald-600/70 font-normal">الآن</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-normal">
                أهلاً بك {user ? `يا ${user.displayName || user.username}` : ''}! أنا <strong>الدكتور عمار</strong>، مستشارك الطبي والصيدلي الذكي.
              </p>
              <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                أنا هنا لمساعدتك في فهم خطتك العلاجية، توضيح التفاعلات بين الأدوية، الإجابة عن أي أسئلة تخص مواعيد الجرعات أو تأثيرات الأغذية، وتقديم النصائح الصيدلانية السريرية.
              </p>
              <div className="mt-3 pt-2.5 border-t border-emerald-100/80 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>يمكنك كتابة أي استفسار أدناه أو اختيار أحد الأسئلة الشائعة للبدء فوراً.</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isDoctor = msg.sender === 'doctor';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 items-start ${
                isDoctor ? 'justify-start' : 'justify-end'
              }`}
            >
              {/* Doctor Avatar on the right (in RTL start) */}
              {isDoctor && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs border border-emerald-300/40">
                  <Stethoscope className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                  isDoctor
                    ? 'bg-gradient-to-b from-emerald-50/80 via-emerald-50/40 to-slate-50 border border-emerald-200/70 text-slate-800 rounded-tr-xs'
                    : 'bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50/60 border border-sky-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Header inside bubble */}
                <div
                  className={`flex items-center justify-between pb-1.5 mb-2 border-b text-[11px] font-bold ${
                    isDoctor
                      ? 'border-emerald-100 text-emerald-800'
                      : 'border-sky-100 text-sky-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isDoctor ? (
                      <>
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        <span>د. عمار (استشاري الأدوية)</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        <span>{user?.displayName || user?.username || 'أنت'}</span>
                      </>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-normal ${
                      isDoctor ? 'text-emerald-700/70' : 'text-sky-700/70'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message text with clear formatting */}
                <div
                  className={`leading-relaxed font-normal ${
                    isDoctor ? 'text-slate-800' : 'text-slate-800'
                  }`}
                >
                  {renderMessageContent(msg.text, isDoctor)}
                </div>

                {/* Action footer for doctor message */}
                {isDoctor && (
                  <div className="mt-3 pt-2 border-t border-emerald-100/90 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-emerald-800/80 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      توجيه طبي معتمد
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`p-1.5 rounded-lg hover:bg-emerald-100/60 hover:text-emerald-800 transition-colors cursor-pointer ${
                          speakingMsgId === msg.id ? 'text-emerald-700 font-bold bg-emerald-100/80' : 'text-slate-500'
                        }`}
                        title="قراءة صوتية بصوت واضح"
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1.5 rounded-lg hover:bg-emerald-100/60 hover:text-emerald-800 transition-colors cursor-pointer text-slate-500"
                        title="نسخ الاستشارة"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar on the left (in RTL end) */}
              {!isDoctor && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-sky-300/50">
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking / Loading indicator with calm styling */}
        {loading && (
          <div className="flex gap-2.5 sm:gap-3 justify-start items-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-pulse shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-4 py-3 text-xs text-slate-700 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium mr-1 font-['Cairo'] text-emerald-950">
                الدكتور عمار يراجع أدويتك ويصيغ التوجيه الطبي المناسب...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Inquiries Carousel */}
      <div className="pt-2 pb-2">
        <p className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          أسئلة طبية شائعة يمكنك سؤالها بضغطة واحدة:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              id={`quick-question-${idx}`}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 text-[11px] px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2 bg-white border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 rounded-2xl p-1.5 shadow-sm transition-all"
      >
        <input
          id="doctor-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب استفسارك الطبي أو اسم دواء للدكتور عمار..."
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />

        <button
          id="doctor-chat-send-btn"
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          title="إرسال الاستشارة"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>

      {/* Medical Safety Disclaimer */}
      <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
        <ShieldAlert className="w-3 h-3 text-slate-400" />
        استشارات الدكتور عمار للتوجيه والتوعية الصحية. في الحالات الحرجة يرجى التوجه لأقرب مركز طوارئ.
      </p>
    </div>
  );
};

