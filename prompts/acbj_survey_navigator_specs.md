ACBJ SURVEY NAVIGATOR

Formal v1 Product & Prototype Specification

Adaptive business survey architecture with BizEstimate

Status

Draft v1

Product

ACBJ Survey Navigator

Working feature

BizEstimate

Industry taxonomy

Deferred

Production valuation methodology

Deferred



Core principle

Ask the fewest questions necessary to accurately update a company’s business profile, using information ACBJ already possesses whenever possible and revealing additional questions only when previous responses make them relevant.



1. Product vision

ACBJ Survey Navigator will replace the experience of completing a traditional long-form business questionnaire with a guided, adaptive survey. The application should resemble the interaction model of consumer tax-preparation software: respondents move through a simple series of questions, see only information relevant to their business and previous answers, can save and return, and receive understandable feedback about progress and value.

Survey Navigator should:

Collect standardized business information needed by ACBJ.

Use existing ACBJ information whenever available rather than repeatedly requesting the same information.

Ask respondents to confirm or update existing information.

Determine the respondent’s industry during the survey.

Dynamically introduce relevant industry and specialty questions.

Capture limited forward-looking operating information.

Clearly distinguish required research questions from optional editorial questions.

Save progress automatically and support returning respondents.

Provide a continuously developing BizEstimate when sufficient eligible information has been supplied.

Minimize the number of questions any individual respondent must answer.

Guiding principle

Ask the fewest questions necessary to accurately update a company’s business profile, using information ACBJ already possesses whenever possible and revealing additional questions only when previous responses make them relevant.

2. Experience principles

Conversational

Questions should sound like something one person would reasonably ask another. Internal database terminology belongs in the data layer, not the respondent interface.

Progressive

Primarily present one question or one closely related question group at a time.

Contextual

Explain potentially confusing or sensitive questions where the respondent encounters them.

Adaptive

Do not display irrelevant fields.

Reassuring

Maintain a bright, clean, airy interface with substantial whitespace and uncomplicated controls.

Transparent

Tell respondents why potentially sensitive information is being requested when that context provides meaningful reassurance.

Forgiving

Respondents should be able to move backward and correct an answer without losing subsequent work.

3. Primary respondent journey

WELCOME / RESUME
  ↓
IDENTIFY BUSINESS
  ↓
CONFIRM KNOWN INFORMATION
  ↓
BUSINESS DETAILS
  ↓
INDUSTRY IDENTIFICATION
  ↓
SPECIALTY IDENTIFICATION
  ↓
INDUSTRY MODULE
  ↓
BUSINESS OUTLOOK
  ↓
OPTIONAL EDITORIAL QUESTIONS
  ↓
CONTACTS
  ↓
REVIEW
  ↓
SUBMIT

BizEstimate operates alongside this journey and may update whenever a response designated as a legitimate valuation input changes.

4. Universal Business Details module

4.1 Company identity

Business name

Street address

City

State

ZIP code

Main telephone

Website

Geographic footprint

Number of offices

Office locations

4.2 Leadership and contacts

CEO/top executive

Executive title

Executive email

Executive telephone

Survey contact

4.3 Company size and financial profile

Local/regional employee count

Companywide employee count

Most recently completed fiscal-year revenue

Fiscal-year ending period/date

4.4 Company history

Survey Navigator must support companywide year founded and, when configured, year founded locally. These are separate data values and must not be treated as synonyms.

When was your company founded?  Year founded: [ YYYY ]

5. Year Founded: detailed requirements and acceptance criteria

5.1 Standard question

When was your company founded?  Year founded: [ YYYY ]

Acceptance criteria:

Accept a four-digit year.

Reject alphabetic characters, negative numbers and malformed values.

Reject a future year.

Allow the respondent to move backward, change the year and continue without losing subsequent responses.

Persist the response after save/resume.

Store companywide founding year separately from year founded locally.

Display the saved founding year on Review with an Edit action.

5.2 Existing founding-year data

We have your company as founded in 1987. Is that correct?  • Yes, 1987 is correct  • No, update it

Display the existing value when one is available.

Selecting “correct” retains the year and records the value as confirmed.

Selecting “update” reveals an entry control.

An updated year becomes the current survey response while preserving the original prior value in application state.

Returning to the question displays the respondent’s latest choice.

Viewing the question alone does not constitute confirmation.

5.3 Companywide versus local founding

company_founded_year
local_founded_year

Did your company begin operating in this market in the same year?  • Yes  • No  • I’m not sure

Show the local question only when enabled by survey configuration.

If Yes is selected, the application may populate local founding year from company founding year, while retaining separate fields.

If No is selected, request a local founding year.

If “I’m not sure” is selected, permit continuation.

Changing companywide year must not silently overwrite a separately supplied local year.

Display both values distinctly on Review when both are present.

6. Ownership model

Ownership is divided into two distinct concepts because they measure different things: corporate ownership structure and voluntary company ownership description. The application must not collapse them into a single question.

6.1 Ownership structure

Tell us a little about how your company is organized. This helps us understand relationships among businesses and avoid treating a subsidiary or operating company as an unrelated organization.

Which best describes your company?

Independent, privately held company

Publicly traded company

Subsidiary or operating company of another company

Holding company or parent company

Portfolio company backed by private equity or another investment firm

Partnership

Nonprofit or foundation

Government/public entity

Other

I’m not sure

Acceptance criteria:

Allow one primary structure selection.

Persist the selection through navigation and save/resume.

Reevaluate conditional questions when the selection changes.

Hide branch-specific questions when they are no longer relevant.

Do not submit stale branch answers after a respondent changes to an incompatible ownership structure.

Allow “I’m not sure” without forcing a guess.

Display the selected structure on Review with an Edit action.

6.2 Subsidiary branch

What company owns or controls your business?  Parent company: [ Company name ]  • I’m not sure

Show only when ownership structure indicates a subsidiary or operating company.

Allow parent company name without requiring the respondent to know the parent’s legal structure.

Permit “I’m not sure.”

Persist the response through save/resume.

Store parent company separately from respondent business name.

Clearly distinguish Business and Parent company on Review.

If the respondent changes away from subsidiary status, prevent the former parent response from being submitted as applicable current information.

6.3 Holding company/parent branch

Does your company own or control other operating businesses?  • Yes  • No  • I’m not sure

Show only for the applicable structure.

Store Yes, No and I’m not sure as distinct states.

Persist through save/resume.

Do not require subsidiary enumeration in v1.

Allow future subsidiary/portfolio collection without changing the core question architecture.

6.4 Private equity/investment-backed branch

Who is the investment or parent organization associated with your business?  [ Organization name ]  • Prefer not to provide

Show only after the corresponding ownership structure is selected.

Request an organization, not information about individual investors.

Permit “Prefer not to provide.”

Persist through save/resume.

Store investment organization separately from company and parent-company fields.

Suppress an inapplicable investment-organization response if ownership structure changes.

6.5 Voluntary ownership description

Does your company describe its ownership in any of these ways? If any apply to your business and you are comfortable sharing them, select all that apply.

Family-owned

Veteran-owned

Woman-owned

Minority-owned

Employee-owned

Other ownership description

None of these

Prefer not to answer

Acceptance criteria:

Treat the entire question as optional.

Allow multiple applicable descriptions.

Permit continuation without a descriptor.

Provide “Prefer not to answer.”

Selecting “None of these” clears affirmative ownership descriptors.

Selecting an affirmative descriptor clears “None of these.”

Do not store “Prefer not to answer” simultaneously with an affirmative descriptor.

Do not show warnings or negative messages when a respondent declines.

Do not make an unanswered ownership-description question appear as an incomplete required item.

Persist ownership descriptions through save/resume.

Allow respondents to modify or remove previously selected descriptions.

Present this information on Review as Ownership description, separate from Ownership structure.

6.6 Sensitive ownership guardrail

Ownership descriptions must come from explicit respondent input or confirmation.

Do not infer ownership descriptors about people from names, photographs, biographies or other indirect signals.

Missing ownership-description data remains unknown, not “No.”

“Prefer not to answer” remains distinct from “None of these.”

Do not require identification of individual owners to answer the general ownership-description question.

Optional ownership-description fields must not affect core survey completion.

Declining optional ownership-description information must not affect BizEstimate.

Optional ownership descriptors must not be BizEstimate inputs.

6.7 Prior ownership information

We currently have your company listed as family-owned. Is that still accurate?  • Yes  • No  • Prefer not to answer

Identify previously stored descriptors as existing information rather than a new respondent assertion.

Allow the respondent to confirm, remove or decline to reconfirm a stored descriptor.

Opening the question does not constitute confirmation.

A prior designation does not automatically become a newly confirmed response.

Represent previous, confirmed and updated states distinctly in application state.

6.8 Ownership QA scenarios

Independent private company → no ownership-structure follow-up.

Subsidiary → parent-company question appears.

Subsidiary changed to Independent → parent question disappears and parent value is not submitted as current.

Holding company → operating-business control question appears.

Private-equity backed → investment-organization question appears.

Family-owned + Veteran-owned → both descriptions can be stored.

None of these → no affirmative description is stored.

Prefer not to answer → no ownership descriptor is inferred.

Skip ownership description → survey completion remains permitted.

Permanent design principle

Ownership structure is business/entity information. Ownership description is a voluntary company self-description. They remain separate throughout the survey, review and data model.

7. Known-information and returning-respondent workflow

Survey Navigator should not automatically ask respondents to re-enter data ACBJ already possesses. It should support confirmation and correction workflows.

Last year you reported 114 employees.  • That’s still correct  • Update this number

Application state must distinguish:

Known

Confirmed

Updated

New

Missing

Declined/not provided

No value becomes newly confirmed merely because a respondent viewed it.

8. Question schema

Every survey question should be configuration-driven and capable of storing the following attributes:

questionId
dataFieldId
moduleId
respondentLabel
questionType
requiredStatus
helpText
definition
currentValue
priorValue
priorValuePeriod
effectiveDate
displayCondition
validationRule
followUpRule
valuationInput

8.1 Reusable question types

Text

Number

Currency

Date

Email

Phone

URL

Yes/No

Single select

Multi-select

Person

Address

Confirm existing value

Long text

9. Branching engine

Conditional logic must be generic rather than hard-coded to individual industries.

IF planning_to_hire = YES
THEN show expected_hires

IF ownership_structure = SUBSIDIARY
THEN show parent_company

IF industry = ACCOUNTING
THEN load accounting_module

The engine evaluates conditions; survey configuration determines the conditions.

10. Industry classification architecture

Broad industry
  ↓
Industry
  ↓
Specialty / subcategory
  ↓
Classification / NAICS mapping
  ↓
Applicable industry question module

Deferred for later phase

The complete ACBJ industry taxonomy, specialty taxonomy, production NAICS mappings, industry-specific workforce counts, operating metrics, service/practice categories, definitions and newsroom questions are intentionally deferred.

Accounting will serve as the initial proof-of-concept industry module using the Honolulu accounting survey methodology already provided by the project owner.

11. Accounting proof-of-concept module

The prototype must demonstrate that an identified accounting business receives accounting-specific questions and then returns to the universal path. The sample module should support:

Local and firmwide professional staff

Local and firmwide CPAs

Local and firmwide partners

Services offered

Industries served

Industry-specific definitions/help text

Prior-year reference values where available

Non-accounting respondents must never encounter these accounting questions.

12. Business Outlook module

What’s ahead for your business? During the next 12 months, which of the following is your company considering?

Hiring additional employees

Expanding into additional space

Relocating

Opening additional locations

Raising capital

Acquiring another business

Considering a merger or sale

Entering new geographic markets

None of these

Prefer not to answer

Responses may trigger concise follow-ups. Examples:

Hiring = YES → Approximately how many people?
Additional space = YES → Approximately how much space?
Raising capital = YES → What type of capital?
Acquisition = YES → Is the company actively seeking opportunities?

The goal is to identify potentially meaningful business activity without creating another lengthy form.

13. Editorial module

Optional newsroom questions must be logically and visually separated from core research questions.

You’ve completed the information we need to update your business profile. Can you also give our newsroom a little insight? These questions are optional and may help inform our reporting.

The respondent must be able to select Continue or Skip for now. Skipping editorial questions must not block core submission.

14. BizEstimate

BizEstimate is a persistent respondent-benefit feature designed to develop alongside the survey, analogous to a continuously updating indicator. The survey and valuation logic must remain separate systems.

14.1 Display states

YOUR BIZESTIMATE — Complete a few questions to begin building your estimate.

YOUR BIZESTIMATE — $X.XM–$X.XM — Preliminary estimated range

BIZESTIMATE UPDATED — $X.XM–$X.XM

14.2 Prototype constraints

Any v1 BizEstimate monetary values must be clearly identified as synthetic demonstration values.

The prototype must not invent a production valuation formula.

Only fields designated as valuation inputs may affect the demonstrated range.

Ownership self-description fields must never affect BizEstimate.

The user interface may show the estimate changing as designated demonstration inputs are completed.

14.3 Architecture

SURVEY ENGINE
   ├─ Survey fields
   ├─ Industry classification
   ├─ Industry modules
   └─ Outlook
          │
          └─ designated eligible inputs → BIZESTIMATE ENGINE → Estimated range

Production valuation methodology, required financial inputs, industry adjustments, eligibility, confidence methodology and disclosures are deferred.

15. Save and resume

V1 must demonstrate:

Automatic response saving

Visible saved-status indicator

Resume from previous position

Backward navigation

Editing existing responses

No loss of previously entered data

Returning-respondent experience

✓ Progress saved

Welcome back. Your progress has been saved. Continue where you left off.

16. Progress experience

Because branching makes final question counts variable, the prototype should favor sectional progress rather than “Question 17 of 42.”

Company          ✓
Business details ✓
Your industry    ●
What’s ahead     ○
Review           ○

17. Contact management

The prototype must support confirming, editing, removing and adding business contacts without exposing internal record-management instructions to respondents.

The experience should support:

Confirming CEO/top executive information

Editing an existing executive

Adding another executive/contact

Removing a contact who is no longer associated with the organization

Selecting or adding the best survey contact

18. Review and submission

Let’s make sure everything looks right.

Review should group responses into sections:

Company

Leadership

Business details

Ownership

Industry

Industry details

Business outlook

Contacts

Each section must include an Edit action. Editing one section must not require restarting the survey. Submission must have an unambiguous completed state.

19. Developer/debug mode

V1 should include a non-respondent debug view that explains why conditional content appeared. This capability is intended for research/product testing and must not be visible in the normal respondent experience.

Question: Local CPAs
Module: accounting
Displayed because: industry = accounting
Required: yes

20. Prototype acceptance scenarios

Scenario

Pass condition

A. New business

No existing information; respondent completes the universal path.

B. Returning business

Respondent reviews and confirms stored information rather than re-entering it.

C. Changed information

Respondent corrects a previous employee, revenue, executive or address value.

D. Accounting firm

Accounting classification triggers the accounting proof-of-concept module.

E. Non-accounting business

Accounting questions never appear.

F. Subsidiary

Ownership structure triggers the parent-company question.

G. Ownership description

Optional ownership descriptors can be selected, declined or skipped without blocking completion.

H. Outlook branch

Selecting Hiring triggers expected-hiring follow-up; selecting No does not.

I. Save/resume

Respondent leaves and returns without losing responses or position.

J. BizEstimate

BizEstimate state changes only when designated demonstration valuation inputs are supplied.

K. Editorial

Respondent skips editorial questions and still completes submission.

L. Year founded

Existing year can be confirmed or corrected; local and companywide years remain distinct.

21. V1 demonstration journeys

21.1 New respondent

Welcome → Company basics → Company size → Industry placeholder → Business outlook → Contacts → Review → Submit

21.2 Returning respondent

Welcome back → Prior values → Confirm / Update → Only changed or missing information → Continue

21.3 Accounting respondent

Industry = Accounting → Accounting module → Return to universal path

22. Explicitly deferred from v1

Complete industry taxonomy

Complete specialty taxonomy

Production NAICS mappings

Production BizEstimate formula

Industry valuation multipliers/adjustments

Final valuation disclosures

Production authentication

Production database/API integration

Final ACBJ field mapping

Final visual branding

Final legal/brand review of BizEstimate

These items are not blockers for prototype development. The v1 architecture must accommodate them without requiring the core survey engine to be rebuilt.

23. Definition of done for the prototype

The prototype is ready for stakeholder testing when all of the following are true:

The three demonstration journeys function end to end.

Conditional branching behaves according to configuration.

Existing values can be confirmed or updated.

Year-founded and ownership acceptance criteria pass.

Accounting-specific questions appear only for the accounting test path.

Outlook follow-ups appear only when triggered.

Optional editorial questions can be skipped.

Responses persist through the prototype save/resume mechanism.

Review/edit works without restarting the survey.

BizEstimate demonstrates state changes using clearly labeled synthetic values only.

Debug mode identifies the trigger behind conditional questions.

No deferred industry taxonomy or production valuation methodology has been hard-coded or invented.

24. Handoff to implementation

This specification is the v1 source of truth for the prototype. Implementation prompts should be derived from it in stages: application shell and visual system; universal question schema; branching engine; prior-value confirmation; accounting proof module; business outlook; optional editorial path; BizEstimate interface; review/submit; and acceptance-test correction.

The full industry and specialty taxonomy, along with the production BizEstimate methodology, will be specified in later project phases.
