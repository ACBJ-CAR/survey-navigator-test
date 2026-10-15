Prompt 15: Review, edit and submission

Implement the complete Review and submission experience.

Review sections:
- Company
- Leadership
- Business details
- Ownership
- Industry
- Industry details
- Business outlook
- Contacts
- Optional editorial responses, if supplied

Requirements:
- Show respondent-friendly labels and formatted values.
- Each section has Edit.
- Edit returns to the relevant section and then back to Review without restarting.
- Distinguish ownership structure from ownership description.
- Show companywide and local founding years separately when both exist.
- Exclude hidden/inapplicable stale branch values from the active submission payload.
- Allow optional unanswered items without incomplete warnings.
- Required unanswered items should identify the specific section needing attention.
- Submission produces an unambiguous completion screen.
- Display final synthetic BizEstimate state without implying a completed professional valuation.
- Provide a developer-only view of the generated submission payload.

Acceptance checklist:
- All review sections render correctly.
- Section editing works without data loss.
- Required-field checks route correctly.
- Hidden stale answers are excluded.
- Submission completion is clear.
- Tests pass.
