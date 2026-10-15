# Survey modules

Question modules are configured in `src/config/survey.ts`. The renderer uses
those configurations and display conditions to assemble the respondent flow.

The accounting module is a proof of concept and is shown only when the
respondent selects Accounting. Do not extend its options into a complete
industry catalog without an approved taxonomy.

`bizEstimate.ts` is an isolated adapter with synthetic fixture ranges. Replace
it only after a production valuation method and required disclosures are
approved.
