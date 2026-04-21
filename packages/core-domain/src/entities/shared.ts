import type {
  ArtifactRefId,
  AuditId,
  BundleId,
  CandidateId,
  CanonicalId,
  CanonicalRecordVersion,
  ClientId,
  CorrelationId,
  DecisionId,
  EventId,
  HandoffId,
  IsoDateTimeString,
  InvocationId,
  MemoryId,
  OwnerId,
  PolicyId,
  RelationId,
  ScopeId,
  SessionId,
  StateId,
  SubjectId,
  SummaryId,
  VisibilityType,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { DomainEntityType } from "../discriminators.js";

export type ProviderProfileId = CanonicalId<"provider_profile_id">;

export type DomainEntityId =
  | SubjectId
  | OwnerId
  | ScopeId
  | SessionId
  | WorkflowId
  | EventId
  | MemoryId
  | StateId
  | ArtifactRefId
  | CandidateId
  | DecisionId
  | PolicyId
  | AuditId
  | BundleId
  | SummaryId
  | HandoffId
  | RelationId
  | ClientId
  | InvocationId
  | ProviderProfileId;

export interface ExternalReference {
  source_system: string;
  external_id: string;
  locator?: string;
}

export interface ActorReference {
  actor_type: string;
  actor_id?: string;
}

export interface EntityReference {
  entity_type: DomainEntityType;
  entity_id: DomainEntityId;
}

export interface CanonicalEntityMetadata {
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
  source_refs: string[];
  policy_tags: string[];
  version: CanonicalRecordVersion;
}

export interface ScopedEntity {
  subject_id: SubjectId;
  scope_id: ScopeId;
}

export interface OwnedEntity {
  owner_id: OwnerId;
}

export interface VisibilityScopedEntity {
  visibility: VisibilityType;
}

export interface ProvenanceLink {
  source_event_ids: EventId[];
  source_refs: string[];
  correlation_id?: CorrelationId;
}
