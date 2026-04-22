import type { EvaluationRecord, EvaluationType } from "@orchestrator/persistence-contracts";
import type { EvaluationScopeReference } from "./types.js";
import type {
  AnomalySignal,
  DriftSignal,
  EvaluationFinding,
  EvaluationMetric,
  QualityDimension,
  QualityDimensionScore
} from "./vocabularies.js";

export interface EvaluationResultBase<
  TType extends EvaluationType,
  TMetrics extends object = Record<string, number>
> {
  evaluation_type: TType;
  scope: EvaluationScopeReference;
  metrics: TMetrics;
  metric_points: EvaluationMetric[];
  findings: EvaluationFinding[];
  quality_dimension_scores: QualityDimensionScore[];
  drift_signals: DriftSignal[];
  anomaly_signals: AnomalySignal[];
  notes?: string[];
}

export interface RelevanceEvaluationMetrics {
  critical_record_recall: number;
  irrelevant_record_rate: number;
  scope_precision: number;
  context_sufficiency_score: number;
}

export interface BoundednessEvaluationMetrics {
  average_bundle_size: number;
  critical_section_preservation_rate: number;
  low_priority_truncation_rate: number;
  over_compression_failures: number;
}

export interface ContinuityEvaluationMetrics {
  continuity_success_rate: number;
  active_state_recovery_rate: number;
  lost_open_loop_incidents: number;
  restart_from_zero_frequency: number;
}

export interface WriteQualityEvaluationMetrics {
  accepted_candidate_quality_score: number;
  duplicate_rate: number;
  false_accept_rate: number;
  false_reject_rate: number;
  state_memory_misclassification_rate: number;
}

export interface HandoffQualityEvaluationMetrics {
  handoff_consumption_success_rate: number;
  handoff_restart_usefulness_rating: number;
  oversized_handoff_rate: number;
  hidden_uncertainty_incidents: number;
  stale_handoff_usage_rate: number;
}

export interface GovernanceQualityEvaluationMetrics {
  policy_rejection_correctness_rate: number;
  scope_leak_incidents: number;
  visibility_leak_incidents: number;
  unresolved_conflict_persistence_rate: number;
  audit_coverage_rate: number;
}

export interface ProviderNeutralityEvaluationMetrics {
  cross_provider_semantic_drift_rate: number;
  provider_specific_anomaly_count: number;
  cross_runtime_bundle_stability_score: number;
}

export interface OperationalStabilityEvaluationMetrics {
  stale_artifact_rate: number;
  missing_audit_rate: number;
  repeated_conflict_recurrence: number;
  degraded_continuity_incident_frequency: number;
}

export type RelevanceEvaluationResult = EvaluationResultBase<
  "relevance_evaluation",
  RelevanceEvaluationMetrics
>;

export type BoundednessEvaluationResult = EvaluationResultBase<
  "boundedness_evaluation",
  BoundednessEvaluationMetrics
>;

export type ContinuityEvaluationResult = EvaluationResultBase<
  "continuity_evaluation",
  ContinuityEvaluationMetrics
>;

export type WriteQualityEvaluationResult = EvaluationResultBase<
  "write_quality_evaluation",
  WriteQualityEvaluationMetrics
>;

export type HandoffQualityEvaluationResult = EvaluationResultBase<
  "handoff_quality_evaluation",
  HandoffQualityEvaluationMetrics
>;

export type GovernanceQualityEvaluationResult = EvaluationResultBase<
  "governance_quality_evaluation",
  GovernanceQualityEvaluationMetrics
>;

export type ProviderNeutralityEvaluationResult = EvaluationResultBase<
  "provider_neutrality_evaluation",
  ProviderNeutralityEvaluationMetrics
>;

export type OperationalStabilityEvaluationResult = EvaluationResultBase<
  "operational_stability_evaluation",
  OperationalStabilityEvaluationMetrics
>;

export type CanonicalEvaluationResult =
  | RelevanceEvaluationResult
  | BoundednessEvaluationResult
  | ContinuityEvaluationResult
  | WriteQualityEvaluationResult
  | HandoffQualityEvaluationResult
  | GovernanceQualityEvaluationResult
  | ProviderNeutralityEvaluationResult
  | OperationalStabilityEvaluationResult;

export interface EvaluationResultArtifact {
  evaluation_record: EvaluationRecord;
  quality_dimensions: QualityDimension[];
  result: CanonicalEvaluationResult;
}
