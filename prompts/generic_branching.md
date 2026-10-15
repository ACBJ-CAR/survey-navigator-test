Prompt 8: Generic branching and module loader

Implement a generic conditional-logic engine and module loader.

Supported behavior:
- Evaluate displayCondition rules against current response state.
- Show/hide individual questions and entire modules.
- Support simple equality, inequality, inclusion and all/any condition groups.
- Reevaluate immediately after relevant answer changes.
- Preserve stale hidden answers only for audit/debug purposes, but exclude them from active submission payloads unless the condition becomes valid again.
- Return the respondent to the universal path after an industry module.
- Detect invalid configuration references and show them only in developer diagnostics, not to respondents.

Create tests using:
- planning_to_hire = yes → show expected_hires;
- ownership_structure = subsidiary → show parent_company;
- industry = accounting → load accounting module.

Acceptance checklist:
- Conditions are configuration-driven.
- Hidden questions do not block completion.
- Hidden stale values are excluded from active payload.
- Module entry and exit preserve progress.
- Invalid rules are diagnosable.
- Tests pass.
