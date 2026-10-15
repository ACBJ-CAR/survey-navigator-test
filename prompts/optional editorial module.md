Prompt 12: Optional editorial module

Implement the optional Editorial module and transition.

Transition screen:
“You’ve completed the information we need to update your business profile. Can you also give our newsroom a little insight? These questions are optional and may help inform our reporting.”

Actions:
- Continue
- Skip for now

Add demonstration accounting editorial questions:
- How is AI changing your firm? Tell us about one way the firm is using, testing or responding to AI.
- Are there U.S. or Hawaii tax-law changes local businesses should watch?
- How has the firm reinvested in or expanded during the past year?
- What is the most critical issue facing the accounting profession?
- What is the firm’s fastest-growing practice area?
- What is one thing the firm values about doing business in Hawaii?
- Who should the response be attributed to? Select a confirmed executive/contact.

Requirements:
- Clearly label the entire module optional.
- Skip must proceed to Contacts/Review without incomplete warnings.
- Keep editorial responses separate from core research data in state and submission payload.
- Do not use editorial answers as BizEstimate inputs.

Acceptance checklist:
- Optional transition is clear.
- Skip path works end to end.
- Editorial answers are stored separately.
- Attribution uses confirmed contact data.
- Tests pass.
