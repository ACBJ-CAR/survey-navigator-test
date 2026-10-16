export const INDUSTRY_TAXONOMY_VERSION = "survey-navigator-industry-1.1.0";
export const NAICS_VINTAGE = "2022";

export type IndustryLevel = "broad" | "industry" | "specialty";
export type IndustryStatus = "active" | "draft" | "retired";
export type SelectionMode = "single" | "multi";
export type ReportingScope = "local_operation" | "companywide" | "specific_establishment";
export type ClassificationStatus =
  | "prior_unconfirmed"
  | "respondent_confirmed"
  | "respondent_updated"
  | "respondent_selected"
  | "researcher_verified"
  | "other_unmapped"
  | "unsure_manual_review";
export type ClassificationSource = "prior_record" | "respondent" | "researcher";
export type NaicsRelationship =
  | "exact"
  | "broader_than_internal"
  | "narrower_than_internal"
  | "partial_overlap"
  | "one_of_multiple_candidates";
export type NaicsUseCase =
  | "classification"
  | "survey_eligibility"
  | "cloud_query_sourcing"
  | "analytics";

export type IndustryTaxonomyNode = {
  id: string;
  parentId: string | null;
  level: IndustryLevel;
  respondentLabel: string;
  shortDescription: string;
  synonyms: string[];
  status: IndustryStatus;
  selectionMode: SelectionMode;
  specialtyRequired: boolean;
  allowOtherBusiness?: boolean;
  otherOptionLabel?: string;
  moduleTags: string[];
  sortOrder: number;
  effectiveFrom: string;
  effectiveTo: string | null;
};

export type IndustrySelection = {
  broadIndustryId: string | null;
  industryId: string | null;
  specialtyIds: string[];
};

export type NaicsCandidate = {
  taxonomyVersion: string;
  industryId: string;
  specialtyId?: string;
  naicsVintage: string;
  naicsCode: string;
  naicsTitle: string;
  relationship: NaicsRelationship;
  useCases: NaicsUseCase[];
  reviewStatus: "approved" | "draft";
  effectiveFrom: string;
  effectiveTo: string | null;
  notes?: string;
};

export type NaicsMappingReviewItem = {
  taxonomyVersion: string;
  taxonomyNodeId: string;
  naicsVintage: string;
  reviewStatus: "draft";
  candidateCodes: string[];
  notes: string;
};

export type IndustryClassification = {
  classificationId: string;
  reportingScope: ReportingScope;
  taxonomyVersion: string;
  primary: IndustrySelection | null;
  secondary: IndustrySelection[];
  status: ClassificationStatus;
  source: ClassificationSource;
  otherDescription: string;
  uncertaintyNote: string;
  naicsVintage: string;
  naicsCandidates: NaicsCandidate[];
  activeModuleIds: string[];
  manualReviewItems: string[];
  confirmedAt?: string;
  history: Array<{
    classificationId?: string;
    reportingScope?: ReportingScope;
    taxonomyVersion?: string;
    primary: IndustrySelection | null;
    secondary: IndustrySelection[];
    status: ClassificationStatus;
    source: ClassificationSource;
    otherDescription?: string;
    uncertaintyNote?: string;
  }>;
};

export type IndustryModuleRule = {
  moduleId: string;
  enabled: boolean;
  surveyEnabled: boolean;
  secondaryEnabled: boolean;
  compatibleScopes: ReportingScope[];
  primaryIndustryIds: string[];
  specialtyIds: string[];
};

const since = "2026-10-16";
const broad = (id: string, label: string, sortOrder: number): IndustryTaxonomyNode => ({
  id,
  parentId: null,
  level: "broad",
  respondentLabel: label,
  shortDescription: label,
  synonyms: [],
  status: "active",
  selectionMode: "single",
  specialtyRequired: false,
  allowOtherBusiness: true,
  otherOptionLabel: "Another business in this category",
  moduleTags: [],
  sortOrder,
  effectiveFrom: since,
  effectiveTo: null,
});

const broadIndustries: IndustryTaxonomyNode[] = [
  broad("broad.natural-resources-energy-utilities", "Agriculture, natural resources, energy & utilities", 1),
  broad("broad.construction-building", "Construction & building services", 2),
  broad("broad.manufacturing", "Manufacturing", 3),
  broad("broad.wholesale-distribution", "Wholesale, distribution & supply", 4),
  broad("broad.retail-consumer", "Retail & consumer commerce", 5),
  broad("broad.transport-logistics", "Transportation, logistics & warehousing", 6),
  broad("broad.technology-media-communications", "Technology, media & communications", 7),
  broad("broad.finance-insurance", "Finance, banking & insurance", 8),
  broad("broad.real-estate-property", "Real estate & property services", 9),
  broad("broad.professional-business-services", "Professional, scientific & business services", 10),
  broad("broad.education-training", "Education & training", 11),
  broad("broad.health-life-sciences", "Health care, life sciences & social assistance", 12),
  broad("broad.hospitality-food-arts", "Hospitality, food, arts & recreation", 13),
  broad("broad.personal-civic-other-services", "Personal, repair, civic & other services", 14),
  broad("broad.government-public", "Government & public administration", 15),
];

type IndustrySeed = {
  id: string;
  parentId: string;
  label: string;
  synonyms?: string[];
  specialties?: Array<{ id: string; label: string; synonyms?: string[] }>;
  moduleTags?: string[];
};

const seeds: IndustrySeed[] = [
  { id: "industry.accounting", parentId: "broad.professional-business-services", label: "Accounting", synonyms: ["accountant", "CPA", "bookkeeping", "tax preparation"], specialties: [
    { id: "specialty.accounting.cpa-firm", label: "CPA firm", synonyms: ["certified public accountant"] },
    { id: "specialty.accounting.other-accounting-services", label: "Other accounting services" },
    { id: "specialty.accounting.bookkeeping-focused-firm", label: "Bookkeeping-focused firm", synonyms: ["bookkeeper"] },
  ], moduleTags: ["accounting"] },
  { id: "industry.legal-services", parentId: "broad.professional-business-services", label: "Legal services", synonyms: ["law firm", "attorney", "lawyer"] },
  { id: "industry.architecture", parentId: "broad.professional-business-services", label: "Architecture", synonyms: ["architect"] },
  { id: "industry.engineering", parentId: "broad.professional-business-services", label: "Engineering", synonyms: ["engineer"], specialties: [
    { id: "specialty.engineering.civil", label: "Civil engineering" },
    { id: "specialty.engineering.structural", label: "Structural engineering" },
    { id: "specialty.engineering.mechanical-electrical", label: "Mechanical or electrical engineering" },
    { id: "specialty.engineering.environmental", label: "Environmental engineering" },
    { id: "specialty.engineering.transportation", label: "Transportation engineering" },
    { id: "specialty.engineering.surveying-geospatial", label: "Surveying or geospatial services" },
  ] },
  { id: "industry.consulting", parentId: "broad.professional-business-services", label: "Consulting", synonyms: ["business consulting", "management consulting"] },
  { id: "industry.staffing-recruiting", parentId: "broad.professional-business-services", label: "Staffing and recruiting", synonyms: ["employment agency", "recruitment"] },
  { id: "industry.general-contractors", parentId: "broad.construction-building", label: "General contractors", synonyms: ["construction contractor"] },
  { id: "industry.homebuilders", parentId: "broad.construction-building", label: "Homebuilders", synonyms: ["home builder", "residential construction"] },
  { id: "industry.heavy-civil-construction", parentId: "broad.construction-building", label: "Heavy and civil construction", synonyms: ["infrastructure construction"] },
  { id: "industry.specialty-trade-contractors", parentId: "broad.construction-building", label: "Specialty trade contractors", synonyms: ["trade contractor"], specialties: [
    "Electrical", "Plumbing/HVAC", "Concrete", "Structural steel", "Framing", "Masonry", "Glass", "Roofing", "Siding", "Drywall/insulation", "Painting", "Flooring", "Finish carpentry", "Site preparation", "Remediation", "Other trade",
  ].map((label) => ({ id: `specialty.trade.${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, label })) },
  { id: "industry.manufacturing", parentId: "broad.manufacturing", label: "Manufacturing", synonyms: ["manufacturer", "factory"] },
  { id: "industry.banks", parentId: "broad.finance-insurance", label: "Banks", synonyms: ["banking", "commercial bank"] },
  { id: "industry.credit-unions", parentId: "broad.finance-insurance", label: "Credit unions" },
  { id: "industry.commercial-lending", parentId: "broad.finance-insurance", label: "Commercial lending" },
  { id: "industry.mortgage-lending", parentId: "broad.finance-insurance", label: "Mortgage lending", synonyms: ["mortgage company"] },
  { id: "industry.investment-wealth-management", parentId: "broad.finance-insurance", label: "Investment and wealth management", synonyms: ["financial advisor", "asset management"] },
  { id: "industry.insurance-carriers", parentId: "broad.finance-insurance", label: "Insurance carriers", synonyms: ["insurer"], specialties: [
    { id: "specialty.insurance.property-casualty", label: "Property and casualty" },
    { id: "specialty.insurance.life-health", label: "Life and health" },
    { id: "specialty.insurance.employee-benefits", label: "Employee benefits" },
    { id: "specialty.insurance.carrier", label: "Carrier" },
    { id: "specialty.insurance.brokerage", label: "Brokerage" },
  ] },
  { id: "industry.insurance-brokerages", parentId: "broad.finance-insurance", label: "Insurance brokerages", synonyms: ["insurance agent"], specialties: [
    { id: "specialty.insurance-brokerage.property-casualty", label: "Property and casualty" },
    { id: "specialty.insurance-brokerage.life-health", label: "Life and health" },
    { id: "specialty.insurance-brokerage.employee-benefits", label: "Employee benefits" },
    { id: "specialty.insurance-brokerage.carrier", label: "Carrier" },
    { id: "specialty.insurance-brokerage.brokerage", label: "Brokerage" },
  ] },
  { id: "industry.commercial-real-estate-brokerage", parentId: "broad.real-estate-property", label: "Commercial real estate brokerage" },
  { id: "industry.residential-real-estate-brokerage", parentId: "broad.real-estate-property", label: "Residential real estate brokerage" },
  { id: "industry.property-management", parentId: "broad.real-estate-property", label: "Property management" },
  { id: "industry.real-estate-development", parentId: "broad.real-estate-property", label: "Real estate development" },
  { id: "industry.colleges-universities", parentId: "broad.education-training", label: "Colleges and universities", synonyms: ["higher education"], specialties: [
    { id: "specialty.education.university", label: "University" },
    { id: "specialty.education.community-college", label: "Community college" },
  ] },
  { id: "industry.k12-schools-districts", parentId: "broad.education-training", label: "K-12 schools and districts", specialties: [
    { id: "specialty.education.k12-district", label: "K-12 district" },
  ] },
  { id: "industry.charter-schools", parentId: "broad.education-training", label: "Charter schools", specialties: [
    { id: "specialty.education.charter-school", label: "Charter school" },
  ] },
  { id: "industry.private-schools", parentId: "broad.education-training", label: "Private schools", specialties: [
    { id: "specialty.education.private-school", label: "Private school" },
  ] },
  { id: "industry.vocational-training", parentId: "broad.education-training", label: "Vocational and training providers", specialties: [
    { id: "specialty.education.vocational-training", label: "Vocational or training" },
  ] },
  { id: "industry.hospitals", parentId: "broad.health-life-sciences", label: "Hospitals", specialties: [
    { id: "specialty.health.hospital", label: "Hospital" },
  ] },
  { id: "industry.physician-ambulatory-care", parentId: "broad.health-life-sciences", label: "Physician and ambulatory care", synonyms: ["doctor's office", "clinic"], specialties: [
    { id: "specialty.health.physician-practice", label: "Physician practice" },
    { id: "specialty.health.behavioral-health", label: "Behavioral health" },
  ] },
  { id: "industry.dental-care", parentId: "broad.health-life-sciences", label: "Dental care", synonyms: ["dentist"], specialties: [
    { id: "specialty.health.dental", label: "Dental" },
  ] },
  { id: "industry.home-health", parentId: "broad.health-life-sciences", label: "Home health", specialties: [
    { id: "specialty.health.home-health", label: "Home health" },
  ] },
  { id: "industry.nursing-residential-care", parentId: "broad.health-life-sciences", label: "Nursing and residential care", specialties: [
    { id: "specialty.health.nursing-care", label: "Nursing care" },
  ] },
  { id: "industry.senior-living", parentId: "broad.health-life-sciences", label: "Senior living", synonyms: ["assisted living", "independent living"], specialties: [
    { id: "specialty.health.assisted-living", label: "Assisted living" },
    { id: "specialty.health.independent-living", label: "Independent living" },
  ] },
  { id: "industry.behavioral-health", parentId: "broad.health-life-sciences", label: "Behavioral health", specialties: [
    { id: "specialty.health.behavioral-health-services", label: "Behavioral health" },
  ] },
  { id: "industry.real-estate-services", parentId: "broad.real-estate-property", label: "Other real estate services", specialties: [
    { id: "specialty.real-estate.commercial-brokerage", label: "Commercial brokerage" },
    { id: "specialty.real-estate.residential-brokerage", label: "Residential brokerage" },
    { id: "specialty.real-estate.property-management", label: "Property management" },
    { id: "specialty.real-estate.development", label: "Development" },
    { id: "specialty.real-estate.appraisal", label: "Appraisal" },
    { id: "specialty.real-estate.title-escrow", label: "Title or escrow" },
  ] },
  { id: "industry.hotels-resorts", parentId: "broad.hospitality-food-arts", label: "Hotels and resorts", synonyms: ["lodging"], specialties: [
    { id: "specialty.hospitality.hotel", label: "Hotel" },
    { id: "specialty.hospitality.resort", label: "Resort" },
  ] },
  { id: "industry.restaurants-food-service", parentId: "broad.hospitality-food-arts", label: "Restaurants and food service", synonyms: ["restaurant", "catering"], specialties: [
    { id: "specialty.hospitality.restaurant", label: "Restaurant" },
  ] },
  { id: "industry.golf-country-clubs", parentId: "broad.hospitality-food-arts", label: "Golf and country clubs", synonyms: ["golf course", "country club"], specialties: [
    { id: "specialty.hospitality.country-club-golf", label: "Country club or golf" },
  ] },
  { id: "industry.airlines-aviation", parentId: "broad.transport-logistics", label: "Airlines and aviation", synonyms: ["airline", "airport"] },
  { id: "industry.trucking", parentId: "broad.transport-logistics", label: "Trucking", synonyms: ["freight trucking", "truck transportation"] },
  { id: "industry.warehousing-logistics", parentId: "broad.transport-logistics", label: "Warehousing and logistics", synonyms: ["warehouse", "logistics"], },
  { id: "industry.agriculture", parentId: "broad.natural-resources-energy-utilities", label: "Agriculture", synonyms: ["farming", "farm"] },
  { id: "industry.energy-utilities", parentId: "broad.natural-resources-energy-utilities", label: "Energy and utilities", synonyms: ["electric utility", "energy company"] },
  { id: "industry.wholesale-distribution", parentId: "broad.wholesale-distribution", label: "Wholesale and distribution" },
  { id: "industry.retail-consumer", parentId: "broad.retail-consumer", label: "Retail and consumer commerce" },
  { id: "industry.technology-media-communications", parentId: "broad.technology-media-communications", label: "Technology, media and communications" },
  { id: "industry.life-sciences", parentId: "broad.health-life-sciences", label: "Life sciences" },
  { id: "industry.arts-recreation", parentId: "broad.hospitality-food-arts", label: "Arts and recreation", specialties: [
    { id: "specialty.hospitality.entertainment-venue", label: "Entertainment venue" },
  ] },
  { id: "industry.personal-repair-services", parentId: "broad.personal-civic-other-services", label: "Personal and repair services" },
  { id: "industry.government-public-administration", parentId: "broad.government-public", label: "Government and public administration" },
];

const industryNodes: IndustryTaxonomyNode[] = seeds.flatMap((seed, sortOrder) => {
  const industry: IndustryTaxonomyNode = {
    id: seed.id,
    parentId: seed.parentId,
    level: "industry",
    respondentLabel: seed.label,
    shortDescription: seed.label,
    synonyms: seed.synonyms ?? [],
    status: "active",
    selectionMode: "single",
    specialtyRequired: false,
    moduleTags: seed.moduleTags ?? [],
    sortOrder,
    effectiveFrom: since,
    effectiveTo: null,
  };
  const specialties = (seed.specialties ?? []).map((specialty, specialtySortOrder): IndustryTaxonomyNode => ({
    id: specialty.id,
    parentId: seed.id,
    level: "specialty",
    respondentLabel: specialty.label,
    shortDescription: specialty.label,
    synonyms: specialty.synonyms ?? [],
    status: "active",
    selectionMode: "single",
    specialtyRequired: false,
    moduleTags: [],
    sortOrder: specialtySortOrder,
    effectiveFrom: since,
    effectiveTo: null,
  }));
  return [industry, ...specialties];
});

export const industryTaxonomy: IndustryTaxonomyNode[] = [...broadIndustries, ...industryNodes];

export const naicsCrosswalk: NaicsCandidate[] = [
  {
    taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
    industryId: "industry.accounting",
    specialtyId: "specialty.accounting.cpa-firm",
    naicsVintage: NAICS_VINTAGE,
    naicsCode: "541211",
    naicsTitle: "Office of Certified Public Accountants",
    relationship: "one_of_multiple_candidates",
    useCases: ["classification", "survey_eligibility", "cloud_query_sourcing", "analytics"],
    reviewStatus: "approved",
    effectiveFrom: "2022-01-01",
    effectiveTo: null,
    notes: "Approved Accounting sourcing candidate.",
  },
  {
    taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
    industryId: "industry.accounting",
    specialtyId: "specialty.accounting.other-accounting-services",
    naicsVintage: NAICS_VINTAGE,
    naicsCode: "541219",
    naicsTitle: "Other Accounting Services",
    relationship: "one_of_multiple_candidates",
    useCases: ["classification", "survey_eligibility", "cloud_query_sourcing", "analytics"],
    reviewStatus: "approved",
    effectiveFrom: "2022-01-01",
    effectiveTo: null,
    notes: "Approved Accounting sourcing candidate.",
  },
];

const mappedNodeIds = new Set(naicsCrosswalk.flatMap((candidate) => [candidate.industryId, candidate.specialtyId].filter(Boolean)));
export const naicsMappingReviewQueue: NaicsMappingReviewItem[] = industryTaxonomy
  .filter((node) => node.level !== "broad" && !mappedNodeIds.has(node.id))
  .map((node) => ({
    taxonomyVersion: INDUSTRY_TAXONOMY_VERSION,
    taxonomyNodeId: node.id,
    naicsVintage: NAICS_VINTAGE,
    reviewStatus: "draft",
    candidateCodes: [],
    notes: "Detailed candidates require source verification; no NAICS code is inferred.",
  }));

export const industryModuleRules: IndustryModuleRule[] = [
  {
    moduleId: "accounting",
    enabled: true,
    surveyEnabled: true,
    secondaryEnabled: false,
    compatibleScopes: ["local_operation", "companywide", "specific_establishment"],
    primaryIndustryIds: ["industry.accounting"],
    specialtyIds: [],
  },
];

export const surveyEnabledIndustryModules = ["accounting"];

export const reportingScopeLabels: Record<ReportingScope, string> = {
  local_operation: "Local operation",
  companywide: "Companywide",
  specific_establishment: "Specific establishment",
};

export const globalIndustryChoices = [
  { action: "other", respondentLabel: "Something else" },
  { action: "unsure", respondentLabel: "I’m not sure" },
] as const;

export function nodeById(id: string | null | undefined) {
  return id ? industryTaxonomy.find((node) => node.id === id) : undefined;
}

export function childrenOf(parentId: string) {
  return industryTaxonomy
    .filter((node) => node.parentId === parentId && node.status === "active")
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function searchIndustries(query: string) {
  const seen = new Set<string>();
  return searchIndustryMatches(query)
    .filter((match) => {
      if (seen.has(match.industry.id)) return false;
      seen.add(match.industry.id);
      return true;
    })
    .map((match) => match.industry);
}

export function searchIndustryMatches(query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const matches = industryTaxonomy.filter((node) =>
    node.status === "active" &&
    node.level !== "broad" &&
    [node.respondentLabel, ...node.synonyms].some((term) => term.toLocaleLowerCase().includes(normalized)),
  );
  const result = matches.flatMap((node) => {
    const industry = node.level === "specialty" ? nodeById(node.parentId) : node;
    if (!industry || industry.level !== "industry") return [];
    return [{
      industry,
      specialty: node.level === "specialty" ? node : undefined,
      respondentLabel: node.level === "specialty" ? `${industry.respondentLabel} — ${node.respondentLabel}` : industry.respondentLabel,
    }];
  });
  const matchedSpecialties = new Set(result.filter((match) => match.specialty).map((match) => match.industry.id));
  return result.filter((match) => match.specialty || !matchedSpecialties.has(match.industry.id));
}

export function toggleSecondarySelection(
  primary: IndustrySelection | null,
  secondary: IndustrySelection[],
  industryId: string,
) {
  if (industryId === primary?.industryId) return { selections: secondary, change: "unchanged" as const };
  const existingIndex = secondary.findIndex((selection) => selection.industryId === industryId);
  if (existingIndex >= 0) {
    return {
      selections: secondary.filter((_, index) => index !== existingIndex),
      change: "removed" as const,
    };
  }
  const industry = nodeById(industryId);
  if (!industry?.parentId || industry.level !== "industry") return { selections: secondary, change: "unchanged" as const };
  return {
    selections: [...secondary, { broadIndustryId: industry.parentId, industryId, specialtyIds: [] }],
    change: "added" as const,
  };
}

export function getIndustryModulePlan(
  classification: IndustryClassification | undefined,
  marketEnabledModules: string[] = surveyEnabledIndustryModules,
) {
  const status = classification?.status;
  const canLoad = status === "respondent_confirmed" ||
    status === "respondent_updated" ||
    status === "respondent_selected" ||
    status === "researcher_verified";
  const matchedModuleRules = industryModuleRules.filter((rule) => {
    const primaryMatch = Boolean(classification?.primary?.industryId) &&
      rule.primaryIndustryIds.includes(classification?.primary?.industryId ?? "") &&
      (rule.specialtyIds.length === 0 || rule.specialtyIds.some((id) => classification?.primary?.specialtyIds.includes(id)));
    const secondaryMatch = rule.secondaryEnabled &&
      (classification?.secondary ?? []).some((selection) => selection.industryId && rule.primaryIndustryIds.includes(selection.industryId));
    return (primaryMatch || secondaryMatch) &&
      Boolean(classification && rule.compatibleScopes.includes(classification.reportingScope));
  });
  const activeModuleIds = canLoad
    ? matchedModuleRules
        .filter((rule) => rule.enabled && rule.surveyEnabled && marketEnabledModules.includes(rule.moduleId))
        .map((rule) => rule.moduleId)
    : [];
  return {
    matchedModuleRules: matchedModuleRules.map((rule) => rule.moduleId),
    activeModuleIds,
    inactiveModuleIds: industryModuleRules.map((rule) => rule.moduleId).filter((id) => !activeModuleIds.includes(id)),
  };
}

export function getClassificationPayload(classification: IndustryClassification | undefined) {
  if (!classification) return {};
  const labelSelection = (selection: IndustrySelection) => ({
    broad_industry: nodeById(selection.broadIndustryId)?.respondentLabel,
    industry: nodeById(selection.industryId)?.respondentLabel,
    specialties: selection.specialtyIds.map((id) => nodeById(id)?.respondentLabel).filter(Boolean),
  });
  const primary = classification.primary ? labelSelection(classification.primary) : null;
  const secondary = classification.secondary.map(labelSelection);
  return {
    industry_classification: {
      reporting_scope: reportingScopeLabels[classification.reportingScope],
      primary,
      secondary,
      status: classification.status,
      other_description: classification.otherDescription || undefined,
      uncertainty_note: classification.uncertaintyNote || undefined,
    },
  };
}

export function validateIndustryConfiguration(
  nodes: IndustryTaxonomyNode[] = industryTaxonomy,
  crosswalk: NaicsCandidate[] = naicsCrosswalk,
  rules: IndustryModuleRule[] = industryModuleRules,
  reviewQueue: NaicsMappingReviewItem[] = naicsMappingReviewQueue,
) {
  const errors: string[] = [];
  const byId = new Map<string, IndustryTaxonomyNode>();
  for (const node of nodes) {
    if (byId.has(node.id)) errors.push(`Duplicate taxonomy node ID "${node.id}".`);
    byId.set(node.id, node);
    if (!node.respondentLabel.trim()) errors.push(`Node "${node.id}" is missing a respondent label.`);
    if (node.level === "broad" && (!node.allowOtherBusiness || !node.otherOptionLabel?.trim())) {
      errors.push(`Broad category "${node.id}" must configure its Other option.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(node.effectiveFrom) || Number.isNaN(Date.parse(node.effectiveFrom))) {
      errors.push(`Node "${node.id}" has invalid effectiveFrom date "${node.effectiveFrom}".`);
    }
    if (node.effectiveTo && (!/^\d{4}-\d{2}-\d{2}$/.test(node.effectiveTo) || Number.isNaN(Date.parse(node.effectiveTo)))) {
      errors.push(`Node "${node.id}" has invalid effectiveTo date "${node.effectiveTo}".`);
    }
    if (node.effectiveTo && node.effectiveTo < node.effectiveFrom) errors.push(`Node "${node.id}" retires before its effective date.`);
    if (node.status === "retired" && !node.effectiveTo) errors.push(`Retired node "${node.id}" must have an effectiveTo date.`);
    if (node.status !== "retired" && node.effectiveTo) errors.push(`Non-retired node "${node.id}" cannot have an effectiveTo date.`);
  }

  const path = new Set<string>();
  const visit = (node: IndustryTaxonomyNode) => {
    if (path.has(node.id)) {
      errors.push(`Circular taxonomy hierarchy includes "${node.id}".`);
      return;
    }
    if (node.level === "broad") {
      if (node.parentId !== null) errors.push(`Broad node "${node.id}" cannot have a parent.`);
      return;
    }
    if (!node.parentId || !byId.has(node.parentId)) {
      errors.push(`Node "${node.id}" has missing parent "${node.parentId ?? ""}".`);
      return;
    }
    const parent = byId.get(node.parentId);
    if (!parent) return;
    const validParentLevel = node.level === "industry" ? parent.level === "broad" : parent.level === "industry";
    if (!validParentLevel) errors.push(`Node "${node.id}" has invalid level ordering under "${parent.id}".`);
    path.add(node.id);
    visit(parent);
    path.delete(node.id);
  };
  nodes.forEach(visit);

  const siblingKeys = new Set<string>();
  for (const node of nodes) {
    const key = `${node.parentId ?? "root"}:${node.respondentLabel.trim().toLocaleLowerCase()}`;
    if (siblingKeys.has(key)) errors.push(`Duplicate sibling label "${node.respondentLabel}" under "${node.parentId ?? "root"}".`);
    siblingKeys.add(key);
  }

  const knownModules = new Set(rules.map((rule) => rule.moduleId));
  const ruleIds = new Set<string>();
  for (const rule of rules) {
    if (ruleIds.has(rule.moduleId)) errors.push(`Duplicate industry module rule "${rule.moduleId}".`);
    ruleIds.add(rule.moduleId);
    rule.primaryIndustryIds.forEach((id) => {
      if (!byId.has(id) || byId.get(id)?.level !== "industry") errors.push(`Module rule "${rule.moduleId}" references missing industry "${id}".`);
    });
    rule.specialtyIds.forEach((id) => {
      const specialty = byId.get(id);
      if (!specialty || specialty.level !== "specialty" || !rule.primaryIndustryIds.includes(specialty.parentId ?? "")) {
        errors.push(`Module rule "${rule.moduleId}" references missing or unrelated specialty "${id}".`);
      }
    });
  }
  for (const node of nodes) {
    if (node.level === "specialty" && (!node.parentId || byId.get(node.parentId)?.level !== "industry")) {
      errors.push(`Specialty "${node.id}" is orphaned.`);
    }
    node.moduleTags.forEach((tag) => {
      if (!knownModules.has(tag)) errors.push(`Node "${node.id}" references missing module "${tag}".`);
    });
  }
  for (const candidate of crosswalk) {
    if (candidate.naicsVintage !== NAICS_VINTAGE) errors.push(`Crosswalk "${candidate.naicsCode}" has invalid NAICS vintage "${candidate.naicsVintage}".`);
    if (candidate.taxonomyVersion !== INDUSTRY_TAXONOMY_VERSION) errors.push(`Crosswalk "${candidate.naicsCode}" has invalid taxonomy version "${candidate.taxonomyVersion}".`);
    if (!["exact", "broader_than_internal", "narrower_than_internal", "partial_overlap", "one_of_multiple_candidates"].includes(candidate.relationship)) {
      errors.push(`Crosswalk "${candidate.naicsCode}" has invalid relationship "${candidate.relationship}".`);
    }
    if (!byId.has(candidate.industryId) || byId.get(candidate.industryId)?.level !== "industry") errors.push(`Crosswalk "${candidate.naicsCode}" references missing industry "${candidate.industryId}".`);
    if (candidate.specialtyId && (!byId.has(candidate.specialtyId) || byId.get(candidate.specialtyId)?.parentId !== candidate.industryId)) {
      errors.push(`Crosswalk "${candidate.naicsCode}" references orphan specialty "${candidate.specialtyId}".`);
    }
  }
  for (const item of reviewQueue) {
    if (!byId.has(item.taxonomyNodeId)) errors.push(`Draft NAICS queue item references missing taxonomy node "${item.taxonomyNodeId}".`);
    if (item.naicsVintage !== NAICS_VINTAGE) errors.push(`Draft NAICS queue item "${item.taxonomyNodeId}" has invalid vintage "${item.naicsVintage}".`);
    if (item.taxonomyVersion !== INDUSTRY_TAXONOMY_VERSION) errors.push(`Draft NAICS queue item "${item.taxonomyNodeId}" has invalid taxonomy version.`);
  }
  return errors;
}
