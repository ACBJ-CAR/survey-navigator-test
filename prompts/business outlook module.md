Prompt 11: Business Outlook module

Implement the common Business Outlook module.

Question:
“During the next 12 months, which of the following is your company considering?”

Options:
- Hiring additional employees
- Expanding into additional space
- Relocating
- Opening additional locations
- Raising capital
- Acquiring another business
- Considering a merger or sale
- Entering new geographic markets
- None of these
- Prefer not to answer

Conditional follow-ups:
- Hiring → approximate number of employees expected to be added.
- Additional space → approximate amount of additional space.
- Raising capital → type of capital being considered.
- Acquisition → whether the company is actively seeking opportunities.

Requirements:
- Keep follow-ups concise.
- “None of these” and “Prefer not to answer” must behave as exclusive choices against affirmative options.
- Hidden follow-ups must not block completion or enter active submission payloads.
- Do not make any of these answers affect BizEstimate unless explicitly designated later in configuration.

Acceptance checklist:
- Every branch shows only when triggered.
- Exclusive choices behave correctly.
- Stale hidden answers are excluded from active payload.
- Respondent can revise choices.
- Tests pass.
