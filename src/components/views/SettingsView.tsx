import React, { useState } from "react";
import {
  Settings,
  Type,
  SunMoon,
  Globe,
  Volume2,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { UserProfile, UserPreferences, TextSize, ContrastMode, Language, ServerStatus } from "../../types.ts";
import { t } from "../../utils/translations.ts";

interface SettingsViewProps {
  user: UserProfile;
  preferences: UserPreferences;
  onUpdateUser: (user: UserProfile) => void;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onResetDemoData: () => void;
  serverStatus: ServerStatus;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  preferences,
  onUpdateUser,
  onUpdatePreferences,
  onResetDemoData,
  serverStatus
}) => {
  const [nameInput, setNameInput] = useState(user.name);
  const [phoneInput, setPhoneInput] = useState(user.phone || "");
  const [saveNotice, setSaveNotice] = useState(false);

  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: nameInput.trim(),
      phone: phoneInput.trim()
    });
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>⚙️</span> {t("nav_settings", preferences.language)}
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
            {isHindi
              ? "अपनी सुविधा अनुसार अक्षरों का आकार, भाषा और आवाज़ की गति बदलें।"
              : "Customize font size, contrast, language, and voice settings to your comfort."}
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Profile saved successfully!</span>
        </div>
      )}

      {/* Senior Profile Form */}
      <div
        className={`p-6 rounded-2xl border-2 space-y-4 shadow-sm ${
          isHC ? "bg-[#151C2C] border-amber-400 text-white" : "bg-white border-slate-200"
        }`}
      >
        <h2 className="text-xl font-black flex items-center gap-2">
          <span>👤</span> Personal Information / व्यक्तिगत जानकारी
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Your Name / आपका नाम:</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-base font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Phone Number / फोन:</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-base font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
                isHC ? "bg-amber-400 text-black font-extrabold" : "bg-[#1B4965] text-white"
              }`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Accessibility & Visual Settings */}
      <div
        className={`p-6 rounded-2xl border-2 space-y-5 shadow-sm ${
          isHC ? "bg-[#151C2C] border-amber-400 text-white" : "bg-white border-slate-200"
        }`}
      >
        <h2 className="text-xl font-black flex items-center gap-2">
          <span>👓</span> Visual & Accessibility Preferences
        </h2>

        {/* Text Size */}
        <div className="space-y-2">
          <label className="text-sm font-extrabold flex items-center gap-2">
            <Type className="w-4 h-4" /> Text Size / अक्षरों का आकार:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Standard", "Large", "Extra Large"] as TextSize[]).map((size) => (
              <button
                key={size}
                id={`btn-size-${size.toLowerCase().replace(" ", "-")}`}
                onClick={() => onUpdatePreferences({ text_size: size })}
                className={`py-3 px-2 rounded-xl font-bold text-sm border text-center transition-all ${
                  preferences.text_size === size
                    ? isHC
                      ? "bg-amber-400 text-black border-2 border-white"
                      : "bg-[#1B4965] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                {size} {size === "Large" && "(Recommended)"}
              </button>
            ))}
          </div>
        </div>

        {/* Contrast Mode */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-extrabold flex items-center gap-2">
            <SunMoon className="w-4 h-4" /> Contrast Mode / कंट्रास्ट मोड:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Standard", "High Contrast"] as ContrastMode[]).map((c) => (
              <button
                key={c}
                id={`btn-contrast-${c.toLowerCase().replace(" ", "-")}`}
                onClick={() => onUpdatePreferences({ contrast_mode: c })}
                className={`py-3 px-2 rounded-xl font-bold text-sm border text-center transition-all ${
                  preferences.contrast_mode === c
                    ? isHC
                      ? "bg-amber-400 text-black border-2 border-white"
                      : "bg-[#1B4965] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-extrabold flex items-center gap-2">
            <Globe className="w-4 h-4" /> Response Language / भाषा:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["English", "Hindi"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onUpdatePreferences({ language: lang })}
                className={`py-3 px-2 rounded-xl font-bold text-sm border text-center transition-all ${
                  preferences.language === lang
                    ? isHC
                      ? "bg-amber-400 text-black border-2 border-white"
                      : "bg-[#1B4965] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                {lang === "English" ? "English" : "हिंदी (Hindi)"}
              </button>
            ))}
          </div>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-sm font-extrabold flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Speech Reading Speed:
            </label>
            <span className="text-xs font-bold text-sky-700 dark:text-amber-400">
              {preferences.speech_rate <= 0.85
                ? "Calm & Relaxed (0.8x)"
                : preferences.speech_rate >= 1.0
                ? "Normal Pace (1.0x)"
                : "Senior Friendly (0.9x)"}
            </span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.1"
            step="0.05"
            value={preferences.speech_rate}
            onChange={(e) =>
              onUpdatePreferences({ speech_rate: parseFloat(e.target.value) })
            }
            className="w-full accent-sky-700 dark:accent-amber-400"
          />
        </div>
      </div>

      {/* Safety & System Guardrails Card */}
      <div
        className={`p-5 rounded-2xl border flex items-start gap-3 ${
          isHC ? "bg-slate-900 border-amber-400 text-white" : "bg-sky-50 border-sky-200 text-slate-800"
        }`}
      >
        <ShieldCheck className="w-6 h-6 text-[#0284C7] shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm font-medium">
          <div className="font-black text-base text-[#1B4965] dark:text-amber-300">
            Privacy & Trust Guarantees
          </div>
          <p>
            • Secret passwords, UPI PINs, and OTPs are automatically masked before any processing.
          </p>
          <p>
            • AI Senior Companion never executes financial payments or books medical treatments directly.
          </p>
          <p>
            • Model backend: <strong>{serverStatus.model}</strong> ({serverStatus.hasKey ? "Live Gemini Connected" : "Calibrated Fallback Mode"}).
          </p>
        </div>
      </div>

      {/* Reset Demo Data Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          id="btn-reset-demo-data"
          onClick={() => {
            if (confirm("Reset all reminders, contacts, and preferences to original demo state?")) {
              onResetDemoData();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 dark:text-rose-400 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t("reset_demo", preferences.language)}</span>
        </button>
      </div>
    </div>
  );
};
