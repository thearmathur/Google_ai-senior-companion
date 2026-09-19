import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Volume2,
  Sparkles,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Phone,
  HelpCircle
} from "lucide-react";
import { Page, UserPreferences, ScamAnalysis, TrustedContact } from "../../types.ts";
import { t, generateTrustedContactUrl } from "../../utils/translations.ts";
import { SpeechHelper } from "../../utils/speech.ts";

interface ScamShieldViewProps {
  preferences: UserPreferences;
  contacts: TrustedContact[];
  prefill?: string;
  onNavigate: (page: Page, params?: any) => void;
}

export const ScamShieldView: React.FC<ScamShieldViewProps> = ({
  preferences,
  contacts,
  prefill = "",
  onNavigate
}) => {
  const [inputText, setInputText] = useState(prefill);
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";
  const primaryContact = contacts[0];

  const handleLoadLotterySample = () => {
    setInputText(
      `CONGRATULATIONS! Your mobile number has won Rs 25,00,000 in KBC All India Lucky Draw! To claim prize money immediately, pay clearance tax fee of Rs 5,000 to UPI ID: rajesh.kbc@upi. Send your Aadhaar card photo and OTP to 9876543210.`
    );
  };

  const handleLoadElectricityThreatSample = () => {
    setInputText(
      `Dear Consumer, Your electricity power supply will be disconnected TONIGHT at 9:30 PM because your previous month bill was not updated. Immediately call our power officer on 9812345678 or install QuickSupport app to avoid black out.`
    );
  };

  const handleLoadBankLegitSample = () => {
    setInputText(
      `Dear SBI Customer, your Account ending with 4821 has been credited by Rs 42,500 on 10-Sep-2026 by NEFT transfer. Available balance: Rs 1,48,250. - State Bank of India`
    );
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          language: preferences.language
        })
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!analysis) return;
    const content = `Scam Shield Assessment: Risk Level is ${analysis.risk_level}. ${
      analysis.summary
    }. Things not to do: ${analysis.do_not_do.join(", ")}. Safe steps: ${analysis.safe_next_steps.join(
      ", "
    )}.`;
    SpeechHelper.speak(content, preferences.language, preferences.speech_rate);
  };

  const alertFamilyMessage = analysis
    ? `Hi ${primaryContact?.name || "Family"}, I received this suspicious message: "${inputText.slice(
        0,
        140
      )}...". AI Senior Companion flagged it as ${analysis.risk_level} risk. Could you please take a look with me?`
    : "";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>🛡️</span> {t("nav_scam", preferences.language)}
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
            {isHindi
              ? "संदिग्ध लॉटरी, बिजली कटने की धमकी, या अनजान फोन कॉल का विवरण यहाँ जाँचें। हम आपको सुरक्षित रखेंगे।"
              : "Check any suspicious text message, WhatsApp forward, lottery claim, or threatening phone call safely."}
          </p>
        </div>
      </div>

      {/* Realistic Samples */}
      <div className="p-4 rounded-2xl border bg-white/70 dark:bg-slate-900/60 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
          {isHindi ? "संदिग्ध नमूने आज़माएं:" : "Test Real Scam Samples:"}
        </span>
        <button
          id="btn-sample-lottery"
          onClick={handleLoadLotterySample}
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900 transition-colors"
        >
          🚨 Lottery Win Scam (₹25 Lakh)
        </button>
        <button
          id="btn-sample-threat"
          onClick={handleLoadElectricityThreatSample}
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 transition-colors"
        >
          ⚡ Power Disconnection Threat
        </button>
        <button
          id="btn-sample-legit-bank"
          onClick={handleLoadBankLegitSample}
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900 transition-colors"
        >
          ✅ Legitimate Bank SMS
        </button>
        <button
          onClick={() => {
            setInputText("");
            setAnalysis(null);
          }}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Input Area */}
      <div
        className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm ${
          isHC
            ? "bg-[#0B0F19] border-amber-400 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <label className="block text-base font-extrabold text-slate-800 dark:text-slate-100">
          {isHindi
            ? "संदेश यहाँ पेस्ट करें या बताएं कि क्या हुआ:"
            : "Paste the message or describe what the caller said:"}
        </label>
        <textarea
          id="scam-input-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          placeholder={
            isHindi
              ? "जैसे: आपका बिजली बिल नहीं भरा, आज रात कनेक्शन कटेगा... या आपने 25 लाख जीते हैं..."
              : "e.g. Urgent! Electricity disconnected tonight or you won a prize..."
          }
          className={`w-full p-4 rounded-xl border-2 text-base font-medium transition-all focus:outline-none ${
            isHC
              ? "bg-slate-900 border-amber-400 text-white focus:border-white"
              : "bg-slate-50 border-slate-300 focus:border-rose-500 text-slate-900"
          }`}
        />

        <div className="flex justify-end pt-1">
          <button
            id="btn-run-scam-shield"
            onClick={handleAnalyze}
            disabled={!inputText.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-black text-base flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isHC
                ? "bg-rose-500 text-white border-2 border-white hover:bg-rose-600"
                : "bg-rose-600 text-white hover:bg-rose-700"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isHindi ? "सुरक्षा जाँच जारी है..." : "Checking Safety..."}</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                <span>{isHindi ? "🛡️ सुरक्षा की जाँच करें" : "🛡️ Check Message Safety"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div
          id="scam-result-card"
          className={`p-6 rounded-2xl border-2 space-y-5 shadow-lg ${
            isHC
              ? "bg-[#151C2C] border-amber-400 text-white"
              : analysis.risk_level === "HIGH"
              ? "bg-rose-50/40 border-rose-400 text-slate-900"
              : analysis.risk_level === "MEDIUM"
              ? "bg-amber-50/40 border-amber-400 text-slate-900"
              : "bg-emerald-50/40 border-emerald-400 text-slate-900"
          }`}
        >
          {/* Header & Risk Level Badge */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-1.5 rounded-full font-black text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                    analysis.risk_level === "HIGH"
                      ? "bg-rose-600 text-white"
                      : analysis.risk_level === "MEDIUM"
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {analysis.risk_level === "HIGH" ? (
                    <AlertOctagon className="w-4 h-4" />
                  ) : analysis.risk_level === "MEDIUM" ? (
                    <HelpCircle className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>RISK LEVEL: {analysis.risk_level}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-3 leading-snug">
                {analysis.summary}
              </h2>
            </div>

            <button
              onClick={handleReadAloud}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 text-xs sm:text-sm shrink-0 shadow-sm ${
                isHC
                  ? "bg-amber-400 text-black"
                  : "bg-white border border-slate-300 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{t("listen_aloud", preferences.language)}</span>
            </button>
          </div>

          {/* Warning Signs Detected */}
          {analysis.warning_signs && analysis.warning_signs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <span>⚠️</span> Warning Signs Detected:
              </h3>
              <ul className="space-y-1.5 pl-2">
                {analysis.warning_signs.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-base font-semibold">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DO NOT DO Section */}
          {analysis.do_not_do && analysis.do_not_do.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <XCircle className="w-5 h-5" /> What You Must NOT Do:
              </h3>
              <div className="space-y-2">
                {analysis.do_not_do.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-base font-extrabold text-rose-900 dark:text-rose-200 flex items-start gap-2"
                  >
                    <span>🛑</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAFE NEXT STEPS Section */}
          {analysis.safe_next_steps && analysis.safe_next_steps.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" /> Safe Steps to Take:
              </h3>
              <div className="space-y-2">
                {analysis.safe_next_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-base font-bold flex items-start gap-2 text-emerald-900 dark:text-emerald-200"
                  >
                    <span>🛡️</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trusted Family Alert Button */}
          {primaryContact && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {t("trusted_contact_alert", preferences.language)}
              </span>

              <a
                id="btn-alert-family"
                href={generateTrustedContactUrl(primaryContact.phone, alertFamilyMessage)}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm sm:text-base shadow-md transition-all active:scale-95 ${
                  isHC
                    ? "bg-amber-400 text-black border-2 border-white"
                    : "bg-[#0284C7] text-white hover:bg-[#0369A1]"
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>
                  {isHindi
                    ? `${primaryContact.name} को संदेश भेजें`
                    : `Alert ${primaryContact.name} on WhatsApp`}
                </span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
