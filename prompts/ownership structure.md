Prompt 7: Ownership structure and voluntary description

Implement the complete Ownership model as two separate concepts.

A. Ownership structure — single select:
- Independent, privately held company
- Publicly traded company
- Subsidiary or operating company of another company
- Holding company or parent company
- Portfolio company backed by private equity or another investment firm
- Partnership
- Nonprofit or foundation
- Government/public entity
- Other
- I’m not sure

Introduction:
“Tell us a little about how your company is organized. This helps us understand relationships among businesses and avoid treating a subsidiary or operating company as an unrelated organization.”

Conditional branches:
1. Subsidiary → ask parent company name and offer “I’m not sure.”
2. Holding company/parent → ask whether it owns or controls other operating businesses; Yes/No/I’m not sure.
3. Private equity/investment-backed → ask for associated investment or parent organization and offer “Prefer not to provide.” Do not ask for individual investors.

B. Voluntary ownership description — optional multi-select:
- Family-owned
- Veteran-owned
- Woman-owned
- Minority-owned
- Employee-owned
- Other ownership description
- None of these
- Prefer not to answer

Required behavior:
- Keep A and B separate in screens, state and Review.
- “None of these” clears affirmative descriptors.
- An affirmative descriptor clears “None of these.”
- “Prefer not to answer” cannot coexist with affirmative descriptors.
- Skipping B never blocks completion.
- Do not display warnings or negative language for declining.
- Missing description data remains unknown, not No.
- Never infer ownership descriptions from names, photos, biographies or indirect signals.
- Ownership descriptions are never BizEstimate inputs.
- If structure changes, hide inapplicable branches and exclude stale branch answers from submission.

Prior descriptor confirmation:
- Support “We currently have your company listed as family-owned. Is that still accurate?”
- Yes / No / Prefer not to answer.
- Opening the question does not reconfirm the descriptor.

Add automated tests for all ownership QA scenarios in the specification.

Acceptance checklist:
- Structure and voluntary descriptions remain separate.
- Conditional branches behave correctly.
- Stale branch data is not submitted.
- Optional descriptions never block completion or affect BizEstimate.
- Prior descriptor confirmation behaves correctly.
- Tests pass.
