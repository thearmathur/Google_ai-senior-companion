import React, { useState } from "react";
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Sparkles,
  Volume2,
  RefreshCw,
  Tag
} from "lucide-react";
import { Page, UserPreferences, Reminder, ReminderCategory } from "../../types.ts";
import { t, formatFriendlyDate } from "../../utils/translations.ts";
import { SpeechHelper } from "../../utils/speech.ts";

interface RemindersViewProps {
  preferences: UserPreferences;
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, "id">) => void;
  onUpdateStatus: (id: string, status: "PENDING" | "COMPLETED") => void;
  onDeleteReminder: (id: string) => void;
  prefill?: string;
  onNavigate: (page: Page) => void;
}

const CATEGORIES: ReminderCategory[] = [
  "Medicine",
  "Bills",
  "Appointments",
  "Important",
  "Personal"
];

export const RemindersView: React.FC<RemindersViewProps> = ({
  preferences,
  reminders,
  onAddReminder,
  onUpdateStatus,
  onDeleteReminder,
  prefill = "",
  onNavigate
}) => {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TODAY" | "UPCOMING" | "COMPLETED">("TODAY");
  const [nlpInput, setNlpInput] = useState(prefill);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual form state
  const todayStr = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ReminderCategory>("Medicine");
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState("09:00");
  const [recurrence, setRecurrence] = useState<"None" | "Daily" | "Weekly" | "Monthly">("Daily");
  const [notes, setNotes] = useState("");

  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";

  const handleNlpAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim() || isExtracting) return;

    setIsExtracting(true);
    try {
      const res = await fetch("/api/reminders/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nlpInput, language: preferences.language })
      });
      const data = await res.json();

      onAddReminder({
        title: data.title || nlpInput,
        category: data.category || "Important",
        due_date: data.date || todayStr,
        due_time: data.time || "09:00",
        recurrence: data.recurrence || "None",
        status: "PENDING",
        notes: "Created via Voice/Natural Input"
      });

      setNlpInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder({
      title: title.trim(),
      category,
      due_date: dueDate,
      due_time: dueTime,
      recurrence,
      status: "PENDING",
      notes: notes.trim()
    });

    setTitle("");
    setNotes("");
    setShowManualForm(false);
  };

  const handleReadAloud = (rem: Reminder) => {
    const text = `${rem.title}. Category: ${rem.category}. Scheduled for ${rem.due_date} at ${
      rem.due_time
    }. Notes: ${rem.notes || "None"}.`;
    SpeechHelper.speak(text, preferences.language, preferences.speech_rate);
  };

  // Filtered lists
  const filteredReminders = reminders.filter((r) => {
    if (activeFilter === "COMPLETED") return r.status === "COMPLETED";
    if (r.status === "COMPLETED") return false;

    if (activeFilter === "TODAY") {
      return r.due_date === todayStr || r.recurrence === "Daily";
    }
    if (activeFilter === "UPCOMING") {
      return r.due_date > todayStr;
    }
    return true; // ALL
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>🔔</span> {t("nav_reminders", preferences.language)}
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
            {isHindi
              ? "अपनी दवाइयाँ, डॉक्टर का समय या बिजली बिल का अलार्म बोलकर या लिखकर याद रखें।"
              : "Keep track of your daily medicines, utility bills, and doctor appointments effortlessly."}
          </p>
        </div>
      </div>

      {/* Natural Language Voice/Text Adder */}
      <div
        className={`p-5 rounded-2xl border-2 space-y-3 shadow-sm ${
          isHC
            ? "bg-[#0B0F19] border-amber-400 text-white"
            : "bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-200 text-slate-900"
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600 dark:text-amber-400" />
          <h2 className="font-extrabold text-base sm:text-lg">
            {isHindi ? "आसान भाषा में रिमाइंडर जोड़ें:" : "Add with Natural Speech or Text:"}
          </h2>
        </div>

        <form onSubmit={handleNlpAdd} className="flex gap-2">
          <input
            id="reminder-nlp-input"
            type="text"
            value={nlpInput}
            onChange={(e) => setNlpInput(e.target.value)}
            placeholder={
              isHindi
                ? "जैसे: कल सुबह 9 बजे बीपी की गोली याद दिलाना..."
                : "e.g. Remind me to take my morning BP pill at 9 AM tomorrow..."
            }
            className={`flex-1 px-4 py-3 rounded-xl border-2 text-base font-medium ${
              isHC
                ? "bg-slate-900 border-amber-400 text-white"
                : "bg-white border-slate-300 focus:border-[#1B4965] text-slate-900"
            }`}
          />
          <button
            id="btn-add-nlp-reminder"
            type="submit"
            disabled={!nlpInput.trim() || isExtracting}
            className={`px-5 py-3 rounded-xl font-black text-sm sm:text-base flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
              isHC
                ? "bg-amber-400 text-black border-2 border-white"
                : "bg-[#1B4965] text-white hover:bg-[#14374d]"
            }`}
          >
            {isExtracting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>{isHindi ? "जोड़ें" : "Add"}</span>
          </button>
        </form>

        <div className="flex justify-end">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="text-xs font-bold text-sky-700 dark:text-amber-400 hover:underline"
          >
            {showManualForm ? "Hide Detailed Form" : "+ Open Detailed Schedule Form"}
          </button>
        </div>
      </div>

      {/* Detailed Manual Form (Collapsible) */}
      {showManualForm && (
        <form
          onSubmit={handleManualSubmit}
          className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm animate-fade-in ${
            isHC ? "bg-slate-950 border-amber-400" : "bg-white border-slate-200"
          }`}
        >
          <div className="font-extrabold text-lg">Detailed Schedule Form</div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Title / क्या याद रखना है:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Amlodipine 5mg Blood Pressure Pill"
              className="w-full px-3 py-2 rounded-lg border text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Category / श्रेणी:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Recurrence / दोहराव:</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-slate-900"
              >
                <option value="None">Once Only (None)</option>
                <option value="Daily">Every Day (Daily)</option>
                <option value="Weekly">Every Week</option>
                <option value="Monthly">Every Month</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Date / तारीख:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Time / समय:</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Doctor's or Personal Notes:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take with warm water after eating"
              className="w-full px-3 py-2 rounded-lg border text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 rounded-lg border text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-bold text-sm ${
                isHC ? "bg-amber-400 text-black" : "bg-[#1B4965] text-white"
              }`}
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {(["TODAY", "UPCOMING", "ALL", "COMPLETED"] as const).map((tab) => {
          const active = activeFilter === tab;
          return (
            <button
              key={tab}
              id={`filter-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${
                active
                  ? isHC
                    ? "bg-amber-400 text-black"
                    : "bg-[#1B4965] text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {tab === "TODAY"
                ? isHindi
                  ? "आज के (Today)"
                  : "Today"
                : tab === "UPCOMING"
                ? isHindi
                  ? "आगामी (Upcoming)"
                  : "Upcoming"
                : tab === "ALL"
                ? isHindi
                  ? "सभी (All)"
                  : "All"
                : isHindi
                ? "पूरे हो चुके (Completed)"
                : "Completed"}
            </button>
          );
        })}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((rem) => {
            const isDone = rem.status === "COMPLETED";
            const icon =
              rem.category === "Medicine"
                ? "💊"
                : rem.category === "Bills"
                ? "🧾"
                : rem.category === "Appointments"
                ? "🏥"
                : "📌";

            return (
              <div
                key={rem.id}
                id={`rem-item-${rem.id}`}
                className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isDone
                    ? "opacity-60 bg-slate-100 dark:bg-slate-900/50 border-slate-300"
                    : isHC
                    ? "bg-[#151C2C] border-amber-400 text-white"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <span className="text-3xl shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <h3
                      className={`font-black text-lg sm:text-xl leading-snug ${
                        isDone ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {rem.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      <span className="inline-flex items-center gap-1 font-bold text-sky-700 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5" /> {rem.due_time}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatFriendlyDate(rem.due_date, preferences.language)}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {rem.category}
                      </span>
                      {rem.recurrence !== "None" && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            🔄 {rem.recurrence}
                          </span>
                        </>
                      )}
                    </div>

                    {rem.notes && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic mt-1">
                        {rem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleReadAloud(rem)}
                    title="Read reminder aloud"
                    className="p-2.5 rounded-xl border bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-toggle-status-${rem.id}`}
                    onClick={() =>
                      onUpdateStatus(rem.id, isDone ? "PENDING" : "COMPLETED")
                    }
                    className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${
                      isDone
                        ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                        : isHC
                        ? "bg-amber-400 text-black hover:bg-amber-300"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isDone ? "Undo" : "Mark Done"}</span>
                  </button>

                  <button
                    id={`btn-delete-rem-${rem.id}`}
                    onClick={() => onDeleteReminder(rem.id)}
                    title="Delete reminder"
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={`p-10 rounded-2xl border text-center font-bold text-base sm:text-lg ${
              isHC
                ? "bg-slate-900 border-amber-400 text-amber-200"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            {isHindi
              ? "इस सूची में कोई रिमाइंडर नहीं है। आप ऊपर से नया जोड़ सकते हैं। 🌸"
              : "No reminders found in this view. Type or speak above to add one! 🌸"}
          </div>
        )}
      </div>
    </div>
  );
};
