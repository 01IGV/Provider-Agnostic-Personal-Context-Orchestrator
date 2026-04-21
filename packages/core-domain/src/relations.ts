import type {
  BundleId,
  CandidateId,
  DecisionId,
  EventId,
  HandoffId,
  MemoryId,
  ScopeId,
  SessionId,
  StateId,
  SubjectId,
  SummaryId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { DomainEntityId } from "./entities/shared.js";

export interface SubjectScopeLink {
  subject_id: SubjectId;
  scope_id: ScopeId;
}

export interface SubjectWorkflowLink {
  subject_id: SubjectId;
  workflow_id: WorkflowId;
}

export interface WorkflowSessionLink {
  workflow_id: WorkflowId;
  session_id: SessionId;
}

export interface SessionEventLink {
  session_id: SessionId;
  event_id: EventId;
}

export interface EventCandidateLink {
  event_id: EventId;
  candidate_id: CandidateId;
}

export interface CandidateDecisionLink {
  candidate_id: CandidateId;
  decision_id: DecisionId;
}

export interface DecisionCanonicalRecordLink {
  decision_id: DecisionId;
  canonical_record_id: MemoryId | StateId;
}

export interface SourceEventMemoryLink {
  source_event_id: EventId;
  memory_id: MemoryId;
}

export interface SourceEventStateLink {
  source_event_id: EventId;
  state_id: StateId;
}

export interface SourceRecordSummaryLink {
  summary_id: SummaryId;
  source_record_id: DomainEntityId;
}

export interface SourceRecordBundleLink {
  bundle_id: BundleId;
  source_record_id: DomainEntityId;
}

export interface SourceRecordHandoffLink {
  handoff_id: HandoffId;
  source_record_id: DomainEntityId;
}
