export type SurveyView = "welcome" | "survey";

export type SurveyNavigationState = {
  view: SurveyView;
  activeSectionIndex: number;
};
