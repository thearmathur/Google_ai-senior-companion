import React, { useState, useEffect } from "react";
import {
  Calendar,
  Sun,
  Coffee,
  CheckCircle2,
  Clock,
  Volume2,
  RefreshCw,
  Sparkles,
  Heart
} from "lucide-react";
import { Page, UserProfile, UserPreferences, Reminder } from "../../types.ts";
import { t } from "../../utils/translations.ts";
import { SpeechHelper } from "../../utils/speech.ts";

interface MyDayViewProps {
  user: UserProfile;
  preferences: UserPreferences;
  reminders: Reminder[];
  onNavigate: (page: Page, params?: any) => void;
}

export const MyDayView: React.FC<MyDayViewProps> = ({
  user,
  preferences,
  reminders,
  onNavigate
}) => {
  const [briefingText, setBriefingText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";

  const fetchBriefing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.name,
          reminders,
          language: preferences.language
        })
      });
      const data = await res.json();
      setBriefingText(data.briefing);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [preferences.language]);

  const handleReadAloud = () => {
    if (!briefingText) return;
    SpeechHelper.speak(briefingText, preferences.language, preferences.speech_rate);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayReminders = reminders.filter(
    (r) => r.due_date === todayStr || r.recurrence === "Daily"
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>📅</span> {t("nav_my_day", preferences.language)}
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
            {isHindi
              ? "आपके दिन की शुरुआत शांति, स्वास्थ्य और स्पष्टता के साथ।"
              : "Your peaceful morning briefing and daily health timeline."}
          </p>
        </div>

        <button
          onClick={fetchBriefing}
          disabled={isLoading}
          className="p-2.5 rounded-xl border bg-white dark:bg-slate-900 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Warm Morning AI Briefing Card */}
      <div
        id="my-day-briefing-card"
        className={`p-6 sm:p-8 rounded-3xl border-2 space-y-4 shadow-lg ${
          isHC
            ? "bg-[#151C2C] border-amber-400 text-white"
            : "bg-gradient-to-br from-amber-50/60 via-sky-50/40 to-emerald-50/30 border-amber-300 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm uppercase tracking-wider">
            <Sun className="w-5 h-5 animate-spin-slow" />
            <span>AI Morning Briefing</span>
          </div>

          <button
            onClick={handleReadAloud}
            disabled={!briefingText || isLoading}
            className={`p-2 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-sm ${
              isHC
                ? "bg-amber-400 text-black"
                : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{t("listen_aloud", preferences.language)}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-6 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
            <span className="font-bold text-base">
              {isHindi ? "सुप्रभात संदेश तैयार हो रहा है..." : "Writing your personal morning briefing..."}
            </span>
          </div>
        ) : (
          <div className="text-lg sm:text-xl font-medium leading-relaxed whitespace-pre-line">
            {briefingText}
          </div>
        )}
      </div>

      {/* Daily Health & Peace Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Morning Wellness Note */}
        <div
          className={`p-5 rounded-2xl border-2 space-y-2 ${
            isHC ? "bg-slate-900 border-amber-400" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
            <Coffee className="w-5 h-5" />
            <span>Daily Health Tip</span>
          </div>
          <h3 className="font-extrabold text-lg">
            {isHindi ? "पर्याप्त पानी और हल्की धूप" : "Stay Hydrated & Enjoy Gentle Sun"}
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {isHindi
              ? "सुबह की 15 मिनट की धूप हड्डियों के लिए विटामिन डी देती है। पानी का गिलास पास रखें।"
              : "15 minutes of mild morning sunshine provides natural Vitamin D. Keep a water bottle nearby throughout the day."}
          </p>
        </div>

        {/* Digital Safety Reminder */}
        <div
          className={`p-5 rounded-2xl border-2 space-y-2 ${
            isHC ? "bg-slate-900 border-amber-400" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm">
            <Heart className="w-5 h-5" />
            <span>Peace of Mind Principle</span>
          </div>
          <h3 className="font-extrabold text-lg">
            {isHindi ? "जल्दबाजी कभी न करें" : "Never Rush Any Digital Action"}
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {isHindi
              ? "कोई भी असली बैंक या बिजली अधिकारी तुरंत पैसे भेजने का दबाव नहीं डालता। हमेशा रुकें और पूछें।"
              : "Legitimate services will never threaten you with instant cutoffs. When in doubt, always stop, breathe, and ask your family."}
          </p>
        </div>
      </div>

      {/* Today's Step-by-Step Schedule */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <span>⏰</span> {isHindi ? "आज का कार्यक्रम" : "Today's Schedule"}
        </h2>

        {todayReminders.map((r, i) => (
          <div
            key={r.id}
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              isHC ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-black text-sky-700 dark:text-amber-300 text-sm">
                {r.due_time}
              </span>
              <div>
                <div className="font-bold text-base">{r.title}</div>
                <div className="text-xs text-slate-500">{r.notes || r.category}</div>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                r.status === "COMPLETED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
