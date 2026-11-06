import { EmailTemplateConfig, SurveyResponse } from '../types/survey';

const TEMPLATE_STORAGE_KEY = 'sta330_custom_email_template_v1';

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplateConfig = {
  senderEmail: 'yasanganlanka@gmail.com',
  subject: 'Thank You for Participating in our FAS USJ Smartphone Screen Time Study!',
  body: `Dear [Participant's Name],

Thank you so much for taking the time to complete our research questionnaire! We sincerely appreciate your contribution as a [Academic Year] undergraduate at the Faculty of Applied Sciences, University of Sri Jayewardenepura.

Your responses regarding daily smartphone screen time and lifestyle factors play a vital role in our STA 330 2.0 (Data Analysis and Preparation of Reports) research project. All data collected will be handled with strict confidentiality and used exclusively for academic analysis.

If you have any questions or would like to know more about the findings of this study, please feel free to reach out to us by replying to this email.

Wishing you success in your academic endeavours!

Warm regards,
Research Team (Group 09)
Department of Statistics, Faculty of Applied Sciences
University of Sri Jayewardenepura`,
};

export function loadEmailTemplate(): EmailTemplateConfig {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.body === 'string' && typeof parsed.subject === 'string') {
        return {
          senderEmail: parsed.senderEmail || DEFAULT_EMAIL_TEMPLATE.senderEmail,
          subject: parsed.subject,
          body: parsed.body,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load custom email template:', err);
  }
  return DEFAULT_EMAIL_TEMPLATE;
}

export function saveEmailTemplate(template: EmailTemplateConfig): void {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(template));
  } catch (err) {
    console.error('Failed to save email template:', err);
  }
}

export function resetEmailTemplateToDefault(): EmailTemplateConfig {
  saveEmailTemplate(DEFAULT_EMAIL_TEMPLATE);
  return DEFAULT_EMAIL_TEMPLATE;
}

const getAssetUrl = (relativePath: string) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${cleanBase}${cleanPath}`;
};

export const EMAIL_HEADER_BANNER = getAssetUrl('assets/aistudio/Gemini_Generated_Image_on5nwlon5nwlon5n_55e9ee7b.jpg');
export const MALE_CERTIFICATE_IMAGE = getAssetUrl('assets/aistudio/Gemini_Generated_Image_3twpzh3twpzh3twp_9890f519.jpg');
export const FEMALE_CERTIFICATE_IMAGE = getAssetUrl('assets/aistudio/Gemini_Generated_Image_p6cmg6p6cmg6p6cm_bbf18bd0.jpg');

export interface RenderedEmail {
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  fullBody: string;
  gmailComposeUrl: string;
  mailtoUrl: string;
  headerImageUrl: string;
  certificateImageUrl: string;
  certificateLabel: string;
  certificateGender: 'Male' | 'Female';
}

export function renderEmailForParticipant(
  template: EmailTemplateConfig,
  participant: {
    fullName?: string;
    academicYear?: string;
    email?: string;
    gender?: 'Male' | 'Female' | string;
  }
): RenderedEmail {
  const name = participant.fullName?.trim() || "Participant";
  const year = participant.academicYear?.trim() || "undergraduate";
  const recipientEmail = participant.email?.trim() || "";

  // Select image based on participant gender:
  // First image for Male ("you're such a wonderful boy"), second image for Female ("you're such a wonderful girl")
  const isFemale = participant.gender?.trim().toLowerCase() === 'female';
  const certificateGender: 'Male' | 'Female' = isFemale ? 'Female' : 'Male';
  const certificateImageUrl = isFemale ? FEMALE_CERTIFICATE_IMAGE : MALE_CERTIFICATE_IMAGE;
  const certificateLabel = isFemale
    ? "Appreciation Certificate — 'you\\'re such a wonderful girl' (Female Edition)"
    : "Appreciation Certificate — 'you\\'re such a wonderful boy' (Male Edition)";

  // Replace placeholders [Participant's Name] and [Academic Year]
  let renderedSubject = template.subject
    .replace(/\[Participant's Name\]/gi, name)
    .replace(/\[Academic Year\]/gi, year);

  let renderedBody = template.body
    .replace(/\[Participant's Name\]/gi, name)
    .replace(/\[Academic Year\]/gi, year);

  const fullBody = `${renderedBody}

--------------------------------------------------
🎓 STA 330 2.0 Official Study Header & Certificate:
• Header: Demographic, Academic, and Lifestyle Factors Associated with Daily Smartphone Screen Time (Faculty of Applied Sciences, USJ)
• Certificate: ${certificateLabel}
• Official Dispatcher: ${template.senderEmail || 'yasanganlanka@gmail.com'}
--------------------------------------------------`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail
  )}&su=${encodeURIComponent(renderedSubject)}&body=${encodeURIComponent(fullBody)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    renderedSubject
  )}&body=${encodeURIComponent(fullBody)}`;

  return {
    senderEmail: template.senderEmail || 'yasanganlanka@gmail.com',
    recipientEmail,
    subject: renderedSubject,
    body: renderedBody,
    fullBody,
    gmailComposeUrl,
    mailtoUrl,
    headerImageUrl: EMAIL_HEADER_BANNER,
    certificateImageUrl,
    certificateLabel,
    certificateGender,
  };
}
