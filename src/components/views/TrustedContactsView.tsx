import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  Trash2,
  Edit2,
  ShieldCheck,
  Check
} from "lucide-react";
import { Page, UserPreferences, TrustedContact } from "../../types.ts";
import { t, generateTrustedContactUrl } from "../../utils/translations.ts";

interface TrustedContactsViewProps {
  preferences: UserPreferences;
  contacts: TrustedContact[];
  onAddContact: (contact: Omit<TrustedContact, "id">) => void;
  onDeleteContact: (id: string) => void;
  onNavigate: (page: Page) => void;
}

export const TrustedContactsView: React.FC<TrustedContactsViewProps> = ({
  preferences,
  contacts,
  onAddContact,
  onDeleteContact
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Son");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const isHC = preferences.contrast_mode === "High Contrast";
  const isHindi = preferences.language === "Hindi";

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddContact({
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim()
    });

    setName("");
    setPhone("+91 ");
    setEmail("");
    setNotes("");
    setShowAddForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>👥</span> {t("nav_trusted", preferences.language)}
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
            {isHindi
              ? "आपके विश्वसनीय परिजन और डॉक्टर। किसी भी संशय की स्थिति में एक क्लिक में मदद मांगें।"
              : "Your trusted family members and personal doctors available for 1-tap guidance."}
          </p>
        </div>

        <button
          id="btn-add-contact-toggle"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
            isHC
              ? "bg-amber-400 text-black border-2 border-white"
              : "bg-[#1B4965] text-white hover:bg-[#14374d]"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isHindi ? "नया संपर्क जोड़ें" : "Add Contact"}</span>
        </button>
      </div>

      {/* Safety explanation banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center gap-3 ${
          isHC
            ? "bg-slate-900 border-amber-400 text-white"
            : "bg-sky-50 border-sky-200 text-sky-950"
        }`}
      >
        <ShieldCheck className="w-6 h-6 text-[#0284C7] shrink-0" />
        <div className="text-sm font-semibold">
          {isHindi
            ? "जब भी आपको कोई संदिग्ध संदेश या बिल दिखाई दे, आप 'व्हाट्सएप पर पूछें' दबाकर तुरंत अपने परिजन की सलाह ले सकते हैं।"
            : "Whenever you feel uncertain about a message or online payment, tap 'Ask on WhatsApp' to share it with your family immediately."}
        </div>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm animate-fade-in ${
            isHC ? "bg-slate-950 border-amber-400" : "bg-white border-slate-300"
          }`}
        >
          <h2 className="font-black text-lg">Add New Trusted Family Member</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Full Name / नाम:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Relationship / रिश्ता:</label>
              <input
                type="text"
                required
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Daughter, Neighbor, Doctor"
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Mobile Number / फोन:</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Email / ईमेल (Optional):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Availability Note:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Available after 5 PM on weekdays"
              className="w-full px-3 py-2 rounded-lg border text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-bold text-sm ${
                isHC ? "bg-amber-400 text-black" : "bg-[#1B4965] text-white"
              }`}
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* Contacts Cards */}
      <div className="space-y-4">
        {contacts.map((c) => {
          const sampleAlertText = `Hi ${c.name}, I need your assistance looking at a digital message on my phone. Could you please check this when free?`;
          const whatsappUrl = generateTrustedContactUrl(c.phone, sampleAlertText);

          return (
            <div
              key={c.id}
              id={`trusted-card-${c.id}`}
              className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all ${
                isHC
                  ? "bg-[#151C2C] border-amber-400 text-white"
                  : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
                    isHC ? "bg-amber-400 text-black" : "bg-sky-100 text-sky-900"
                  }`}
                >
                  {c.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-xl">{c.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.relationship}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                    📞 {c.phone}
                  </div>

                  {c.notes && (
                    <div className="text-xs text-slate-500 italic mt-0.5">{c.notes}</div>
                  )}
                </div>
              </div>

              {/* 1-Tap Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  id={`btn-whatsapp-${c.id}`}
                  className="px-4 py-2.5 rounded-xl font-extrabold text-sm bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask on WhatsApp</span>
                </a>

                <a
                  href={`tel:${c.phone}`}
                  className="px-3.5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors border"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>

                {contacts.length > 1 && (
                  <button
                    onClick={() => onDeleteContact(c.id)}
                    title="Delete contact"
                    className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
