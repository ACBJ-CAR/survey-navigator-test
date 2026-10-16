import { useEffect, useMemo, useState } from "react";
import {
  childrenOf,
  globalIndustryChoices,
  INDUSTRY_TAXONOMY_VERSION,
  industryTaxonomy,
  NAICS_VINTAGE,
  naicsCrosswalk,
  nodeById,
  reportingScopeLabels,
  searchIndustryMatches,
  toggleSecondarySelection,
  type IndustryClassification as Classification,
  type IndustrySelection,
  type ReportingScope,
} from "../config/industry";

type Props = {
  answers: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  onContinue: (updatedAnswers?: Record<string, unknown>) => void;
  onPrevious: () => void;
  onReturnToReview?: () => void;
  firstQuestion: boolean;
};

const emitAnalytics = (event: string, properties: Record<string, string | number | boolean> = {}) => {
  window.dispatchEvent(new CustomEvent("survey-analytics", { detail: { event, ...properties } }));
};

function emptyClassification(scope: ReportingScope = "companywide"): Classification {
  return {
    classificationId: crypto.randomUUID(),
    reportingScope: scope,
    taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
    primary: null,
    secondary: [],
    status: "respondent_selected",
    source: "respondent",
    otherDescription: "",
    uncertaintyNote: "",
    naicsVintage: NAICS_VINTAGE,
    naicsCandidates: [],
    activeModuleIds: [],
    manualReviewItems: [],
    history: [],
  };
}

function historySnapshot(
  classification: Classification,
  status: Classification["status"] = classification.status,
) {
  return {
    classificationId: classification.classificationId,
    reportingScope: classification.reportingScope,
    taxonomyVersion: classification.taxonomyVersion,
    primary: classification.primary,
    secondary: classification.secondary,
    status,
    source: classification.source,
    otherDescription: classification.otherDescription,
    uncertaintyNote: classification.uncertaintyNote,
  };
}

export function IndustryClassification({
  answers,
  onChange,
  onContinue,
  onPrevious,
  onReturnToReview,
  firstQuestion,
}: Props) {
  const classification = answers.industryClassification as Classification | undefined;
  const phase = typeof answers.industryPhase === "string" ? answers.industryPhase : undefined;
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const results = useMemo(() => searchIndustryMatches(query), [query]);
  const selectedPrimary = classification?.primary;
  const selectedIndustry = nodeById(selectedPrimary?.industryId);
  const broadOptions = childrenOf(selectedPrimary?.broadIndustryId ?? "");
  const specialties = selectedIndustry ? childrenOf(selectedIndustry.id) : [];
  const secondaryIndustryIds = new Set(
    (classification?.secondary ?? []).flatMap((selection) => selection.industryId ? [selection.industryId] : []),
  );

  useEffect(() => {
    emitAnalytics("classification_started");
  }, []);

  useEffect(() => {
    if (!query.trim()) return;
    const timeout = window.setTimeout(() => {
      emitAnalytics("search_performed", { hasResults: results.length > 0 });
      if (results.length === 0) emitAnalytics("search_no_results");
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query, results.length]);

  function setPhase(next: string) {
    onChange("industryPhase", next);
  }

  function saveClassification(next: Classification, legacyIndustry?: string) {
    onChange("industryClassification", next);
    onChange("industryClassificationStatus", next.status);
    if (legacyIndustry !== undefined) onChange("industry", legacyIndustry);
  }

  function beginSelection(selection: IndustrySelection, status?: Classification["status"]) {
    const current = classification ?? emptyClassification();
    const selectionStatus = status ?? (answers.classificationWasUpdated === true || current.status === "respondent_updated"
      ? "respondent_updated"
      : "respondent_selected");
    const selectedCandidates = naicsCrosswalk.filter((candidate) =>
      candidate.industryId === selection.industryId &&
      (!selection.specialtyIds.length || !candidate.specialtyId || selection.specialtyIds.includes(candidate.specialtyId)),
    );
    const changed = current.primary?.industryId !== selection.industryId ||
      current.primary?.broadIndustryId !== selection.broadIndustryId;
    const hasPreviousClassification = Boolean(
      current.primary?.industryId ||
      current.secondary.length ||
      current.otherDescription ||
      current.status === "unsure_manual_review",
    );
    const history = changed && hasPreviousClassification
      ? [...current.history, historySnapshot(current)]
      : current.history;
    saveClassification({
      ...current,
      classificationId: changed ? crypto.randomUUID() : current.classificationId,
      primary: selection,
      history,
      secondary: current.secondary.filter((item) => item.industryId !== selection.industryId),
      otherDescription: "",
      status: selectionStatus,
      source: "respondent",
      naicsCandidates: selectedCandidates,
      manualReviewItems: [],
    }, selection.industryId === "industry.accounting" ? "accounting" : "classified");
    onChange("industryDescription", "");
    setError("");
    const specialtyNodes = selection.industryId ? childrenOf(selection.industryId) : [];
    setPhase(specialtyNodes.length > 0 ? "specialty" : "secondary");
  }

  function addSecondary(industryId: string) {
    const current = classification ?? emptyClassification();
    const result = toggleSecondarySelection(current.primary, current.secondary, industryId);
    if (result.change === "unchanged") return;
    saveClassification({ ...current, secondary: result.selections });
    emitAnalytics(result.change === "added" ? "secondary_industry_added" : "secondary_industry_removed", {
      count: result.selections.length,
    });
  }

  function setSecondarySpecialty(industryId: string, specialtyId: string) {
    const current = classification ?? emptyClassification();
    saveClassification({
      ...current,
      secondary: current.secondary.map((selection) => selection.industryId === industryId
        ? {
            ...selection,
          specialtyIds: !specialtyId
            ? []
            : selection.specialtyIds.includes(specialtyId)
              ? selection.specialtyIds.filter((id) => id !== specialtyId)
              : [...selection.specialtyIds, specialtyId],
          }
        : selection),
    });
  }

  function setPrimarySpecialty(specialtyId: string) {
    if (!selectedPrimary) return;
    const selectedIds = selectedIndustry?.selectionMode === "multi"
      ? selectedPrimary.specialtyIds.includes(specialtyId)
        ? selectedPrimary.specialtyIds.filter((id) => id !== specialtyId)
        : [...selectedPrimary.specialtyIds, specialtyId]
      : [specialtyId];
    saveClassification({
      ...(classification ?? emptyClassification()),
      primary: { ...selectedPrimary, specialtyIds: selectedIds },
      naicsCandidates: naicsCrosswalk.filter((candidate) =>
        candidate.industryId === selectedPrimary.industryId &&
        (!candidate.specialtyId || !selectedIds.length || selectedIds.includes(candidate.specialtyId)),
      ),
    });
  }

  function finishClassification(classificationOverride?: Classification) {
    if (!classification?.primary && classification?.status !== "other_unmapped" && classification?.status !== "unsure_manual_review") {
      setError("Choose an industry, describe another business, or select “I’m not sure.”");
      return;
    }
    const next = classificationOverride ?? classification ?? emptyClassification();
    if (selectedIndustry?.specialtyRequired && !selectedPrimary?.specialtyIds.length) {
      setError("Please choose a specialty to continue.");
      setPhase("specialty");
      return;
    }
    if (next.secondary.some((selection) =>
      Boolean(nodeById(selection.industryId)?.specialtyRequired) && selection.specialtyIds.length === 0,
    )) {
      setError("Please choose a specialty for each required secondary industry.");
      return;
    }
    const completed = {
      ...next,
      status: next.status === "other_unmapped" || next.status === "unsure_manual_review"
        ? next.status
        : answers.classificationWasUpdated === true || next.status === "respondent_updated"
          ? "respondent_updated"
          : "respondent_selected",
      manualReviewItems: next.status === "other_unmapped"
        ? ["industry.other_unmapped"]
        : next.status === "unsure_manual_review" ? ["industry.unsure_manual_review"] : [],
    } satisfies Classification;
    saveClassification(completed);
    onChange("classificationWasUpdated", false);
    emitAnalytics("classification_completed", { status: completed.status });
    onContinue({
      industryClassification: completed,
      industryClassificationStatus: completed.status,
      industry: completed.primary?.industryId === "industry.accounting"
        ? "accounting"
        : completed.status === "other_unmapped" ? "other"
          : completed.status === "unsure_manual_review" ? "unsure" : "classified",
      classificationWasUpdated: false,
    });
  }

  function selectBroad(broadId: string) {
    const current = classification ?? emptyClassification();
    if (current.primary?.broadIndustryId === broadId && current.primary.industryId) {
      setPhase("industry");
      return;
    }
    const changed = current.primary?.broadIndustryId !== broadId || !current.primary?.industryId;
    const hasPreviousClassification = Boolean(current.primary?.industryId || current.otherDescription || current.status === "unsure_manual_review");
    const history = changed && hasPreviousClassification
      ? [...current.history, historySnapshot(current)]
      : current.history;
    saveClassification({
      ...current,
      classificationId: current.primary?.broadIndustryId === broadId ? current.classificationId : crypto.randomUUID(),
      primary: { broadIndustryId: broadId, industryId: null, specialtyIds: [] },
      history,
      naicsCandidates: [],
      status: answers.classificationWasUpdated === true || current.status === "respondent_updated"
        ? "respondent_updated"
        : "respondent_selected",
    }, "");
    emitAnalytics("category_browsed");
    setPhase("industry");
  }

  function chooseOther(broadIndustryId: string | null) {
    const current = classification ?? emptyClassification();
    const hasPreviousClassification = Boolean(current.primary?.industryId || current.otherDescription || current.status === "unsure_manual_review");
    const history = hasPreviousClassification
      ? [...current.history, historySnapshot(current)]
      : current.history;
    saveClassification({
      ...current,
      primary: broadIndustryId ? { broadIndustryId, industryId: null, specialtyIds: [] } : null,
      secondary: [],
      otherDescription: "",
      history,
      classificationId: crypto.randomUUID(),
      status: "other_unmapped",
      source: "respondent",
      activeModuleIds: [],
      naicsCandidates: [],
      manualReviewItems: ["industry.other_unmapped"],
    }, "other");
    emitAnalytics(broadIndustryId ? "other_selected" : "something_else_selected");
    setError("");
    setPhase("other");
    onChange("industryDescription", "");
  }

  function chooseUnsure() {
    const current = classification ?? emptyClassification();
    const hasPreviousClassification = Boolean(current.primary?.industryId || current.secondary.length || current.otherDescription);
    const history = hasPreviousClassification
      ? [...current.history, historySnapshot(current, "prior_unconfirmed")]
      : current.history;
    saveClassification({
      ...current,
      primary: null,
      secondary: [],
      otherDescription: "",
      uncertaintyNote: "",
      status: "unsure_manual_review",
      source: "respondent",
      activeModuleIds: [],
      naicsCandidates: [],
      history,
      manualReviewItems: ["industry.unsure_manual_review"],
    }, "unsure");
    onChange("classificationWasUpdated", false);
    emitAnalytics("unsure_selected");
    setPhase("unsure");
    onChange("industryDescription", "");
  }

  function submitDescription() {
    const description = String(answers.industryDescription ?? "").trim();
    if (description.length < 3) {
      setError("Please add a few words describing what your company does.");
      return;
    }
    const current = classification ?? emptyClassification();
    const completed = { ...current, otherDescription: description, status: "other_unmapped" as const, activeModuleIds: [], manualReviewItems: ["industry.other_unmapped"] };
    saveClassification(completed, "other");
    setError("");
    finishClassification(completed);
  }

  function goBack() {
    if (phase === "industry") setPhase("browse");
    else if (phase === "specialty") setPhase("industry");
    else if (phase === "secondary" || phase === "secondary-select") setPhase(specialties.length ? "specialty" : "industry");
    else if (phase === "other" || phase === "unsure") setPhase(selectedPrimary?.broadIndustryId ? "industry" : "browse");
    else onPrevious();
  }

  function confirmPrior() {
    if (!classification) return;
    const confirmed = { ...classification, status: "respondent_confirmed" as const, source: "respondent" as const, confirmedAt: new Date().toISOString() };
    saveClassification(confirmed,
      classification.primary?.industryId === "industry.accounting" ? "accounting" : "classified");
    emitAnalytics("prior_classification_confirmed");
    onContinue({
      industryClassification: confirmed,
      industryClassificationStatus: confirmed.status,
      industry: confirmed.primary?.industryId === "industry.accounting" ? "accounting" : "classified",
    });
  }

  function updatePrior() {
    if (!classification) return;
    const history = [...classification.history, historySnapshot(classification, "prior_unconfirmed")];
    saveClassification({ ...classification, primary: null, secondary: [], status: "respondent_updated", history, otherDescription: "", naicsCandidates: [], manualReviewItems: [] }, "");
    onChange("classificationWasUpdated", true);
    emitAnalytics("prior_classification_rejected");
    setPhase("browse");
  }

  const priorUnconfirmed = classification?.status === "prior_unconfirmed" && phase !== "browse" && phase !== "industry" && phase !== "specialty" && phase !== "secondary" && phase !== "secondary-select";

  return (
    <section className="question-card question-flow-card industry-classification" aria-labelledby="question-title">
      <p className="eyebrow">Your industry</p>
      {priorUnconfirmed ? (
        <>
          <h1 id="question-title">We have a previous industry classification. Is it still right?</h1>
          <p className="question-intro">This information is not confirmed unless you choose to confirm it.</p>
          <p className="prior-value-note">{nodeById(classification?.primary?.industryId)?.respondentLabel ?? "Prior classification"}</p>
          <div className="industry-actions">
            <button className="button button-primary" onClick={confirmPrior}>Yes, confirm it</button>
            <button className="button button-secondary" onClick={updatePrior}>Update it</button>
            <button className="text-button" onClick={chooseUnsure}>I’m not sure</button>
          </div>
          <nav className="step-navigation" aria-label="Industry classification navigation">
            <button className="button button-secondary" disabled={firstQuestion} onClick={onPrevious}><span aria-hidden="true">←</span>Previous</button>
            {onReturnToReview && <button className="text-button" onClick={onReturnToReview}>Return to review</button>}
          </nav>
        </>
      ) : (
        <>
          <h1 id="question-title" aria-live="polite">
            {phase === "industry" ? "Which industry best describes your main business?" :
              phase === "specialty" ? `What kind of ${selectedIndustry?.respondentLabel.toLocaleLowerCase()} business is it?` :
                phase === "secondary" ? "Does your company have another significant line of business?" :
                  phase === "secondary-select" ? "Which other industries are significant for your company?" :
                    phase === "other" ? "How would you describe your company’s main business activity?" :
                      phase === "unsure" ? "That’s okay. What does the company make, sell or do?" :
                        "What does your company do?"}
          </h1>
          {phase !== "other" && phase !== "unsure" && (
            <>
              <p className="question-intro">
                Classify what the company does, not the industries its customers represent.
              </p>
              <p className="field-help">Reporting scope: {reportingScopeLabels[classification?.reportingScope ?? "companywide"]}. Choose the level this survey covers: local operation, companywide, or a specific establishment.</p>
              <fieldset className="industry-scope">
                <legend className="answer-label">What does this response cover?</legend>
                {(Object.entries(reportingScopeLabels) as [ReportingScope, string][]).map(([value, label]) => (
                  <label className="choice-option" key={value}>
                    <input
                      type="radio"
                      name="industry-reporting-scope"
                      checked={(classification?.reportingScope ?? "companywide") === value}
                      onChange={() => saveClassification({ ...(classification ?? emptyClassification(value)), reportingScope: value })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
            </>
          )}

          {(phase === undefined || phase === "browse") && (
            <>
              <label className="answer-label" htmlFor="industry-search">Search by industry, specialty or common term</label>
              <input
                id="industry-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="For example, bookkeeping or warehouse"
              />
              {query.trim() && (
                <div className="industry-option-list" aria-label="Industry search results">
                  {results.map((match) => (
                    <button className="industry-option" key={`${match.industry.id}-${match.specialty?.id ?? "industry"}`} onClick={() => beginSelection({
                      broadIndustryId: match.industry.parentId,
                      industryId: match.industry.id,
                      specialtyIds: match.specialty ? [match.specialty.id] : [],
                    })}>{match.respondentLabel}</button>
                  ))}
                  {!results.length && <p role="status">No matching industries. Try another term or browse below.</p>}
                </div>
              )}
              <h2 className="industry-subheading">Browse by broad industry</h2>
              <div className="industry-option-list">
                {industryTaxonomy.filter((node) => node.level === "broad" && node.status === "active").map((node) => (
                  <button className="industry-option" key={node.id} onClick={() => selectBroad(node.id)}>{node.respondentLabel}</button>
                ))}
              </div>
              <div className="industry-actions">
                {globalIndustryChoices.map((choice) => (
                  <button
                    className={choice.action === "other" ? "button button-secondary" : "text-button"}
                    key={choice.action}
                    onClick={() => choice.action === "other" ? chooseOther(null) : chooseUnsure()}
                  >{choice.respondentLabel}</button>
                ))}
              </div>
              <nav className="step-navigation" aria-label="Industry classification navigation">
                <button className="button button-secondary" disabled={firstQuestion} onClick={onPrevious}><span aria-hidden="true">←</span>Previous</button>
                {onReturnToReview && <button className="text-button" onClick={onReturnToReview}>Return to review</button>}
              </nav>
            </>
          )}

          {phase === "industry" && (
            <div className="industry-option-list">
              {broadOptions.map((node) => (
                <button className="industry-option" key={node.id} onClick={() => beginSelection({
                  broadIndustryId: selectedPrimary?.broadIndustryId ?? null,
                  industryId: node.id,
                  specialtyIds: [],
                })}>{node.respondentLabel}</button>
              ))}
              {nodeById(selectedPrimary?.broadIndustryId)?.allowOtherBusiness && (
                <button className="industry-option industry-option-other" onClick={() => chooseOther(selectedPrimary?.broadIndustryId ?? null)}>
                  {nodeById(selectedPrimary?.broadIndustryId)?.otherOptionLabel}
                </button>
              )}
            </div>
          )}

          {phase === "specialty" && (
            <fieldset className="industry-option-list">
              <legend className="answer-label">
                {selectedIndustry?.selectionMode === "multi"
                  ? "Choose all specialties that fit, or skip if none fits"
                  : "Choose the closest specialty, or skip if none fits"}
              </legend>
              {specialties.map((node) => (
                <label className="choice-option" key={node.id}>
                  <input
                    type={selectedIndustry?.selectionMode === "multi" ? "checkbox" : "radio"}
                    name={selectedIndustry?.selectionMode === "multi" ? undefined : "industry-specialty"}
                    checked={selectedPrimary?.specialtyIds.includes(node.id) ?? false}
                    onChange={() => setPrimarySpecialty(node.id)}
                  />
                  <span>{node.respondentLabel}</span>
                </label>
              ))}
              <p className="field-help">Choose services your company provides only when asked by a module. This is about your own business, not customers you serve.</p>
            </fieldset>
          )}

          {phase === "secondary" && (
            <fieldset className="industry-option-list">
              <legend className="answer-label">Choose one</legend>
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "unsure", label: "I’m not sure" },
              ].map((option) => (
                <label className="choice-option" key={option.value}>
                  <input type="radio" name="has-secondary-industry" checked={answers.hasSecondaryIndustry === option.value} onChange={() => onChange("hasSecondaryIndustry", option.value)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
          )}

          {phase === "secondary-select" && (
            <>
              <label className="answer-label" htmlFor="secondary-industry-search">Search additional industries</label>
              <input id="secondary-industry-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search industry names" />
              <div className="industry-option-list">
                {industryTaxonomy.filter((node) => node.level === "industry" && node.status === "active" && node.id !== selectedPrimary?.industryId)
                  .filter((node) => !query.trim() || [node.respondentLabel, ...node.synonyms].some((term) => term.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())))
                  .map((node) => {
                    const selection = classification?.secondary.find((item) => item.industryId === node.id);
                    const secondarySpecialties = childrenOf(node.id);
                    return (
                      <div className="secondary-industry-option" key={node.id}>
                        <label className="choice-option">
                          <input type="checkbox" checked={secondaryIndustryIds.has(node.id)} onChange={() => addSecondary(node.id)} />
                          <span>{node.respondentLabel}</span>
                        </label>
                        {selection && secondarySpecialties.length > 0 && (
                          <fieldset className="secondary-specialties">
                            <legend className="answer-label">{node.specialtyRequired ? "Choose a specialty (required)" : "Choose a specialty (optional)"}</legend>
                            {!node.specialtyRequired && (
                              <label className="choice-option">
                                <input type="radio" name={`secondary-specialty-${node.id}`} checked={selection.specialtyIds.length === 0} onChange={() => setSecondarySpecialty(node.id, "")} />
                                <span>No specialty</span>
                              </label>
                            )}
                            {secondarySpecialties.map((specialty) => (
                              <label className="choice-option" key={specialty.id}>
                                <input
                                  type={node.selectionMode === "multi" ? "checkbox" : "radio"}
                                  name={node.selectionMode === "multi" ? undefined : `secondary-specialty-${node.id}`}
                                  checked={selection.specialtyIds.includes(specialty.id)}
                                  onChange={() => setSecondarySpecialty(node.id, specialty.id)}
                                />
                                <span>{specialty.respondentLabel}</span>
                              </label>
                            ))}
                          </fieldset>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {(phase === "other" || phase === "unsure") && (
            <div className="answer-field">
              <label className="answer-label" htmlFor="industry-description">
                {phase === "other" ? "Describe what your company mainly makes, sells or does" : "In a few words, what does the company make, sell or do? (optional)"}
              </label>
              <textarea
                id="industry-description"
                rows={4}
                value={String(phase === "unsure" ? classification?.uncertaintyNote ?? "" : answers.industryDescription ?? "")}
                onChange={(event) => {
                  if (phase === "unsure") {
                    const current = classification ?? emptyClassification();
                    saveClassification({ ...current, uncertaintyNote: event.target.value });
                  } else onChange("industryDescription", event.target.value);
                  setError("");
                }}
              />
            </div>
          )}

          {error && <p className="field-error" role="alert">{error}</p>}
          <nav className="step-navigation" aria-label="Industry classification navigation">
            <button className="button button-secondary" disabled={firstQuestion} onClick={goBack}><span aria-hidden="true">←</span>Previous</button>
            <div className="question-nav-actions">
              {onReturnToReview && <button className="text-button" onClick={onReturnToReview}>Return to review</button>}
              {phase === "other" ? (
                <button className="button button-primary" onClick={submitDescription}>Continue<span aria-hidden="true">→</span></button>
              ) : phase === "unsure" ? (
                <button className="button button-primary" onClick={() => finishClassification()}>Continue<span aria-hidden="true">→</span></button>
              ) : phase === "specialty" ? (
                <button className="button button-primary" onClick={() => {
                  if (selectedIndustry?.specialtyRequired && !selectedPrimary?.specialtyIds.length) {
                    setError("Please choose a specialty to continue.");
                    return;
                  }
                  setError("");
                  setPhase("secondary");
                }}>Continue<span aria-hidden="true">→</span></button>
              ) : phase === "secondary" ? (
                <button
                  className="button button-primary"
                  onClick={() => answers.hasSecondaryIndustry === "yes"
                    ? setPhase("secondary-select")
                    : finishClassification()}
                >Continue<span aria-hidden="true">→</span></button>
              ) : phase === "secondary-select" ? (
                <button className="button button-primary" onClick={() => finishClassification()}>Continue<span aria-hidden="true">→</span></button>
              ) : phase === "industry" ? (
                <button className="button button-primary" disabled={!selectedIndustry} onClick={() => specialties.length ? setPhase("specialty") : setPhase("secondary")}>Continue<span aria-hidden="true">→</span></button>
              ) : phase === "browse" || phase === undefined ? null : null}
            </div>
          </nav>
        </>
      )}
    </section>
  );
}
