import type { DecisionOutcome, ScopeId, VisibilityType } from "@orchestrator/core-foundation";
import type { CandidateRecord, DomainEntityId, PolicyRecord } from "@orchestrator/core-domain";

export const GOVERNANCE_DOMAINS = [
  "admissibility",
  "visibility",
  "scope_governance",
  "lifecycle_retention",
  "deduplication",
  "conflict_handling",
  "transfer_governance",
  "capability_governance"
] as const;

export type GovernanceDomain = (typeof GOVERNANCE_DOMAINS)[number];

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface GovernanceWarning {
  code: string;
  message: string;
  domain: GovernanceDomain;
}

export interface GovernanceRiskNote {
  level: RiskLevel;
  note: string;
  domain: GovernanceDomain;
}

export const GOVERNANCE_REJECTION_REASONS = [
  "reject_noise",
  "reject_invalid",
  "reject_policy",
  "reject_scope",
  "reject_low_confidence",
  "reject_visibility",
  "reject_conflict",
  "reject_capability",
  "reject_transfer"
] as const;

export type GovernanceRejectionReason = (typeof GOVERNANCE_REJECTION_REASONS)[number];

export const GOVERNANCE_DEFER_REASONS = [
  "requires_manual_review",
  "insufficient_grounding",
  "policy_ambiguity",
  "conflict_unresolved",
  "missing_context"
] as const;

export type GovernanceDeferReason = (typeof GOVERNANCE_DEFER_REASONS)[number];

export interface ReviewNeeded {
  required: boolean;
  reason?: GovernanceDeferReason;
  requested_checks?: string[];
}

export interface AppliedPolicySummary {
  policy_id?: PolicyRecord["policy_id"];
  rule_key: string;
  effect: "allow" | "restrict" | "deny" | "defer" | "review";
  explanation: string;
}

export interface GovernanceResultBase<TDomain extends GovernanceDomain, TOutcome extends string> {
  domain: TDomain;
  outcome: TOutcome;
  applied_policies: AppliedPolicySummary[];
  warnings: GovernanceWarning[];
  risks: GovernanceRiskNote[];
  rejection_reason?: GovernanceRejectionReason;
  defer_reason?: GovernanceDeferReason;
  review_needed?: ReviewNeeded;
}

export interface CandidateGovernanceContext {
  candidate?: CandidateRecord;
  target_scope_id?: ScopeId;
  target_visibility?: VisibilityType;
  related_record_ids?: DomainEntityId[];
}

export interface PolicyEvaluationInput<TPayload> {
  domain: GovernanceDomain;
  payload: TPayload;
  policy_records: PolicyRecord[];
}

export interface PolicyEvaluationResult<TPayload = unknown>
  extends GovernanceResultBase<GovernanceDomain, "allow" | "restrict" | "deny" | "defer" | "review"> {
  payload: TPayload;
}

export interface DecisioningResult
  extends GovernanceResultBase<GovernanceDomain, DecisionOutcome | "deferred" | "review_required"> {
  decision_outcome: DecisionOutcome | "deferred" | "review_required";
  target_record_id?: DomainEntityId;
  mutation_intent?: "create" | "update" | "merge" | "archive" | "none";
}
