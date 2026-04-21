import type { CanonicalEntityFamily } from "@orchestrator/core-foundation";

export const RECORD_CLASSES = ["canonical", "derived"] as const;
export type RecordClass = (typeof RECORD_CLASSES)[number];

export const CANONICAL_ENTITY_TYPES = [
  "subject",
  "owner",
  "scope",
  "session",
  "workflow",
  "event",
  "memory_object",
  "state_object",
  "artifact_reference",
  "candidate_record",
  "decision_record",
  "policy_record",
  "audit_record",
  "relation_edge",
  "client_record",
  "runtime_invocation_record",
  "provider_profile"
] as const;

export type CanonicalEntityType = (typeof CANONICAL_ENTITY_TYPES)[number];

export const DERIVED_ENTITY_TYPES = [
  "context_bundle",
  "summary_artifact",
  "handoff_artifact"
] as const;

export type DerivedEntityType = (typeof DERIVED_ENTITY_TYPES)[number];

export type DomainEntityType = CanonicalEntityType | DerivedEntityType;

export interface DomainEntityDiscriminator<
  TClass extends RecordClass,
  TFamily extends CanonicalEntityFamily,
  TType extends DomainEntityType
> {
  record_class: TClass;
  entity_family: TFamily;
  entity_type: TType;
}

export type CanonicalEntityDiscriminator<
  TFamily extends CanonicalEntityFamily,
  TType extends CanonicalEntityType
> = DomainEntityDiscriminator<"canonical", TFamily, TType>;

export type DerivedEntityDiscriminator<
  TFamily extends CanonicalEntityFamily,
  TType extends DerivedEntityType
> = DomainEntityDiscriminator<"derived", TFamily, TType>;
