import type { Brand } from "./types.js";

export type CanonicalId<T extends string> = Brand<string, T>;

export type SubjectId = CanonicalId<"subject_id">;
export type OwnerId = CanonicalId<"owner_id">;
export type ScopeId = CanonicalId<"scope_id">;
export type SessionId = CanonicalId<"session_id">;
export type WorkflowId = CanonicalId<"workflow_id">;
export type EventId = CanonicalId<"event_id">;
export type MemoryId = CanonicalId<"memory_id">;
export type StateId = CanonicalId<"state_id">;
export type ArtifactRefId = CanonicalId<"artifact_ref_id">;
export type BundleId = CanonicalId<"bundle_id">;
export type SummaryId = CanonicalId<"summary_id">;
export type HandoffId = CanonicalId<"handoff_id">;
export type CandidateId = CanonicalId<"candidate_id">;
export type DecisionId = CanonicalId<"decision_id">;
export type PolicyId = CanonicalId<"policy_id">;
export type AuditId = CanonicalId<"audit_id">;
export type ClientId = CanonicalId<"client_id">;
export type InvocationId = CanonicalId<"invocation_id">;
export type RelationId = CanonicalId<"relation_id">;
export type CorrelationId = CanonicalId<"correlation_id">;

export const asCanonicalId = <T extends string>(value: string): CanonicalId<T> => {
  return value as CanonicalId<T>;
};
