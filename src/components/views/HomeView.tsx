import React from "react";
import {
  FileText,
  ShieldAlert,
  Compass,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  ChevronRight
} from "lucide-react";
import { Page, UserProfile, UserPreferences, Reminder } from "../../types.ts";
import { t, getGreeting } from "../../utils/translations.ts";
import { SpeechHelper } from "../../utils/speech.ts";

interface HomeViewProps {
  user: UserProfile;
  preferences: UserPreferences;
  reminders: Reminder[];
  onUpdateReminderStatus: (id: string, status: "PENDING" | "COMPLETED") => void;
  onNavigate: (page: Page, params?: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  preferences,
  reminders,
  onUpdateReminderStatus,
  onNavigate
}) => {
  const isHC = preferences.contrast_mode === "High Contrast";
  const greeting = getGreeting(user.name, preferences.language);
  const isHindi = preferences.language === "Hindi";

  // Filter today's reminders
  const todayStr = new Date().toISOString().split("T")[0];
  const todayReminders = reminders.filter(
    (r) => r.status === "PENDING" && (r.due_date <= todayStr || r.recurrence === "Daily")
  );

  const proactiveText = isHindi
    ? "आपका बिजली का बिल 2 दिन में देय है (₹2,450)। क्या आप चाहते हैं कि मैं इसे सुरक्षित रूप से जमा करने का तरीका समझाऊँ?"
    : "Your electricity bill (BSES Rajdhani - ₹2,450) is due in 2 days. Would you like me to guide you through checking and paying it safely?";

  const handleReadAloud = () => {
    const speechContent = `${greeting}. ${t("how_can_i_help", preferences.language)}. ${proactiveText}`;
    SpeechHelper.speak(speechContent, preferences.language, preferences.speech_rate);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Welcome Title & Audio button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{greeting}</h1>
          <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 mt-1">
            {t("how_can_i_help", preferences.language)}
          </p>
        </div>
        <button
          id="btn-home-read-aloud"
          onClick={handleReadAloud}
          aria-label="Read page aloud"
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95 ${
            isHC
              ? "bg-amber-400 text-black border-2 border-black"
              : "bg-[#1B4965] text-white hover:bg-[#14374d]"
          }`}
        >
          <Volume2 className="w-5 h-5" />
          <span>{t("listen_aloud", preferences.language)}</span>
        </button>
      </div>

      {/* Proactive Assistance Banner */}
      <section
        aria-label="Proactive Assistance"
        className={`p-5 sm:p-6 rounded-2xl border-2 shadow-sm ${
          isHC
            ? "bg-[#151C2C] border-amber-400 text-white"
            : "bg-gradient-to-r from-[#E0F2FE] to-[#F0FDF4] border-[#0284C7] text-slate-900"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💡</span>
          <h2 className="font-extrabold text-xl tracking-tight text-[#0369A1] dark:text-amber-300">
            {t("proactive_banner", preferences.language)}
          </h2>
        </div>
        <p className="text-base sm:text-lg font-medium leading-relaxed mb-4">{proactiveText}</p>
        <div className="flex flex-wrap gap-3">
          <button
            id="home-btn-guide-bill"
            onClick={() => onNavigate("guided", { taskName: "Pay an electricity bill" })}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm sm:text-base shadow-sm transition-all hover:scale-[1.01] ${
              isHC
                ? "bg-amber-400 text-black border-2 border-white"
                : "bg-[#1B4965] text-white hover:bg-[#14374d]"
            }`}
          >
            <Compass className="w-5 h-5 text-amber-300" />
            <span>{isHindi ? "हाँ, मुझे तरीका सिखाएं" : "Yes, Guide Me Step-by-Step"}</span>
          </button>
          <button
            id="home-btn-view-bill"
            onClick={() => onNavigate("explain", { sample: "electricity" })}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm sm:text-base border shadow-sm transition-colors ${
              isHC
                ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
                : "bg-white border-sky-400 text-sky-900 hover:bg-sky-50"
            }`}
          >
            <FileText className="w-5 h-5 text-[#0284C7]" />
            <span>{isHindi ? "बिल का पूरा विवरण देखें" : "View Bill Breakdown"}</span>
          </button>
        </div>
      </section>

      {/* Today's Priority Reminders */}
      <section aria-labelledby="today-reminders-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="today-reminders-heading" className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <span>📋</span> {t("today_heading", preferences.language)}
          </h2>
          <button
            onClick={() => onNavigate("reminders")}
            className="text-sm font-bold text-sky-700 dark:text-amber-300 hover:underline flex items-center"
          >
            {isHindi ? "सभी रिमाइंडर देखें" : "View All"}
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {todayReminders.length > 0 ? (
          <div className="space-y-3">
            {todayReminders.map((rem) => {
              const icon =
                rem.category === "Medicine" ? "💊" : rem.category === "Bills" ? "🧾" : "🏥";
              return (
                <div
                  key={rem.id}
                  id={`home-rem-${rem.id}`}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    isHC
                      ? "bg-[#151C2C] border-amber-400 text-white"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <h3 className="font-extrabold text-lg sm:text-xl leading-snug">{rem.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1 font-bold text-sky-700 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> {rem.due_time}
                        </span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {rem.category}
                        </span>
                        {rem.notes && (
                          <>
                            <span>•</span>
                            <span className="italic">{rem.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-done-${rem.id}`}
                    onClick={() => onUpdateReminderStatus(rem.id, "COMPLETED")}
                    className={`shrink-0 px-4 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm ${
                      isHC
                        ? "bg-amber-400 text-black hover:bg-amber-300"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isHindi ? "काम पूरा हुआ" : "Mark Done"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`p-6 rounded-2xl border text-center font-bold text-base sm:text-lg ${
              isHC
                ? "bg-slate-900 border-amber-400 text-amber-200"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            {isHindi
              ? "आज के लिए कोई जरूरी काम शेष नहीं है। आपका दिन सुखद और शांतिपूर्ण रहे! 🌸"
              : "No more pending reminders for today. Have a peaceful, healthy day! 🌸"}
          </div>
        )}
      </section>

      {/* 4 Large Senior Action Help Cards */}
      <section aria-labelledby="quick-help-heading">
        <h2 id="quick-help-heading" className="text-xl sm:text-2xl font-black mb-3 flex items-center gap-2">
          <span>🚀</span> {t("quick_help", preferences.language)}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Explain Bill */}
          <button
            id="card-action-explain"
            onClick={() => onNavigate("explain")}
            className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] flex items-start gap-4 shadow-sm ${
              isHC
                ? "bg-[#151C2C] border-amber-400 text-white hover:bg-slate-900"
                : "bg-white border-sky-200 hover:border-sky-400 text-slate-900 hover:bg-sky-50/40"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${
                isHC ? "bg-amber-400 text-black" : "bg-[#1B4965] text-white"
              }`}
            >
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                {t("btn_explain", preferences.language)}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                {isHindi
                  ? "बिजली का बिल, डॉक्टर की पर्ची या बैंक पत्र को सरल भाषा में समझें।"
                  : "Simplify bills, prescriptions, or letters without confusing jargon."}
              </p>
            </div>
          </button>

          {/* Card 2: Scam Shield */}
          <button
            id="card-action-scam"
            onClick={() => onNavigate("scam")}
            className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] flex items-start gap-4 shadow-sm ${
              isHC
                ? "bg-[#151C2C] border-amber-400 text-white hover:bg-slate-900"
                : "bg-white border-rose-200 hover:border-rose-400 text-slate-900 hover:bg-rose-50/40"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${
                isHC ? "bg-rose-500 text-white" : "bg-rose-600 text-white"
              }`}
            >
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                {t("btn_scam", preferences.language)}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                {isHindi
                  ? "संदिग्ध लॉटरी, बिजली कटने की धमकी या फर्जी कॉल की सुरक्षित जाँच करें।"
                  : "Check suspicious SMS, fake lottery messages, or urgent threat calls."}
              </p>
            </div>
          </button>

          {/* Card 3: Guided Help */}
          <button
            id="card-action-guided"
            onClick={() => onNavigate("guided")}
            className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] flex items-start gap-4 shadow-sm ${
              isHC
                ? "bg-[#151C2C] border-amber-400 text-white hover:bg-slate-900"
                : "bg-white border-emerald-200 hover:border-emerald-400 text-slate-900 hover:bg-emerald-50/40"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${
                isHC ? "bg-emerald-400 text-black" : "bg-emerald-600 text-white"
              }`}
            >
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                {t("btn_guided", preferences.language)}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                {isHindi
                  ? "बिल भरना, डॉक्टर से समय लेना या वीडियो कॉल करना कदम-दर-कदम सीखें।"
                  : "Follow relaxed step-by-step guides for everyday online tasks."}
              </p>
            </div>
          </button>

          {/* Card 4: Reminders */}
          <button
            id="card-action-reminder"
            onClick={() => onNavigate("reminders")}
            className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] flex items-start gap-4 shadow-sm ${
              isHC
                ? "bg-[#151C2C] border-amber-400 text-white hover:bg-slate-900"
                : "bg-white border-amber-200 hover:border-amber-400 text-slate-900 hover:bg-amber-50/40"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${
                isHC ? "bg-amber-400 text-black" : "bg-amber-500 text-white"
              }`}
            >
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                {t("btn_reminder", preferences.language)}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                {isHindi
                  ? "दवाइयों या जरूरी बिलों के लिए बोलकर या लिखकर रिमाइंडर जोड़ें।"
                  : "Set reminders by typing or speaking in your everyday words."}
              </p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
