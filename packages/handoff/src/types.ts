import type {
  HandoffType,
  IsoDateTimeString,
  ScopeId,
  SharedLifecycleStatus,
  SubjectId,
  VisibilityType
} from "@orchestrator/core-foundation";
import type { DomainEntityId, HandoffArtifact } from "@orchestrator/core-domain";
import type { PolicyEvaluationResult } from "@orchestrator/governance";

export const HANDOFF_TRIGGER_TYPES = [
  "session_ending_with_active_work",
  "workflow_checkpoint",
  "explicit_transfer_request",
  "cross_provider_continuation",
  "unresolved_open_loops",
  "state_branch_change",
  "user_pause_recovery"
] as const;

export type HandoffTriggerType = (typeof HANDOFF_TRIGGER_TYPES)[number];

export const HANDOFF_TRIGGER_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type HandoffTriggerPriority = (typeof HANDOFF_TRIGGER_PRIORITIES)[number];

export interface HandoffTriggerInput {
  subject_id: SubjectId;
  scope_id: ScopeId;
  session_status?: "active" | "ending" | "closed";
  workflow_checkpoint_reached?: boolean;
  explicit_transfer_requested?: boolean;
  cross_provider_continuation_expected?: boolean;
  unresolved_open_loops_count?: number;
  state_branch_changed?: boolean;
  user_paused?: boolean;
  source_record_ids?: DomainEntityId[];
}

export interface HandoffTriggerResult {
  should_trigger: boolean;
  handoff_trigger_type?: HandoffTriggerType;
  trigger_source_record_ids: DomainEntityId[];
  continuity_reason?: string;
  priority?: HandoffTriggerPriority;
}

export const TARGET_CONTEXT_TYPES = [
  "next_session",
  "next_workflow_step",
  "next_agent",
  "next_runtime",
  "next_provider",
  "later_recovery"
] as const;

export type TargetContextType = (typeof TARGET_CONTEXT_TYPES)[number];

export interface HandoffTargetBoundaryInput {
  requested_target_context?: TargetContextType;
  source_context_type: string;
  target_runtime?: string;
  target_provider?: string;
  expected_use_mode?: string;
}

export interface HandoffTargetBoundaryResult {
  handoff_type: HandoffType;
  source_context_type: string;
  target_context_type: TargetContextType;
  target_runtime?: string;
  target_provider?: string;
  expected_use_mode?: string;
}

export const CONTINUITY_CANDIDATE_FAMILIES = [
  "active_state",
  "relevant_memory",
  "open_loops",
  "recent_decisions",
  "workflow_checkpoint",
  "unresolved_conflicts",
  "artifact_refs",
  "recent_handoffs",
  "recent_summaries",
  "recent_bundles"
] as const;

export type ContinuityCandidateFamily = (typeof CONTINUITY_CANDIDATE_FAMILIES)[number];

export interface ContinuityCandidate {
  record_id: DomainEntityId;
  family: ContinuityCandidateFamily;
  content: Record<string, unknown>;
  continuity_weight: number;
  rationale: string;
}

export interface ContinuityCandidateSet {
  candidates: ContinuityCandidate[];
  omitted_record_ids: DomainEntityId[];
  omission_notes: string[];
}

export const HANDOFF_WARNING_CODES = [
  "boundedness_pressure",
  "missing_state_signal",
  "missing_decision_signal",
  "scope_narrowed",
  "validation_restriction"
] as const;

export type HandoffWarningCode = (typeof HANDOFF_WARNING_CODES)[number];

export const HANDOFF_UNCERTAINTY_CODES = [
  "incomplete_open_loop_coverage",
  "policy_ambiguity",
  "stale_context_fragment",
  "confidence_drop"
] as const;

export type HandoffUncertaintyCode = (typeof HANDOFF_UNCERTAINTY_CODES)[number];

export interface HandoffWarning {
  code: HandoffWarningCode;
  note: string;
}

export interface HandoffUncertainty {
  code: HandoffUncertaintyCode;
  note: string;
}

export interface HandoffPackagingResult {
  sections: Record<string, unknown>;
  source_record_ids: DomainEntityId[];
  warnings: HandoffWarning[];
  uncertainties: HandoffUncertainty[];
  omissions: string[];
}

export interface HandoffValidationInput {
  scope_id: ScopeId;
  trigger: HandoffTriggerResult;
  target_boundary: HandoffTargetBoundaryResult;
  candidate_set: ContinuityCandidateSet;
  packaging: HandoffPackagingResult;
  requested_visibility?: VisibilityType;
}

export interface HandoffValidationResult {
  accepted: boolean;
  outcome: "accept_handoff" | "revise_handoff" | "reject_handoff" | "accept_with_warnings" | "refresh_existing_handoff";
  policy_result?: PolicyEvaluationResult;
  warnings: HandoffWarning[];
  rejection_reason?: string;
}

export interface HandoffArtifactAssemblyInput {
  subject_id: SubjectId;
  scope_id: ScopeId;
  target_boundary: HandoffTargetBoundaryResult;
  packaging: HandoffPackagingResult;
  validation: HandoffValidationResult;
  generated_at?: IsoDateTimeString;
  expires_at?: IsoDateTimeString;
  status?: SharedLifecycleStatus;
  transfer_metadata?: Record<string, unknown>;
}

export interface HandoffArtifactAssemblyResult {
  handoff_artifact: HandoffArtifact;
  warnings: HandoffWarning[];
  uncertainties: HandoffUncertainty[];
}

export interface HandoffRunResult {
  trigger: HandoffTriggerResult;
  target_boundary: HandoffTargetBoundaryResult;
  candidate_set: ContinuityCandidateSet;
  packaging: HandoffPackagingResult;
  validation: HandoffValidationResult;
  assembly?: HandoffArtifactAssemblyResult;
}
