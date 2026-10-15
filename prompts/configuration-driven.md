Prompt 2: Configuration-driven survey engine

Extend the existing ACBJ Survey Navigator repository with a configuration-driven question engine.

Create a reusable question schema supporting:
- questionId
- dataFieldId
- moduleId
- respondentLabel
- questionType
- requiredStatus
- helpText
- definition
- currentValue
- priorValue
- priorValuePeriod
- effectiveDate
- displayCondition
- validationRule
- followUpRule
- valuationInput

Support these question types:
- text
- number
- currency
- date
- email
- phone
- URL
- yes/no
- single select
- multi-select
- person
- address
- confirm existing value
- long text

Engine behavior:
- Render questions from configuration.
- Present primarily one question or tightly related group per screen.
- Validate required fields and type-specific input.
- Preserve answers when navigating backward and forward.
- Keep respondent wording independent from internal dataFieldId values.
- Add collapsible help/definition content.
- Add unit tests for schema parsing, required-field behavior and answer persistence.

Create a minimal universal test configuration with:
- business name
- street address
- city
- state
- ZIP
- main telephone
- website

Do not yet add the complete business-details inventory.

Acceptance checklist:
- Questions render from configuration, not hard-coded screens.
- All listed question types have a renderer or documented placeholder.
- Validation messages are clear and nontechnical.
- Internal field IDs are not shown to respondents.
- Back/forward navigation preserves answers.
- Tests pass.
