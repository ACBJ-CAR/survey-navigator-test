import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

afterEach(() => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.clear();
  }
});

function saveAtIndustry(answers: Record<string, unknown> = {}) {
  window.localStorage.setItem(
    "acbj-survey-navigator-v1",
    JSON.stringify({
      version: 1,
      screen: "survey",
      currentQuestionId: "industry",
      answers: { respondentType: "new", industryPhase: "browse", ...answers },
    }),
  );
}

describe("ACBJ Survey Navigator question flow", () => {
  it("starts a new respondent on a specific company question", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /start survey/i }));
    expect(
      screen.getByRole("heading", { name: "What’s the name of your business?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /business name/i })).toBeRequired();
    expect(screen.queryByRole("button", { name: /developer diagnostics/i })).not.toBeInTheDocument();
  });

  it("validates the required business name and advances to the address group", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /start survey/i }));

    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText("Business name is required.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /business name/i }), "Island Foods");
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(
      screen.getByRole("heading", { name: "Where is your business located?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /street address/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /zip code/i })).toBeInTheDocument();
  });

  it("offers a returning-business confirmation flow without confirming on view", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /try a synthetic returning-business demo/i }),
    );

    expect(
      screen.getByRole("heading", {
        name: /sample company.*island pacific demo co/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /business name/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /yes, that’s right/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByRole("heading", { name: /make sure we have the right address/i })).toBeInTheDocument();
  });

  it("saves answers locally and resumes from the saved question", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: /start survey/i }));
    await user.type(screen.getByRole("textbox", { name: /business name/i }), "North Shore Market");

    await waitFor(() => {
      expect(window.localStorage.getItem("acbj-survey-navigator-v1")).toContain(
        "North Shore Market",
      );
    });
    first.unmount();

    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    expect(screen.getByRole("textbox", { name: /business name/i })).toHaveValue("North Shore Market");
  });

  it("edits a review section and returns to review without losing other answers", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "acbj-survey-navigator-v1",
      JSON.stringify({
        version: 1,
        screen: "review",
        currentQuestionId: "industry",
        answers: {
          respondentType: "new",
          businessName: "Before edit",
          streetAddress: "1 Main Street",
          city: "Honolulu",
          state: "HI",
          zip: "96814",
          foundedYear: "1987",
          ownershipStructure: "Independent, privately held company",
          industry: "other",
        },
      }),
    );

    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    expect(screen.getByRole("heading", { name: /make sure everything looks right/i })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    const nameInput = screen.getByRole("textbox", { name: /business name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "After edit");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("heading", { name: /make sure everything looks right/i })).toBeInTheDocument();
    expect(screen.getByText("After edit")).toBeInTheDocument();
    expect(screen.getByText("1 Main Street")).toBeInTheDocument();
  });

  it("identifies the section with missing required answers before submission", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "acbj-survey-navigator-v1",
      JSON.stringify({
        version: 1,
        screen: "review",
        currentQuestionId: "industry",
        answers: { respondentType: "new" },
      }),
    );
    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/required questions in company/i);
    await user.click(screen.getByRole("button", { name: /submit survey/i }));
    expect(screen.getByRole("heading", { name: /name of your business/i })).toBeInTheDocument();
  });

  it("shows question diagnostics only in development debug mode", async () => {
    window.history.replaceState({}, "", "/?debug=1");
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /start survey/i }));
    await user.click(screen.getByRole("button", { name: /show developer diagnostics/i }));

    expect(screen.getByText("business-name")).toBeInTheDocument();
    expect(screen.getByText("business_name")).toBeInTheDocument();
    expect(screen.getByText(/browser localStorage \(prototype\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset prototype data/i })).toBeInTheDocument();
  });

  it("searches by a specialty term and loads Accounting only after classification is completed", async () => {
    saveAtIndustry();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    await user.type(screen.getByRole("searchbox", { name: /search by industry/i }), "bookkeeping");
    await user.click(await screen.findByRole("button", { name: /Accounting — Bookkeeping-focused firm/i }));
    await user.click(screen.getByRole("radio", { name: "Bookkeeping-focused firm" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("radio", { name: "No" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("heading", { name: /learn about your professional team/i })).toBeInTheDocument();
  });

  it("requires a useful Other description and then continues without an industry module", async () => {
    saveAtIndustry();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    await user.click(screen.getByRole("button", { name: /professional, scientific & business services/i }));
    await user.click(screen.getByRole("button", { name: /another business in this category/i }));
    await user.click(screen.getByRole("button", { name: /^continue/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/few words/i);

    await user.type(screen.getByRole("textbox", { name: /describe what your company/i }), "We restore historic buildings");
    await user.click(screen.getByRole("button", { name: /^continue/i }));
    expect(screen.getByRole("heading", { name: /during the next 12 months/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /professional team/i })).not.toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("acbj-survey-navigator-v1") ?? "{}");
      expect(saved.answers.industryClassification.primary.broadIndustryId).toBe("broad.professional-business-services");
      expect(saved.answers.industryClassification.primary.industryId).toBeNull();
      expect(saved.answers.industryClassification.manualReviewItems).toContain("industry.other_unmapped");
      expect(saved.answers.industryClassification.otherDescription).toBe("We restore historic buildings");
    });
  });

  it("records global Something else without creating taxonomy selections", async () => {
    saveAtIndustry();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    await user.click(screen.getByRole("button", { name: /something else/i }));
    await user.type(screen.getByRole("textbox", { name: /describe what your company/i }), "We provide community mediation");
    await user.click(screen.getByRole("button", { name: /^continue/i }));
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("acbj-survey-navigator-v1") ?? "{}");
      expect(saved.answers.industryClassification.status).toBe("other_unmapped");
      expect(saved.answers.industryClassification.primary).toBeNull();
      expect(saved.answers.industryClassification.secondary).toEqual([]);
    });
  });

  it("allows an unsure classification to continue without guessing", async () => {
    saveAtIndustry();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    await user.click(screen.getByRole("button", { name: /i’m not sure/i }));
    await user.click(screen.getByRole("button", { name: /^continue/i }));
    expect(screen.getByRole("heading", { name: /during the next 12 months/i })).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("acbj-survey-navigator-v1") ?? "{}");
      expect(saved.answers.industryClassification.status).toBe("unsure_manual_review");
      expect(saved.answers.industryClassification.primary).toBeNull();
      expect(saved.answers.industryClassification.manualReviewItems).toContain("industry.unsure_manual_review");
    });
  });

  it("supports keyboard activation for the unsure path", async () => {
    saveAtIndustry();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    const unsure = screen.getByRole("button", { name: /i’m not sure/i });
    unsure.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: /what does the company make, sell or do/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /in a few words/i })).toBeInTheDocument();
  });

  it("asks respondents to confirm a prior classification before loading its module", async () => {
    const priorClassification = {
      classificationId: "sample-prior",
      reportingScope: "companywide",
      taxonomyVersion: "survey-navigator-industry-1.1.0",
      primary: { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: [] },
      secondary: [],
      status: "prior_unconfirmed",
      source: "prior_record",
      otherDescription: "",
      uncertaintyNote: "",
      naicsVintage: "2022",
      naicsCandidates: [],
      activeModuleIds: [],
      manualReviewItems: [],
      history: [],
    };
    saveAtIndustry({ industryPhase: undefined, industryClassification: priorClassification, industryClassificationStatus: "prior_unconfirmed" });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    expect(screen.queryByRole("heading", { name: /professional team/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /yes, confirm it/i }));
    expect(screen.getByRole("heading", { name: /professional team/i })).toBeInTheDocument();
  });

  it("retains the prior classification history when it is updated and resumes the active module", async () => {
    const priorClassification = {
      classificationId: "sample-prior",
      reportingScope: "companywide",
      taxonomyVersion: "survey-navigator-industry-1.1.0",
      primary: { broadIndustryId: "broad.professional-business-services", industryId: "industry.accounting", specialtyIds: [] },
      secondary: [],
      status: "prior_unconfirmed",
      source: "prior_record",
      otherDescription: "",
      uncertaintyNote: "",
      naicsVintage: "2022",
      naicsCandidates: [],
      activeModuleIds: [],
      manualReviewItems: [],
      history: [],
    };
    saveAtIndustry({ industryPhase: undefined, industryClassification: priorClassification, industryClassificationStatus: "prior_unconfirmed" });
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    await user.click(screen.getByRole("button", { name: /^update it$/i }));
    await user.type(screen.getByRole("searchbox", { name: /search by industry/i }), "accounting");
    await user.click(screen.getByRole("button", { name: /Accounting/ }));
    await user.click(screen.getByRole("radio", { name: "CPA firm" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("radio", { name: "No" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByRole("heading", { name: /professional team/i })).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("acbj-survey-navigator-v1") ?? "{}");
      expect(saved.answers.industryClassification.status).toBe("respondent_updated");
      expect(saved.answers.industryClassification.history).toHaveLength(1);
    });
    first.unmount();

    render(<App />);
    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    expect(screen.getByRole("heading", { name: /professional team/i })).toBeInTheDocument();
  });
});
