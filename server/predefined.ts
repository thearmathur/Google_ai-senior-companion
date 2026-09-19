import { GuidedTask, ScamAnalysis, DocumentExplanation } from "../src/types.ts";

export const PREDEFINED_GUIDED_TASKS: Record<string, GuidedTask> = {
  "Pay an electricity bill": {
    task_name: "Pay an electricity bill",
    total_steps: 4,
    disclaimer: "This is a guidance system. No actual payments or bookings are made here.",
    steps: [
      {
        step_number: 1,
        total_steps: 4,
        title: "Find Consumer Number",
        description: "Check your paper bill for the 9-digit CA Number (Consumer Account Number) printed near the top-right corner.",
        helpful_tip: "Look for 'CA No.' or 'Consumer ID'. It is usually printed in bold numbers.",
        safety_reminder: "Never transfer money directly to a personal mobile number or private UPI ID for utility bills.",
        action_button_label: "Next: Open App ->"
      },
      {
        step_number: 2,
        total_steps: 4,
        title: "Open Official App or Portal",
        description: "Open your verified utility portal or trusted payment app (such as Google Pay, BHIM, Paytm, or Netbanking). Tap 'Electricity' and pick your provider (e.g. BSES Rajdhani).",
        helpful_tip: "Look for the blue or green verified checkmark next to your power provider name.",
        safety_reminder: "Do not search for customer service phone numbers on public search engines; they may be fraudulent.",
        action_button_label: "Next: Verify Details ->"
      },
      {
        step_number: 3,
        total_steps: 4,
        title: "Verify Consumer Name and Bill Amount",
        description: "Enter your 9-digit CA number. The app will fetch your bill. Verify that the displayed name and amount (₹2,450) match your paper bill exactly.",
        helpful_tip: "If the name shown is unfamiliar, stop immediately and recheck the digits.",
        safety_reminder: "Never proceed if the name or bill amount does not match your official receipt.",
        action_button_label: "Next: Payment Safety ->"
      },
      {
        step_number: 4,
        total_steps: 4,
        title: "Pay & Save Confirmation",
        description: "Review payment and enter your bank UPI PIN only on your bank's official security screen. Save the transaction screenshot or receipt number for your records.",
        helpful_tip: "Keep the receipt number safe. The payment takes a few minutes to reflect on the electricity company server.",
        safety_reminder: "Remember: Entering your UPI PIN always sends money; you NEVER enter your PIN to receive money.",
        action_button_label: "Finish Task 🎉"
      }
    ]
  },
  "Book a doctor appointment": {
    task_name: "Book a doctor appointment",
    total_steps: 4,
    disclaimer: "This is a guidance system. Consult your doctor directly for medical decisions.",
    steps: [
      {
        step_number: 1,
        total_steps: 4,
        title: "Choose Specialist & Clinic",
        description: "Decide which specialist you need to visit (e.g., General Physician, Cardiologist, or Eye Doctor) and locate the hospital clinic phone number from your previous prescription slip.",
        helpful_tip: "Keep your previous doctor prescription handy so you have the clinic name.",
        safety_reminder: "Always call the hospital reception desk directly; avoid random numbers listed on web directories.",
        action_button_label: "Next: Choose Slot ->"
      },
      {
        step_number: 2,
        total_steps: 4,
        title: "Pick a Comfortable Morning Slot",
        description: "Request a morning consultation slot between 10:00 AM and 12:00 PM to avoid rush hours and long hospital queues.",
        helpful_tip: "Ask if fasting is required for any routine blood tests before the appointment.",
        safety_reminder: "Never share personal Aadhaar OTPs or banking passwords simply to check doctor availability.",
        action_button_label: "Next: Prepare Documents ->"
      },
      {
        step_number: 3,
        total_steps: 4,
        title: "Organize Medical Reports",
        description: "Place your recent blood pressure readings, sugar test reports, and list of current daily medicines into a clear plastic folder.",
        helpful_tip: "Doctors appreciate when reports are arranged in date order (newest on top).",
        safety_reminder: "Never stop or change prescribed medicine dosages without your doctor's explicit advice.",
        action_button_label: "Next: Set Reminder ->"
      },
      {
        step_number: 4,
        total_steps: 4,
        title: "Confirm & Set a Reminder",
        description: "Note down the appointment token number and doctor's room number. Use the AI Senior Companion Reminder tab to alert you the morning of the visit.",
        helpful_tip: "Arrive 15 minutes before your slot to complete registration smoothly.",
        safety_reminder: "Have your trusted contact (family member) accompany you if you feel dizzy or weak.",
        action_button_label: "Finish Task 🎉"
      }
    ]
  },
  "Change a password safely": {
    task_name: "Change a password safely",
    total_steps: 4,
    disclaimer: "Always keep your passwords confidential.",
    steps: [
      {
        step_number: 1,
        total_steps: 4,
        title: "Open Official Account Settings",
        description: "Open your account app directly (or type the exact website address in your browser). Go to 'Settings' or 'Profile' and tap 'Security'.",
        helpful_tip: "Never click a password reset link received inside an unsolicited SMS or WhatsApp message.",
        safety_reminder: "Legitimate banks and services will never call you asking you to change your password over the phone.",
        action_button_label: "Next: Create Password ->"
      },
      {
        step_number: 2,
        total_steps: 4,
        title: "Create an Easy-to-Remember Passphrase",
        description: "Create a password that combines 3 simple, pleasant words that are easy for you to remember, plus a number (e.g. MangoTreeGreen25!).",
        helpful_tip: "A longer sentence of familiar words is much stronger and easier to recall than random symbols.",
        safety_reminder: "Avoid using your date of birth, year of retirement, or phone number as your password.",
        action_button_label: "Next: Write It Down ->"
      },
      {
        step_number: 3,
        total_steps: 4,
        title: "Store in a Private Home Diary",
        description: "Write your new password in your private physical notebook kept securely in your home drawer. Do not save passwords in public phone notes.",
        helpful_tip: "Keeping a physical notebook at home is safe from internet hackers.",
        safety_reminder: "Never write your passwords on sticky notes attached to your computer screen or phone case.",
        action_button_label: "Next: Save & Log Out ->"
      },
      {
        step_number: 4,
        total_steps: 4,
        title: "Save and Log Out of Unused Devices",
        description: "Save your new password. If prompted, select 'Log out of other devices' to ensure old sessions are cleanly disconnected.",
        helpful_tip: "You can test your new password once to make sure you have it memorized comfortably.",
        safety_reminder: "If anyone calls claiming to be 'IT Support' asking for this password, hang up immediately.",
        action_button_label: "Finish Task 🎉"
      }
    ]
  },
  "Make a video call to family": {
    task_name: "Make a video call to family",
    total_steps: 3,
    disclaimer: "Connect with family safely.",
    steps: [
      {
        step_number: 1,
        total_steps: 3,
        title: "Check Internet & Volume",
        description: "Ensure your phone is connected to your home Wi-Fi. Turn your phone volume up so you can hear clearly, and sit in a well-lit room.",
        helpful_tip: "Facing a window or lamp ensures your family can see your face clearly.",
        safety_reminder: "Never accept video calls from unknown phone numbers.",
        action_button_label: "Next: Open WhatsApp ->"
      },
      {
        step_number: 2,
        total_steps: 3,
        title: "Open Trusted Contact in WhatsApp",
        description: "Open WhatsApp, tap your family member's chat (e.g. Son Aarav), and look at the top-right corner of the screen.",
        helpful_tip: "Look for the small camera icon next to their name.",
        safety_reminder: "Double-check you selected the correct person before tapping the call button.",
        action_button_label: "Next: Tap Video Icon ->"
      },
      {
        step_number: 3,
        total_steps: 3,
        title: "Tap the Video Camera Icon & Enjoy",
        description: "Tap the small Video Camera icon. Hold your phone comfortably at eye level. When finished, tap the red phone icon to hang up.",
        helpful_tip: "Use a phone stand or prop the phone against a mug so your hands don't get tired.",
        safety_reminder: "If the call disconnects or freezes, simply tap the red button and try again in 1 minute.",
        action_button_label: "Finish Task 🎉"
      }
    ]
  }
};

export const SAMPLE_FALLBACK_BILLS: Record<string, DocumentExplanation> = {
  electricity: {
    document_type: "Electricity Bill (BSES Rajdhani)",
    simple_summary: "This is your monthly electricity bill for August–September. You need to pay ₹2,450 before 25 September 2026 to avoid any late fees.",
    amount_to_pay: "₹2,450.00",
    due_date: "25 September 2026",
    provider_or_sender: "BSES Rajdhani Power Limited (BRPL)",
    important_details: [
      "Consumer Account (CA) Number: 100458921",
      "Units Consumed: 340 Units",
      "Energy Charges: ₹2,150.00 | Fixed Charges: ₹180.00",
      "Government Subsidy Applied: ₹500.00 discount"
    ],
    what_you_need_to_do: [
      "Pay ₹2,450 on or before 25 September 2026",
      "Keep the digital payment receipt or transaction ID safely in your records",
      "Check your next bill to verify this payment was adjusted"
    ],
    safety_warning: "Beware of fraud SMS threats claiming electricity will be disconnected tonight. Always check this official bill.",
    suggested_action: "set_reminder"
  },
  medical: {
    document_type: "Routine Diagnostic Lab Report",
    simple_summary: "This is your blood test report from Dr. Lal PathLabs. Your Fasting Blood Sugar and Blood Pressure indicators are within normal reference ranges.",
    amount_to_pay: "None (Already Paid)",
    due_date: "Next Checkup: October 2026",
    provider_or_sender: "Dr. Lal PathLabs / City Health Clinic",
    important_details: [
      "Fasting Blood Sugar: 98 mg/dL (Normal Range: 70 - 100 mg/dL)",
      "HbA1c: 5.7% (Good Glycemic Control)",
      "Blood Pressure Reading: 124/82 mmHg"
    ],
    what_you_need_to_do: [
      "Keep this report safely in your health folder for your next visit with Dr. Verma",
      "Continue taking your morning BP medication as previously prescribed"
    ],
    safety_warning: "Medical Notice: This is an informational summary. Please review these results with your doctor at your scheduled visit.",
    suggested_action: "none"
  }
};

export const SAMPLE_SCAM_ANALYSES: Record<string, ScamAnalysis> = {
  lottery: {
    risk_level: "HIGH",
    summary: "This message contains clear signs commonly associated with advance-fee lottery fraud. You have not won money, and this is an attempt to steal your savings.",
    warning_signs: [
      "Promises an unprompted huge lottery prize (₹25,00,000) for a contest you never entered",
      "Demands an advance 'clearance fee' or 'processing tax' of ₹5,000 via a personal UPI ID",
      "Urges you to reply with your secret Aadhaar OTP or bank credentials"
    ],
    do_not_do: [
      "NEVER transfer ₹5,000 or any money to claim prize funds",
      "NEVER share your Aadhaar OTP, bank OTP, or ATM PIN with anyone",
      "Do not reply to this message or call back the sender"
    ],
    safe_next_steps: [
      "Block the sender's phone number on your mobile",
      "Report the message as spam in WhatsApp / SMS",
      "Talk to your trusted family member (e.g. Son Aarav) to put your mind at ease"
    ],
    confidence: "high"
  },
  utility: {
    risk_level: "HIGH",
    summary: "This message shows strong indicators of an electricity disconnection phishing scam designed to induce panic.",
    warning_signs: [
      "Creates artificial urgency threatening power disconnection tonight at 9:30 PM",
      "Sent from an unverified 10-digit personal mobile number instead of an official utility shortcode",
      "Directs you to call an unofficial mobile number rather than using official customer service"
    ],
    do_not_do: [
      "Do not call the phone number given in the message",
      "Do not install any screen-sharing apps (like AnyDesk or TeamViewer) if asked",
      "Do not transfer money into private UPI handles"
    ],
    safe_next_steps: [
      "Check your actual electricity bill — your bill is not disconnected",
      "Call the official BSES customer care helpline (19123) printed on your paper bill",
      "Delete and block the suspicious sender"
    ],
    confidence: "high"
  },
  safe_bank: {
    risk_level: "LOW",
    summary: "This appears to be a legitimate informational SMS notification regarding a regular account credit with no suspicious urgency or links.",
    warning_signs: [
      "No urgency, threats, or demands for payments",
      "Does not ask you to click weird links or call private mobile numbers",
      "Standard transactional format sent from registered bank shortcode"
    ],
    do_not_do: [
      "Never forward bank SMS messages containing transaction codes to strangers"
    ],
    safe_next_steps: [
      "You do not need to take any action; this is a standard record of your deposit",
      "Check your monthly bank passbook at your convenience"
    ],
    confidence: "high"
  }
};
