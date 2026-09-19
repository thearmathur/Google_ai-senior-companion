import React from "react";
import { Type, SunMoon, Volume2, VolumeX } from "lucide-react";
import { UserPreferences, TextSize, ContrastMode, UserProfile } from "../types.ts";
import { SpeechHelper } from "../utils/speech.ts";

interface HeaderProps {
  user: UserProfile;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  preferences,
  onUpdatePreferences,
  isSpeaking,
  onToggleSpeech
}) => {
  const isHC = preferences.contrast_mode === "High Contrast";

  const nextTextSize = (): TextSize => {
    if (preferences.text_size === "Standard") return "Large";
    if (preferences.text_size === "Large") return "Extra Large";
    return "Standard";
  };

  const toggleContrast = () => {
    const newContrast: ContrastMode =
      preferences.contrast_mode === "Standard" ? "High Contrast" : "Standard";
    onUpdatePreferences({ contrast_mode: newContrast });
  };

  return (
    <header
      id="app-header"
      className={`border-b px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 ${
        isHC ? "bg-[#0B0F19] border-amber-400 text-white" : "bg-white border-slate-200 text-slate-800"
      }`}
    >
      {/* Senior Greeting & Identity */}
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xl ${
            isHC ? "bg-amber-400 text-black border-2 border-white" : "bg-[#1B4965] text-white"
          }`}
        >
          {user.name.charAt(0) || "S"}
        </div>
        <div>
          <div className="font-extrabold text-base sm:text-lg leading-tight">
            {user.name}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {preferences.language === "Hindi" ? "डिजिटल साथी सक्रिय" : "Senior Companion Active"}
          </div>
        </div>
      </div>

      {/* Senior Accessibility Quick Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Text Size Cycle Button */}
        <button
          id="btn-text-size-toggle"
          onClick={() => onUpdatePreferences({ text_size: nextTextSize() })}
          title="Change Text Size"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm border transition-all ${
            isHC
              ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
              : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Size: {preferences.text_size}</span>
        </button>

        {/* High Contrast Mode Toggle */}
        <button
          id="btn-contrast-toggle"
          onClick={toggleContrast}
          title="Toggle High Contrast Mode"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm border transition-all ${
            isHC
              ? "bg-amber-400 text-black border-amber-300 font-extrabold"
              : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
          }`}
        >
          <SunMoon className="w-4 h-4" />
          <span>{isHC ? "High Contrast" : "Standard"}</span>
        </button>

        {/* Global Stop / Play Voice Button */}
        <button
          id="btn-voice-audio-toggle"
          onClick={onToggleSpeech}
          title={isSpeaking ? "Stop Voice Readout" : "Audio Reader"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm border transition-all ${
            isSpeaking
              ? "bg-rose-600 text-white animate-pulse border-rose-700"
              : isHC
              ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
              : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isSpeaking ? "Stop Voice" : "Voice On"}</span>
        </button>
      </div>
    </header>
  );
};
