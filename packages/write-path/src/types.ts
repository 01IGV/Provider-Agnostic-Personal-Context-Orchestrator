import type {
  CandidateId,
  CandidateStatus,
  CandidateType,
  ClientId,
  EventId,
  IsoDateTimeString,
  ScopeId,
  SubjectId,
  WorkflowId,
  SessionId,
  OwnerId,
  SharedLifecycleStatus,
  VisibilityType
} from "@orchestrator/core-foundation";
import type { CandidateRecord, DecisionRecord, DomainEntityId } from "@orchestrator/core-domain";
import type {
  AdmissibilityResult,
  ConflictResult,
  DecisioningResult,
  DedupResult,
  GovernanceDecisioningTrace,
  GovernanceRejectionReason
} from "@orchestrator/governance";

export const WRITE_SIGNAL_SOURCE_TYPES = [
  "model_output",
  "tool_call",
  "explicit_memory_tool",
  "explicit_state_tool",
  "workflow_transition",
  "external_client_action",
  "system_event"
] as const;

export type WriteSignalSourceType = (typeof WRITE_SIGNAL_SOURCE_TYPES)[number];

export interface RawWritebackInput {
  write_signal_id?: string;
  request_id: string;
  client_id: string;
  subject_id: string;
  session_id?: string;
  workflow_id?: string;
  source_event_ids?: string[];
  source_actor_type?: string;
  source_actor_id?: string;
  signal_source: WriteSignalSourceType;
  raw_signal_payload: Record<string, unknown>;
  signal_timestamp?: string;
  runtime_metadata?: Record<string, unknown>;
}

export interface NormalizedWritebackEnvelope {
  write_signal_id: string;
  request_id: string;
  client_id: ClientId;
  subject_id: SubjectId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  source_event_ids: EventId[];
  source_actor_type: string;
  source_actor_id?: string;
  signal_source: WriteSignalSourceType;
  raw_signal_payload: Record<string, unknown>;
  signal_timestamp: IsoDateTimeString;
  runtime_metadata?: Record<string, unknown>;
}

export const WRITE_CANDIDATE_FAMILIES = [
  "memory_candidate",
  "state_candidate",
  "summary_candidate",
  "handoff_candidate",
  "audit_candidate",
  "no_write_candidate"
] as const;

export type WriteCandidateFamily = (typeof WRITE_CANDIDATE_FAMILIES)[number];

export interface ExtractedCandidateDraft {
  candidate_id: CandidateId;
  candidate_type: CandidateType;
  candidate_family: WriteCandidateFamily;
  proposed_record_type: string;
  subject_id: SubjectId;
  owner_id?: OwnerId;
  scope_id: ScopeId;
  content: Record<string, unknown>;
  proposed_metadata: Record<string, unknown>;
  proposed_by_actor_type: string;
  proposed_by_actor_id?: string;
  source_event_ids: EventId[];
  submitted_at: IsoDateTimeString;
  why_store?: string;
  status: CandidateStatus;
}

export interface ExtractedCandidateSet {
  extracted_candidates: ExtractedCandidateDraft[];
  extraction_notes: string[];
}

export const WRITE_ROUTE_FAMILIES = [
  "canonical_memory_write",
  "canonical_state_write",
  "derived_summary_refresh",
  "derived_handoff_refresh",
  "audit_only",
  "no_write"
] as const;

export type WriteRouteFamily = (typeof WRITE_ROUTE_FAMILIES)[number];

export const WRITE_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type WritePriority = (typeof WRITE_PRIORITIES)[number];

export interface CandidateClassificationResult {
  candidate_id: CandidateId;
  route_family: WriteRouteFamily;
  candidate_semantic_type: "memory" | "state" | "summary" | "handoff" | "audit" | "none";
  candidate_priority: WritePriority;
  expected_target_entity_type: string;
  requires_conflict_check: boolean;
  requires_dedup_check: boolean;
  requires_policy_review: boolean;
}

export interface ClassificationResultSet {
  classifications: CandidateClassificationResult[];
}

export interface CandidateAdmissibilityLink {
  candidate_id: CandidateId;
  admissibility: AdmissibilityResult;
}

export interface CandidateDedupConflictLink {
  candidate_id: CandidateId;
  dedup?: DedupResult;
  conflict?: ConflictResult;
}

export interface CandidateDecisionLink {
  candidate_id: CandidateId;
  decision: DecisioningResult;
  trace: GovernanceDecisioningTrace;
}

export const WRITE_REJECTION_VOCABULARY = [
  "reject_invalid",
  "reject_scope",
  "reject_policy",
  "reject_low_confidence",
  "reject_conflict",
  "reject_duplicate",
  "reject_runtime_mismatch"
] as const;

export type WriteRejectionVocabulary = (typeof WRITE_REJECTION_VOCABULARY)[number];

export const WRITE_DEFER_VOCABULARY = [
  "requires_manual_review",
  "insufficient_grounding",
  "policy_ambiguity",
  "conflict_unresolved"
] as const;

export type WriteDeferVocabulary = (typeof WRITE_DEFER_VOCABULARY)[number];

export interface DecisionRoutingResult {
  candidate_id: CandidateId;
  route_family: WriteRouteFamily;
  decision_outcome: DecisioningResult["decision_outcome"];
  mutation_intent: DecisioningResult["mutation_intent"];
  target_record_id?: DomainEntityId;
  rejection_reason?: GovernanceRejectionReason | WriteRejectionVocabulary;
  defer_reason?: WriteDeferVocabulary;
}

export const MUTATION_PLAN_ACTIONS = [
  "create_memory_object",
  "create_state_object",
  "update_existing_record",
  "merge_into_existing_record",
  "supersede_existing_record",
  "refresh_summary_artifact",
  "refresh_handoff_artifact",
  "no_op"
] as const;

export type MutationPlanAction = (typeof MUTATION_PLAN_ACTIONS)[number];

export interface MutationPlanStep {
  candidate_id: CandidateId;
  action: MutationPlanAction;
  target_record_id?: DomainEntityId;
  rationale: string;
  planned_status?: SharedLifecycleStatus;
  planned_visibility?: VisibilityType;
}

export interface MutationPlanResult {
  plan_steps: MutationPlanStep[];
}

export interface WritePathRunResult {
  writeback_envelope: NormalizedWritebackEnvelope;
  extracted_candidate_set: ExtractedCandidateSet;
  classifications: ClassificationResultSet;
  admissibility_links: CandidateAdmissibilityLink[];
  dedup_conflict_links: CandidateDedupConflictLink[];
  decision_routes: DecisionRoutingResult[];
  mutation_plan: MutationPlanResult;
}

export type CandidateRecordProjection = CandidateRecord;
export type DecisionRecordProjection = DecisionRecord;
