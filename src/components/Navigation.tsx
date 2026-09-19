import React from "react";
import {
  Home,
  MessageSquare,
  FileText,
  ShieldAlert,
  Compass,
  Bell,
  Calendar,
  Users,
  Settings,
  Phone,
  Sparkles,
  Volume2
} from "lucide-react";
import { Page, UserPreferences, TrustedContact, ServerStatus } from "../types.ts";
import { t, generateTrustedContactUrl } from "../utils/translations.ts";

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  contacts: TrustedContact[];
  serverStatus: ServerStatus;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  preferences,
  onUpdatePreferences,
  contacts,
  serverStatus
}) => {
  const isHC = preferences.contrast_mode === "High Contrast";
  const primaryContact = contacts[0];

  const navItems: { page: Page; labelKey: string; icon: React.ReactNode }[] = [
    { page: "home", labelKey: "nav_home", icon: <Home className="w-6 h-6" /> },
    { page: "companion", labelKey: "nav_companion", icon: <MessageSquare className="w-6 h-6" /> },
    { page: "explain", labelKey: "nav_explain", icon: <FileText className="w-6 h-6" /> },
    { page: "scam", labelKey: "nav_scam", icon: <ShieldAlert className="w-6 h-6" /> },
    { page: "guided", labelKey: "nav_guided", icon: <Compass className="w-6 h-6" /> },
    { page: "reminders", labelKey: "nav_reminders", icon: <Bell className="w-6 h-6" /> },
    { page: "my_day", labelKey: "nav_my_day", icon: <Calendar className="w-6 h-6" /> },
    { page: "trusted", labelKey: "nav_trusted", icon: <Users className="w-6 h-6" /> },
    { page: "settings", labelKey: "nav_settings", icon: <Settings className="w-6 h-6" /> }
  ];

  return (
    <>
      {/* Sticky Mobile Topbar (always accessible even on narrow viewports) */}
      <nav
        id="mobile-top-nav"
        aria-label="Mobile Navigation"
        className={`md:hidden sticky top-0 z-50 border-b-4 px-3 py-2 flex items-center justify-between overflow-x-auto ${
          isHC ? "bg-slate-950 border-amber-400 text-amber-300" : "bg-[#1B4965] border-amber-400 text-white"
        }`}
      >
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                id={`mobile-nav-${item.page}`}
                onClick={() => onNavigate(item.page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  active
                    ? isHC
                      ? "bg-amber-400 text-black border-2 border-amber-300"
                      : "bg-white/20 text-white border border-white/40"
                    : isHC
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-[#14374d] text-white/90 hover:bg-[#0f293b]"
                }`}
              >
                {item.icon}
                <span>{t(item.labelKey, preferences.language).replace(/^[^\s]+\s*/, "")}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop & Tablet Permanent Senior Sidebar */}
      <aside
        id="senior-sidebar"
        aria-label="Sidebar Navigation"
        className={`hidden md:flex flex-col w-72 shrink-0 border-r-2 p-5 min-h-screen select-none ${
          isHC
            ? "bg-[#0B0F19] border-amber-400 text-white"
            : "bg-[#F0F7FA] border-[#BEE1E6] text-slate-900"
        }`}
      >
        {/* Brand Heading */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label="Senior emoji">
              👴
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-tight">
                {t("app_title", preferences.language)}
              </h1>
              <p
                className={`text-xs font-semibold mt-0.5 ${
                  isHC ? "text-amber-300" : "text-[#1B4965]"
                }`}
              >
                {t("tagline", preferences.language)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-300/40 dark:bg-slate-700/60 mb-4" />

        {/* Navigation Items (Extra Large click targets for senior fingers) */}
        <div className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                id={`sidebar-nav-${item.page}`}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all text-left ${
                  active
                    ? isHC
                      ? "bg-amber-400 text-black border-2 border-amber-300 shadow-md translate-x-1"
                      : "bg-[#1B4965] text-white shadow-md translate-x-1"
                    : isHC
                    ? "bg-slate-900/60 text-white hover:bg-slate-800 border border-slate-700"
                    : "bg-white text-slate-800 hover:bg-sky-50 border border-slate-200"
                }`}
              >
                <span className={active ? (isHC ? "text-black" : "text-amber-300") : "text-sky-700"}>
                  {item.icon}
                </span>
                <span className="text-base font-bold">
                  {t(item.labelKey, preferences.language)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Language Switcher */}
        <div className="mt-5 p-3 rounded-xl border bg-white/70 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-600 dark:text-slate-300">
            🌐 {t("language_label", preferences.language)} / भाषा
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="lang-btn-en"
              onClick={() => onUpdatePreferences({ language: "English" })}
              className={`py-2 px-3 rounded-lg font-bold text-sm text-center transition-colors ${
                preferences.language === "English"
                  ? isHC
                    ? "bg-amber-400 text-black border-2 border-black"
                    : "bg-[#1B4965] text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200"
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-hi"
              onClick={() => onUpdatePreferences({ language: "Hindi" })}
              className={`py-2 px-3 rounded-lg font-bold text-sm text-center transition-colors ${
                preferences.language === "Hindi"
                  ? isHC
                    ? "bg-amber-400 text-black border-2 border-black"
                    : "bg-[#1B4965] text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200"
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        {/* Primary Trusted Contact Quick Card */}
        {primaryContact && (
          <div
            id="sidebar-trusted-contact-card"
            className={`mt-3 p-3.5 rounded-xl border ${
              isHC
                ? "bg-slate-900 border-amber-400 text-white"
                : "bg-[#E0F2FE] border-[#0284C7] text-[#0C4A6E]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1 text-[#0369A1] dark:text-amber-300">
                <Users className="w-4 h-4" /> Trusted Contact
              </span>
              <a
                href={generateTrustedContactUrl(
                  primaryContact.phone,
                  `Hi ${primaryContact.name}, I need your assistance looking at a digital message on my phone.`
                )}
                target="_blank"
                rel="noreferrer"
                id="sidebar-call-contact"
                className="text-xs font-bold px-2 py-1 bg-[#0284C7] text-white rounded-md flex items-center gap-1 hover:bg-[#0369A1]"
              >
                <Phone className="w-3 h-3" /> WhatsApp
              </a>
            </div>
            <div className="font-extrabold text-sm">{primaryContact.name} ({primaryContact.relationship})</div>
            <div className="text-xs font-semibold opacity-90">{primaryContact.phone}</div>
          </div>
        )}

        {/* Live AI Status Badge */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2">
          {serverStatus.hasKey ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              🟢 {t("connected_ai", preferences.language)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              🟡 {t("demo_mode", preferences.language)}
            </span>
          )}
        </div>
      </aside>
    </>
  );
};
