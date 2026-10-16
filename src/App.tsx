import { useEffect, useMemo, useState } from "react";
import { QuestionCard } from "./components/QuestionCard";
import { IndustryClassification } from "./components/IndustryClassification";
import { sections, surveyQuestions, evaluateCondition, getConfigurationDiagnostics, getEditorialPayload, getVisibleQuestions, buildSubmissionPayload, type SectionId, type SurveyQuestion } from "./config/survey";
import { getIndustryModulePlan, INDUSTRY_TAXONOMY_VERSION, naicsMappingReviewQueue, NAICS_VINTAGE, nodeById, reportingScopeLabels, validateIndustryConfiguration, type IndustryClassification as IndustryClassificationState } from "./config/industry";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { BizEstimateCard } from "./components/BizEstimateCard";
import { SectionProgress } from "./components/SectionProgress";
import { loadSurveyState, resetSurveyState, saveSurveyState, type PersistedSurveyState } from "./state/storage";
import { validateQuestion } from "./utils/validation";
import { getDemoEstimate } from "./modules/bizEstimate";

type Screen = "welcome" | "survey" | "review" | "complete";

const returningAnswers: Record<string, unknown> = {
  respondentType: "returning",
  businessName: "Island Pacific Demo Co.",
  nameConfirmation: undefined,
  streetAddress: "425 Ward Avenue",
  city: "Honolulu",
  state: "HI",
  zip: "96814",
  addressConfirmation: undefined,
  mainTelephone: "(808) 555-0142",
  website: "hawaiipacific.example",
  executiveName: "Alex Morgan",
  executiveTitle: "Chief Executive Officer",
  executiveEmail: "alex.morgan@example.com",
  executivePhone: "(808) 555-0122",
  executiveConfirmation: undefined,
  companyEmployees: "114",
  localEmployees: "46",
  employeesConfirmation: undefined,
  annualRevenue: "4200000",
  revenueConfirmation: undefined,
  foundedYear: "1987",
  foundedYearConfirmation: undefined,
  priorOwnershipDescriptor: "Family-owned",
  industryClassification: {
    classificationId: "synthetic-prior-accounting",
    reportingScope: "companywide",
    taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
    primary: { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: [] },
    secondary: [],
    status: "prior_unconfirmed",
    source: "prior_record",
    otherDescription: "",
    uncertaintyNote: "",
    naicsVintage: NAICS_VINTAGE,
    naicsCandidates: [],
    activeModuleIds: [],
    manualReviewItems: [],
    history: [],
  } satisfies IndustryClassificationState,
  industryClassificationStatus: "prior_unconfirmed",
};

const reviewGroups: { title: string; modules: string[] }[] = [
  { title: "Company", modules: ["company"] },
  { title: "Leadership", modules: ["leadership"] },
  { title: "Business details", modules: ["business-details"] },
  { title: "Ownership", modules: ["ownership"] },
  { title: "Industry", modules: ["industry-identification"] },
  { title: "Industry details", modules: ["accounting"] },
  { title: "Business outlook", modules: ["business-outlook"] },
  { title: "Contacts", modules: ["contacts"] },
  { title: "Optional editorial responses", modules: ["editorial"] },
];

const questionGroup: Record<string, string> = {
  "business-name": "company",
  "existing-business-name": "company",
  "existing-address": "company",
  "business-address": "company",
  "company-contact": "company",
  executive: "leadership",
  "existing-executive": "leadership",
  footprint: "business-details",
  offices: "business-details",
  "office-locations": "business-details",
  "company-size": "business-details",
  "existing-employees": "business-details",
  "financial-profile": "business-details",
  "existing-revenue": "business-details",
  "founded-year": "business-details",
  "existing-year-founded": "business-details",
  "local-started-same-year": "business-details",
  "local-founded-year": "business-details",
};

function getQuestionGroup(question: SurveyQuestion) {
  return questionGroup[question.questionId] ?? question.moduleId;
}

function fieldHasAnswer(value: unknown) {
  return value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0);
}

function formatValue(value: unknown, type: string) {
  if (Array.isArray(value)) return value.join(", ");
  if (type === "currency" && value !== "" && value !== undefined) {
    const amount = Number(value);
    return Number.isFinite(amount)
      ? amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      : String(value);
  }
  return String(value);
}

function hasCompleteIndustryClassification(classification: IndustryClassificationState | undefined) {
  if (!classification) return false;
  if (classification.status === "unsure_manual_review") return true;
  if (classification.status === "other_unmapped") return classification.otherDescription.trim().length >= 3;
  const completedStatuses = ["respondent_confirmed", "respondent_updated", "respondent_selected", "researcher_verified"];
  if (!completedStatuses.includes(classification.status) || !classification.primary?.industryId) return false;
  const industry = nodeById(classification.primary.industryId);
  return !industry?.specialtyRequired || classification.primary.specialtyIds.length > 0;
}

export default function App() {
  const [savedLoad] = useState(() => loadSurveyState());
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState("business-name");
  const [editingReview, setEditingReview] = useState(false);
  const [saveStatus, setSaveStatus] = useState(savedLoad.state ? "Progress saved" : "Ready");
  const [saveError, setSaveError] = useState(savedLoad.error ?? "");
  const [hasSavedProgress, setHasSavedProgress] = useState(Boolean(savedLoad.state));
  const [debugPayloadOpen, setDebugPayloadOpen] = useState(false);
  const debugMode =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const modulePlan = useMemo(
    () => getIndustryModulePlan(answers.industryClassification as IndustryClassificationState | undefined),
    [answers.industryClassification],
  );
  const currentQuestionIndex = Math.max(
    visibleQuestions.findIndex((question) => question.questionId === currentQuestionId),
    0,
  );
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const estimate = getDemoEstimate(answers);
  const currentSection: SectionId =
    screen === "review" || screen === "complete"
      ? "review"
      : currentQuestion?.section ?? "company";

  useEffect(() => {
    if (
      screen === "survey" &&
      visibleQuestions.length > 0 &&
      !visibleQuestions.some((question) => question.questionId === currentQuestionId)
    ) {
      setCurrentQuestionId(visibleQuestions[0].questionId);
    }
  }, [currentQuestionId, screen, visibleQuestions]);

  useEffect(() => {
    if (screen === "welcome") return;
    setSaveStatus("Saving…");
    setSaveError("");
    const timeout = window.setTimeout(() => {
      try {
        saveSurveyState({
          version: 1,
          answers,
          currentQuestionId,
          screen: screen as PersistedSurveyState["screen"],
        });
        setHasSavedProgress(true);
        setSaveStatus("Progress saved");
      } catch {
        setSaveStatus("Couldn’t save");
        setSaveError("Your progress could not be saved in this browser. You can continue, but it may not be available later.");
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [answers, currentQuestionId, screen]);

  useEffect(() => {
    const previous = (answers.industryClassification as IndustryClassificationState | undefined)?.activeModuleIds ?? [];
    modulePlan.activeModuleIds.forEach((moduleId) => {
      if (!previous.includes(moduleId)) window.dispatchEvent(new CustomEvent("survey-analytics", { detail: { event: "module_loaded", moduleId } }));
    });
    previous.forEach((moduleId) => {
      if (!modulePlan.activeModuleIds.includes(moduleId)) window.dispatchEvent(new CustomEvent("survey-analytics", { detail: { event: "module_unloaded", moduleId } }));
    });
    if (answers.industryClassification && JSON.stringify(previous) !== JSON.stringify(modulePlan.activeModuleIds)) {
      setAnswers((current) => {
        const classification = current.industryClassification as IndustryClassificationState | undefined;
        if (!classification || JSON.stringify(classification.activeModuleIds) === JSON.stringify(modulePlan.activeModuleIds)) return current;
        return { ...current, industryClassification: { ...classification, activeModuleIds: modulePlan.activeModuleIds } };
      });
    }
  }, [answers.industryClassification, modulePlan.activeModuleIds]);

  function beginNewSurvey() {
    setAnswers({ respondentType: "new" });
    setCurrentQuestionId("business-name");
    setEditingReview(false);
    setScreen("survey");
  }

  function beginReturningSurvey() {
    setAnswers({ ...returningAnswers, respondentType: "returning" });
    setCurrentQuestionId("existing-business-name");
    setEditingReview(false);
    setScreen("survey");
  }

  function resumeSurvey() {
    const saved = savedLoad.state;
    if (!saved) {
      beginNewSurvey();
      return;
    }
    setAnswers(saved.answers);
    setCurrentQuestionId(saved.currentQuestionId);
    setScreen(saved.screen);
  }

  function changeAnswer(fieldId: string, value: unknown) {
    setAnswers((current) => {
      const updated = { ...current, [fieldId]: value };
      const updatedConfirmationByField: Record<string, string> = {
        businessName: "nameConfirmation",
        streetAddress: "addressConfirmation",
        city: "addressConfirmation",
        state: "addressConfirmation",
        zip: "addressConfirmation",
        executiveName: "executiveConfirmation",
        executiveTitle: "executiveConfirmation",
        executiveEmail: "executiveConfirmation",
        executivePhone: "executiveConfirmation",
        companyEmployees: "employeesConfirmation",
        annualRevenue: "revenueConfirmation",
        foundedYear: "foundedYearConfirmation",
      };
      const confirmationField = updatedConfirmationByField[fieldId];
      if (confirmationField && updated[confirmationField] === "update") {
        updated[confirmationField] = "updated";
      }
      if (fieldId === "localFoundedSameYear" && value === "yes" && !fieldHasAnswer(current.localFoundedYear)) {
        updated.localFoundedYear = current.foundedYear;
      }
      if (fieldId === "priorOwnershipConfirmation") {
        if (value === "confirmed") updated.ownershipDescriptions = ["Family-owned"];
        if (value === "removed") updated.ownershipDescriptions = [];
        if (value === "declined") updated.ownershipDescriptions = ["declined"];
      }
      if (
        fieldId === "ownershipDescriptions" &&
        fieldHasAnswer(current.priorOwnershipDescriptor)
      ) {
        updated.priorOwnershipConfirmation = "updated";
      }
      return updated;
    });
  }

  function navigateToQuestion(question: SurveyQuestion, fromReview = false) {
    setCurrentQuestionId(question.questionId);
    setEditingReview(fromReview);
    setScreen("survey");
  }

  function continueQuestion(updatedAnswers?: Record<string, unknown>) {
    if (editingReview) {
      setEditingReview(false);
      setScreen("review");
      return;
    }
    const activeQuestions = getVisibleQuestions(updatedAnswers ? { ...answers, ...updatedAnswers } : answers);
    const activeIndex = activeQuestions.findIndex((question) => question.questionId === currentQuestionId);
    const next = activeQuestions[activeIndex + 1];
    if (next) {
      setCurrentQuestionId(next.questionId);
      return;
    }
    setScreen("review");
  }

  function previousQuestion() {
    if (editingReview) {
      setEditingReview(false);
      setScreen("review");
      return;
    }
    const previous = visibleQuestions[currentQuestionIndex - 1];
    if (previous) setCurrentQuestionId(previous.questionId);
  }

  function submitSurvey() {
    const firstIncomplete = visibleQuestions.find((question) =>
      Object.keys(validateQuestion(question, answers)).length > 0,
    );
    if (firstIncomplete) {
      navigateToQuestion(firstIncomplete);
      return;
    }
    const classification = answers.industryClassification as IndustryClassificationState | undefined;
    if (!hasCompleteIndustryClassification(classification)) {
      const industryQuestion = visibleQuestions.find((question) => question.questionId === "industry");
      if (industryQuestion) navigateToQuestion(industryQuestion);
      return;
    }
    setScreen("complete");
  }

  function resetPrototype() {
    resetSurveyState();
    setAnswers({});
    setCurrentQuestionId("business-name");
    setEditingReview(false);
    setScreen("welcome");
    setSaveStatus("Ready");
    setSaveError("");
    setHasSavedProgress(false);
  }

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        onStart={beginNewSurvey}
        onResume={resumeSurvey}
        onStartReturning={beginReturningSurvey}
        hasSavedProgress={hasSavedProgress}
      />
    );
  }

  if (screen === "complete") {
    return (
      <div className="survey-page">
        <header className="site-header survey-header">
          <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="ACBJ Survey Navigator home">
            <span className="wordmark-mark" aria-hidden="true">A</span><span>ACBJ</span>
          </a>
          <span className="header-product-name">Survey Navigator</span>
          <span className={`save-status${saveError ? " save-status-error" : ""}`} role="status">
            <span className="save-status-dot" aria-hidden="true" />{saveStatus}
          </span>
        </header>
        <main className="completion-content">
          <div className="completion-check" aria-hidden="true">✓</div>
          <p className="eyebrow">Survey complete</p>
          <h1>Thank you for sharing your business story.</h1>
          <p>Your responses are complete in this prototype. No information is sent to a production service.</p>
          {saveError && <p className="save-error-message" role="alert">{saveError}</p>}
          <BizEstimateCard estimate={estimate} />
          <button className="button button-secondary" onClick={() => setScreen("review")}>Review your answers</button>
          {debugMode && <DebugPayload
            answers={answers}
            open={debugPayloadOpen}
            onToggle={() => setDebugPayloadOpen((value) => !value)}
            currentQuestion={currentQuestion}
            visibleQuestions={visibleQuestions}
            position={`${currentQuestionIndex + 1} of ${visibleQuestions.length}`}
            saveStatus={saveStatus}
          />}
        </main>
      </div>
    );
  }

  return (
    <div className="survey-page">
      <header className="site-header survey-header">
        <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="ACBJ Survey Navigator home">
          <span className="wordmark-mark" aria-hidden="true">A</span><span>ACBJ</span>
        </a>
        <span className="header-product-name">Survey Navigator</span>
        <span className={`save-status${saveError ? " save-status-error" : ""}`} role="status">
          <span className="save-status-dot" aria-hidden="true" />
          {saveStatus}
        </span>
      </header>

      <div className="survey-layout">
        <aside className="survey-sidebar" aria-label="Survey overview">
          <div className="sidebar-section">
            <p className="sidebar-heading">YOUR PROGRESS</p>
            <SectionProgress activeSection={currentSection} onSelect={(section) => {
              const first = visibleQuestions.find((question) => question.section === section);
              if (first) navigateToQuestion(first);
              else if (section === "review") setScreen("review");
            }} />
          </div>
          <div className="sidebar-estimate"><BizEstimateCard estimate={estimate} /></div>
          <p className="sidebar-footnote">Your answers help us build a clearer picture of your business.</p>
        </aside>

        <main className="survey-main">
          {saveError && <p className="save-error-message" role="alert">{saveError}</p>}
          {screen === "survey" && currentQuestion && (
            <div className="question-flow-wrap">
              <p className="question-counter">One step at a time</p>
              {currentQuestion.questionId === "industry" ? (
                <IndustryClassification
                  key={currentQuestion.questionId}
                  answers={answers}
                  onChange={(fieldId, value) => {
                    changeAnswer(fieldId, value);
                    if (fieldId === "industryClassification" && typeof value === "object" && value !== null && "status" in value) {
                      changeAnswer("industryClassificationStatus", value.status);
                    }
                  }}
                  onContinue={continueQuestion}
                  onPrevious={previousQuestion}
                  onReturnToReview={editingReview ? () => { setEditingReview(false); setScreen("review"); } : undefined}
                  firstQuestion={currentQuestionIndex === 0}
                />
              ) : (
                <QuestionCard
                  key={currentQuestion.questionId}
                  question={currentQuestion}
                  answers={answers}
                  onChange={changeAnswer}
                  onContinue={continueQuestion}
                  onPrevious={previousQuestion}
                  onReturnToReview={editingReview ? () => { setEditingReview(false); setScreen("review"); } : undefined}
                  firstQuestion={currentQuestionIndex === 0}
                  lastQuestion={currentQuestionIndex === visibleQuestions.length - 1}
                />
              )}
              <p className="question-index" aria-live="polite">
                {sections.find((section) => section.id === currentQuestion.section)?.label}
              </p>
            </div>
          )}
          {screen === "review" && (
            <ReviewScreen
              answers={answers}
              incompleteSection={
                visibleQuestions.find((question) =>
                  Object.keys(validateQuestion(question, answers)).length > 0,
                )?.section ??
                  (!hasCompleteIndustryClassification(answers.industryClassification as IndustryClassificationState | undefined)
                    ? "industry"
                    : undefined)
              }
              onEdit={(group) => {
                const matching = visibleQuestions.find((question) => getQuestionGroup(question) === group);
                if (matching) {
                  if (group === "industry-identification") window.dispatchEvent(new CustomEvent("survey-analytics", { detail: { event: "classification_edited_from_review" } }));
                  navigateToQuestion(matching, true);
                }
              }}
              onSubmit={submitSurvey}
              onBack={() => {
                setCurrentQuestionId(visibleQuestions.at(-1)?.questionId ?? "business-name");
                setScreen("survey");
              }}
            />
          )}
          {debugMode && (
            <DebugPayload
              answers={answers}
              open={debugPayloadOpen}
              onToggle={() => setDebugPayloadOpen((value) => !value)}
              onReset={resetPrototype}
              currentQuestion={screen === "survey" ? currentQuestion : undefined}
              visibleQuestions={visibleQuestions}
              position={screen === "survey" ? `${currentQuestionIndex + 1} of ${visibleQuestions.length}` : "Review"}
              saveStatus={saveStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ReviewScreen({
  answers,
  incompleteSection,
  onEdit,
  onSubmit,
  onBack,
}: {
  answers: Record<string, unknown>;
  incompleteSection?: Exclude<SectionId, "review">;
  onEdit: (group: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const activeFieldIds = new Set([
    ...Object.keys(buildSubmissionPayload(answers)),
    ...Object.keys(getEditorialPayload(answers)),
  ]);
  const completedGroups = reviewGroups.map((group) => {
    const groupQuestions = surveyQuestions.filter((question) => getQuestionGroup(question) === group.modules[0]);
    const rows = groupQuestions.flatMap((question) =>
      (question.fields ?? []).flatMap((field) => {
        if (!activeFieldIds.has(field.id.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)) || !fieldHasAnswer(answers[field.id])) return [];
        return [{ label: field.label, value: formatValue(answers[field.id], field.type) }];
      }),
    );
    return { ...group, rows };
  }).filter((group) => group.rows.length > 0);
  const classification = answers.industryClassification as IndustryClassificationState | undefined;
  const industryRows: { label: string; value: string }[] = [];
  if (classification) {
    const primary = classification.primary;
    const primaryIndustry = nodeById(primary?.industryId)?.respondentLabel;
    const primaryBroad = nodeById(primary?.broadIndustryId)?.respondentLabel;
    if (primaryIndustry) {
      industryRows.push({
        label: classification.status === "prior_unconfirmed" ? "Previously listed (not confirmed)" : "Primary industry",
        value: primaryIndustry,
      });
    } else if (primaryBroad && classification.status === "other_unmapped") {
      industryRows.push({ label: "Primary industry", value: `Another business in ${primaryBroad}` });
    } else if (classification.status === "unsure_manual_review") {
      industryRows.push({ label: "Primary industry", value: "I’m not sure — needs review" });
    } else if (classification.status === "other_unmapped") {
      industryRows.push({ label: "Primary industry", value: "Something else — needs review" });
    }
    const specialtyLabels = (primary?.specialtyIds ?? []).map((id) => nodeById(id)?.respondentLabel).filter(Boolean);
    if (specialtyLabels.length) industryRows.push({ label: "Specialties", value: specialtyLabels.join(", ") });
    const secondaryLabels = classification.secondary.map((selection) => nodeById(selection.industryId)?.respondentLabel).filter(Boolean);
    if (secondaryLabels.length) industryRows.push({ label: "Secondary industries", value: secondaryLabels.join(", ") });
    if (classification.otherDescription) industryRows.push({ label: "Business description", value: classification.otherDescription });
    else if (classification.status === "other_unmapped" || classification.status === "unsure_manual_review") {
      industryRows.push({ label: "Review status", value: "Needs review" });
    }
    industryRows.push({ label: "Reporting scope", value: reportingScopeLabels[classification.reportingScope] });
    if (classification.status === "prior_unconfirmed") industryRows.push({ label: "Confirmation", value: "Needs confirmation" });
  }

  return (
    <section className="review-card" aria-labelledby="review-title">
      <p className="eyebrow">Almost there</p>
      <h1 id="review-title">Let’s make sure everything looks right.</h1>
      <p className="question-intro">You can edit any section before completing the survey.</p>
      {incompleteSection && (
        <p className="review-required-note" role="alert">
          Please complete the required questions in{" "}
          {sections.find((section) => section.id === incompleteSection)?.label} before submitting.
        </p>
      )}
      <div className="review-sections">
        {industryRows.length > 0 && (
          <section className="review-section">
            <div className="review-section-heading">
              <h2>Industry classification</h2>
              <button className="text-button" onClick={() => onEdit("industry-identification")}>Edit</button>
            </div>
            {industryRows.map((row) => (
              <div className="review-row" key={`industry-${row.label}`}>
                <span>{row.label}</span><strong>{row.value}</strong>
              </div>
            ))}
          </section>
        )}
        {completedGroups.map((group) => (
          <section className="review-section" key={group.title}>
            <div className="review-section-heading">
              <h2>{group.title}</h2>
              <button className="text-button" onClick={() => onEdit(group.modules[0])}>Edit</button>
            </div>
            {group.rows.map((row) => (
              <div className="review-row" key={`${group.title}-${row.label}`}>
                <span>{row.label}</span><strong>{row.value}</strong>
              </div>
            ))}
          </section>
        ))}
      </div>
      <div className="step-navigation">
        <button className="button button-secondary" onClick={onBack}><span aria-hidden="true">←</span>Previous</button>
        <button className="button button-primary" onClick={onSubmit}>Submit survey<span aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}

function DebugPayload({
  answers,
  open,
  onToggle,
  onReset,
  currentQuestion,
  visibleQuestions,
  position,
  saveStatus,
}: {
  answers: Record<string, unknown>;
  open: boolean;
  onToggle: () => void;
  onReset?: () => void;
  currentQuestion?: SurveyQuestion;
  visibleQuestions: SurveyQuestion[];
  position: string;
  saveStatus: string;
}) {
  const researchPayload = buildSubmissionPayload(answers);
  const editorialPayload = getEditorialPayload(answers);
  const taxonomyDiagnostics = validateIndustryConfiguration();
  const includedFieldIds = new Set([
    ...Object.keys(researchPayload),
    ...Object.keys(editorialPayload),
  ]);
  const hiddenAnswers = surveyQuestions.flatMap((question) => {
    if (visibleQuestions.some((visibleQuestion) => visibleQuestion.questionId === question.questionId)) return [];
    return (question.fields ?? [])
      .filter((field) => fieldHasAnswer(answers[field.id]))
      .map((field) => ({
        question: question.questionId,
        field: field.dataFieldId,
        value: answers[field.id],
      }));
  });
  const confirmationFieldFor: Record<string, string> = {
    businessName: "nameConfirmation",
    streetAddress: "addressConfirmation",
    executiveName: "executiveConfirmation",
    companyEmployees: "employeesConfirmation",
    annualRevenue: "revenueConfirmation",
    foundedYear: "foundedYearConfirmation",
    ownershipDescriptions: "priorOwnershipConfirmation",
  };
  const activeModules = [...new Set(visibleQuestions.map((question) => question.moduleId))];

  return (
    <section className="developer-panel" aria-label="Developer tools">
      <button className="text-button" onClick={onToggle}>{open ? "Hide" : "Show"} developer diagnostics</button>
      {open && (
        <div className="developer-details">
          <p><strong>Position:</strong> {position}</p>
          <p><strong>Active modules:</strong> {activeModules.join(", ") || "None"}</p>
          <p><strong>Industry taxonomy:</strong> {INDUSTRY_TAXONOMY_VERSION}</p>
          <p><strong>Reporting scope:</strong> {reportingScopeLabels[(answers.industryClassification as IndustryClassificationState | undefined)?.reportingScope ?? "companywide"]}</p>
          <p><strong>Matched module rules:</strong> {getIndustryModulePlan(answers.industryClassification as IndustryClassificationState | undefined).matchedModuleRules.join(", ") || "None"}</p>
          <p><strong>Inactive modules:</strong> {getIndustryModulePlan(answers.industryClassification as IndustryClassificationState | undefined).inactiveModuleIds.join(", ") || "None"}</p>
          <p><strong>Classification:</strong> {JSON.stringify(answers.industryClassification ?? "Not selected")}</p>
          <p><strong>Classification status/source:</strong> {String((answers.industryClassification as IndustryClassificationState | undefined)?.status ?? "Not selected")} / {String((answers.industryClassification as IndustryClassificationState | undefined)?.source ?? "Not selected")}</p>
          <p><strong>NAICS vintage:</strong> {NAICS_VINTAGE}</p>
          <p><strong>NAICS candidates:</strong> {JSON.stringify((answers.industryClassification as IndustryClassificationState | undefined)?.naicsCandidates ?? [])}</p>
          <p><strong>Draft NAICS mapping queue:</strong> {naicsMappingReviewQueue.length} taxonomy entries awaiting sourced candidates.</p>
          <p><strong>Manual review items:</strong> {JSON.stringify((answers.industryClassification as IndustryClassificationState | undefined)?.manualReviewItems ?? [])}</p>
          <p><strong>Manual review reason:</strong> {(answers.industryClassification as IndustryClassificationState | undefined)?.status === "other_unmapped" ? "Other business description" : (answers.industryClassification as IndustryClassificationState | undefined)?.status === "unsure_manual_review" ? "Respondent is unsure" : "None"}</p>
          <p><strong>Storage adapter:</strong> Browser localStorage (prototype) — {saveStatus}</p>
          <p><strong>BizEstimate adapter:</strong> Synthetic demo fixture — {getDemoEstimate(answers).status}</p>
          <p><strong>Configuration diagnostics:</strong> {getConfigurationDiagnostics().length ? JSON.stringify(getConfigurationDiagnostics()) : "No invalid condition references"}</p>
          <p><strong>Industry taxonomy diagnostics:</strong> {taxonomyDiagnostics.length ? JSON.stringify(taxonomyDiagnostics) : "No taxonomy configuration errors"}</p>
          {currentQuestion ? (
            <dl className="developer-question">
              <dt>Question ID</dt><dd>{currentQuestion.questionId}</dd>
              <dt>Data field ID</dt><dd>{currentQuestion.dataFieldId}</dd>
              <dt>Module</dt><dd>{currentQuestion.moduleId}</dd>
              <dt>Required</dt><dd>{currentQuestion.requiredStatus}</dd>
              <dt>Display condition</dt><dd>{JSON.stringify(currentQuestion.displayCondition ?? "always")}</dd>
              <dt>Why displayed</dt>
              <dd>
                {currentQuestion.displayCondition
                  ? `Configured condition currently evaluates ${evaluateCondition(currentQuestion.displayCondition, answers)}.`
                  : "No display condition; included in the configured flow."}
              </dd>
              <dt>Prior value</dt><dd>{currentQuestion.priorValue ?? "None configured"}</dd>
              <dt>Current response state</dt>
              <dd>
                {JSON.stringify(Object.fromEntries((currentQuestion.fields ?? []).map((field) => [
                  field.id,
                  {
                    value: answers[field.id] ?? null,
                    state: answers[confirmationFieldFor[field.id]] ??
                      (fieldHasAnswer(answers[field.id]) ? "new" : "missing"),
                    includedInPayload: includedFieldIds.has(field.dataFieldId),
                    valuationInput: Boolean(field.valuationInput),
                  },
                ])), null, 2)}
              </dd>
            </dl>
          ) : <p><strong>Current question:</strong> None (review or completion screen).</p>}
          <h3>Hidden stale answers</h3>
          {hiddenAnswers.length ? (
            <pre>{JSON.stringify(hiddenAnswers, null, 2)}</pre>
          ) : <p>None</p>}
          <h3>Generated submission payload</h3>
          <pre>{JSON.stringify({ research: researchPayload, editorial: editorialPayload }, null, 2)}</pre>
        </div>
      )}
      {onReset && <button className="text-button developer-reset" onClick={onReset}>Reset prototype data</button>}
    </section>
  );
}
