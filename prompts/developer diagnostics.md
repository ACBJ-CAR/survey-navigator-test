Prompt 16: Developer diagnostics and audit view

Implement a developer/debug mode that is unavailable in the normal respondent experience.

For each current question, show:
- question ID
- data field ID
- module
- required status
- display condition
- why it is currently displayed
- prior/current response state
- whether it is a valuation input
- whether it is included in active submission payload

Also provide:
- current section/question position;
- active modules;
- hidden stale-answer inventory;
- storage adapter status;
- reset prototype data action;
- current BizEstimate adapter status.

Requirements:
- Debug mode must be gated by an obvious development-only control or environment flag.
- Never expose debug data in production builds by default.
- Add tests that normal respondent mode does not render debug controls.

Acceptance checklist:
- Conditional-question reasons are visible in debug mode.
- Hidden stale values and active payload inclusion are inspectable.
- Normal mode contains no debug controls.
- Tests pass.
