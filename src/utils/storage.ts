import { SurveyResponse } from '../types/survey';

const STORAGE_KEY = 'sta330_smartphone_survey_responses_v1';
const DRAFT_KEY = 'sta330_survey_draft_v1';

export const INITIAL_SEED_RESPONSES: SurveyResponse[] = [
  {
    id: 'RESP-USJ-1001',
    timestamp: '2024-11-01T08:30:00.000Z',
    createdAtFormatted: '2024-11-01 14:00',
    fullName: 'Kavindu Bandara',
    registrationNumber: 'AS2021045',
    contactNumber: '0771234567',
    email: 'kavindu.b99@gmail.com',
    gender: 'Male',
    age: 23,
    degreeProgramme: 'Physical Science',
    academicYear: '3rd year',
    accommodationType: 'Rented accommodation (Boarding/Annex)',
    dailyScreenTimeMinutes: 310, // 5h 10m
    primaryPurpose: 'Social Communication (WhatsApp, Telegram, Calls)',
    bedtimeUsageMinutes: 50,
    connectionType: 'Wi-Fi (Hostel Wi-Fi, Home Fibre/ADSL, Campus Wi-Fi)',
    monthlyDataSpendLKR: 1800,
    independentStudyHours: 3.5,
    sleepDurationHours: 6.5,
    commutingTimeMinutes: 45,
  },
  {
    id: 'RESP-USJ-1002',
    timestamp: '2024-11-01T09:15:00.000Z',
    createdAtFormatted: '2024-11-01 14:45',
    fullName: 'Sanduni Weerasinghe',
    registrationNumber: 'AS2022112',
    contactNumber: '0719876543',
    email: 'sanduni.weera@gmail.com',
    gender: 'Female',
    age: 22,
    degreeProgramme: 'Biological Science',
    academicYear: '2nd year',
    accommodationType: 'University accommodation (Hostel)',
    dailyScreenTimeMinutes: 245, // 4h 05m
    primaryPurpose: 'Academic (LMS, reading lecture notes, research apps)',
    bedtimeUsageMinutes: 30,
    connectionType: 'Both (Used almost equally)',
    monthlyDataSpendLKR: 1450,
    independentStudyHours: 4.5,
    sleepDurationHours: 7.0,
    commutingTimeMinutes: 20,
  },
  {
    id: 'RESP-USJ-1003',
    timestamp: '2024-11-01T11:40:00.000Z',
    createdAtFormatted: '2024-11-01 17:10',
    fullName: 'Nipun Jayawardena',
    registrationNumber: 'AS2023078',
    contactNumber: '0765544332',
    email: 'nipun.j@gmail.com',
    gender: 'Male',
    age: 21,
    degreeProgramme: 'Food Science & Technology',
    academicYear: '1st year',
    accommodationType: 'Family home',
    dailyScreenTimeMinutes: 380, // 6h 20m
    primaryPurpose: 'Entertainment & Leisure (Social Media, YouTube, Gaming, Movies)',
    bedtimeUsageMinutes: 75,
    connectionType: 'Mobile Data (Dialog, Mobitel, Hutch, Airtel)',
    monthlyDataSpendLKR: 2500,
    independentStudyHours: 2.0,
    sleepDurationHours: 5.5,
    commutingTimeMinutes: 90,
  },
  {
    id: 'RESP-USJ-1004',
    timestamp: '2024-11-02T04:20:00.000Z',
    createdAtFormatted: '2024-11-02 09:50',
    fullName: 'Dinithi Senanayake',
    registrationNumber: 'AS2021189',
    contactNumber: '0702334455',
    email: 'dinithi.sena@gmail.com',
    gender: 'Female',
    age: 23,
    degreeProgramme: 'Physical Science',
    academicYear: '3rd year',
    accommodationType: 'Family home',
    dailyScreenTimeMinutes: 210, // 3h 30m
    primaryPurpose: 'Academic (LMS, reading lecture notes, research apps)',
    bedtimeUsageMinutes: 20,
    connectionType: 'Wi-Fi (Hostel Wi-Fi, Home Fibre/ADSL, Campus Wi-Fi)',
    monthlyDataSpendLKR: 1200,
    independentStudyHours: 5.0,
    sleepDurationHours: 7.5,
    commutingTimeMinutes: 60,
  },
  {
    id: 'RESP-USJ-1005',
    timestamp: '2024-11-02T07:10:00.000Z',
    createdAtFormatted: '2024-11-02 12:40',
    fullName: 'Tharindu Fernando',
    registrationNumber: 'AS2022090',
    contactNumber: '0783322114',
    email: 'tharindu.fnd@gmail.com',
    gender: 'Male',
    age: 22,
    degreeProgramme: 'Sports Science & Management',
    academicYear: '2nd year',
    accommodationType: 'University accommodation (Hostel)',
    dailyScreenTimeMinutes: 320, // 5h 20m
    primaryPurpose: 'Mixed (Equal combination of multiple purposes)',
    bedtimeUsageMinutes: 60,
    connectionType: 'Both (Used almost equally)',
    monthlyDataSpendLKR: 2000,
    independentStudyHours: 2.5,
    sleepDurationHours: 6.0,
    commutingTimeMinutes: 15,
  },
  {
    id: 'RESP-USJ-1006',
    timestamp: '2024-11-02T10:05:00.000Z',
    createdAtFormatted: '2024-11-02 15:35',
    fullName: 'Himashi Karunaratne',
    registrationNumber: 'AS2023156',
    contactNumber: '0714455667',
    email: 'himashi.karu@gmail.com',
    gender: 'Female',
    age: 20,
    degreeProgramme: 'Biological Science',
    academicYear: '1st year',
    accommodationType: 'Rented accommodation (Boarding/Annex)',
    dailyScreenTimeMinutes: 410, // 6h 50m
    primaryPurpose: 'Entertainment & Leisure (Social Media, YouTube, Gaming, Movies)',
    bedtimeUsageMinutes: 90,
    connectionType: 'Mobile Data (Dialog, Mobitel, Hutch, Airtel)',
    monthlyDataSpendLKR: 2800,
    independentStudyHours: 2.0,
    sleepDurationHours: 5.0,
    commutingTimeMinutes: 30,
  },
  {
    id: 'RESP-USJ-1007',
    timestamp: '2024-11-02T13:30:00.000Z',
    createdAtFormatted: '2024-11-02 19:00',
    fullName: 'Malith Dissanayake',
    registrationNumber: 'AS2021008',
    contactNumber: '0758899001',
    email: 'malith.diss@gmail.com',
    gender: 'Male',
    age: 24,
    degreeProgramme: 'Physical Science',
    academicYear: '3rd year',
    accommodationType: 'University accommodation (Hostel)',
    dailyScreenTimeMinutes: 275, // 4h 35m
    primaryPurpose: 'Mixed (Equal combination of multiple purposes)',
    bedtimeUsageMinutes: 40,
    connectionType: 'Wi-Fi (Hostel Wi-Fi, Home Fibre/ADSL, Campus Wi-Fi)',
    monthlyDataSpendLKR: 1500,
    independentStudyHours: 4.0,
    sleepDurationHours: 6.5,
    commutingTimeMinutes: 15,
  },
  {
    id: 'RESP-USJ-1008',
    timestamp: '2024-11-03T02:15:00.000Z',
    createdAtFormatted: '2024-11-03 07:45',
    fullName: 'Sewwandi Gamage',
    registrationNumber: 'AS2022204',
    contactNumber: '0761122334',
    email: 'sewwandi.g@gmail.com',
    gender: 'Female',
    age: 22,
    degreeProgramme: 'Food Science & Technology',
    academicYear: '2nd year',
    accommodationType: 'Family home',
    dailyScreenTimeMinutes: 190, // 3h 10m
    primaryPurpose: 'Academic (LMS, reading lecture notes, research apps)',
    bedtimeUsageMinutes: 15,
    connectionType: 'Wi-Fi (Hostel Wi-Fi, Home Fibre/ADSL, Campus Wi-Fi)',
    monthlyDataSpendLKR: 1000,
    independentStudyHours: 4.5,
    sleepDurationHours: 8.0,
    commutingTimeMinutes: 75,
  },
  {
    id: 'RESP-USJ-1009',
    timestamp: '2024-11-03T05:40:00.000Z',
    createdAtFormatted: '2024-11-03 11:10',
    fullName: 'Praveen Abeykoon',
    registrationNumber: 'AS2023022',
    contactNumber: '0778899112',
    email: 'praveen.abey@gmail.com',
    gender: 'Male',
    age: 21,
    degreeProgramme: 'Sports Science & Management',
    academicYear: '1st year',
    accommodationType: 'Rented accommodation (Boarding/Annex)',
    dailyScreenTimeMinutes: 350, // 5h 50m
    primaryPurpose: 'Social Communication (WhatsApp, Telegram, Calls)',
    bedtimeUsageMinutes: 65,
    connectionType: 'Mobile Data (Dialog, Mobitel, Hutch, Airtel)',
    monthlyDataSpendLKR: 2200,
    independentStudyHours: 3.0,
    sleepDurationHours: 6.0,
    commutingTimeMinutes: 40,
  },
  {
    id: 'RESP-USJ-1010',
    timestamp: '2024-11-03T08:10:00.000Z',
    createdAtFormatted: '2024-11-03 13:40',
    fullName: 'Chalani Rajapaksha',
    registrationNumber: 'AS2021067',
    contactNumber: '0723456789',
    email: 'chalani.raj@gmail.com',
    gender: 'Female',
    age: 23,
    degreeProgramme: 'Biological Science',
    academicYear: '3rd year',
    accommodationType: 'Family home',
    dailyScreenTimeMinutes: 290, // 4h 50m
    primaryPurpose: 'Mixed (Equal combination of multiple purposes)',
    bedtimeUsageMinutes: 45,
    connectionType: 'Both (Used almost equally)',
    monthlyDataSpendLKR: 1600,
    independentStudyHours: 3.5,
    sleepDurationHours: 6.5,
    commutingTimeMinutes: 80,
  },
];

export function loadStoredResponses(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_RESPONSES));
      return INITIAL_SEED_RESPONSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Normalize any seed items that had future 2026 benchmark dates to 2024
      // so newly submitted real-time responses always sort cleanly to the top
      let modified = false;
      const sanitized = parsed.map((item: SurveyResponse) => {
        if (
          item.id?.startsWith('RESP-USJ-10') &&
          typeof item.timestamp === 'string' &&
          item.timestamp.startsWith('2026-11-0')
        ) {
          modified = true;
          return {
            ...item,
            timestamp: item.timestamp.replace('2026-11-', '2024-11-'),
            createdAtFormatted: (item.createdAtFormatted || '').replace('2026-11-', '2024-11-'),
          };
        }
        return item;
      });
      if (modified) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch {
          // ignore
        }
      }
      return sanitized;
    }
    return INITIAL_SEED_RESPONSES;
  } catch (e) {
    console.error('Error loading stored responses:', e);
    return INITIAL_SEED_RESPONSES;
  }
}

export function saveResponses(responses: SurveyResponse[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sta330_responses_updated', { detail: responses }));
    }
  } catch (e) {
    console.error('Error saving responses:', e);
  }
}

export function addSurveyResponse(response: SurveyResponse): SurveyResponse[] {
  const current = loadStoredResponses();
  // Ensure the new response is prepended at index 0 and deduplicated
  const updated = [response, ...current.filter((r) => r.id !== response.id)];
  saveResponses(updated);
  return updated;
}

export function deleteSurveyResponse(id: string): SurveyResponse[] {
  const current = loadStoredResponses();
  const updated = current.filter((r) => r.id !== id);
  saveResponses(updated);
  return updated;
}

export function resetToSeedData(): SurveyResponse[] {
  saveResponses(INITIAL_SEED_RESPONSES);
  return INITIAL_SEED_RESPONSES;
}

export function clearAllSurveyData(): SurveyResponse[] {
  saveResponses([]);
  return [];
}

export function updateSurveyResponseEmailSent(id: string, sentAt?: string | null): SurveyResponse[] {
  const current = loadStoredResponses();
  const updated = current.map((r) => {
    if (r.id !== id) return r;
    // If sentAt is empty string or explicitly null, clear it to revert to Pending
    if (sentAt === '' || sentAt === null) {
      const copy = { ...r };
      delete copy.emailSentAt;
      return copy;
    }
    return { ...r, emailSentAt: sentAt || new Date().toISOString() };
  });
  saveResponses(updated);
  return updated;
}

export function resetAllEmailStatusesToPending(): SurveyResponse[] {
  const current = loadStoredResponses();
  const updated = current.map((r) => {
    const copy = { ...r };
    delete copy.emailSentAt;
    return copy;
  });
  saveResponses(updated);
  return updated;
}

export function saveFormDraft(draft: Partial<SurveyResponse>): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('Error saving form draft:', e);
  }
}

export function loadFormDraft(): Partial<SurveyResponse> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearFormDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
