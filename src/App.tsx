import React, { useState, useEffect } from "react";
import {
  Page,
  UserProfile,
  UserPreferences,
  Reminder,
  TrustedContact,
  ChatMessage,
  ServerStatus
} from "./types.ts";
import { storage } from "./utils/storage.ts";
import { SpeechHelper } from "./utils/speech.ts";
import { Navigation } from "./components/Navigation.tsx";
import { Header } from "./components/Header.tsx";
import { HomeView } from "./components/views/HomeView.tsx";
import { CompanionView } from "./components/views/CompanionView.tsx";
import { ExplainView } from "./components/views/ExplainView.tsx";
import { ScamShieldView } from "./components/views/ScamShieldView.tsx";
import { GuidedHelpView } from "./components/views/GuidedHelpView.tsx";
import { RemindersView } from "./components/views/RemindersView.tsx";
import { MyDayView } from "./components/views/MyDayView.tsx";
import { TrustedContactsView } from "./components/views/TrustedContactsView.tsx";
import { SettingsView } from "./components/views/SettingsView.tsx";

export function App() {
  const [user, setUser] = useState<UserProfile>(() => storage.getUser());
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    storage.getPreferences()
  );
  const [reminders, setReminders] = useState<Reminder[]>(() =>
    storage.getReminders()
  );
  const [contacts, setContacts] = useState<TrustedContact[]>(() =>
    storage.getContacts()
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    storage.getChat(user.name)
  );

  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [pageParams, setPageParams] = useState<any>({});
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    connected: false,
    model: "gemini-3.8-flash",
    hasKey: false
  });

  // Check server status on mount
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          connected: Boolean(data.connected),
          model: data.model || "gemini-3.8-flash",
          hasKey: Boolean(data.hasKey)
        });
      })
      .catch((err) => {
        console.warn("Could not reach /api/status:", err);
      });
  }, []);

  // Monitor speech synthesis speaking state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(SpeechHelper.isSpeaking());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Persist state changes
  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated };
      storage.setPreferences(next);
      return next;
    });
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  const handleAddReminder = (newRem: Omit<Reminder, "id">) => {
    const created: Reminder = {
      ...newRem,
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setReminders((prev) => {
      const next = [created, ...prev];
      storage.setReminders(next);
      return next;
    });
  };

  const handleUpdateReminderStatus = (id: string, status: "PENDING" | "COMPLETED") => {
    setReminders((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      storage.setReminders(next);
      return next;
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => {
      const next = prev.filter((r) => r.id !== id);
      storage.setReminders(next);
      return next;
    });
  };

  const handleAddContact = (newContact: Omit<TrustedContact, "id">) => {
    const created: TrustedContact = {
      ...newContact,
      id: `contact-${Date.now()}`
    };
    setContacts((prev) => {
      const next = [...prev, created];
      storage.setContacts(next);
      return next;
    });
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => {
      const next = prev.filter((c) => c.id !== id);
      storage.setContacts(next);
      return next;
    });
  };

  const handleResetDemoData = () => {
    storage.resetDemoData();
    window.location.reload();
  };

  const handleNavigate = (page: Page, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleSpeech = () => {
    if (SpeechHelper.isSpeaking()) {
      SpeechHelper.stop();
      setIsSpeaking(false);
    } else {
      const promptText =
        preferences.language === "Hindi"
          ? `नमस्ते ${user.name}! मैं आपका एआई सीनियर साथी हूँ। मैं आपकी सहायता के लिए तैयार हूँ।`
          : `Hello ${user.name}! I am your AI Senior Companion. I am here to help you anytime.`;
      SpeechHelper.speak(promptText, preferences.language, preferences.speech_rate);
    }
  };

  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    storage.setChat(newHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userName: user.name,
          language: preferences.language
        })
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intent: data.intent,
        suggested_action: data.suggested_action,
        disclaimer: data.disclaimer,
        is_sensitive_masked: data.is_sensitive_masked,
        original_text: text
      };

      const updatedHistory = [...newHistory, assistantMsg];
      setChatMessages(updatedHistory);
      storage.setChat(updatedHistory);

      // Auto-read response if speech is enabled
      if (preferences.voice_enabled) {
        SpeechHelper.speak(data.text, preferences.language, preferences.speech_rate);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content:
          preferences.language === "Hindi"
            ? "माफ़ कीजिए, मुझे उत्तर प्राप्त करने में समस्या हुई। कृपया दोबारा पूछें।"
            : "I am sorry, I had trouble answering that. Please feel free to ask again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      const updatedHistory = [...newHistory, errorMsg];
      setChatMessages(updatedHistory);
      storage.setChat(updatedHistory);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Senior Accessibility Classes
  const textSizeClass =
    preferences.text_size === "Extra Large"
      ? "text-xl font-medium"
      : preferences.text_size === "Large"
      ? "text-lg font-medium"
      : "text-base";

  const isHC = preferences.contrast_mode === "High Contrast";

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors ${
        isHC ? "bg-[#0B0F19] text-white" : "bg-[#F8FAFC] text-slate-900"
      } ${textSizeClass}`}
    >
      {/* Permanent Navigation */}
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        contacts={contacts}
        serverStatus={serverStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          user={user}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          isSpeaking={isSpeaking}
          onToggleSpeech={handleToggleSpeech}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {currentPage === "home" && (
            <HomeView
              user={user}
              preferences={preferences}
              reminders={reminders}
              onUpdateReminderStatus={handleUpdateReminderStatus}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "companion" && (
            <CompanionView
              user={user}
              preferences={preferences}
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              onNavigate={handleNavigate}
              isLoading={isChatLoading}
            />
          )}

          {currentPage === "explain" && (
            <ExplainView
              preferences={preferences}
              onNavigate={handleNavigate}
              onAddReminder={handleAddReminder}
              prefill={pageParams.prefill}
              sampleType={pageParams.sample}
            />
          )}

          {currentPage === "scam" && (
            <ScamShieldView
              preferences={preferences}
              contacts={contacts}
              prefill={pageParams.prefill}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "guided" && (
            <GuidedHelpView
              preferences={preferences}
              taskName={pageParams.taskName}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "reminders" && (
            <RemindersView
              preferences={preferences}
              reminders={reminders}
              onAddReminder={handleAddReminder}
              onUpdateStatus={handleUpdateReminderStatus}
              onDeleteReminder={handleDeleteReminder}
              prefill={pageParams.prefill}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "my_day" && (
            <MyDayView
              user={user}
              preferences={preferences}
              reminders={reminders}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "trusted" && (
            <TrustedContactsView
              preferences={preferences}
              contacts={contacts}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "settings" && (
            <SettingsView
              user={user}
              preferences={preferences}
              onUpdateUser={handleUpdateUser}
              onUpdatePreferences={handleUpdatePreferences}
              onResetDemoData={handleResetDemoData}
              serverStatus={serverStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
