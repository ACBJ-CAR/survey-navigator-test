Prompt 10: Accounting proof-of-concept module

Create the Accounting industry proof-of-concept module based on the Honolulu accounting survey example.

Configured questions:
- Local professional staff
- Firmwide professional staff
- Local CPAs
- Firmwide CPAs
- Local partners
- Firmwide partners
- Services offered
- Other service, conditional on Other
- Industries served
- Brief business description

Professional-staff help text:
Include CPAs, accountants and other client-billable consultants offering accounting and professional services, such as risk management, compliance and technology consulting. Exclude administrative, HR, sales and marketing staff.

Services demonstration options:
- Audit
- Tax
- Bookkeeping
- Payroll processing
- Business valuation
- Mergers & acquisitions
- Small-business services
- Employee benefits
- Financial planning
- Investment services
- Estate planning
- Insurance
- Information technology
- Personal finance
- Other

Requirements:
- Load only when industry = Accounting.
- Allow local and firmwide counts to remain separate.
- Support effective/as-of date labels from configuration.
- Support prior-year confirmation where demonstration data exists.
- Return to the universal survey path after completion.
- Do not treat this module as the final industry taxonomy.

Acceptance checklist:
- Accounting path sees all configured accounting questions.
- Non-accounting path sees none.
- Other service follow-up is conditional.
- Definitions are accessible but not visually overwhelming.
- Local/firmwide values remain separate.
- Tests pass.
