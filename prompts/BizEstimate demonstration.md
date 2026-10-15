Prompt 14: BizEstimate demonstration engine and UI

Implement the v1 BizEstimate demonstration interface and a clearly synthetic calculation adapter.

Critical restrictions:
- Do not invent or imply a production business-valuation methodology.
- Label all displayed monetary ranges as synthetic prototype values.
- Keep the survey engine separate from the BizEstimate adapter.
- Only fields explicitly marked valuationInput may trigger a demonstration update.
- Ownership descriptions and optional editorial responses must never affect BizEstimate.

States:
1. Insufficient information:
“Your BizEstimate — Complete a few questions to begin building your estimate.”
2. Preliminary:
“Your BizEstimate — $X.XM–$X.XM — Synthetic prototype estimate.”
3. Updated:
“BizEstimate updated — $X.XM–$X.XM — Synthetic prototype estimate.”

Implementation:
- Create an adapter/interface that accepts designated inputs and returns a demo range plus status.
- Use deterministic fixture logic solely so tests and demos are repeatable.
- Put prominent comments and README notes that this is not a production valuation model.
- Animate updates subtly while respecting reduced-motion preferences.
- Explain which completed survey areas have helped refine the demonstration without exposing a false formula.

Acceptance checklist:
- Initial, preliminary and updated states render.
- Updates occur only after designated inputs.
- Synthetic labeling is always visible with a monetary range.
- Ownership descriptions/editorial answers cannot affect the range.
- Adapter can be replaced later without rewriting the survey engine.
- Tests pass.
