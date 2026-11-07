import { SurveyResponse } from '../types/survey';
import { INITIAL_SEED_RESPONSES_300 } from '../data/seedResponses300';

const STORAGE_KEY = 'sta330_smartphone_survey_responses_v1';
const DRAFT_KEY = 'sta330_survey_draft_v1';

export const INITIAL_SEED_RESPONSES: SurveyResponse[] = INITIAL_SEED_RESPONSES_300;

export function loadStoredResponses(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_RESPONSES));
      return INITIAL_SEED_RESPONSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Seamlessly upgrade existing local storage to the full target sample of 300 records,
      // while preserving any user-submitted survey entries
      if (parsed.length < 300) {
        const userSubmitted = parsed.filter(
          (r: SurveyResponse) =>
            !r.id?.startsWith('RESP-USJ-100') && !r.id?.startsWith('RESP-USJ-1010')
        );
        const upgraded = [...userSubmitted, ...INITIAL_SEED_RESPONSES_300];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
        } catch {
          // ignore
        }
        return upgraded;
      }
      return parsed;
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
