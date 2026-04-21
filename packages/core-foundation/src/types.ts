export type Brand<T, B extends string> = T & { readonly __brand: B };

export type IsoDateTimeString = Brand<string, "iso_datetime">;
export type CanonicalRecordVersion = Brand<number, "canonical_record_version">;

export const CANONICAL_ENTITY_FAMILIES = [
  "identity_scope",
  "chronology",
  "canonical_context",
  "derived_context",
  "governance",
  "integration",
  "relationship"
] as const;

export type CanonicalEntityFamily = (typeof CANONICAL_ENTITY_FAMILIES)[number];

export const PRIMARY_CONCEPT_LABELS = [
  "context",
  "memory",
  "state",
  "bundle",
  "candidate",
  "canonical_record",
  "handoff",
  "policy"
] as const;

export type PrimaryConceptLabel = (typeof PRIMARY_CONCEPT_LABELS)[number];

export interface CommonTemporalMetadata {
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
  valid_from?: IsoDateTimeString;
  valid_to?: IsoDateTimeString;
  started_at?: IsoDateTimeString;
  ended_at?: IsoDateTimeString;
  generated_at?: IsoDateTimeString;
  expires_at?: IsoDateTimeString;
}

export interface CommonCanonicalMetadata extends CommonTemporalMetadata {
  source_refs: string[];
  policy_tags: string[];
  version: CanonicalRecordVersion;
}
