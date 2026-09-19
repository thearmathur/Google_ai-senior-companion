import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertTriangle,
  Compass,
  FileText,
  ShieldAlert,
  Bell,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Page, UserProfile, UserPreferences, ChatMessage } from "../../types.ts";
import { t } from "../../utils/translations.ts";
import { SpeechHelper, createSpeechRecognizer } from "../../utils/speech.ts";

interface CompanionViewProps {
  user: UserProfile;
  preferences: UserPreferences;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onNavigate: (page: Page, params?: any) => void;
  isLoading: boolean;
}

export const CompanionView: React.FC<CompanionViewProps> = ({
  user,
  preferences,
  messages,
  onSendMessage,
  onNavigate,
  isLoading
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Speech Recognition hook
  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);

  useEffect(() => {
    recognizerRef.current = createSpeechRecognizer(
      (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      preferences.language
    );

    return () => {
      recognizerRef.current?.stop();
      SpeechHelper.stop();
    };
  }, [preferences.language]);

  const toggleListen = () => {
    if (!recognizerRef.current?.isAvailable) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      recognizerRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText("");
    await onSendMessage(textToSend);
  };

  const handleSampleClick = async (sample: string) => {
    if (isLoading) return;
    await onSendMessage(sample);
  };

  const handleSpeakMessage = (msgId: string, content: string) => {
    if (activeSpeechId === msgId && SpeechHelper.isSpeaking()) {
      SpeechHelper.stop();
      setActiveSpeechId(null);
    } else {
      SpeechHelper.speak(content, preferences.language, preferences.speech_rate);
      setActiveSpeechId(msgId);
    }
  };

  const sampleQuestions = isHindi
    ? [
        "बिजली का बिल भरने का सुरक्षित तरीका क्या है?",
        "मुझे बैंक से लॉटरी का संदेश आया है, क्या यह सच है?",
        "रोज सुबह 9 बजे बीपी की गोली लेने का अलार्म लगाओ।",
        "अपने पोते को व्हाट्सएप पर वीडियो कॉल कैसे करूँ?"
      ]
    : [
        "How do I check if my electricity bill is paid?",
        "I got an SMS saying my bank account is blocked, what do I do?",
        "Remind me to take my blood pressure medicine every morning at 9 AM.",
        "How do I make a WhatsApp video call to my grandson?"
      ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      {/* Title & Header */}
      <div className="mb-3 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>🤖</span> {t("nav_companion", preferences.language)}
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">
            {t("voice_fallback", preferences.language)}
          </p>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="mb-3 shrink-0 overflow-x-auto pb-1">
        <div className="flex gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSampleClick(q)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all active:scale-95 border ${
                isHC
                  ? "bg-slate-900 border-amber-400 text-amber-300 hover:bg-slate-800"
                  : "bg-white hover:bg-sky-50 border-sky-200 text-sky-900 shadow-sm"
              }`}
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div
        id="companion-chat-box"
        className={`flex-1 overflow-y-auto p-4 rounded-2xl border-2 space-y-4 shadow-inner ${
          isHC
            ? "bg-[#0B0F19] border-amber-400 text-white"
            : "bg-[#F8FAFC] border-slate-200 text-slate-900"
        }`}
      >
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          const speakingThis = activeSpeechId === msg.id && SpeechHelper.isSpeaking();

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] p-4 rounded-2xl shadow-sm border transition-all ${
                  isAssistant
                    ? isHC
                      ? "bg-[#151C2C] border-amber-400 text-white rounded-tl-none"
                      : "bg-white border-slate-200 text-slate-900 rounded-tl-none"
                    : isHC
                    ? "bg-amber-400 text-black border-2 border-white rounded-tr-none font-bold"
                    : "bg-[#1B4965] text-white border-[#1B4965] rounded-tr-none"
                }`}
              >
                {/* Sensitive Mask Notification */}
                {msg.is_sensitive_masked && (
                  <div className="mb-2 p-2 rounded-lg bg-amber-500/20 border border-amber-500 text-xs font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      {isHindi
                        ? "सुरक्षा सूचना: आपकी सुरक्षा के लिए गुप्त पिन/ओटीपी छिपा दिया गया है।"
                        : "Security Shield: Secret OTPs or bank numbers were masked for your safety."}
                    </span>
                  </div>
                )}

                {/* Domain Disclaimer (Medical or Financial notice) */}
                {msg.disclaimer && (
                  <div className="mb-3 p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-xs font-bold leading-relaxed text-sky-800 dark:text-sky-200">
                    {msg.disclaimer}
                  </div>
                )}

                {/* Message Body */}
                <div className="text-base sm:text-lg whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Footer Controls & Suggested Action Buttons */}
                <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs opacity-75 font-semibold">{msg.timestamp}</span>

                  {isAssistant && (
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      aria-label="Read message aloud"
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${
                        speakingThis
                          ? "bg-rose-600 text-white animate-pulse"
                          : isHC
                          ? "bg-amber-400 text-black"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {speakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{speakingThis ? "Stop" : t("listen_aloud", preferences.language)}</span>
                    </button>
                  )}
                </div>

                {/* Connected Workflow Triggers */}
                {isAssistant && msg.suggested_action && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                    {msg.suggested_action === "scam_shield" && (
                      <button
                        onClick={() => onNavigate("scam", { prefill: msg.original_text })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm ${
                          isHC
                            ? "bg-rose-500 text-white"
                            : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>
                          {isHindi ? "🛡️ धोखा सुरक्षा में जाँचें" : "🛡️ Check with Scam Shield"}
                        </span>
                      </button>
                    )}

                    {msg.suggested_action === "explain" && (
                      <button
                        onClick={() => onNavigate("explain", { prefill: msg.original_text })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm ${
                          isHC
                            ? "bg-amber-400 text-black"
                            : "bg-[#1B4965] text-white hover:bg-[#14374d] shadow-sm"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>
                          {isHindi ? "📄 कागज़ समझाइए में खोलें" : "📄 Open Document Explainer"}
                        </span>
                      </button>
                    )}

                    {msg.suggested_action === "guided_help" && (
                      <button
                        onClick={() => onNavigate("guided")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm ${
                          isHC
                            ? "bg-emerald-400 text-black"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                        }`}
                      >
                        <Compass className="w-4 h-4" />
                        <span>
                          {isHindi ? "🧭 कदम-दर-कदम मदद खोलें" : "🧭 Open Step-by-Step Guide"}
                        </span>
                      </button>
                    )}

                    {msg.suggested_action === "reminders" && (
                      <button
                        onClick={() => onNavigate("reminders", { prefill: msg.original_text })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm ${
                          isHC
                            ? "bg-amber-400 text-black"
                            : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        <span>{isHindi ? "🔔 रिमाइंडर में देखें" : "🔔 Open Reminders"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit">
            <RefreshCw className="w-5 h-5 text-sky-700 dark:text-amber-300 animate-spin" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isHindi
                ? "आपका साथी सोच रहा है और सरल उत्तर तैयार कर रहा है..."
                : "Your companion is thinking and preparing a simple response..."}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Speech Button */}
      <form onSubmit={handleSubmit} className="mt-3 shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleListen}
          title={isListening ? "Stop listening" : "Speak your message"}
          className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center font-bold transition-all active:scale-95 shadow-md ${
            isListening
              ? "bg-rose-600 text-white animate-pulse"
              : isHC
              ? "bg-slate-900 border-2 border-amber-400 text-amber-300 hover:bg-slate-800"
              : "bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800"
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-sky-700" />}
        </button>

        <input
          id="companion-input-field"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? t("listening", preferences.language)
              : isHindi
              ? "अपना सवाल यहाँ लिखें या माइक दबाकर बोलें..."
              : "Type your question in simple words or tap the mic to speak..."
          }
          disabled={isLoading}
          className={`flex-1 h-14 px-4 sm:px-5 rounded-2xl border-2 text-base sm:text-lg font-medium shadow-sm transition-all focus:outline-none ${
            isHC
              ? "bg-slate-900 border-amber-400 text-white focus:border-white"
              : "bg-white border-slate-300 focus:border-[#1B4965] text-slate-900"
          }`}
        />

        <button
          id="companion-send-button"
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`h-14 px-6 shrink-0 rounded-2xl font-black text-base flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isHC
              ? "bg-amber-400 text-black border-2 border-white hover:bg-amber-300"
              : "bg-[#1B4965] text-white hover:bg-[#14374d]"
          }`}
        >
          <span>{isHindi ? "पूछें" : "Send"}</span>
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
