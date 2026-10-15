import type { QuestionField, SurveyQuestion } from "../config/survey";

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function validateField(field: QuestionField, value: unknown) {
  if (field.required && isEmpty(value)) return `${field.label} is required.`;
  if (isEmpty(value)) return undefined;

  const text = String(value).trim();
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return "Enter an email address in a format like name@example.com.";
  }
  if (field.type === "url") {
    try {
      const parsed = new URL(text.startsWith("http") ? text : `https://${text}`);
      if (!parsed.hostname.includes(".")) throw new Error("Invalid host");
    } catch {
      return "Enter a website address, like example.com.";
    }
  }
  if (field.type === "phone" && text.replace(/\D/g, "").length < 7) {
    return "Enter a telephone number with at least 7 digits.";
  }
  if (field.type === "number" || field.type === "currency") {
    const parsed = Number(text.replace(/[$,]/g, ""));
    if (!Number.isFinite(parsed) || parsed < 0) return "Enter a number that is zero or greater.";
  }
  if (field.type === "year") {
    const year = Number(text);
    if (!/^\d{4}$/.test(text) || year < 1000) return "Enter a four-digit year.";
    if (year > new Date().getFullYear()) return "Enter a year that is not in the future.";
  }
  return undefined;
}

export function validateQuestion(question: SurveyQuestion, answers: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const fields = question.fields ?? [];
  for (const field of fields) {
    const error = validateField(field, answers[field.id]);
    if (error) errors[field.id] = error;
  }
  if (question.requiredStatus === "required" && fields.every((field) => !field.required)) {
    const firstField = fields[0];
    if (firstField && isEmpty(answers[firstField.id])) {
      errors[firstField.id] = "Please answer this question to continue.";
    }
  }
  return errors;
}
