export class SafetyService {
  private static OTP_PATTERN = /\b(?:otp|code|pin)\s*[:=is\s]*(\d{4,8})\b/gi;
  private static CARD_PATTERN = /\b(?:\d[ -]*?){13,16}\b/g;

  public static sanitizeUserInput(text: string): { sanitized: string; detected: boolean } {
    let detected = false;
    let sanitized = text;

    if (this.OTP_PATTERN.test(sanitized)) {
      sanitized = sanitized.replace(this.OTP_PATTERN, "[SENSITIVE OTP/PIN HIDDEN FOR YOUR SAFETY]");
      detected = true;
    }

    if (this.CARD_PATTERN.test(sanitized)) {
      sanitized = sanitized.replace(this.CARD_PATTERN, "[CARD NUMBER HIDDEN FOR YOUR SAFETY]");
      detected = true;
    }

    return { sanitized, detected };
  }

  public static getDomainDisclaimer(text: string, language: string = "English"): string | null {
    const low = text.toLowerCase();
    const isHindi = language.toLowerCase() === "hindi";

    if (
      ["diagnosis", "doctor", "tablet", "pain", "hospital", "prescription", "medicine", "bp", "sugar", "दवा", "डॉक्टर", "अस्पताल"].some(
        (w) => low.includes(w)
      )
    ) {
      if (isHindi) {
        return "🩺 स्वास्थ्य सूचना: मैं जानकारी सरल शब्दों में समझा सकता हूँ, लेकिन चिकित्सीय निदान या इलाज नहीं बता सकता। कृपया डॉक्टर से सलाह लें।";
      }
      return "🩺 Medical Notice: I can help explain the information, but I cannot diagnose a medical condition or prescribe treatment. Please consult your doctor.";
    }

    if (
      ["transfer money", "investment", "bank account", "debit card", "upi", "pin", "पैसे", "खाता"].some((w) =>
        low.includes(w)
      )
    ) {
      if (isHindi) {
        return "💰 वित्तीय सुरक्षा: मैं केवल मार्गदर्शन देता हूँ। मैं कभी भी आपका गुप्त पिन या ओटीपी नहीं मांगूँगा और न ही सीधे पैसे ट्रांसफर करूँगा।";
      }
      return "💰 Financial Safety: I provide guidance only. I will never ask for your PIN/OTP or make transfers.";
    }

    return null;
  }
}

export function detectUserIntent(
  msg: string
): "scam" | "explain" | "guided_task" | "reminder" | "general" {
  const t = msg.toLowerCase();
  if (
    ["scam", "fraud", "suspicious", "won ₹", "won 25 lakh", "lottery", "disconnected tonight", "धोखा", "लॉटरी", "बिजली कटेगी"].some(
      (w) => t.includes(w)
    )
  ) {
    return "scam";
  }
  if (
    ["bill", "electricity", "receipt", "document", "what does this mean", "explain", "बिजली", "रसीद", "कागज़"].some(
      (w) => t.includes(w)
    )
  ) {
    return "explain";
  }
  if (
    ["how to", "guide me", "steps", "book appointment", "change password", "video call", "कैसे", "तरीका", "सिखाएं"].some(
      (w) => t.includes(w)
    )
  ) {
    return "guided_task";
  }
  if (
    ["remind", "reminder", "medicine time", "yaad", "याद", "अलार्म"].some(
      (w) => t.includes(w)
    )
  ) {
    return "reminder";
  }
  return "general";
}
