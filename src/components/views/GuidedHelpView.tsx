import React, { useState, useEffect } from "react";
import {
  Compass,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  Lightbulb,
  ShieldAlert,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import { Page, UserPreferences, GuidedTask, GuidedStep } from "../../types.ts";
import { t } from "../../utils/translations.ts";
import { SpeechHelper } from "../../utils/speech.ts";

interface GuidedHelpViewProps {
  preferences: UserPreferences;
  taskName?: string;
  onNavigate: (page: Page) => void;
}

const POPULAR_TASKS = [
  "Pay an electricity bill",
  "Book a doctor appointment",
  "Change a password safely",
  "Make a video call to family"
];

export const GuidedHelpView: React.FC<GuidedHelpViewProps> = ({
  preferences,
  taskName: initialTaskName,
  onNavigate
}) => {
  const [selectedTaskName, setSelectedTaskName] = useState(
    initialTaskName || "Pay an electricity bill"
  );
  const [customTaskInput, setCustomTaskInput] = useState("");
  const [taskData, setTaskData] = useState<GuidedTask | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";

  const fetchTask = async (taskName: string) => {
    setIsLoading(true);
    setCompleted(false);
    setCurrentStepIndex(0);
    try {
      const res = await fetch("/api/guided", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName, language: preferences.language })
      });
      const data = await res.json();
      setTaskData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTaskName) {
      setSelectedTaskName(initialTaskName);
      fetchTask(initialTaskName);
    } else {
      fetchTask("Pay an electricity bill");
    }
  }, [initialTaskName, preferences.language]);

  const currentStep: GuidedStep | undefined = taskData?.steps?.[currentStepIndex];

  const handleNext = () => {
    if (!taskData) return;
    if (currentStepIndex < taskData.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setCompleted(false);
    }
  };

  const handleReadAloud = () => {
    if (!currentStep) return;
    const content = `Step ${currentStep.step_number} of ${currentStep.total_steps}. ${
      currentStep.title
    }. ${currentStep.description}. Tip: ${currentStep.helpful_tip || ""}. Safety Check: ${
      currentStep.safety_reminder || ""
    }.`;
    SpeechHelper.speak(content, preferences.language, preferences.speech_rate);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskInput.trim()) return;
    const task = customTaskInput.trim();
    setSelectedTaskName(task);
    setCustomTaskInput("");
    fetchTask(task);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>🧭</span> {t("nav_guided", preferences.language)}
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
            {isHindi
              ? "किसी भी काम को बिना किसी जल्दबाजी के एक-एक कदम करके सीखें।"
              : "Learn any digital task one step at a time at a calm, relaxed pace."}
          </p>
        </div>
      </div>

      {/* Popular Tasks Selection Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isHindi ? "लोकप्रिय काम चुनें:" : "Choose a Task to Learn:"}
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TASKS.map((task) => (
            <button
              key={task}
              id={`btn-task-${task.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => {
                setSelectedTaskName(task);
                fetchTask(task);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                selectedTaskName === task
                  ? isHC
                    ? "bg-amber-400 text-black border-2 border-white"
                    : "bg-[#1B4965] text-white shadow-sm"
                  : isHC
                  ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
                  : "bg-white hover:bg-sky-50 border-slate-300 text-slate-800"
              }`}
            >
              {task}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Task Generator Input */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="text"
          value={customTaskInput}
          onChange={(e) => setCustomTaskInput(e.target.value)}
          placeholder={
            isHindi
              ? "या कोई अन्य काम लिखें (जैसे: IRCTC पर टिकट कैसे बुक करें)..."
              : "Or ask for guidance on any task (e.g. How to book train tickets online)..."
          }
          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium ${
            isHC
              ? "bg-slate-900 border-amber-400 text-white"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />
        <button
          type="submit"
          disabled={!customTaskInput.trim() || isLoading}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
            isHC
              ? "bg-amber-400 text-black border-2 border-white"
              : "bg-[#1B4965] text-white hover:bg-[#14374d]"
          }`}
        >
          {isHindi ? "मार्गदर्शन प्राप्त करें" : "Guide Me"}
        </button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center rounded-2xl border bg-slate-50 dark:bg-slate-900 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-sky-700 dark:text-amber-400 animate-spin" />
          <div className="font-bold text-lg">
            {isHindi
              ? "आपके लिए आसान कदम तैयार किए जा रहे हैं..."
              : "Preparing gentle step-by-step instructions for you..."}
          </div>
        </div>
      )}

      {/* Task Guidance Card */}
      {!isLoading && taskData && currentStep && !completed && (
        <div
          id="guided-step-card"
          className={`p-6 sm:p-8 rounded-3xl border-2 space-y-6 shadow-xl ${
            isHC
              ? "bg-[#151C2C] border-amber-400 text-white"
              : "bg-white border-sky-300 text-slate-900"
          }`}
        >
          {/* Top Progress & Read-Aloud */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-sky-700 dark:text-amber-400">
                {taskData.task_name}
              </span>
              <div className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400">
                Step {currentStep.step_number} of {currentStep.total_steps}
              </div>
            </div>

            <button
              onClick={handleReadAloud}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 text-xs sm:text-sm shadow-sm ${
                isHC
                  ? "bg-amber-400 text-black"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{t("listen_aloud", preferences.language)}</span>
            </button>
          </div>

          {/* Visual Step Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isHC ? "bg-amber-400" : "bg-[#1B4965]"
              }`}
              style={{
                width: `${(currentStep.step_number / currentStep.total_steps) * 100}%`
              }}
            />
          </div>

          {/* Step Main Title & Description */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              {currentStep.title}
            </h2>
            <p className="text-lg sm:text-xl font-medium leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Helpful Tip */}
          {currentStep.helpful_tip && (
            <div className="p-4 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-sky-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold uppercase text-sky-800 dark:text-sky-300">
                  Helpful Tip
                </div>
                <div className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {currentStep.helpful_tip}
                </div>
              </div>
            </div>
          )}

          {/* Safety Reminder */}
          {currentStep.safety_reminder && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold uppercase text-amber-800 dark:text-amber-300">
                  Safety Checkpoint
                </div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {currentStep.safety_reminder}
                </div>
              </div>
            </div>
          )}

          {/* Guidance Disclaimer */}
          <div className="text-xs text-slate-400 italic">
            🛡️ {taskData.disclaimer || "This is a guidance system. No actual payments are made here."}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <button
              id="btn-guided-prev"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className={`px-5 py-3.5 rounded-2xl font-black text-base flex items-center gap-2 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                isHC
                  ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{isHindi ? "पिछला कदम" : "Previous Step"}</span>
            </button>

            <button
              id="btn-guided-next"
              onClick={handleNext}
              className={`px-7 py-3.5 rounded-2xl font-black text-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isHC
                  ? "bg-amber-400 text-black border-2 border-white hover:bg-amber-300"
                  : "bg-[#1B4965] text-white hover:bg-[#14374d]"
              }`}
            >
              <span>
                {currentStepIndex === taskData.steps.length - 1
                  ? t("finish_button", preferences.language)
                  : isHindi
                  ? "अगला कदम ->"
                  : "Next Step ->"}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Task Completion Celebration Screen */}
      {!isLoading && completed && (
        <div
          id="guided-complete-card"
          className={`p-8 sm:p-10 rounded-3xl border-2 text-center space-y-6 shadow-xl animate-fade-in ${
            isHC
              ? "bg-[#151C2C] border-amber-400 text-white"
              : "bg-white border-emerald-300 text-slate-900"
          }`}
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-4xl">
            🎉
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {isHindi ? "बहुत बढ़िया! आपने यह काम सीख लिया।" : "Wonderful Job! You Completed This Guide."}
            </h2>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              {isHindi
                ? "अब आप आत्मविश्वास के साथ यह काम कर सकते हैं। यदि आपको कभी भी संदेह हो, तो बेझिझक दोबारा पूछें।"
                : "You now have all the knowledge needed to handle this task with calm confidence. Ask anytime if you want to review!"}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setCompleted(false);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-base border transition-all ${
                isHC
                  ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isHindi ? "दोबारा पढ़ें" : "Review Steps Again"}</span>
            </button>
            <button
              onClick={() => onNavigate("home")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-base shadow-md transition-all ${
                isHC
                  ? "bg-amber-400 text-black border-2 border-white"
                  : "bg-[#1B4965] text-white hover:bg-[#14374d]"
              }`}
            >
              <span>{isHindi ? "मुख्य पृष्ठ पर जाएं" : "Return to Home"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
