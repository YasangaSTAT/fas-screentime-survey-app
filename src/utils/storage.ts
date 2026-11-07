import { SurveyResponse } from '../types/survey';

// Storage key v2: Clean slate for authentic respondent data collection (Target sample: 300)
const STORAGE_KEY = 'sta330_smartphone_survey_responses_v2';
const LEGACY_STORAGE_KEY_V1 = 'sta330_smartphone_survey_responses_v1';
const DRAFT_KEY = 'sta330_survey_draft_v1';

export const INITIAL_SEED_RESPONSES: SurveyResponse[] = [];

/**
 * Loads stored responses from browser storage.
 * Starts with an empty dataset (0 responses) so the research team can fill all 300 real survey records.
 * Automatically clears legacy example/mock data from v1.
 */
export function loadStoredResponses(): SurveyResponse[] {
  try {
    if (typeof localStorage !== 'undefined') {
      // Clean up legacy mock data key if present
      if (localStorage.getItem(LEGACY_STORAGE_KEY_V1)) {
        localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure any legacy seed responses (IDs like RESP-USJ-1001 to RESP-USJ-1300) are removed
      const authenticResponses = parsed.filter(
        (r: SurveyResponse) =>
          !r.id?.startsWith('RESP-USJ-10') &&
          !r.id?.startsWith('RESP-USJ-11') &&
          !r.id?.startsWith('RESP-USJ-12')
      );

      if (authenticResponses.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticResponses));
      }
      return authenticResponses;
    }
    return [];
  } catch (e) {
    console.error('Error loading stored responses:', e);
    return [];
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
  saveResponses([]);
  return [];
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
