export type SurveySection = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export const sections: SurveySection[] = [
  {
    id: "company",
    label: "Company",
    title: "First, your company",
    description:
      "We’ll start with the basics and make it easy to confirm what we already know.",
  },
  {
    id: "business-details",
    label: "Business details",
    title: "A little about your business",
    description:
      "This section will gather a few helpful details about how your business operates.",
  },
  {
    id: "industry",
    label: "Your industry",
    title: "Your industry",
    description:
      "We’ll ask how you describe the work your business does. Industry questions are not configured yet.",
  },
  {
    id: "outlook",
    label: "What’s ahead",
    title: "What’s ahead",
    description:
      "Later, you’ll be able to share a little about what’s next for your business.",
  },
  {
    id: "review",
    label: "Review",
    title: "Review your answers",
    description:
      "You’ll have a chance to review your responses before finishing the survey.",
  },
];
