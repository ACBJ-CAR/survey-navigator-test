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
import {
  INDUSTRY_TAXONOMY_VERSION,
  getIndustryModulePlan,
  getClassificationPayload,
  industryModuleRules,
  industryTaxonomy,
  naicsCrosswalk,
  searchIndustries,
  searchIndustryMatches,
  toggleSecondarySelection,
  validateIndustryConfiguration,
  type IndustryClassification,
} from "../config/industry";

describe("configuration-driven survey rules", () => {
  it("has no conditions referencing unknown response fields", () => {
    expect(getConfigurationDiagnostics()).toEqual([]);
  });

  it("loads accounting questions only for accounting respondents", () => {
    const accounting = getVisibleQuestions({
      industry: "accounting",
      industryClassificationStatus: "respondent_selected",
      industryClassification: {
        classificationId: "test",
        reportingScope: "companywide",
        taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
        primary: { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: [] },
        secondary: [],
        status: "respondent_selected",
        source: "respondent",
        otherDescription: "",
        uncertaintyNote: "",
        naicsVintage: "2022",
        naicsCandidates: [],
        activeModuleIds: [],
        manualReviewItems: [],
        history: [],
      } satisfies IndustryClassification,
    });
    const other = getVisibleQuestions({ industry: "other", industryClassificationStatus: "other_unmapped" });
    expect(accounting.some((question) => question.moduleId === "accounting")).toBe(true);
    expect(other.some((question) => question.moduleId === "accounting")).toBe(false);
    expect(getVisibleQuestions({ industry: "accounting" }).some((question) => question.moduleId === "accounting")).toBe(false);
  });

  it("keeps Accounting module eligibility on a confirmed primary, never a secondary", () => {
    const primary: IndustryClassification = {
      classificationId: "test",
      reportingScope: "companywide",
      taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
      primary: { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: [] },
      secondary: [],
      status: "respondent_confirmed",
      source: "respondent",
      otherDescription: "",
      uncertaintyNote: "",
      naicsVintage: "2022",
      naicsCandidates: [],
      activeModuleIds: [],
      manualReviewItems: [],
      history: [],
    };
    expect(getIndustryModulePlan(primary).activeModuleIds).toEqual(["accounting"]);
    expect(getIndustryModulePlan({ ...primary, primary: { broadIndustryId: "broad.finance-insurance", industryId: "industry.banks", specialtyIds: [] } }).activeModuleIds).toEqual([]);
    expect(getIndustryModulePlan({ ...primary, primary: { broadIndustryId: "broad.finance-insurance", industryId: "industry.banks", specialtyIds: [] }, secondary: [primary.primary!] }).activeModuleIds).toEqual([]);
    expect(getIndustryModulePlan({ ...primary, status: "prior_unconfirmed" }).activeModuleIds).toEqual([]);
    expect(getIndustryModulePlan({ ...primary, reportingScope: "specific_establishment" }, []).activeModuleIds).toEqual([]);
    expect(industryModuleRules.find((rule) => rule.moduleId === "accounting")?.secondaryEnabled).toBe(false);
  });

  it("uses one stable industry ID for search and browse and validates the seeded tree", () => {
    expect(searchIndustries("bookkeeping").map((node) => node.id)).toContain("industry.accounting");
    expect(searchIndustryMatches("CPA firm").map((match) => match.respondentLabel)).toContain("Accounting — CPA firm");
    const accounting = industryTaxonomy.find((node) => node.id === "industry.accounting");
    expect(accounting?.parentId).toBe("broad.professional-business-services");
    expect(validateIndustryConfiguration()).toEqual([]);
    expect(industryTaxonomy.filter((node) => node.level === "broad").every((node) => node.allowOtherBusiness && node.otherOptionLabel)).toBe(true);
  });

  it("fails invalid taxonomy structures with actionable diagnostics", () => {
    const invalid = [
      ...industryTaxonomy,
      { ...industryTaxonomy[0] },
      { ...industryTaxonomy.find((node) => node.id === "industry.accounting")!, id: "orphan.test", parentId: "missing.parent" },
    ];
    const diagnostics = validateIndustryConfiguration(invalid, [
      { ...naicsCrosswalk[0], naicsVintage: "2017", relationship: "made_up" as never },
    ], []);
    expect(diagnostics.some((error) => error.includes("Duplicate taxonomy node ID"))).toBe(true);
    expect(diagnostics.some((error) => error.includes("missing parent"))).toBe(true);
    expect(diagnostics.some((error) => error.includes("invalid NAICS vintage"))).toBe(true);
    expect(diagnostics.some((error) => error.includes("invalid relationship"))).toBe(true);
  });

  it("validates cycles, sibling labels, module references, and retired-date rules", () => {
    const cyclicNodes = industryTaxonomy.map((node) => {
      if (node.id === "industry.accounting") return { ...node, parentId: "industry.legal-services" };
      if (node.id === "industry.legal-services") return { ...node, parentId: "industry.accounting" };
      return node;
    });
    const duplicateSibling = industryTaxonomy.map((node) =>
      node.id === "industry.legal-services" ? { ...node, respondentLabel: "Accounting" } : node,
    );
    const invalidNodes = industryTaxonomy.map((node) => {
      if (node.id === "industry.accounting") {
        return { ...node, respondentLabel: "", moduleTags: ["missing.module"], status: "retired" as const, effectiveTo: null };
      }
      return node;
    });
    expect(validateIndustryConfiguration(cyclicNodes).some((error) => error.includes("Circular taxonomy"))).toBe(true);
    expect(validateIndustryConfiguration(duplicateSibling).some((error) => error.includes("Duplicate sibling label"))).toBe(true);
    const diagnostics = validateIndustryConfiguration(invalidNodes, naicsCrosswalk, [{
      ...industryModuleRules[0],
      primaryIndustryIds: ["missing.industry"],
    }]);
    expect(diagnostics.some((error) => error.includes("respondent label"))).toBe(true);
    expect(diagnostics.some((error) => error.includes("missing module"))).toBe(true);
    expect(diagnostics.some((error) => error.includes("must have an effectiveTo"))).toBe(true);
    expect(diagnostics.some((error) => error.includes("references missing industry"))).toBe(true);
  });

  it("keeps respondent industry payload labels free of taxonomy IDs and NAICS codes", () => {
    const classification: IndustryClassification = {
      classificationId: "test",
      reportingScope: "companywide",
      taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
      primary: { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: ["specialty.accounting.cpa-firm"] },
      secondary: [],
      status: "respondent_selected",
      source: "respondent",
      otherDescription: "",
      uncertaintyNote: "",
      naicsVintage: "2022",
      naicsCandidates: naicsCrosswalk,
      activeModuleIds: ["accounting"],
      manualReviewItems: [],
      history: [],
    };
    const respondentPayload = JSON.stringify(getClassificationPayload(classification));
    expect(respondentPayload).toContain("Accounting");
    expect(respondentPayload).toContain("CPA firm");
    expect(respondentPayload).not.toContain("industry.accounting");
    expect(respondentPayload).not.toContain("541211");
    const fullPayload = JSON.stringify(buildSubmissionPayload({ industryClassification: classification, industry: "accounting", industryClassificationStatus: "respondent_selected", accountingStaffLocal: "12" }));
    expect(fullPayload).not.toContain("industry.accounting");
    expect(fullPayload).not.toContain("541211");
    expect(fullPayload).toContain("CPA firm");
  });

  it("supports multiple secondary industries without allowing the primary to be duplicated", () => {
    const primary = { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: [] };
    const first = toggleSecondarySelection(primary, [], "industry.banks");
    const second = toggleSecondarySelection(primary, first.selections, "industry.trucking");
    const duplicatePrimary = toggleSecondarySelection(primary, second.selections, "industry.accounting");
    expect(second.selections.map((selection) => selection.industryId)).toEqual(["industry.banks", "industry.trucking"]);
    expect(duplicatePrimary.change).toBe("unchanged");
    expect(duplicatePrimary.selections).toHaveLength(2);
  });

  it("restores inactive module answers when the compatible classification is selected again", () => {
    const accountingAnswers = {
      industry: "accounting",
      industryClassificationStatus: "respondent_selected",
      industryClassification: {
        classificationId: "test",
        reportingScope: "companywide" as const,
        taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
        primary: { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: [] },
        secondary: [],
        status: "respondent_selected" as const,
        source: "respondent" as const,
        otherDescription: "",
        uncertaintyNote: "",
        naicsVintage: "2022",
        naicsCandidates: [],
        activeModuleIds: ["accounting"],
        manualReviewItems: [],
        history: [],
      },
      accountingStaffLocal: "12",
    };
    const inactiveAnswers = { ...accountingAnswers, industry: "classified", industryClassificationStatus: "respondent_updated", industryClassification: { ...accountingAnswers.industryClassification, primary: { broadIndustryId: "broad.finance-insurance", industryId: "industry.banks", specialtyIds: [] }, activeModuleIds: [] } };
    expect(buildSubmissionPayload(inactiveAnswers)).not.toHaveProperty("accounting_staff_local");
    expect(buildSubmissionPayload(accountingAnswers)).toHaveProperty("accounting_staff_local");
    expect(accountingAnswers.accountingStaffLocal).toBe("12");
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
