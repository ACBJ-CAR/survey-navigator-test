export type SectionId =
  | "company"
  | "business-details"
  | "industry"
  | "outlook"
  | "review";

export type Condition =
  | { field: string; operator: "equals" | "notEquals" | "includes" | "greaterThan" | "exists"; value?: unknown }
  | { all: Condition[] }
  | { any: Condition[] };

export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "email"
  | "phone"
  | "url"
  | "year"
  | "longText"
  | "singleSelect"
  | "multiSelect"
  | "yesNo"
  | "confirm"
  | "person"
  | "address";

export type QuestionField = {
  id: string;
  dataFieldId: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  helpText?: string;
  valuationInput?: boolean;
  exclusive?: boolean;
};

export type SurveyQuestion = {
  questionId: string;
  dataFieldId: string;
  moduleId: string;
  section: Exclude<SectionId, "review">;
  respondentLabel: string;
  questionType: FieldType | "group" | "transition";
  requiredStatus: "required" | "optional";
  helpText?: string;
  definition?: string;
  fields?: QuestionField[];
  options?: { label: string; value: string }[];
  displayCondition?: Condition;
  followUpRule?: string;
  priorValue?: string;
  priorValuePeriod?: string;
  effectiveDate?: string;
  valuationInput?: boolean;
  currentValue?: unknown;
  validationRule?: string;
};

export const sections: { id: SectionId; label: string }[] = [
  { id: "company", label: "Company" },
  { id: "business-details", label: "Business details" },
  { id: "industry", label: "Your industry" },
  { id: "outlook", label: "What’s ahead" },
  { id: "review", label: "Review" },
];

const field = (
  id: string,
  label: string,
  type: FieldType = "text",
  options?: QuestionField["options"],
  extras: Partial<QuestionField> = {},
): QuestionField => {
  const { dataFieldId, ...attributes } = extras;
  return {
    id,
    dataFieldId: dataFieldId ?? toDataFieldId(id),
    label,
    type,
    options,
    ...attributes,
  };
};

const ownershipOptions = [
  "Independent, privately held company",
  "Publicly traded company",
  "Subsidiary or operating company of another company",
  "Holding company or parent company",
  "Portfolio company backed by private equity or another investment firm",
  "Partnership",
  "Nonprofit or foundation",
  "Government/public entity",
  "Other",
  "I’m not sure",
].map((label) => ({ label, value: label }));

const outlookOptions = [
  "Hiring additional employees",
  "Expanding into additional space",
  "Relocating",
  "Opening additional locations",
  "Raising capital",
  "Acquiring another business",
  "Considering a merger or sale",
  "Entering new geographic markets",
  "None of these",
  "Prefer not to answer",
].map((label) => ({ label, value: label }));

const services = [
  "Audit",
  "Tax",
  "Bookkeeping",
  "Payroll processing",
  "Business valuation",
  "Mergers & acquisitions",
  "Small-business services",
  "Employee benefits",
  "Financial planning",
  "Investment services",
  "Estate planning",
  "Insurance",
  "Information technology",
  "Personal finance",
  "Other",
].map((label) => ({ label, value: label }));

const accountingCondition: Condition = {
  field: "industry",
  operator: "equals",
  value: "accounting",
};

const isReturning: Condition = {
  field: "respondentType",
  operator: "equals",
  value: "returning",
};

export const surveyQuestions: SurveyQuestion[] = [
  {
    questionId: "existing-business-name",
    dataFieldId: "business_name_confirmation",
    moduleId: "company",
    section: "company",
    respondentLabel: "Welcome back to the sample company. We have it listed as Island Pacific Demo Co. Is that right?",
    questionType: "confirm",
    requiredStatus: "optional",
    displayCondition: isReturning,
    fields: [field("nameConfirmation", "Confirm or update the business name", "confirm", [
      { label: "Yes, that’s right", value: "confirmed" },
      { label: "I need to update it", value: "update" },
    ])],
  },
  {
    questionId: "business-name",
    dataFieldId: "business_name",
    moduleId: "company",
    section: "company",
    respondentLabel: "What’s the name of your business?",
    questionType: "text",
    requiredStatus: "required",
    displayCondition: {
      any: [
        { field: "respondentType", operator: "notEquals", value: "returning" },
        { field: "nameConfirmation", operator: "equals", value: "update" },
      ],
    },
    fields: [field("businessName", "Business name", "text", undefined, { required: true })],
  },
  {
    questionId: "existing-address",
    dataFieldId: "address_confirmation",
    moduleId: "company",
    section: "company",
    respondentLabel: "Let’s make sure we have the right address.",
    questionType: "confirm",
    requiredStatus: "optional",
    priorValue: "425 Ward Avenue, Honolulu, HI 96814",
    priorValuePeriod: "Last year",
    displayCondition: isReturning,
    fields: [
      field("addressConfirmation", "Is this still correct?", "confirm", [
        { label: "Yes, that’s right", value: "confirmed" },
        { label: "I need to update it", value: "update" },
      ]),
    ],
  },
  {
    questionId: "business-address",
    dataFieldId: "business_address",
    moduleId: "company",
    section: "company",
    respondentLabel: "Where is your business located?",
    questionType: "group",
    requiredStatus: "required",
    displayCondition: {
      any: [
        { field: "respondentType", operator: "notEquals", value: "returning" },
        { field: "addressConfirmation", operator: "equals", value: "update" },
        { field: "addressConfirmation", operator: "equals", value: "updated" },
      ],
    },
    fields: [
      field("streetAddress", "Street address", "text", undefined, { required: true, placeholder: "Street and number" }),
      field("city", "City", "text", undefined, { required: true }),
      field("state", "State", "text", undefined, { required: true, placeholder: "State or territory" }),
      field("zip", "ZIP code", "text", undefined, { required: true }),
    ],
  },
  {
    questionId: "company-contact",
    dataFieldId: "company_contact",
    moduleId: "company",
    section: "company",
    respondentLabel: "How can people reach your business?",
    questionType: "group",
    requiredStatus: "optional",
    fields: [
      field("mainTelephone", "Main telephone", "phone"),
      field("website", "Website", "url", undefined, { placeholder: "https://" }),
    ],
  },
  {
    questionId: "footprint",
    dataFieldId: "geographic_footprint",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "Where does your business operate?",
    questionType: "singleSelect",
    requiredStatus: "optional",
    fields: [
      field("geographicFootprint", "Choose the closest fit", "singleSelect", [
        { label: "In one local area", value: "local" },
        { label: "Across a region", value: "regional" },
        { label: "Across the United States", value: "national" },
        { label: "In multiple countries", value: "international" },
        { label: "Another footprint", value: "other" },
        { label: "I’m not sure", value: "unsure" },
      ]),
    ],
  },
  {
    questionId: "offices",
    dataFieldId: "office_count",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "How many offices does your company have?",
    questionType: "number",
    requiredStatus: "optional",
    fields: [field("officeCount", "Number of offices", "number", undefined, { placeholder: "For example, 2" })],
  },
  {
    questionId: "office-locations",
    dataFieldId: "office_locations",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "Where are your other offices?",
    questionType: "longText",
    requiredStatus: "optional",
    displayCondition: { field: "officeCount", operator: "greaterThan", value: 1 },
    fields: [field("officeLocations", "List the cities or locations", "longText")],
  },
  {
    questionId: "existing-executive",
    dataFieldId: "executive_confirmation",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "We have Alex Morgan listed as the company’s top executive. Is that still right?",
    questionType: "confirm",
    requiredStatus: "optional",
    priorValue: "Alex Morgan, Chief Executive Officer",
    priorValuePeriod: "Our current information",
    displayCondition: isReturning,
    fields: [field("executiveConfirmation", "Confirm or update this information", "confirm", [
      { label: "That’s still correct", value: "confirmed" },
      { label: "I need to update it", value: "update" },
    ])],
  },
  {
    questionId: "executive",
    dataFieldId: "top_executive",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "Who leads the company?",
    questionType: "group",
    requiredStatus: "optional",
    displayCondition: {
      any: [
        { field: "respondentType", operator: "notEquals", value: "returning" },
        { field: "executiveConfirmation", operator: "equals", value: "update" },
        { field: "executiveConfirmation", operator: "equals", value: "updated" },
      ],
    },
    fields: [
      field("executiveName", "CEO or top executive", "text"),
      field("executiveTitle", "Title", "text"),
      field("executiveEmail", "Email", "email"),
      field("executivePhone", "Telephone", "phone"),
    ],
  },
  {
    questionId: "existing-employees",
    dataFieldId: "employee_count_confirmation",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "Last year you reported 114 companywide employees. Is that still correct?",
    questionType: "confirm",
    requiredStatus: "optional",
    priorValue: "114 employees",
    priorValuePeriod: "Last year",
    displayCondition: isReturning,
    fields: [field("employeesConfirmation", "Confirm or update this number", "confirm", [
      { label: "That’s still correct", value: "confirmed" },
      { label: "Update this number", value: "update" },
    ])],
  },
  {
    questionId: "company-size",
    dataFieldId: "employee_counts",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "About how many people work for your company?",
    questionType: "group",
    requiredStatus: "optional",
    effectiveDate: "Current estimate",
    displayCondition: {
      any: [
        { field: "respondentType", operator: "notEquals", value: "returning" },
        { field: "employeesConfirmation", operator: "equals", value: "update" },
        { field: "employeesConfirmation", operator: "equals", value: "updated" },
      ],
    },
    fields: [
      field("localEmployees", "In this market", "number"),
      field("companyEmployees", "Across the whole company", "number", undefined, { valuationInput: true }),
    ],
  },
  {
    questionId: "existing-revenue",
    dataFieldId: "revenue_confirmation",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "We have your most recently reported annual revenue as $4,200,000. Is that still right?",
    questionType: "confirm",
    requiredStatus: "optional",
    priorValue: "$4,200,000",
    priorValuePeriod: "Last reported fiscal year",
    displayCondition: isReturning,
    fields: [field("revenueConfirmation", "Confirm or update this amount", "confirm", [
      { label: "That’s still correct", value: "confirmed" },
      { label: "Update this amount", value: "update" },
    ])],
  },
  {
    questionId: "financial-profile",
    dataFieldId: "financial_profile",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "Let’s talk about your most recently completed fiscal year.",
    questionType: "group",
    requiredStatus: "optional",
    displayCondition: {
      any: [
        { field: "respondentType", operator: "notEquals", value: "returning" },
        { field: "revenueConfirmation", operator: "equals", value: "update" },
        { field: "revenueConfirmation", operator: "equals", value: "updated" },
      ],
    },
    fields: [
      field("annualRevenue", "Approximate companywide revenue", "currency", undefined, { valuationInput: true }),
      field("fiscalYearEnd", "When did that fiscal year end?", "date"),
    ],
  },
  {
    questionId: "existing-year-founded",
    dataFieldId: "company_founded_year_confirmation",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "We have your company as founded in 1987. Is that correct?",
    questionType: "confirm",
    requiredStatus: "optional",
    priorValue: "1987",
    priorValuePeriod: "Our current information",
    displayCondition: isReturning,
    fields: [field("foundedYearConfirmation", "Confirm or update the year", "confirm", [
      { label: "Yes, 1987 is correct", value: "confirmed" },
      { label: "No, update it", value: "update" },
    ])],
  },
  {
    questionId: "founded-year",
    dataFieldId: "company_founded_year",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "When was your company founded?",
    questionType: "year",
    requiredStatus: "required",
    displayCondition: {
      any: [
        { field: "respondentType", operator: "notEquals", value: "returning" },
        { field: "foundedYearConfirmation", operator: "equals", value: "update" },
        { field: "foundedYearConfirmation", operator: "equals", value: "updated" },
      ],
    },
    fields: [field("foundedYear", "Year founded", "year", undefined, { required: true, placeholder: "YYYY" })],
  },
  {
    questionId: "local-started-same-year",
    dataFieldId: "local_founding_same_year",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "Did your company begin operating in this market in the same year?",
    questionType: "yesNo",
    requiredStatus: "optional",
    helpText: "This is separate from the year the company as a whole was founded.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I’m not sure", value: "unsure" },
    ],
    fields: [field("localFoundedSameYear", "Choose one", "singleSelect", [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I’m not sure", value: "unsure" },
    ], { dataFieldId: "local_founding_same_year" })],
  },
  {
    questionId: "local-founded-year",
    dataFieldId: "local_founded_year",
    moduleId: "business-details",
    section: "business-details",
    respondentLabel: "What year did your company begin operating in this market?",
    questionType: "year",
    requiredStatus: "optional",
    displayCondition: { field: "localFoundedSameYear", operator: "equals", value: "no" },
    fields: [field("localFoundedYear", "Year local operations began", "year", undefined, { placeholder: "YYYY" })],
  },
  {
    questionId: "ownership-structure",
    dataFieldId: "ownership_structure",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "Tell us a little about how your company is organized.",
    questionType: "singleSelect",
    requiredStatus: "required",
    helpText:
      "This helps us understand relationships among businesses and avoid treating a subsidiary or operating company as an unrelated organization.",
    fields: [field("ownershipStructure", "Which best describes your company?", "singleSelect", ownershipOptions, { required: true })],
  },
  {
    questionId: "parent-company-known",
    dataFieldId: "parent_company_knowledge",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "Do you know the name of the company that owns or controls your business?",
    questionType: "singleSelect",
    requiredStatus: "optional",
    displayCondition: { field: "ownershipStructure", operator: "equals", value: "Subsidiary or operating company of another company" },
    fields: [field("parentCompanyKnown", "Choose one", "singleSelect", [
      { label: "Yes, I know it", value: "yes" },
      { label: "I’m not sure", value: "unsure" },
    ])],
  },
  {
    questionId: "parent-company",
    dataFieldId: "parent_company",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "What company owns or controls your business?",
    questionType: "text",
    requiredStatus: "optional",
    displayCondition: {
      all: [
        { field: "ownershipStructure", operator: "equals", value: "Subsidiary or operating company of another company" },
        { field: "parentCompanyKnown", operator: "equals", value: "yes" },
      ],
    },
    fields: [field("parentCompany", "Parent company name", "text")],
  },
  {
    questionId: "holding-company",
    dataFieldId: "controls_operating_businesses",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "Does your company own or control other operating businesses?",
    questionType: "yesNo",
    requiredStatus: "optional",
    displayCondition: { field: "ownershipStructure", operator: "equals", value: "Holding company or parent company" },
    fields: [field("controlsBusinesses", "Choose one", "singleSelect", [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I’m not sure", value: "unsure" },
    ])],
  },
  {
    questionId: "investment-organization",
    dataFieldId: "investment_organization_preference",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "Would you like to name the investment or parent organization associated with your business?",
    questionType: "singleSelect",
    requiredStatus: "optional",
    helpText: "Please name an organization, not individual investors.",
    displayCondition: { field: "ownershipStructure", operator: "equals", value: "Portfolio company backed by private equity or another investment firm" },
    fields: [field("investmentOrganizationChoice", "Choose one", "singleSelect", [
      { label: "I can provide the organization name", value: "provide" },
      { label: "Prefer not to provide", value: "declined" },
    ])],
  },
  {
    questionId: "investment-organization-name",
    dataFieldId: "investment_organization",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "What is the organization’s name?",
    questionType: "text",
    requiredStatus: "optional",
    displayCondition: {
      all: [
        { field: "ownershipStructure", operator: "equals", value: "Portfolio company backed by private equity or another investment firm" },
        { field: "investmentOrganizationChoice", operator: "equals", value: "provide" },
      ],
    },
    fields: [field("investmentOrganization", "Organization name", "text")],
  },
  {
    questionId: "ownership-description",
    dataFieldId: "ownership_description",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "Does your company describe its ownership in any of these ways?",
    questionType: "multiSelect",
    requiredStatus: "optional",
    helpText:
      "If any apply to your business and you’re comfortable sharing them, select all that apply. This is optional; we never infer these descriptions.",
    fields: [field("ownershipDescriptions", "Select any that apply", "multiSelect", [
      { label: "Family-owned", value: "Family-owned" },
      { label: "Veteran-owned", value: "Veteran-owned" },
      { label: "Woman-owned", value: "Woman-owned" },
      { label: "Minority-owned", value: "Minority-owned" },
      { label: "Employee-owned", value: "Employee-owned" },
      { label: "Other ownership description", value: "Other ownership description" },
      { label: "None of these", value: "none" },
      { label: "Prefer not to answer", value: "declined" },
    ], { exclusive: true })],
  },
  {
    questionId: "prior-ownership-description",
    dataFieldId: "prior_ownership_confirmation",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "We currently have your company listed as family-owned. Is that still accurate?",
    questionType: "confirm",
    requiredStatus: "optional",
    displayCondition: { field: "priorOwnershipDescriptor", operator: "exists" },
    fields: [field("priorOwnershipConfirmation", "Choose one", "confirm", [
      { label: "Yes", value: "confirmed" },
      { label: "No", value: "removed" },
      { label: "Prefer not to answer", value: "declined" },
    ])],
  },
  {
    questionId: "other-ownership-description",
    dataFieldId: "other_ownership_description",
    moduleId: "ownership",
    section: "business-details",
    respondentLabel: "What other ownership description would you like to share?",
    questionType: "text",
    requiredStatus: "optional",
    displayCondition: { field: "ownershipDescriptions", operator: "includes", value: "Other ownership description" },
    fields: [field("otherOwnershipDescription", "Other description", "text")],
  },
  {
    questionId: "industry",
    dataFieldId: "industry",
    moduleId: "industry-identification",
    section: "industry",
    respondentLabel: "Which best describes the work your business does?",
    questionType: "singleSelect",
    requiredStatus: "required",
    helpText: "This short list is for demonstration only; a complete industry and specialty taxonomy is deferred.",
    fields: [field("industry", "Choose one", "singleSelect", [
      { label: "Accounting", value: "accounting" },
      { label: "Another kind of business", value: "other" },
      { label: "I’m not sure", value: "unsure" },
    ], { required: true })],
  },
  {
    questionId: "other-industry",
    dataFieldId: "industry_description",
    moduleId: "industry-identification",
    section: "industry",
    respondentLabel: "What kind of business do you have?",
    questionType: "text",
    requiredStatus: "optional",
    displayCondition: { field: "industry", operator: "equals", value: "other" },
    fields: [field("industryDescription", "Business type", "text")],
  },
  {
    questionId: "accounting-staff",
    dataFieldId: "accounting_staff",
    moduleId: "accounting",
    section: "industry",
    respondentLabel: "Let’s learn about your professional team.",
    questionType: "group",
    requiredStatus: "optional",
    helpText:
      "Professional staff include CPAs, accountants and other client-billable consultants offering accounting and professional services, such as risk management, compliance and technology consulting. Exclude administrative, HR, sales and marketing staff.",
    definition:
      "Share local and firmwide counts separately. These questions are a Honolulu accounting proof of concept, not a complete industry module.",
    displayCondition: accountingCondition,
    fields: [
      field("accountingStaffLocal", "Professional staff in this market", "number"),
      field("accountingStaffFirmwide", "Professional staff firmwide", "number"),
      field("cpasLocal", "CPAs in this market", "number"),
      field("cpasFirmwide", "CPAs firmwide", "number"),
      field("partnersLocal", "Partners in this market", "number"),
      field("partnersFirmwide", "Partners firmwide", "number"),
    ],
  },
  {
    questionId: "accounting-services",
    dataFieldId: "accounting_services",
    moduleId: "accounting",
    section: "industry",
    respondentLabel: "Which services does your firm offer?",
    questionType: "multiSelect",
    requiredStatus: "optional",
    displayCondition: accountingCondition,
    fields: [field("accountingServices", "Select all that apply", "multiSelect", services)],
  },
  {
    questionId: "other-accounting-service",
    dataFieldId: "other_accounting_service",
    moduleId: "accounting",
    section: "industry",
    respondentLabel: "What other service does your firm offer?",
    questionType: "text",
    requiredStatus: "optional",
    displayCondition: {
      all: [
        accountingCondition,
        { field: "accountingServices", operator: "includes", value: "Other" },
      ],
    },
    fields: [field("otherAccountingService", "Other service", "text")],
  },
  {
    questionId: "accounting-industries",
    dataFieldId: "accounting_industries_served",
    moduleId: "accounting",
    section: "industry",
    respondentLabel: "What industries does your firm serve?",
    questionType: "longText",
    requiredStatus: "optional",
    displayCondition: accountingCondition,
    fields: [field("accountingIndustriesServed", "Industries served", "longText")],
  },
  {
    questionId: "accounting-description",
    dataFieldId: "accounting_business_description",
    moduleId: "accounting",
    section: "industry",
    respondentLabel: "How would you briefly describe your firm?",
    questionType: "longText",
    requiredStatus: "optional",
    displayCondition: accountingCondition,
    fields: [field("accountingDescription", "Business description", "longText")],
  },
  {
    questionId: "business-outlook",
    dataFieldId: "business_outlook",
    moduleId: "business-outlook",
    section: "outlook",
    respondentLabel: "During the next 12 months, which of the following is your company considering?",
    questionType: "multiSelect",
    requiredStatus: "optional",
    fields: [field("outlookPlans", "Select all that apply", "multiSelect", outlookOptions, { exclusive: true })],
  },
  {
    questionId: "expected-hires",
    dataFieldId: "expected_hires",
    moduleId: "business-outlook",
    section: "outlook",
    respondentLabel: "About how many people do you expect to add?",
    questionType: "number",
    requiredStatus: "optional",
    followUpRule: "Shown when Hiring additional employees is selected.",
    displayCondition: { field: "outlookPlans", operator: "includes", value: "Hiring additional employees" },
    fields: [field("expectedHires", "Approximate number of new employees", "number")],
  },
  {
    questionId: "additional-space",
    dataFieldId: "expected_additional_space",
    moduleId: "business-outlook",
    section: "outlook",
    respondentLabel: "About how much additional space are you considering?",
    questionType: "text",
    requiredStatus: "optional",
    followUpRule: "Shown when Expanding into additional space is selected.",
    displayCondition: { field: "outlookPlans", operator: "includes", value: "Expanding into additional space" },
    fields: [field("additionalSpace", "Approximate amount of space", "text", undefined, { placeholder: "For example, 5,000 square feet" })],
  },
  {
    questionId: "capital-type",
    dataFieldId: "capital_type",
    moduleId: "business-outlook",
    section: "outlook",
    respondentLabel: "What type of capital is your company considering?",
    questionType: "text",
    requiredStatus: "optional",
    followUpRule: "Shown when Raising capital is selected.",
    displayCondition: { field: "outlookPlans", operator: "includes", value: "Raising capital" },
    fields: [field("capitalType", "Type of capital", "text")],
  },
  {
    questionId: "acquisition-active",
    dataFieldId: "actively_seeking_acquisitions",
    moduleId: "business-outlook",
    section: "outlook",
    respondentLabel: "Is your company actively seeking acquisition opportunities?",
    questionType: "yesNo",
    requiredStatus: "optional",
    followUpRule: "Shown when Acquiring another business is selected.",
    displayCondition: { field: "outlookPlans", operator: "includes", value: "Acquiring another business" },
    fields: [field("acquisitionActive", "Choose one", "singleSelect", [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I’m not sure", value: "unsure" },
    ])],
  },
  {
    questionId: "editorial-transition",
    dataFieldId: "editorial_path",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel:
      "You’ve completed the information we need to update your business profile. Can you also give our newsroom a little insight?",
    questionType: "transition",
    requiredStatus: "optional",
    helpText: "These questions are optional and may help inform our reporting.",
    displayCondition: accountingCondition,
    fields: [field("editorialPath", "Choose an option", "singleSelect", [
      { label: "Continue with optional questions", value: "continue" },
      { label: "Skip for now", value: "skip" },
    ])],
  },
  {
    questionId: "editorial-ai",
    dataFieldId: "editorial_ai",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel: "How is AI changing your firm?",
    questionType: "longText",
    requiredStatus: "optional",
    helpText: "Tell us about one way the firm is using, testing or responding to AI.",
    displayCondition: { field: "editorialPath", operator: "equals", value: "continue" },
    fields: [field("editorialAi", "Your response (optional)", "longText")],
  },
  {
    questionId: "editorial-tax",
    dataFieldId: "editorial_tax_law",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel: "Are there U.S. or Hawaii tax-law changes local businesses should watch?",
    questionType: "longText",
    requiredStatus: "optional",
    displayCondition: { field: "editorialPath", operator: "equals", value: "continue" },
    fields: [field("editorialTax", "Your response (optional)", "longText")],
  },
  {
    questionId: "editorial-reinvestment",
    dataFieldId: "editorial_reinvestment",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel: "How has the firm reinvested in or expanded during the past year?",
    questionType: "longText",
    requiredStatus: "optional",
    displayCondition: { field: "editorialPath", operator: "equals", value: "continue" },
    fields: [field("editorialReinvestment", "Your response (optional)", "longText")],
  },
  {
    questionId: "editorial-profession",
    dataFieldId: "editorial_profession_issue",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel: "What is the most critical issue facing the accounting profession?",
    questionType: "longText",
    requiredStatus: "optional",
    displayCondition: { field: "editorialPath", operator: "equals", value: "continue" },
    fields: [field("editorialProfession", "Your response (optional)", "longText")],
  },
  {
    questionId: "editorial-practice",
    dataFieldId: "editorial_growing_practice",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel: "What is the firm’s fastest-growing practice area?",
    questionType: "text",
    requiredStatus: "optional",
    displayCondition: { field: "editorialPath", operator: "equals", value: "continue" },
    fields: [field("editorialPractice", "Practice area (optional)", "text")],
  },
  {
    questionId: "editorial-hawaii",
    dataFieldId: "editorial_hawaii",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel: "What is one thing the firm values about doing business in Hawaii?",
    questionType: "longText",
    requiredStatus: "optional",
    displayCondition: { field: "editorialPath", operator: "equals", value: "continue" },
    fields: [field("editorialHawaii", "Your response (optional)", "longText")],
  },
  {
    questionId: "editorial-attribution",
    dataFieldId: "editorial_attribution",
    moduleId: "editorial",
    section: "outlook",
    respondentLabel: "Who should the response be attributed to?",
    questionType: "singleSelect",
    requiredStatus: "optional",
    displayCondition: { field: "editorialPath", operator: "equals", value: "continue" },
    fields: [field("editorialAttribution", "Choose an attribution", "singleSelect", [
      { label: "The CEO or top executive", value: "executive" },
      { label: "The survey contact", value: "survey_contact" },
      { label: "No attribution", value: "none" },
    ])],
  },
  {
    questionId: "survey-contact",
    dataFieldId: "survey_contact",
    moduleId: "contacts",
    section: "outlook",
    respondentLabel: "Who is the best person to contact about this survey?",
    questionType: "group",
    requiredStatus: "optional",
    helpText: "This can be the company leader or another person who knows the business well.",
    fields: [
      field("surveyContactName", "Contact name", "text"),
      field("surveyContactEmail", "Contact email", "email"),
    ],
  },
  {
    questionId: "add-contact",
    dataFieldId: "additional_contact_choice",
    moduleId: "contacts",
    section: "outlook",
    respondentLabel: "Would you like to add another business contact?",
    questionType: "yesNo",
    requiredStatus: "optional",
    fields: [field("addAnotherContact", "Choose one", "singleSelect", [
      { label: "Yes, add another contact", value: "yes" },
      { label: "No, that’s all", value: "no" },
    ])],
  },
  {
    questionId: "additional-contact",
    dataFieldId: "additional_contact",
    moduleId: "contacts",
    section: "outlook",
    respondentLabel: "Who else should we know about?",
    questionType: "group",
    requiredStatus: "optional",
    displayCondition: { field: "addAnotherContact", operator: "equals", value: "yes" },
    fields: [
      field("additionalContactName", "Name", "text"),
      field("additionalContactTitle", "Title", "text"),
      field("additionalContactEmail", "Email", "email"),
    ],
  },
];

export function evaluateCondition(
  condition: Condition | undefined,
  answers: Record<string, unknown>,
): boolean {
  if (!condition) return true;
  if ("all" in condition) return condition.all.every((item) => evaluateCondition(item, answers));
  if ("any" in condition) return condition.any.some((item) => evaluateCondition(item, answers));

  const actual = answers[condition.field];
  switch (condition.operator) {
    case "equals":
      return actual === condition.value;
    case "notEquals":
      return actual !== condition.value;
    case "includes":
      return Array.isArray(actual) && actual.includes(condition.value);
    case "greaterThan":
      return Number(actual) > Number(condition.value);
    case "exists":
      return actual !== undefined && actual !== null && actual !== "";
  }
}

export function getVisibleQuestions(answers: Record<string, unknown>) {
  return surveyQuestions.filter((question) => evaluateCondition(question.displayCondition, answers));
}

export function getConfigurationDiagnostics() {
  const knownAnswerIds = new Set([
    "respondentType",
    "priorOwnershipDescriptor",
    ...surveyQuestions.flatMap((question) => (question.fields ?? []).map((field) => field.id)),
  ]);
  const conditionFields = (condition: Condition | undefined): string[] => {
    if (!condition) return [];
    if ("all" in condition) return condition.all.flatMap(conditionFields);
    if ("any" in condition) return condition.any.flatMap(conditionFields);
    return [condition.field];
  };
  return surveyQuestions.flatMap((question) =>
    conditionFields(question.displayCondition)
      .filter((fieldId) => !knownAnswerIds.has(fieldId))
      .map((fieldId) => ({
        questionId: question.questionId,
        missingFieldId: fieldId,
      })),
  );
}

export function normalizeExclusiveSelection(value: string[], changed: string, exclusiveValues: string[]) {
  if (!value.includes(changed)) return value.filter((item) => !exclusiveValues.includes(item));
  if (!exclusiveValues.includes(changed)) return value.filter((item) => !exclusiveValues.includes(item));
  return [changed];
}

export function buildSubmissionPayload(answers: Record<string, unknown>) {
  const activeFieldIds = new Set(
    getVisibleQuestions(answers).flatMap((question) =>
      (question.fields ?? []).map((questionField) => questionField.id),
    ),
  );
  const confirmedFields: Record<string, string[]> = {
    nameConfirmation: ["businessName"],
    addressConfirmation: ["streetAddress", "city", "state", "zip"],
    executiveConfirmation: ["executiveName", "executiveTitle", "executiveEmail", "executivePhone"],
    employeesConfirmation: ["localEmployees", "companyEmployees"],
    revenueConfirmation: ["annualRevenue", "fiscalYearEnd"],
    foundedYearConfirmation: ["foundedYear"],
  };
  for (const [confirmationField, fieldIds] of Object.entries(confirmedFields)) {
    if (answers[confirmationField] === "confirmed") {
      fieldIds.forEach((id) => activeFieldIds.add(id));
    }
  }
  if (answers.localFoundedSameYear === "yes" && fieldHasValue(answers.localFoundedYear)) {
    activeFieldIds.add("localFoundedYear");
  }

  return Object.fromEntries(
    surveyQuestions
      .filter((question) => question.moduleId !== "editorial")
      .flatMap((question) =>
        (question.fields ?? []).flatMap((questionField) => {
          const value = answers[questionField.id];
          if (!activeFieldIds.has(questionField.id)) return [];
          return value === undefined || value === "" || (Array.isArray(value) && value.length === 0)
            ? []
            : [[questionField.dataFieldId, value]];
        }),
      ),
  );
}

export function toDataFieldId(fieldId: string) {
  return fieldId.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function fieldHasValue(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

export function getEditorialPayload(answers: Record<string, unknown>) {
  return Object.fromEntries(
    getVisibleQuestions(answers)
      .filter((question) => question.moduleId === "editorial" && question.questionId !== "editorial-transition")
      .flatMap((question) =>
        (question.fields ?? []).flatMap((questionField) => {
          const value = answers[questionField.id];
          return value === undefined || value === "" ? [] : [[questionField.dataFieldId, value]];
        }),
      ),
  );
}
