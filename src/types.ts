export type Page =
  | "home"
  | "companion"
  | "explain"
  | "scam"
  | "guided"
  | "reminders"
  | "my_day"
  | "trusted"
  | "settings";

export type TextSize = "Standard" | "Large" | "Extra Large";
export type ContrastMode = "Standard" | "High Contrast";
export type Language = "English" | "Hindi";

export interface UserPreferences {
  text_size: TextSize;
  contrast_mode: ContrastMode;
  language: Language;
  voice_enabled: boolean;
  speech_rate: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export type ReminderCategory =
  | "Medicine"
  | "Bills"
  | "Appointments"
  | "Personal"
  | "Important";

export interface Reminder {
  id: string;
  user_id?: number;
  title: string;
  category: ReminderCategory;
  due_date: string; // YYYY-MM-DD
  due_time: string; // HH:MM
  recurrence: "None" | "Daily" | "Weekly" | "Monthly";
  status: "PENDING" | "COMPLETED";
  notes?: string;
  created_at?: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: "scam" | "explain" | "guided_task" | "reminder" | "general";
  suggested_action?: "scam_shield" | "explain" | "guided_help" | "reminders" | null;
  disclaimer?: string;
  is_sensitive_masked?: boolean;
  timestamp: string;
  original_text?: string;
}

export interface DocumentExplanation {
  document_type: string;
  simple_summary: string;
  amount_to_pay?: string | null;
  due_date?: string | null;
  provider_or_sender?: string | null;
  important_details: string[];
  what_you_need_to_do: string[];
  safety_warning?: string | null;
  suggested_action?: string | null;
}

export interface ScamAnalysis {
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  summary: string;
  warning_signs: string[];
  do_not_do: string[];
  safe_next_steps: string[];
  confidence: "high" | "medium" | "low";
}

export interface GuidedStep {
  step_number: number;
  total_steps: number;
  title: string;
  description: string;
  helpful_tip?: string;
  safety_reminder?: string;
  action_button_label?: string;
}

export interface GuidedTask {
  task_name: string;
  total_steps: number;
  steps: GuidedStep[];
  disclaimer?: string;
}

export interface ServerStatus {
  connected: boolean;
  model: string;
  hasKey: boolean;
}
