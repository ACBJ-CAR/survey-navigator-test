import { useState } from "react";
import type { QuestionField, SurveyQuestion } from "../config/survey";
import { normalizeExclusiveSelection } from "../config/survey";
import { validateQuestion } from "../utils/validation";

type QuestionCardProps = {
  question: SurveyQuestion;
  answers: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  onContinue: () => void;
  onPrevious: () => void;
  onReturnToReview?: () => void;
  firstQuestion: boolean;
  lastQuestion: boolean;
};

function InputField({
  field,
  value,
  error,
  onChange,
}: {
  field: QuestionField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const controlId = `answer-${field.id}`;
  const describedBy = [
    field.helpText ? `${controlId}-help` : undefined,
    error ? `${controlId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  if (
    field.type === "singleSelect" ||
    field.type === "yesNo" ||
    field.type === "confirm"
  ) {
    return (
      <fieldset className="answer-field answer-choice-field">
        <legend className="answer-label">{field.label}</legend>
        <div className="choice-list">
          {(field.options ?? []).map((option) => (
            <label className="choice-option" key={option.value}>
              <input
                type="radio"
                name={field.id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {field.helpText && <p className="field-help" id={`${controlId}-help`}>{field.helpText}</p>}
        {error && <p className="field-error" id={`${controlId}-error`}>{error}</p>}
      </fieldset>
    );
  }

  if (field.type === "multiSelect") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const exclusiveValues = (field.options ?? [])
      .filter((option) => /none of these|prefer not to answer/i.test(option.label))
      .map((option) => option.value);
    return (
      <fieldset className="answer-field answer-choice-field">
        <legend className="answer-label">{field.label}</legend>
        <div className="choice-list">
          {(field.options ?? []).map((option) => (
            <label className="choice-option" key={option.value}>
              <input
                type="checkbox"
                value={option.value}
                checked={selected.includes(option.value)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selected, option.value]
                    : selected.filter((item) => item !== option.value);
                  onChange(
                    normalizeExclusiveSelection(next, option.value, exclusiveValues),
                  );
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {field.helpText && <p className="field-help" id={`${controlId}-help`}>{field.helpText}</p>}
        {error && <p className="field-error" id={`${controlId}-error`}>{error}</p>}
      </fieldset>
    );
  }

  const inputType =
    field.type === "currency" || field.type === "number"
      ? "number"
      : field.type === "date"
        ? "date"
        : field.type === "year"
          ? "text"
          : field.type === "longText"
            ? "textarea"
            : field.type === "phone"
              ? "tel"
              : field.type === "url"
                ? "url"
                : field.type === "email"
                  ? "email"
                  : "text";

  return (
    <div className="answer-field">
      <label className="answer-label" htmlFor={controlId}>
        {field.label}
        {field.required && <span className="required-mark">Required</span>}
      </label>
      {inputType === "textarea" ? (
        <textarea
          id={controlId}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          aria-required={field.required || undefined}
          required={field.required}
          rows={4}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "currency" ? (
        <div className="currency-input-wrap">
          <span aria-hidden="true">$</span>
          <input
            id={controlId}
            type={inputType}
            min={0}
            step="0.01"
            value={String(value ?? "")}
            placeholder={field.placeholder}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            aria-required={field.required || undefined}
            required={field.required}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      ) : (
        <input
          id={controlId}
          type={inputType}
          min={field.type === "number" ? 0 : undefined}
          step={field.type === "number" ? 1 : undefined}
          maxLength={field.type === "year" ? 4 : undefined}
          inputMode={field.type === "year" ? "numeric" : undefined}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          aria-required={field.required || undefined}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.helpText && <p className="field-help" id={`${controlId}-help`}>{field.helpText}</p>}
      {error && <p className="field-error" id={`${controlId}-error`}>{error}</p>}
    </div>
  );
}

export function QuestionCard({
  question,
  answers,
  onChange,
  onContinue,
  onPrevious,
  onReturnToReview,
  firstQuestion,
  lastQuestion,
}: QuestionCardProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fields = question.fields ?? [];

  function continueIfValid() {
    const nextErrors = validateQuestion(question, answers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onContinue();
  }

  return (
    <section className="question-card question-flow-card" aria-labelledby="question-title">
      <p className="eyebrow">
        {question.moduleId === "editorial"
          ? "Optional newsroom questions"
          : question.moduleId === "contacts"
            ? "Contacts"
            : question.section.replace("-", " ")}
      </p>
      <h1 id="question-title">{question.respondentLabel}</h1>
      {question.questionId === "prior-ownership-description" && (
        <p className="prior-value-note">Previously reported information — not confirmed yet.</p>
      )}
      {question.priorValue && (
        <p className="prior-value-note">
          {question.priorValuePeriod ? `${question.priorValuePeriod}: ` : ""}
          {question.priorValue}
        </p>
      )}
      {question.questionType === "transition" && (
        <p className="question-intro">{question.helpText}</p>
      )}
      {question.helpText && question.questionType !== "transition" && (
        <details className="question-help">
          <summary>Why we’re asking</summary>
          <p>{question.helpText}</p>
        </details>
      )}
      {question.definition && (
        <details className="question-help">
          <summary>More about this question</summary>
          <p>{question.definition}</p>
        </details>
      )}

      <div className={`question-fields${question.questionType === "group" ? " is-group" : ""}`}>
        {fields.map((field) => (
          <InputField
            key={field.id}
            field={field}
            value={answers[field.id]}
            error={errors[field.id]}
            onChange={(value) => {
              onChange(field.id, value);
              setErrors((current) => {
                const next = { ...current };
                delete next[field.id];
                return next;
              });
            }}
          />
        ))}
      </div>

      {question.followUpRule && <p className="follow-up-note">{question.followUpRule}</p>}

      <nav className="step-navigation" aria-label="Survey navigation">
        <button className="button button-secondary" disabled={firstQuestion} onClick={onPrevious}>
          <span aria-hidden="true">←</span>
          Previous
        </button>
        <div className="question-nav-actions">
          {onReturnToReview && (
            <button className="text-button" onClick={onReturnToReview}>
              Return to review
            </button>
          )}
          <button className="button button-primary" onClick={continueIfValid}>
            {lastQuestion ? "Review answers" : "Continue"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </nav>
    </section>
  );
}
