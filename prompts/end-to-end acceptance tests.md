Prompt 17: End-to-end acceptance tests

Create end-to-end tests for every v1 acceptance journey.

Required scenarios:
A. New business completes universal path.
B. Returning business confirms stored information.
C. Respondent updates employee, revenue, executive or address data.
D. Accounting classification triggers accounting module.
E. Non-accounting business never sees accounting questions.
F. Subsidiary structure triggers parent-company question.
G. Ownership descriptions can be selected, declined or skipped without blocking completion.
H. Hiring selection triggers expected-hiring follow-up; removing it hides and excludes the follow-up.
I. Respondent leaves and resumes without lost responses or position.
J. BizEstimate changes only after designated synthetic valuation inputs.
K. Editorial questions can be skipped and submission still completes.
L. Existing year founded can be confirmed or updated; local/companywide years remain distinct.
M. Changing subsidiary to independent excludes stale parent-company data.
N. None of these / Prefer not to answer ownership rules behave correctly.
O. Review/Edit returns to Review without losing answers.

Testing requirements:
- Run tests at desktop and mobile viewport sizes where practical.
- Include keyboard-only coverage for the principal journey.
- Include automated accessibility checks supported by the project stack.
- Add fixtures for new, returning and accounting respondents.
- Produce a concise test report in the repository.

Acceptance checklist:
- Every scenario passes.
- Build and lint pass.
- Accessibility checks have no critical failures.
- Test report identifies any intentionally deferred limitation.
- No production valuation methodology or full industry taxonomy has been invented.
