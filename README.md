# ACBJ Survey Navigator

ACBJ Survey Navigator is a browser-based prototype for a guided, adaptive
business survey. The experience is designed to feel clear and conversational,
with one step at a time and a persistent BizEstimate area.

*Reporter: Ethan Nelson*

*Editor: Craig Douglas*

## Project goal

Build an approachable survey that helps business respondents review and share
information about their company. The browser prototype presents one question
or closely related group per screen, adapts follow-ups to respondent answers,
and saves progress locally so a respondent can return to the same question.

## Methodology

The formal v1 product specification in
[`prompts/acbj_survey_navigator_specs.md`](./prompts/acbj_survey_navigator_specs.md)
is the source of truth. The application includes a limited accounting proof of
concept and a generic “another kind of business” path; it does not include a
complete industry or specialty taxonomy, production NAICS mapping, or a
production valuation formula.

## Data sources

No survey data sources are configured in this foundation stage.

## Browser application

The browser application uses React, TypeScript, and Vite. Node.js 20.19+ or
22.12+ is required by Vite 7.

1. Run `npm install` to install the application dependencies.
2. Run `npm run dev` and open the local URL printed by Vite.
3. Run `npm run build` to type-check and create a production build in `dist/`.
4. Run `npm run lint` to lint the project.
5. Run `npm test` to run the automated tests.

## Respondent journey

1. **Welcome / resume** — start a new response, resume locally saved progress,
   or try a clearly labeled synthetic returning-business example.
2. **Company** — business name, address, phone and website. Returning-example
   respondents can confirm or update existing values.
3. **Business details** — operating footprint, offices, leadership and survey
   contact, employee and revenue details, founding years, ownership structure
   and optional ownership description. Follow-ups appear only when relevant.
4. **Your industry** — choose the accounting demonstration path, another kind
   of business, or “I’m not sure.” Accounting-specific staff, service and
   editorial questions appear only for accounting respondents.
5. **What’s ahead** — select plans for the next 12 months and answer only the
   corresponding short follow-ups.
6. **Review** — review completed answers, edit a section without restarting,
   and submit to a clear completion screen. Editorial responses are optional
   and kept separate from research answers.

The persistent BizEstimate starts with “Complete a few questions to begin
building your estimate.” Monetary ranges are synthetic demonstration fixtures,
not a professional or production valuation. Only the configured employee and
revenue fields are eligible inputs.

## Prototype architecture

- `src/config/survey.ts` defines respondent wording, field IDs, types,
  requiredness, help, prior values and reusable equality/inclusion/compound
  display conditions. New questions and branches should be added here rather
  than wired into a hard-coded page sequence.
- `src/components/QuestionCard.tsx` renders configured question groups and
  validates required, year, number, currency, email, phone and URL answers.
- `src/state/storage.ts` isolates local prototype persistence. It uses browser
  local storage only; this is not production authentication or server storage.
- `src/modules/bizEstimate.ts` is a replaceable adapter for clearly labeled
  synthetic estimate fixtures.
- `src/App.tsx` evaluates the active question path, autosaves answers and
  position, and provides review, section editing and submission.

To add a future module, define its question metadata and `displayCondition` in
`src/config/survey.ts`, mark valuation inputs only when explicitly approved,
and add tests for visible questions and exclusion of hidden answers from the
submission payload. Production taxonomy and valuation policy must not be
invented in the prototype.

## Prototype limitations

- Data lives in the current browser’s local storage and is not shared across
  browsers or devices.
- The “returning business” action loads an illustrative synthetic sample
  record; it is not ACBJ company data.
- The accounting module is a Honolulu proof of concept, not a complete
  accounting or industry inventory.
- Contact capture supports the executive, survey contact and adding one
  additional contact. Production contact-record management and authentication
  are not implemented.
- The BizEstimate range is fixed synthetic demo output. Production valuation
  methodology, eligibility rules, confidence methodology and legal disclosures
  remain deferred.
- Production data APIs, final ACBJ field mappings, complete NAICS/industry
  classifications and final brand/legal review remain deferred.

## Stakeholder testing guide

- Try a new response and confirm the address and founding-year required fields
  provide clear, nontechnical validation.
- Use **Try a synthetic returning-business demo** to confirm the existing
  company, address, executive, employee, revenue and founding-year prompts.
  Viewing a prior value alone must not confirm it.
- Choose subsidiary, holding-company and investment-backed ownership
  structures, then change the structure and verify irrelevant follow-ups leave
  the active review/submission.
- Compare the Accounting and “Another kind of business” paths. Only accounting
  should see accounting questions or newsroom prompts.
- Select hiring or other outlook plans, then revise the selections and confirm
  only relevant follow-ups remain.
- Refresh after answering and use **Resume survey** to confirm the response
  and question position are restored.
- Review the estimate’s synthetic label and ensure the estimate does not imply
  a completed professional valuation.

## Notebook and data workflow

**Cloning the GitHub repo**

1. Run `git clone git@github.com:ACBJ-CAR/survey-navigator-test.git`
2. Run `uv sync` to create the virtual environment and install all Python dependencies from `pyproject.toml`.
3. Run `datakit data pull` to retrieve the data files.
4. Run `uv run pre-commit install` to add pre-commit hooks. This ensures consistent formatting and runs code checks before committing code.

**Making edits**

1. Run `uv run jupyter lab` or open a notebook in VS Code.

> Reminder: Git is not tracking or saving notebooks. Instead, using jupytext, notebooks are synced with a .py file. Any changes made in either file sync with the other paired file when you save. If you are using VS Code for editing your notebooks, you must have the "Jupytext Sync" VS Code extension.

**Committing changes to GitHub**

1. Run `git add . && git commit -m "describe message of changes here"`
2. Run `git push origin main`
3. Run `datakit data push`

## Data notes

Add important caveats and source contact information here when data sources are
introduced.
