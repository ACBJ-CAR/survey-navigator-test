Prompt 6: Year Founded requirements

Implement and test the complete Year Founded requirements from the v1 specification.

Companywide year founded:
- Ask “When was your company founded?”
- Accept a four-digit year.
- Reject letters, negative numbers, malformed values and future years.
- Persist through navigation and save/resume.
- Display on Review with Edit.

Existing year:
- When configured, display “We have your company as founded in [YEAR]. Is that correct?”
- Allow Confirm or Update.
- Viewing alone does not confirm.
- Preserve the prior value after an update.

Local founding year:
- Support a separate local_founded_year field.
- Ask the local question only when enabled by configuration.
- Ask whether local operations began in the same year.
- Yes may populate local year from companywide year while retaining separate fields.
- No requests local year.
- “I’m not sure” permits continuation.
- Changing the companywide year must not overwrite a separately supplied local year.
- Show both values distinctly on Review when both exist.

Add automated tests for every acceptance criterion above.

Acceptance checklist:
- Companywide and local years remain separate.
- All validation rules work.
- Confirm/update and save/resume behavior work.
- Review/Edit works.
- Tests pass.
