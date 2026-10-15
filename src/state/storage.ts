export const STORAGE_KEY = "acbj-survey-navigator-v1";

export type PersistedSurveyState = {
  version: 1;
  answers: Record<string, unknown>;
  currentQuestionId: string;
  screen: "survey" | "review" | "complete";
};

export type LoadResult = { state: PersistedSurveyState | null; error?: string };

export function loadSurveyState(): LoadResult {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: null };
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("answers" in parsed) ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null ||
      !("currentQuestionId" in parsed) ||
      typeof parsed.currentQuestionId !== "string" ||
      !("screen" in parsed) ||
      !["survey", "review", "complete"].includes(String(parsed.screen))
    ) {
      return { state: null, error: "Saved prototype progress could not be read. Start a new survey." };
    }
    return { state: parsed as PersistedSurveyState };
  } catch {
    return { state: null, error: "Saved prototype progress is unavailable in this browser." };
  }
}

export function saveSurveyState(state: PersistedSurveyState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetSurveyState() {
  window.localStorage.removeItem(STORAGE_KEY);
}
