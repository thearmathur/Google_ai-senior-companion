import { Language } from "../types.ts";

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  English: {
    app_title: "AI Senior Companion",
    tagline: "Your simple, safe and trusted digital companion.",
    nav_home: "🏠 Home",
    nav_companion: "🤖 Ask Companion",
    nav_explain: "📄 Explain Something",
    nav_scam: "🛡️ Scam Shield",
    nav_guided: "🧭 Guided Help",
    nav_reminders: "🔔 Reminders",
    nav_my_day: "📅 My Day",
    nav_trusted: "👥 Trusted Family",
    nav_settings: "⚙️ Settings",
    how_can_i_help: "How can I help you today?",
    voice_fallback: "You can type or speak in simple everyday words.",
    today_heading: "Today's Schedule & Medicines",
    quick_help: "Quick Help & Services",
    proactive_banner: "Important Reminder & Gentle Offer",
    btn_explain: "📄 Explain a Bill or Document",
    btn_scam: "🛡️ Check a Suspicious Message",
    btn_guided: "🧭 Step-by-Step Task Guide",
    btn_reminder: "🔔 Add a New Reminder",
    finish_button: "Finish Task",
    trusted_contact_alert: "This situation may need help from someone you trust.",
    reset_demo: "Reset Demo Data",
    listen_aloud: "Read Aloud",
    stop_audio: "Stop Reading",
    speak_input: "Speak",
    listening: "Listening...",
    connected_ai: "AI Connected (Gemini 3.8 Flash)",
    demo_mode: "Demo Mode (Safe Reassuring Fallback)",
    text_size_label: "Text Size",
    contrast_label: "Contrast Mode",
    language_label: "Language"
  },
  Hindi: {
    app_title: "एआई सीनियर साथी",
    tagline: "आपका सरल, सुरक्षित और भरोसेमंद डिजिटल साथी।",
    nav_home: "🏠 मुख्य पृष्ठ (Home)",
    nav_companion: "🤖 साथी से पूछें",
    nav_explain: "📄 समझाइए (Explain)",
    nav_scam: "🛡️ धोखा सुरक्षा (Scam)",
    nav_guided: "🧭 कदम-दर-कदम मदद",
    nav_reminders: "🔔 मेरे रिमाइंडर",
    nav_my_day: "📅 मेरा दिन (My Day)",
    nav_trusted: "👥 भरोसेमंद संपर्क",
    nav_settings: "⚙️ सेटिंग्स",
    how_can_i_help: "आज मैं आपकी क्या सहायता कर सकता हूँ?",
    voice_fallback: "आप नीचे लिखकर या बोलकर बिना किसी झिझक के पूछ सकते हैं।",
    today_heading: "आज के ज़रूरी काम और दवाइयाँ",
    quick_help: "त्वरित सहायता",
    proactive_banner: "सुरक्षा और सहायता सुझाव",
    btn_explain: "📄 कोई बिल या कागज़ समझें",
    btn_scam: "🛡️ संदिग्ध संदेश की जाँच करें",
    btn_guided: "🧭 काम करने का सरल तरीका सीखें",
    btn_reminder: "🔔 नया रिमाइंडर जोड़ें",
    finish_button: "काम पूरा हुआ 🎉",
    trusted_contact_alert: "इस मामले में किसी परिजन की मदद लेना बेहतर रहेगा।",
    reset_demo: "डेमो डेटा रीसेट करें",
    listen_aloud: "बोलकर सुनाएं",
    stop_audio: "आवाज़ रोकें",
    speak_input: "बोलें",
    listening: "सुन रहे हैं...",
    connected_ai: "एआई कनेक्टेड (Gemini 3.8 Flash)",
    demo_mode: "डेमो मोड (सुरक्षित बैकअप)",
    text_size_label: "अक्षरों का आकार",
    contrast_label: "कंट्रास्ट मोड",
    language_label: "भाषा"
  }
};

export function t(key: string, lang: Language = "English"): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.English;
  return dict[key] || TRANSLATIONS.English[key] || key;
}

export function getGreeting(name: string, lang: Language = "English"): string {
  const hour = new Date().getHours();
  if (lang === "Hindi") {
    const greeting = hour < 12 ? "सुप्रभात" : hour < 17 ? "नमस्ते" : "शुभ संध्या";
    return `${greeting}, ${name} जी 👋`;
  }
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return `${greeting}, ${name} 👋`;
}

export function formatFriendlyDate(dateStr: string, lang: Language = "English"): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString(lang === "Hindi" ? "hi-IN" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return dateStr;
  }
}

export function generateTrustedContactUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
