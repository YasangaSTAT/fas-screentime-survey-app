export interface SurveyResponse {
  id: string;
  timestamp: string; // ISO string
  createdAtFormatted: string;

  // Section 1: Personal Information
  fullName: string;
  registrationNumber: string;
  contactNumber: string;
  email: string;

  // Section 2: Demographic & Academic Background
  gender: 'Male' | 'Female' | '';
  age: number | '';
  degreeProgramme:
    | 'Physical Science'
    | 'Biological Science'
    | 'Food Science & Technology'
    | 'Sports Science & Management'
    | '';
  academicYear: '1st year' | '2nd year' | '3rd year' | '';
  accommodationType:
    | 'Family home'
    | 'University accommodation (Hostel)'
    | 'Rented accommodation (Boarding/Annex)'
    | 'Other'
    | '';
  accommodationOtherText?: string;

  // Section 3: Smartphone Usage & Digital Habits
  dailyScreenTimeMinutes: number | '';
  primaryPurpose:
    | 'Academic (LMS, reading lecture notes, research apps)'
    | 'Social Communication (WhatsApp, Telegram, Calls)'
    | 'Entertainment & Leisure (Social Media, YouTube, Gaming, Movies)'
    | 'Mixed (Equal combination of multiple purposes)'
    | '';
  bedtimeUsageMinutes: number | '';
  connectionType:
    | 'Mobile Data (Dialog, Mobitel, Hutch, Airtel)'
    | 'Wi-Fi (Hostel Wi-Fi, Home Fibre/ADSL, Campus Wi-Fi)'
    | 'Both (Used almost equally)'
    | '';
  monthlyDataSpendLKR: number | '';

  // Section 4: Lifestyle & Academic Factors
  independentStudyHours: number | '';
  sleepDurationHours: number | '';
  commutingTimeMinutes: number | '';

  // Email dispatch status tracking
  emailSentAt?: string;
}

export interface EmailTemplateConfig {
  senderEmail: string;
  subject: string;
  body: string;
}

export type SurveySection = 1 | 2 | 3 | 4 | 5; // 5 is review

export type VisualThemeMode = 'blueLight' | 'amberShield' | 'obsidianOled';
