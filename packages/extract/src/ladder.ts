export const extractionLadder = [
  "jsonld",
  "microdata",
  "script_blob",
  "dom",
  "schema_llm",
  "site_adapter"
] as const;

export type ExtractionStep = typeof extractionLadder[number];
