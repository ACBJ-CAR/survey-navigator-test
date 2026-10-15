import { describe, expect, it } from "vitest";
import {
  buildSubmissionPayload,
  getConfigurationDiagnostics,
  evaluateCondition,
  getEditorialPayload,
  getVisibleQuestions,
  normalizeExclusiveSelection,
  surveyQuestions,
} from "../config/survey";
import { validateQuestion } from "../utils/validation";
import { getDemoEstimate } from "../modules/bizEstimate";

describe("configuration-driven survey rules", () => {
  it("has no conditions referencing unknown response fields", () => {
    expect(getConfigurationDiagnostics()).toEqual([]);
  });

  it("loads accounting questions only for accounting respondents", () => {
    const accounting = getVisibleQuestions({ industry: "accounting" });
    const other = getVisibleQuestions({ industry: "other" });
    expect(accounting.some((question) => question.moduleId === "accounting")).toBe(true);
    expect(other.some((question) => question.moduleId === "accounting")).toBe(false);
  });

  it("shows the subsidiary branch and drops stale parent values after structure changes", () => {
    const subsidiary = { ownershipStructure: "Subsidiary or operating company of another company", parentCompanyKnown: "yes", parentCompany: "Pacific Holdings" };
    expect(getVisibleQuestions(subsidiary).some((question) => question.questionId === "parent-company")).toBe(true);
    const independent = { ...subsidiary, ownershipStructure: "Independent, privately held company" };
    expect(getVisibleQuestions(independent).some((question) => question.questionId === "parent-company")).toBe(false);
    expect(buildSubmissionPayload(independent)).not.toHaveProperty("parent_company");
  });

  it("shows the hiring follow-up only while the relevant choice is active", () => {
    const hiring = { outlookPlans: ["Hiring additional employees"], expectedHires: "6" };
    expect(getVisibleQuestions(hiring).some((question) => question.questionId === "expected-hires")).toBe(true);
    const noHiring = { outlookPlans: ["None of these"], expectedHires: "6" };
    expect(getVisibleQuestions(noHiring).some((question) => question.questionId === "expected-hires")).toBe(false);
    expect(buildSubmissionPayload(noHiring)).not.toHaveProperty("expected_hires");
  });

  it("treats none/prefer-not-to-answer as exclusive ownership choices", () => {
    expect(normalizeExclusiveSelection(["Family-owned", "none"], "Family-owned", ["none", "declined"])).toEqual(["Family-owned"]);
    expect(normalizeExclusiveSelection(["Family-owned", "declined"], "declined", ["none", "declined"])).toEqual(["declined"]);
    expect(normalizeExclusiveSelection([], "none", ["none", "declined"])).toEqual([]);
  });

  it("keeps ownership descriptions separate from structure and estimates", () => {
    const answers = {
      ownershipStructure: "Independent, privately held company",
      ownershipDescriptions: ["Family-owned"],
    };
    const payload = buildSubmissionPayload(answers);
    expect(payload.ownership_structure).toBe(answers.ownershipStructure);
    expect(payload.ownership_descriptions).toEqual(["Family-owned"]);
    expect(getDemoEstimate(answers)).toEqual({ status: "insufficient" });
  });

  it("does not use unconfirmed prior values in the synthetic estimate", () => {
    const returning = {
      respondentType: "returning",
      companyEmployees: "114",
      annualRevenue: "4200000",
    };
    expect(getDemoEstimate(returning)).toEqual({ status: "insufficient" });
    expect(getDemoEstimate({
      ...returning,
      employeesConfirmation: "confirmed",
      revenueConfirmation: "confirmed",
    })).toEqual({ status: "preliminary", range: "$1.2M–$1.8M" });
    expect(getDemoEstimate({
      respondentType: "new",
      companyEmployees: "24",
      annualRevenue: "800000",
    })).toEqual({ status: "updated", range: "$1.2M–$1.8M" });
  });

  it("keeps optional editorial answers separate from research payload", () => {
    const answers = { industry: "accounting", editorialPath: "continue", editorialAi: "We are exploring tools." };
    expect(buildSubmissionPayload(answers)).not.toHaveProperty("editorial_ai");
    expect(getEditorialPayload(answers)).toHaveProperty("editorial_ai", "We are exploring tools.");
    expect(getEditorialPayload({ industry: "accounting", editorialPath: "skip" })).toEqual({});
  });

  it("validates four-digit years and type-specific email and number values", () => {
    const yearQuestion = surveyQuestions.find((question) => question.questionId === "founded-year")!;
    const emailQuestion = surveyQuestions.find((question) => question.questionId === "executive")!;
    expect(validateQuestion(yearQuestion, { foundedYear: "20x0" })).toHaveProperty("foundedYear");
    expect(validateQuestion(yearQuestion, { foundedYear: String(new Date().getFullYear() + 1) })).toHaveProperty("foundedYear");
    expect(validateQuestion(yearQuestion, { foundedYear: "1987" })).toEqual({});
    expect(validateQuestion(emailQuestion, { executiveEmail: "not-an-email" }).executiveEmail).toMatch(/email address/i);
    expect(evaluateCondition({ field: "count", operator: "greaterThan", value: 1 }, { count: "2" })).toBe(true);
  });
});
