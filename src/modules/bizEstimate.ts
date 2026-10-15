import { surveyQuestions } from "../config/survey";

export type BizEstimate =
  | { status: "insufficient" }
  | { status: "preliminary" | "updated"; range: string };

export interface BizEstimateAdapter {
  estimate(answers: Record<string, unknown>): BizEstimate;
}

const syntheticAdapter: BizEstimateAdapter = {
  estimate(answers) {
    const eligibleInputIds = new Set(
      surveyQuestions.flatMap((question) =>
        (question.fields ?? [])
          .filter((field) => field.valuationInput)
          .map((field) => field.id),
      ),
    );
    const returning = answers.respondentType === "returning";
    const hasRevenue =
      eligibleInputIds.has("annualRevenue") &&
      Boolean(answers.annualRevenue) &&
      (!returning || ["confirmed", "updated"].includes(String(answers.revenueConfirmation)));
    const hasEmployees =
      eligibleInputIds.has("companyEmployees") &&
      Boolean(answers.companyEmployees) &&
      (!returning || ["confirmed", "updated"].includes(String(answers.employeesConfirmation)));

    if (!hasRevenue && !hasEmployees) return { status: "insufficient" };

    const updated =
      (!returning && hasRevenue && hasEmployees) ||
      answers.revenueConfirmation === "updated" ||
      answers.employeesConfirmation === "updated";
    return {
      status: updated ? "updated" : "preliminary",
      range: hasRevenue && hasEmployees ? "$1.2M–$1.8M" : "$0.8M–$1.2M",
    };
  },
};

export function getDemoEstimate(answers: Record<string, unknown>) {
  return syntheticAdapter.estimate(answers);
}
