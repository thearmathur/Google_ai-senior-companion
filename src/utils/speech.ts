export class SpeechHelper {
  private static synth: SpeechSynthesis | null =
    typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

  public static isSupported(): boolean {
    return Boolean(this.synth);
  }

  public static speak(text: string, language: string = "English", rate: number = 0.9): void {
    if (!this.synth) return;

    this.stop();

    // Clean markdown symbols from text before speaking
    const cleanText = text
      .replace(/[*_#`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate; // slightly slower for senior comprehension
    utterance.pitch = 1.0;

    if (language === "Hindi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-US";
    }

    // Try finding an appropriate voice
    const voices = this.synth.getVoices();
    const voice = voices.find((v) =>
      language === "Hindi" ? v.lang.startsWith("hi") : v.lang.startsWith("en")
    );
    if (voice) {
      utterance.voice = voice;
    }

    this.synth.speak(utterance);
  }

  public static stop(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  public static isSpeaking(): boolean {
    return Boolean(this.synth && this.synth.speaking);
  }
}

// Voice Recognition (Speech-to-Text)
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onEnd: () => void,
  language: string = "English"
): { start: () => void; stop: () => void; isAvailable: boolean } {
  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  if (!SpeechRecognition) {
    return {
      start: () => {},
      stop: () => {},
      isAvailable: false
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = language === "Hindi" ? "hi-IN" : "en-US";

  recognition.onresult = (event: any) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    }
  };

  recognition.onerror = () => {
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch {
        // already started or not allowed
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
    isAvailable: true
  };
}
