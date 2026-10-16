# ACBJ Survey Navigator v1.1 — GitHub Implementation Prompt

## How to use

Apply this prompt to the existing ACBJ Survey Navigator repository as a **new iteration of the existing prototype**, not as a new application. Preserve accepted v1 behavior. Implement this on a feature branch/pull request, run the existing test suite plus the new acceptance tests below, review the prototype, and merge only after acceptance.

## Prompt for GitHub Copilot / coding agent

You are extending the existing ACBJ Survey Navigator repository with the Survey Navigator v1.1 Industry Identification & Classification workstream.

Inspect the existing repository, package scripts, architecture, question engine, branching engine, state model, autosave implementation, Accounting module and tests before making changes. Preserve the established stack and accepted v1 functionality. Do not replace working infrastructure or introduce a second survey engine.

### GOAL

Replace the v1 industry placeholder with a versioned, configuration-driven classification experience that supports:

1. Broad industry
2. Industry
3. Specialty/subcategory where configured
4. One primary industry and zero or more secondary industries
5. Distinct Other and I'm not sure paths
6. Internal, versioned NAICS mappings
7. Configuration-driven industry-module loading
8. Safe module unloading and stale-answer exclusion
9. Save/resume, Review/Edit and developer diagnostics

### RESPONDENT EXPERIENCE

Use plain-language labels. Never display internal taxonomy IDs or NAICS codes.

If a prior classification exists, ask the respondent to:
- Confirm it
- Update it
- Select "I'm not sure"

Otherwise provide:
- Search/type-ahead by industry label, specialty, synonym and common term
- Browse by broad industry
- "Something else"
- "I'm not sure"

After the primary industry is selected, ask:

"Does your company have another significant line of business?"

Options:
- Yes
- No
- I'm not sure

If Yes, allow additional industry selections. Do not allow the primary industry to be duplicated as a secondary industry.

Make the configured reporting scope visible in help text:
- local operation
- companywide
- specific establishment

Clarify that respondents should classify what the company does, not the industries its customers represent.

### SEED BROAD-INDUSTRY CONFIGURATION

Create stable IDs and respondent labels for:

- `broad.natural-resources-energy-utilities` — Agriculture, natural resources, energy & utilities
- `broad.construction-building` — Construction & building services
- `broad.manufacturing` — Manufacturing
- `broad.wholesale-distribution` — Wholesale, distribution & supply
- `broad.retail-consumer` — Retail & consumer commerce
- `broad.transport-logistics` — Transportation, logistics & warehousing
- `broad.technology-media-communications` — Technology, media & communications
- `broad.finance-insurance` — Finance, banking & insurance
- `broad.real-estate-property` — Real estate & property services
- `broad.professional-business-services` — Professional, scientific & business services
- `broad.education-training` — Education & training
- `broad.health-life-sciences` — Health care, life sciences & social assistance
- `broad.hospitality-food-arts` — Hospitality, food, arts & recreation
- `broad.personal-civic-other-services` — Personal, repair, civic & other services
- `broad.government-public` — Government & public administration

Each broad category must support a configured "Another business in this category" option. The top level must also provide "Something else" and "I'm not sure."

### SEED PRIORITY INDUSTRIES

At minimum, configure these industries under appropriate broad categories:

- Accounting
- Legal services
- Architecture
- Engineering
- Consulting
- Staffing and recruiting
- General contractors
- Homebuilders
- Heavy and civil construction
- Specialty trade contractors
- Manufacturing
- Banks
- Credit unions
- Commercial lending
- Mortgage lending
- Investment and wealth management
- Insurance carriers
- Insurance brokerages
- Commercial real estate brokerage
- Residential real estate brokerage
- Property management
- Real estate development
- Colleges and universities
- K-12 schools and districts
- Charter schools
- Private schools
- Hospitals
- Physician and ambulatory care
- Dental care
- Home health
- Nursing and residential care
- Senior living
- Hotels and resorts
- Restaurants and food service
- Golf and country clubs
- Airlines and aviation
- Trucking
- Warehousing and logistics

The taxonomy must be configuration data, not JSX/component branching.

### SPECIALTIES

Support optional and required specialty configuration.

Seed specialties for:

- Accounting: CPA firm; other accounting services; bookkeeping-focused firm
- Engineering: civil; structural; mechanical/electrical; environmental; transportation; surveying/geospatial
- Specialty trade contractors: electrical; plumbing/HVAC; concrete; structural steel; framing; masonry; glass; roofing; siding; drywall/insulation; painting; flooring; finish carpentry; site preparation; remediation; other trade
- Insurance: property and casualty; life and health; employee benefits; carrier; brokerage
- Real estate: commercial brokerage; residential brokerage; property management; development; appraisal; title/escrow
- Health care: hospital; physician practice; dental; home health; nursing care; assisted living; independent living; behavioral health
- Education: university; community college; K-12 district; charter school; private school; vocational/training
- Hospitality: hotel; resort; restaurant; country club/golf; entertainment venue

Do not model services offered or industries served as the company's own industry. Those remain module-specific fields.

### DATA MODEL

Add typed schemas equivalent to:

`IndustryTaxonomyNode`
- id
- parentId
- level: broad | industry | specialty
- respondentLabel
- shortDescription
- synonyms
- status: active | draft | retired
- selectionMode for children: single | multi
- specialtyRequired
- moduleTags
- sortOrder
- effectiveFrom
- effectiveTo

`IndustryClassification`
- classificationId
- reportingScope
- taxonomyVersion
- primary selection or null
- secondary selections
- status
- source
- otherDescription
- uncertaintyNote
- naicsVintage
- naicsCandidates
- activeModuleIds
- confirmation/history metadata

`NaicsCrosswalk`
- taxonomyVersion
- industryId
- optional specialtyId
- naicsVintage
- naicsCode
- naicsTitle
- relationship
- useCases
- reviewStatus
- effectiveFrom
- effectiveTo
- notes

Use taxonomy version `survey-navigator-industry-1.1.0` and NAICS vintage `2022`.

### CLASSIFICATION STATUSES

Support:
- prior_unconfirmed
- respondent_confirmed
- respondent_updated
- respondent_selected
- researcher_verified
- other_unmapped
- unsure_manual_review

Opening or viewing a prior classification must not confirm it.

### OTHER PATH

For "Another business in this category":
- Preserve the broad-industry ID.
- Ask "How would you describe your company's main business activity?"
- Require a nonempty meaningful description.
- Store status `other_unmapped`.
- Load no industry module.
- Add a manual-review item.
- Display the description on Review.

For global "Something else":
- Ask the same description.
- Do not fabricate broad, industry or specialty IDs.
- Store status `other_unmapped`.
- Load no industry module.

### I'M NOT SURE PATH

- Permit continuation without a guess.
- Offer the optional prompt: "In a few words, what does the company make, sell or do?"
- Store status `unsure_manual_review`.
- Preserve prior values only as unconfirmed history.
- Load no industry module.
- Add a manual-review item.
- Do not block completion or submission.

### NAICS

Keep all NAICS information internal.

Seed approved Accounting sourcing candidates:
- 541211 — Office of Certified Public Accountants
- 541219 — Other Accounting Services

Represent all remaining detailed mappings as draft configuration unless the repository already contains approved mappings.

Support many-to-many crosswalks and these relationships:
- exact
- broader_than_internal
- narrower_than_internal
- partial_overlap
- one_of_multiple_candidates

Separate mapping use cases:
- classification
- survey_eligibility
- cloud_query_sourcing
- analytics

Do not derive a six-digit code from broad-industry selection alone.

### MODULE LOADING

Implement module selection through configuration.

An industry module may load only when:
- the module is enabled;
- survey/reporting scope is compatible;
- the confirmed primary industry or specialty satisfies the entry rule;
- the classification status is respondent_confirmed, respondent_updated, respondent_selected or researcher_verified;
- the survey/market configuration enables that module.

Accounting:
- Selecting Accounting as confirmed primary loads the existing Accounting module.
- Accounting as secondary does not load the module by default.
- Non-accounting, Other and unsure paths never load Accounting questions.

Broad-category selection alone must never load an industry module.

If multiple modules become eligible:
- Load the primary module first.
- Load a secondary module only when explicitly enabled.
- Do not repeat universal questions.

### RECLASSIFICATION AND STALE DATA

When a classification changes:
- Reevaluate the module plan immediately.
- Deactivate incompatible modules.
- Preserve their answers in audit/debug state.
- Exclude stale answers from visible questions, required-field checks, Review and active submission payloads.
- If the respondent restores the compatible classification during the same response, restore the saved module answers without treating them as newly confirmed.

### SAVE, RESUME AND REVIEW

Persist:
- taxonomy version
- reporting scope
- primary and secondary selections
- specialties
- classification status and source
- free-text Other/unsure descriptions
- active modules
- historical classifications
- current survey position

Review must show respondent-friendly:
- Primary industry
- Specialties
- Secondary industries
- Other description or "Needs review," when relevant

Provide Edit and return to Review without losing unrelated responses.

### CONFIGURATION VALIDATION

Add build-time or test-time validation for:
- duplicate node IDs
- missing parent IDs
- circular hierarchy
- invalid level ordering
- missing respondent labels
- duplicate siblings
- orphan specialties
- missing module references
- invalid NAICS vintage
- invalid relationship values
- invalid retired/effective-date combinations

Errors must be actionable in developer output and invisible to respondents.

### DEVELOPER DIAGNOSTICS

Extend development-only diagnostics to show:
- taxonomy version
- reporting scope
- primary and secondary selections
- classification status and source
- matched module rules
- active and inactive modules
- NAICS candidates and review status
- manual-review reason
- stale answers excluded from the payload

Do not expose diagnostics in normal production/respondent mode.

### ANALYTICS

Instrument:
- classification started/completed
- prior classification confirmed/rejected
- search performed
- search with no results
- category browsed
- Other selected
- Something else selected
- I'm not sure selected
- secondary industry added/removed
- module loaded/unloaded
- classification edited from Review

Do not place free-text business descriptions in analytics event properties.

### TESTS

Add unit, integration and end-to-end tests for:

1. Prior classification confirm.
2. Prior classification update with history retained.
3. Search and browse reaching the same stable ID.
4. Accounting primary loading Accounting module.
5. Non-accounting primary never loading Accounting module.
6. Accounting secondary not loading by default.
7. Category Other preserving broad ID and creating review item.
8. Global Something else creating no fabricated taxonomy IDs.
9. I'm not sure allowing completion.
10. Multiple secondary industries.
11. Primary cannot be duplicated as secondary.
12. Accounting-to-non-accounting change unloading the module.
13. Stale answers excluded from validation and submission.
14. Compatible classification restored during the session restoring answers.
15. Save/resume preserving complete classification state.
16. Review/Edit returning to Review without unrelated data loss.
17. Respondent mode containing no NAICS codes or internal IDs.
18. New configured industry rendering without component changes.
19. Invalid taxonomy configurations failing validation.
20. Keyboard-only and automated accessibility coverage.
21. Mobile and desktop end-to-end paths.

### DEFINITION OF DONE

- Build passes.
- Lint passes.
- Unit, integration and end-to-end tests pass.
- Automated accessibility checks have no critical failures.
- Accounting and universal survey behavior remain intact.
- Industry rendering and module loading are configuration-driven.
- Other and unsure paths work end to end.
- NAICS remains internal and versioned.
- Inactive module answers are excluded from the active payload.
- README documents the taxonomy structure, stable-ID policy, reporting scope, NAICS crosswalk, module-rule format, manual-review states, extension process and intentionally draft mappings.
- Summarize files changed, tests run, test results, migration considerations and remaining mapping-review work.

### STOP CONDITION

Implement only v1.1. Do not begin v1.2 industry-specific information architecture in this change. Do not redesign accepted v1 screens or BizEstimate behavior except where required to integrate the v1.1 classification flow.
