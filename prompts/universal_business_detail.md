Prompt 4: Full universal Business Details module

Implement the universal Business Details module using the existing survey engine.

Add configured questions for:
Company identity:
- Business name
- Street address
- City
- State
- ZIP code
- Main telephone
- Website
- Geographic footprint
- Number of offices
- Office locations

Leadership and contacts:
- CEO/top executive name
- Executive title
- Executive email
- Executive telephone
- Survey contact

Company size and financial profile:
- Local/regional employees
- Companywide employees
- Most recently completed fiscal-year revenue
- Fiscal-year ending period/date

Company history:
- Companywide year founded
- Configurable year founded locally

Requirements:
- Group closely related address and contact fields when this reduces friction.
- Use conversational respondent wording.
- Validate email, URL, telephone, numeric, currency and date inputs.
- Allow survey configuration to determine required versus optional fields.
- Include as-of/effective dates in question configuration where appropriate.
- Keep “local” configurable rather than hard-coded to a specific market.
- Add Review-ready human-readable labels for all values.

Acceptance checklist:
- All universal fields are represented in configuration.
- Required status is configuration-driven.
- Local and companywide values are distinct.
- Validation works and does not discard responses.
- Mobile layout remains usable.
- Tests pass.
