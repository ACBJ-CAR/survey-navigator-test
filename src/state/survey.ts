export type SurveyView = "welcome" | "survey" | "review" | "complete";

export type ResponseStatus =
  | "known"
  | "confirmed"
  | "updated"
  | "new"
  | "missing"
  | "declined";

export type SurveyResponse = {
  value: unknown;
  status: ResponseStatus;
  priorValue?: unknown;
  priorValuePeriod?: string;
};

export type SurveyNavigationState = {
  view: SurveyView;
  currentQuestionId: string;
  answers: Record<string, SurveyResponse>;
};
