# ACBJ Survey Navigator

ACBJ Survey Navigator is a browser-based prototype for a guided, adaptive
business survey. The experience is designed to feel clear and conversational,
with one step at a time and a persistent BizEstimate area.

*Reporter: Ethan Nelson*

*Editor: Craig Douglas*

## Project goal

Build an approachable survey that helps business respondents review and share
information about their company. This repository currently contains the
responsive application foundation only; questionnaire content and response
persistence are planned for later stages.

## Methodology

The prototype's survey methodology and question inventory have not yet been
defined. No production industry taxonomy, NAICS mapping, or valuation formula
is included.

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

The current shell previews the survey sections but does not collect or save
responses. The visible “Progress saved” status is a UI placeholder, not evidence
of persistence. The BizEstimate card shows its initial state and does not
calculate or display a valuation.

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
