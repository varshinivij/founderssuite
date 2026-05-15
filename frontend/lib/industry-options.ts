/** Shared industry list for signup / profiles (select or multi-select). */
export const INDUSTRY_OPTIONS = [
  "SaaS",
  "MedTech",
  "FinTech",
  "Consumer",
  "Hardware",
  "Climate",
  "GovTech",
  "EdTech",
  "B2B",
  "AI / ML",
  "Other",
] as const;

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];
