Prompt 9: Industry-identification placeholder

Add the v1 industry-identification framework without inventing the final taxonomy.

Create a staged structure for:
- broad industry
- industry
- specialty/subcategory
- classification/NAICS mapping placeholder
- applicable industry module

Requirements:
- Use plain-language respondent labels.
- Do not ask respondents to know a NAICS code.
- Add only enough demonstration options to prove branching, including Accounting and a generic Other business path.
- Store internal classification separately from respondent labels.
- Mark complete taxonomy, specialty definitions and production NAICS mappings as deferred in code comments and README documentation.
- Non-accounting selections must follow the universal path and never load accounting questions.

Acceptance checklist:
- The framework supports future taxonomy expansion through configuration.
- Accounting and non-accounting paths work.
- No broad industry catalog has been invented.
- NAICS remains a placeholder mapping layer.
- Tests pass.
