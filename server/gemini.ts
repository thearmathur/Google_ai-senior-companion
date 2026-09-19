import { GoogleGenAI } from "@google/genai";
import {
  getSystemPrompt,
  getScamPrompt,
  getExplainPrompt,
  getGuidedTaskPrompt,
  getReminderExtractionPrompt,
  getProactiveBriefingPrompt
} from "./prompts.ts";
import { SafetyService, detectUserIntent } from "./safety.ts";
import {
  PREDEFINED_GUIDED_TASKS,
  SAMPLE_FALLBACK_BILLS,
  SAMPLE_SCAM_ANALYSES
} from "./predefined.ts";
import {
  ChatMessage,
  ScamAnalysis,
  DocumentExplanation,
  GuidedTask,
  Reminder
} from "../src/types.ts";

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim().length > 5 && !key.includes("MY_GEMINI_API_KEY")) {
      aiClient = new GoogleGenAI({ apiKey: key.trim() });
    }
  }
  return aiClient;
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 5 && !key.includes("MY_GEMINI_API_KEY"));
}

function cleanJsonString(text: string): string {
  let cleaned = text.trim();
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }
  return cleaned;
}

function safeParseJSON<T>(text: string, fallback: T): T {
  const cleaned = cleanJsonString(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        // fallback
      }
    }
    return fallback;
  }
}

export async function handleChatResponse(
  messages: { role: "user" | "assistant"; content: string }[],
  userName: string = "Mr. Sharma",
  language: string = "English"
): Promise<{
  text: string;
  intent: "scam" | "explain" | "guided_task" | "reminder" | "general";
  suggested_action: "scam_shield" | "explain" | "guided_help" | "reminders" | null;
  disclaimer?: string | null;
  is_sensitive_masked?: boolean;
}> {
  if (!messages || messages.length === 0) {
    return {
      text: language === "Hindi" ? "नमस्ते! मैं आपकी क्या सहायता कर सकता हूँ?" : "Hello! How can I help you today?",
      intent: "general",
      suggested_action: null
    };
  }

  const lastUserMsg = messages[messages.length - 1].content;
  const { sanitized, detected } = SafetyService.sanitizeUserInput(lastUserMsg);
  const disclaimer = SafetyService.getDomainDisclaimer(sanitized, language);
  const intent = detectUserIntent(sanitized);

  let suggested_action: "scam_shield" | "explain" | "guided_help" | "reminders" | null = null;
  if (intent === "scam") suggested_action = "scam_shield";
  else if (intent === "explain") suggested_action = "explain";
  else if (intent === "guided_task") suggested_action = "guided_help";
  else if (intent === "reminder") suggested_action = "reminders";

  const ai = getGenAI();
  if (ai) {
    try {
      const systemPrompt = getSystemPrompt(userName, language);
      const conversationHistory = messages
        .slice(-6)
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

      const prompt = `${systemPrompt}\n\nRecent Conversation:\n${conversationHistory}\n\nASSISTANT:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
      });

      const replyText = response.text?.trim() || "";
      if (replyText) {
        return {
          text: replyText,
          intent,
          suggested_action,
          disclaimer,
          is_sensitive_masked: detected
        };
      }
    } catch (err) {
      console.warn("Gemini generateContent error in chat:", err);
    }
  }

  // Empathetic offline fallbacks calibrated for senior questions
  let fallbackReply = "";
  if (intent === "scam") {
    fallbackReply =
      language === "Hindi"
        ? `यह संदेश संदिग्ध प्रतीत हो रहा है। कृपया किसी के साथ अपना गुप्त ओटीपी, पिन या पैसे साझा न करें। क्या आप चाहते हैं कि मैं इसे 'धोखा सुरक्षा' (Scam Shield) में पूरी तरह जाँचूँ?`
        : `This message seems suspicious. Please do not share any OTP, passwords, or send money. Would you like me to check the full details with Scam Shield?`;
  } else if (intent === "explain") {
    fallbackReply =
      language === "Hindi"
        ? `मैं आपका बिजली का बिल या सरकारी पत्र बहुत आसान शब्दों में समझा सकता हूँ। आप इसे 'कागज़ समझाइए' (Explain) टैब में पेस्ट कर सकते हैं।`
        : `I can simplify your electricity bill, doctor prescription, or official notice. You can paste or upload it in the 'Explain Something' tab and I will break it down clearly.`;
  } else if (intent === "guided_task") {
    fallbackReply =
      language === "Hindi"
        ? `मैं आपको यह काम चरण-दर-चरण आसानी से सिखाऊँगा। बिना किसी घबराहट के हम एक-एक कदम आगे बढ़ेंगे।`
        : `I will guide you through this step-by-step at a calm, relaxed pace so you never have to feel overwhelmed.`;
  } else if (intent === "reminder") {
    fallbackReply =
      language === "Hindi"
        ? `मैंने आपका रिमाइंडर नोट करने के लिए तैयार रखा है। आप 'रिमाइंडर' टैब में इसे देख सकते हैं।`
        : `I can note this reminder for you and notify you at the right time.`;
  } else {
    fallbackReply =
      language === "Hindi"
        ? `नमस्ते ${userName}! मैं आपका साथी हूँ। आप मुझसे किसी भी बिल, संदेश, या रोज़मर्रा के डिजिटल काम के बारे में बिना किसी संकोच के पूछ सकते हैं।`
        : `Hello ${userName}! I am here to help you navigate anything digital, explain confusing bills, check suspicious messages, and keep track of your daily routine.`;
  }

  return {
    text: fallbackReply,
    intent,
    suggested_action,
    disclaimer,
    is_sensitive_masked: detected
  };
}

export async function handleAnalyzeScam(
  text: string,
  language: string = "English"
): Promise<ScamAnalysis> {
  const { sanitized } = SafetyService.sanitizeUserInput(text);
  const low = sanitized.toLowerCase();

  // Pick suitable fallback default
  let fallback: ScamAnalysis = SAMPLE_SCAM_ANALYSES.utility;
  if (low.includes("lottery") || low.includes("won") || low.includes("25 lakh") || low.includes("लॉटरी")) {
    fallback = SAMPLE_SCAM_ANALYSES.lottery;
  } else if (low.includes("credited") || low.includes("salary") || low.includes("statement")) {
    fallback = SAMPLE_SCAM_ANALYSES.safe_bank;
  }

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `${getScamPrompt(language)}\n\nMessage to evaluate:\n"${sanitized}"`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        return safeParseJSON<ScamAnalysis>(response.text, fallback);
      }
    } catch (err) {
      console.warn("Gemini analyzeScam error:", err);
    }
  }

  return fallback;
}

export async function handleExplainDocument(
  textContent: string,
  imageBase64?: string,
  imageMimeType?: string,
  language: string = "English"
): Promise<DocumentExplanation> {
  const isHindi = language.toLowerCase() === "hindi";
  const fallback = textContent.toLowerCase().includes("medical") || textContent.toLowerCase().includes("sugar")
    ? SAMPLE_FALLBACK_BILLS.medical
    : SAMPLE_FALLBACK_BILLS.electricity;

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `${getExplainPrompt(language)}\n\nDocument Text Content:\n${textContent || "Attached document/image"}`;

      const contents: any[] = [];
      if (imageBase64 && imageMimeType) {
        contents.push({
          inlineData: {
            data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
            mimeType: imageMimeType
          }
        });
      }
      contents.push(prompt);

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        return safeParseJSON<DocumentExplanation>(response.text, fallback);
      }
    } catch (err) {
      console.warn("Gemini explainDocument error:", err);
    }
  }

  return fallback;
}

export async function handleGuidedTask(
  taskName: string,
  language: string = "English"
): Promise<GuidedTask> {
  if (PREDEFINED_GUIDED_TASKS[taskName]) {
    return PREDEFINED_GUIDED_TASKS[taskName];
  }

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = getGuidedTaskPrompt(taskName, language);
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        const parsed = safeParseJSON<GuidedTask>(response.text, PREDEFINED_GUIDED_TASKS["Pay an electricity bill"]);
        if (parsed && parsed.steps && parsed.steps.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini guidedTask error:", err);
    }
  }

  return PREDEFINED_GUIDED_TASKS["Pay an electricity bill"];
}

export async function handleExtractReminder(
  text: string,
  language: string = "English"
): Promise<{
  title: string;
  category: "Medicine" | "Bills" | "Appointments" | "Personal" | "Important";
  date: string;
  time: string;
  recurrence: "None" | "Daily" | "Weekly" | "Monthly";
  clarification_question: string | null;
}> {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tom = new Date(today);
  tom.setDate(tom.getDate() + 1);
  const tomStr = tom.toISOString().split("T")[0];
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

  const low = text.toLowerCase();
  const defaultFallback = {
    title: text.trim() || "Important Task",
    category: (low.includes("doctor") || low.includes("डॉक्टर")
      ? "Appointments"
      : low.includes("medicine") || low.includes("tablet") || low.includes("दवा") || low.includes("bp")
      ? "Medicine"
      : low.includes("bill") || low.includes("बिल")
      ? "Bills"
      : "Important") as any,
    date: low.includes("tomorrow") || low.includes("kal") || low.includes("कल") ? tomStr : todayStr,
    time: "09:00",
    recurrence: (low.includes("daily") || low.includes("every day") || low.includes("रोज") ? "Daily" : "None") as any,
    clarification_question: null
  };

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `${getReminderExtractionPrompt(todayStr, dayName, language)}\n\nUser Input: "${text}"`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        return safeParseJSON(response.text, defaultFallback);
      }
    } catch (err) {
      console.warn("Gemini extractReminder error:", err);
    }
  }

  return defaultFallback;
}

export async function handleProactiveBriefing(
  userName: string = "Mr. Sharma",
  reminders: Reminder[],
  language: string = "English"
): Promise<string> {
  const today = new Date();
  const dateStr = today.toLocaleDateString(language === "Hindi" ? "hi-IN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const summary = reminders
    .map((r) => `- ${r.due_time}: ${r.title} (${r.category}) [Status: ${r.status}]`)
    .join("\n");

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = getProactiveBriefingPrompt(userName, dateStr, summary || "None scheduled", language);
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
      });

      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn("Gemini briefing error:", err);
    }
  }

  const todayCount = reminders.filter((r) => r.status === "PENDING").length;
  if (language === "Hindi") {
    return `**सुप्रभात, ${userName}! 🙏**\n\nआज ${dateStr} है। आज आपके लिए **${todayCount}** जरूरी काम/दवाइयाँ निर्धारित हैं। अपने स्वास्थ्य का ध्यान रखें और दिन की शुरुआत एक गिलास गुनगुने पानी से करें। बिजली का बिल समय पर अवश्य जमा करें।`;
  }

  return `**Good Morning, ${userName}! ☀️**\n\nToday is ${dateStr}. You have **${todayCount}** priority task(s) on your schedule today. Remember to drink a glass of water and take your morning medicine on time. Your electricity bill is due soon if you wish to review it.`;
}
