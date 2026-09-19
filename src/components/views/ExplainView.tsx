import React, { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  Volume2,
  Calendar,
  IndianRupee,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Compass,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { Page, UserPreferences, DocumentExplanation, Reminder } from "../../types.ts";
import { t } from "../../utils/translations.ts";
import { SpeechHelper } from "../../utils/speech.ts";

interface ExplainViewProps {
  preferences: UserPreferences;
  onNavigate: (page: Page, params?: any) => void;
  onAddReminder: (reminder: Omit<Reminder, "id">) => void;
  prefill?: string;
  sampleType?: string;
}

export const ExplainView: React.FC<ExplainViewProps> = ({
  preferences,
  onNavigate,
  onAddReminder,
  prefill = "",
  sampleType
}) => {
  const [inputText, setInputText] = useState(
    prefill ||
      (sampleType === "electricity"
        ? `BSES RAJDHANI POWER LIMITED\nConsumer Name: MR. ANAND SHARMA\nCA Number: 100458921\nBill Date: 10-Sep-2026\nUnits Consumed: 340 Units\nTotal Energy Charges: ₹2,150.00\nFixed Monthly Charges: ₹180.00\nNET AMOUNT PAYABLE: ₹2,450.00\nDUE DATE: 25-Sep-2026`
        : "")
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    sampleType === "electricity" ? "/assets/sample_bills/sample_electricity_bill.png" : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<DocumentExplanation | null>(null);
  const [flashNotice, setFlashNotice] = useState<string | null>(null);

  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";

  const handleLoadElectricitySample = () => {
    setInputText(
      `BSES RAJDHANI POWER LIMITED\nConsumer Name: MR. ANAND SHARMA\nCA Number: 100458921\nBill Date: 10-Sep-2026\nUnits Consumed: 340 Units\nTotal Energy Charges: ₹2,150.00\nFixed Monthly Charges: ₹180.00\nNET AMOUNT PAYABLE: ₹2,450.00\nDUE DATE: 25-Sep-2026\nNote: Beware of fraud SMS threats.`
    );
    setImagePreview("/assets/sample_bills/sample_electricity_bill.png");
    setImageBase64(null);
  };

  const handleLoadMedicalSample = () => {
    setInputText(
      `DR. LAL PATHLABS - ROUTINE METABOLIC PANEL\nPatient Name: Mr. Anand Sharma, Age: 68\nDate: 12-Sep-2026\nFasting Blood Sugar: 98 mg/dL (Normal Range: 70 - 100 mg/dL)\nHbA1c: 5.7% (Excellent Glycemic Control)\nBlood Pressure: 124/82 mmHg\nDoctor Consultation: Routine Follow-up with Dr. Verma recommended next month.`
    );
    setImagePreview(null);
    setImageBase64(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageBase64(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleExplain = async () => {
    if (!inputText.trim() && !imageBase64 && !imagePreview) return;

    setIsLoading(true);
    setFlashNotice(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          imageBase64: imageBase64,
          imageMimeType: imageMimeType,
          language: preferences.language
        })
      });
      const data = await res.json();
      setExplanation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!explanation) return;
    const content = `${explanation.document_type}. ${explanation.simple_summary}. Amount: ${
      explanation.amount_to_pay || "Not applicable"
    }. Due date: ${explanation.due_date || "Not applicable"}. What you need to do: ${explanation.what_you_need_to_do.join(
      ", "
    )}.`;
    SpeechHelper.speak(content, preferences.language, preferences.speech_rate);
  };

  const handleSetReminder = () => {
    if (!explanation) return;
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const dueDate = today.toISOString().split("T")[0];

    onAddReminder({
      title: `${explanation.document_type} Due: ${explanation.amount_to_pay || ""}`,
      category: "Bills",
      due_date: dueDate,
      due_time: "18:00",
      recurrence: "None",
      status: "PENDING",
      notes: `Provider: ${explanation.provider_or_sender || "Official"}. Verified via Explain Bill.`
    });

    setFlashNotice(
      isHindi
        ? "✅ रिमाइंडर सफलतापूर्वक सेट हो गया!"
        : "✅ Reminder set successfully for this bill!"
    );
    setTimeout(() => {
      onNavigate("reminders");
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title & Introduction */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>📄</span> {t("nav_explain", preferences.language)}
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
            {isHindi
              ? "किसी भी बिल, डॉक्टर के पर्चे या बैंक पत्र का फोटो लें या टेक्स्ट लिखें। मैं इसे सरल और सहज भाषा में समझाऊँगा।"
              : "Upload an image, bill, or paste the text of any letter. I will explain it in simple everyday words."}
          </p>
        </div>
      </div>

      {flashNotice && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-base animate-fade-in">
          {flashNotice}
        </div>
      )}

      {/* Sample Quick Loader Buttons */}
      <div className="p-4 rounded-2xl border bg-white/70 dark:bg-slate-900/60 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
          {isHindi ? "नमूने लोड करें:" : "Try Realistic Samples:"}
        </span>
        <button
          id="btn-sample-electricity"
          onClick={handleLoadElectricitySample}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-colors ${
            isHC
              ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
              : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-900"
          }`}
        >
          📋 Electricity Bill (BSES ₹2,450)
        </button>
        <button
          id="btn-sample-medical"
          onClick={handleLoadMedicalSample}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-colors ${
            isHC
              ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
              : "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900"
          }`}
        >
          📋 Medical Lab Report (Dr. Lal)
        </button>
        <button
          onClick={() => {
            setInputText("");
            setImagePreview(null);
            setImageBase64(null);
            setExplanation(null);
          }}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Input Section (Text or File) */}
      <div
        className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm ${
          isHC
            ? "bg-[#0B0F19] border-amber-400 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <label className="block text-base font-extrabold text-slate-800 dark:text-slate-100">
          {isHindi
            ? "बिल या दस्तावेज़ का टेक्स्ट यहाँ पेस्ट करें:"
            : "Paste the text of your bill or notice here:"}
        </label>
        <textarea
          id="explain-input-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          placeholder={
            isHindi
              ? "जैसे: BSES बिजली बिल, ₹2,450 देय तिथि 25 सितंबर..."
              : "e.g. BSES Electricity Bill due 25 September for Rs 2,450..."
          }
          className={`w-full p-4 rounded-xl border-2 text-base font-medium transition-all focus:outline-none ${
            isHC
              ? "bg-slate-900 border-amber-400 text-white focus:border-white"
              : "bg-slate-50 border-slate-300 focus:border-[#1B4965] text-slate-900"
          }`}
        />

        {/* File / Image Attachment */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
            <Upload className="w-4 h-4" />
            <span>{imagePreview ? "Change Picture" : "Upload Picture or Bill"}</span>
            <input
              id="file-upload-input"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {imagePreview && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ImageIcon className="w-4 h-4" />
              <span>Picture Attached Ready</span>
            </div>
          )}

          <button
            id="btn-run-explain"
            onClick={handleExplain}
            disabled={(!inputText.trim() && !imagePreview) || isLoading}
            className={`px-6 py-3 rounded-xl font-black text-base flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isHC
                ? "bg-amber-400 text-black border-2 border-white hover:bg-amber-300"
                : "bg-[#1B4965] text-white hover:bg-[#14374d]"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isHindi ? "विश्लेषण हो रहा है..." : "Analyzing Document..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{isHindi ? "सरल शब्दों में समझाइए" : "Explain This to Me Simply"}</span>
              </>
            )}
          </button>
        </div>

        {imagePreview && (
          <div className="mt-3 p-2 rounded-xl border border-slate-300 dark:border-slate-700 max-h-56 overflow-hidden flex justify-center bg-black/5">
            <img
              src={imagePreview}
              alt="Uploaded document preview"
              className="max-h-52 object-contain rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Explanation Results */}
      {explanation && (
        <div
          id="explain-result-card"
          className={`p-6 rounded-2xl border-2 space-y-5 shadow-lg ${
            isHC
              ? "bg-[#151C2C] border-amber-400 text-white"
              : "bg-white border-[#1B4965] text-slate-900"
          }`}
        >
          {/* Header & Speech */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                  isHC ? "bg-amber-400 text-black" : "bg-sky-100 text-sky-800"
                }`}
              >
                📑 {explanation.document_type}
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-snug">
                {explanation.simple_summary}
              </h2>
            </div>

            <button
              onClick={handleReadAloud}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 text-xs sm:text-sm shrink-0 shadow-sm ${
                isHC
                  ? "bg-amber-400 text-black"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{t("listen_aloud", preferences.language)}</span>
            </button>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`p-4 rounded-xl border ${
                isHC ? "bg-slate-900 border-amber-400" : "bg-sky-50/70 border-sky-200"
              }`}
            >
              <div className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" /> Amount to Pay / राशि
              </div>
              <div className="text-2xl font-black text-[#1B4965] dark:text-amber-300 mt-1">
                {explanation.amount_to_pay || "N/A"}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isHC ? "bg-slate-900 border-amber-400" : "bg-sky-50/70 border-sky-200"
              }`}
            >
              <div className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due Date / अंतिम तिथि
              </div>
              <div className="text-xl font-black text-[#1B4965] dark:text-amber-300 mt-1">
                {explanation.due_date || "N/A"}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isHC ? "bg-slate-900 border-amber-400" : "bg-sky-50/70 border-sky-200"
              }`}
            >
              <div className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Organization / विभाग
              </div>
              <div className="text-lg font-bold text-[#1B4965] dark:text-amber-300 mt-1 truncate">
                {explanation.provider_or_sender || "N/A"}
              </div>
            </div>
          </div>

          {/* Important Details */}
          {explanation.important_details && explanation.important_details.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5">
                <span>🔍</span> Important Information:
              </h3>
              <ul className="space-y-1.5 pl-2">
                {explanation.important_details.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-base font-medium">
                    <span className="text-sky-600 dark:text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What you need to do */}
          {explanation.what_you_need_to_do && explanation.what_you_need_to_do.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" /> What You Need To Do:
              </h3>
              <div className="space-y-2">
                {explanation.what_you_need_to_do.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-base font-bold flex items-start gap-2"
                  >
                    <span>✅</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Warning */}
          {explanation.safety_warning && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500 text-sm font-bold flex items-start gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <span>Safety Note: {explanation.safety_warning}</span>
            </div>
          )}

          {/* Connected Workflows */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3">
            <button
              id="explain-set-reminder-btn"
              onClick={handleSetReminder}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm sm:text-base shadow-sm transition-all active:scale-95 ${
                isHC
                  ? "bg-amber-400 text-black border-2 border-black hover:bg-amber-300"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>{isHindi ? "🔔 इस देय तिथि का रिमाइंडर सेट करें" : "🔔 Set Reminder for Due Date"}</span>
            </button>

            <button
              id="explain-guide-pay-btn"
              onClick={() => onNavigate("guided", { taskName: "Pay an electricity bill" })}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base border shadow-sm transition-all active:scale-95 ${
                isHC
                  ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
                  : "bg-white border-[#1B4965] text-[#1B4965] hover:bg-sky-50"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>
                {isHindi ? "🧭 इसे भरने का तरीका कदम-दर-कदम सीखें" : "🧭 Guide Me Step-by-Step to Pay This"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
