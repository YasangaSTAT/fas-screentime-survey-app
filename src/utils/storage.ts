import { SurveyResponse } from '../types/survey';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  deleteField,
} from 'firebase/firestore';

// Storage key v2: Fallback cache for authentic respondent data collection (Target sample: 300)
const STORAGE_KEY = 'sta330_smartphone_survey_responses_v2';
const LEGACY_STORAGE_KEY_V1 = 'sta330_smartphone_survey_responses_v1';
const DRAFT_KEY = 'sta330_survey_draft_v1';
const COLLECTION_NAME = 'survey_responses';

export const INITIAL_SEED_RESPONSES: SurveyResponse[] = [];

/**
 * Sanitizes an object before writing to Firestore.
 * Strips any undefined fields to prevent Firestore serialization errors.
 */
function sanitizeForFirestore(response: Partial<SurveyResponse>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(response)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Loads stored responses from local cache.
 */
export function loadStoredResponses(): SurveyResponse[] {
  try {
    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem(LEGACY_STORAGE_KEY_V1)) {
        localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Remove any legacy mock seed responses (IDs like RESP-USJ-1001 to RESP-USJ-1300)
      const authentic = parsed.filter(
        (r: SurveyResponse) =>
          !r.id?.startsWith('RESP-USJ-10') &&
          !r.id?.startsWith('RESP-USJ-11') &&
          !r.id?.startsWith('RESP-USJ-12')
      );
      return authentic;
    }
    return [];
  } catch (e) {
    console.error('Error loading stored responses from local cache:', e);
    return [];
  }
}

/**
 * Saves responses to local storage cache and notifies local listeners.
 */
export function saveResponses(responses: SurveyResponse[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sta330_responses_updated', { detail: responses }));
    }
  } catch (e) {
    console.error('Error saving responses to local cache:', e);
  }
}

/**
 * Subscribes to real-time updates from Firebase Firestore across all devices and emails.
 * Any survey submitted from any phone or computer will immediately stream to this callback.
 */
export function subscribeToSurveyResponses(
  callback: (responses: SurveyResponse[]) => void
): () => void {
  // First, provide local cached responses immediately so UI renders with 0 latency
  const cached = loadStoredResponses();
  callback(cached);

  const colRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const liveResponses: SurveyResponse[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SurveyResponse;
        if (data && data.id) {
          liveResponses.push(data);
        }
      });

      // Sort newest first by timestamp
      liveResponses.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      // Update local storage cache
      saveResponses(liveResponses);
      // Notify subscriber
      callback(liveResponses);
    },
    (error) => {
      console.warn('Realtime listener error, falling back to local storage cache:', error);
      try {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      } catch {
        // Fall back gracefully to local cache if network/permission issue
        callback(loadStoredResponses());
      }
    }
  );

  return unsubscribe;
}

/**
 * Adds a new survey response to both Firebase Firestore and local storage.
 * Stores in the centralized cloud database so researchers on any email/device see it immediately.
 */
export async function addSurveyResponse(response: SurveyResponse): Promise<SurveyResponse[]> {
  // 1. Immediately update local storage so user sees instant confirmation
  const current = loadStoredResponses();
  const updated = [response, ...current.filter((r) => r.id !== response.id)];
  saveResponses(updated);

  // 2. Persist to shared Firestore database
  try {
    const docRef = doc(db, COLLECTION_NAME, response.id);
    const sanitized = sanitizeForFirestore(response);
    await setDoc(docRef, sanitized);
  } catch (error) {
    console.error('Failed to sync response to Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${response.id}`);
    } catch {
      // Keep local update intact
    }
  }

  return updated;
}

/**
 * Deletes a survey response from both Firestore and local storage.
 */
export async function deleteSurveyResponse(id: string): Promise<SurveyResponse[]> {
  const current = loadStoredResponses();
  const updated = current.filter((r) => r.id !== id);
  saveResponses(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Failed to delete response from Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    } catch {
      // ignore
    }
  }

  return updated;
}

/**
 * Clears all survey data across all devices from Firestore and local cache.
 */
export async function clearAllSurveyData(): Promise<SurveyResponse[]> {
  saveResponses([]);

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Failed to clear all data in Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
    } catch {
      // ignore
    }
  }

  return [];
}

export function resetToSeedData(): SurveyResponse[] {
  clearAllSurveyData();
  return [];
}

/**
 * Updates certificate dispatch timestamp in Firestore and local storage.
 */
export async function updateSurveyResponseEmailSent(
  id: string,
  sentAt?: string | null
): Promise<SurveyResponse[]> {
  const current = loadStoredResponses();
  const updated = current.map((r) => {
    if (r.id !== id) return r;
    if (sentAt === '' || sentAt === null) {
      const copy = { ...r };
      delete copy.emailSentAt;
      return copy;
    }
    return { ...r, emailSentAt: sentAt || new Date().toISOString() };
  });
  saveResponses(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    if (sentAt === '' || sentAt === null) {
      await updateDoc(docRef, { emailSentAt: deleteField() });
    } else {
      await updateDoc(docRef, { emailSentAt: sentAt || new Date().toISOString() });
    }
  } catch (error) {
    console.error('Failed to update emailSentAt in Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    } catch {
      // ignore
    }
  }

  return updated;
}

/**
 * Resets all certificate dispatch statuses back to pending.
 */
export async function resetAllEmailStatusesToPending(): Promise<SurveyResponse[]> {
  const current = loadStoredResponses();
  const updated = current.map((r) => {
    const copy = { ...r };
    delete copy.emailSentAt;
    return copy;
  });
  saveResponses(updated);

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { emailSentAt: deleteField() });
    });
    await batch.commit();
  } catch (error) {
    console.error('Failed to reset email statuses in Firestore:', error);
  }

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
