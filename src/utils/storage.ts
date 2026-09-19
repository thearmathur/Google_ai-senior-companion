import {
  UserProfile,
  UserPreferences,
  Reminder,
  TrustedContact,
  ChatMessage
} from "../types.ts";

const STORAGE_KEYS = {
  USER: "senior_companion_user",
  PREFERENCES: "senior_companion_preferences",
  REMINDERS: "senior_companion_reminders",
  CONTACTS: "senior_companion_contacts",
  CHAT: "senior_companion_chat"
};

export function getDefaultUser(): UserProfile {
  return {
    id: 1,
    name: "Mr. Sharma",
    email: "sharma.senior@example.com",
    phone: "+91 98111 22334"
  };
}

export function getDefaultPreferences(): UserPreferences {
  return {
    text_size: "Large",
    contrast_mode: "Standard",
    language: "English",
    voice_enabled: true,
    speech_rate: 0.9
  };
}

export function getDefaultReminders(): Reminder[] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const inTwoDays = new Date(today);
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  const inTwoDaysStr = inTwoDays.toISOString().split("T")[0];

  return [
    {
      id: "rem-1",
      title: "Take Morning Blood Pressure Medicine (Amlodipine 5mg)",
      category: "Medicine",
      due_date: todayStr,
      due_time: "09:00",
      recurrence: "Daily",
      status: "PENDING",
      notes: "Take after a light breakfast with a glass of water."
    },
    {
      id: "rem-2",
      title: "Electricity Bill Due (BSES Rajdhani - ₹2,450)",
      category: "Bills",
      due_date: inTwoDaysStr,
      due_time: "18:00",
      recurrence: "None",
      status: "PENDING",
      notes: "Consumer No: 100458921. Verified via Explain Bill."
    },
    {
      id: "rem-3",
      title: "Routine Health Check-up with Dr. Verma",
      category: "Appointments",
      due_date: tomorrowStr,
      due_time: "11:00",
      recurrence: "None",
      status: "PENDING",
      notes: "City Hospital Clinic Room 204. Carry previous sugar reports."
    }
  ];
}

export function getDefaultContacts(): TrustedContact[] {
  return [
    {
      id: "contact-1",
      name: "Aarav Sharma",
      relationship: "Son",
      phone: "+91 98765 43210",
      email: "aarav.sharma@example.com",
      notes: "Call anytime. Usually available after 6 PM."
    },
    {
      id: "contact-2",
      name: "Dr. Alok Verma",
      relationship: "Family Doctor",
      phone: "+91 98123 45678",
      email: "clinic.verma@cityhospital.com",
      notes: "Clinic hours: 10 AM - 1 PM"
    }
  ];
}

export function getDefaultChatMessages(userName: string = "Mr. Sharma"): ChatMessage[] {
  return [
    {
      id: "msg-1",
      role: "assistant",
      content: `Hello ${userName}! I am your personal digital companion. How can I help you today? You can ask me about bills, suspicious messages, or everyday phone tasks in simple words.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ];
}

// LocalStorage helpers
export const storage = {
  getUser: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : getDefaultUser();
    } catch {
      return getDefaultUser();
    }
  },
  setUser: (user: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
  },
  getPreferences: (): UserPreferences => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : getDefaultPreferences();
    } catch {
      return getDefaultPreferences();
    }
  },
  setPreferences: (pref: UserPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(pref));
    } catch {}
  },
  getReminders: (): Reminder[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : getDefaultReminders();
    } catch {
      return getDefaultReminders();
    }
  },
  setReminders: (rems: Reminder[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(rems));
    } catch {}
  },
  getContacts: (): TrustedContact[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : getDefaultContacts();
    } catch {
      return getDefaultContacts();
    }
  },
  setContacts: (contacts: TrustedContact[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch {}
  },
  getChat: (userName?: string): ChatMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      return data ? JSON.parse(data) : getDefaultChatMessages(userName);
    } catch {
      return getDefaultChatMessages(userName);
    }
  },
  setChat: (msgs: ChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(msgs));
    } catch {}
  },
  resetDemoData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.REMINDERS);
      localStorage.removeItem(STORAGE_KEYS.CONTACTS);
      localStorage.removeItem(STORAGE_KEYS.CHAT);
    } catch {}
  }
};
