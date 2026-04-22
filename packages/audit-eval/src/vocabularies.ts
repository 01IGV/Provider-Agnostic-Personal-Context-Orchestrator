export const QUALITY_DIMENSIONS = [
  "relevance",
  "boundedness",
  "continuity",
  "write_quality",
  "handoff_quality",
  "governance_quality",
  "provider_neutrality",
  "operational_stability"
] as const;

export type QualityDimension = (typeof QUALITY_DIMENSIONS)[number];

export const FINDING_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export const FINDING_VOCABULARIES = [
  "coverage_gap",
  "critical_context_missed",
  "irrelevant_context_overflow",
  "boundedness_pressure",
  "over_compression",
  "continuity_loss",
  "state_memory_confusion",
  "duplicate_write_risk",
  "governance_misapplication",
  "visibility_scope_risk",
  "provider_semantic_drift",
  "operational_degradation"
] as const;

export type FindingVocabulary = (typeof FINDING_VOCABULARIES)[number];

export const METRIC_KINDS = ["ratio", "count", "score", "duration_ms", "percentile"] as const;
export type MetricKind = (typeof METRIC_KINDS)[number];

export const DRIFT_VOCABULARIES = [
  "cross_provider_semantic_drift",
  "classification_drift",
  "governance_outcome_drift",
  "handoff_meaning_drift",
  "bundle_shape_drift"
] as const;

export type DriftVocabulary = (typeof DRIFT_VOCABULARIES)[number];

export const ANOMALY_VOCABULARIES = [
  "missing_audit_trace",
  "stale_artifact_spike",
  "continuity_regression",
  "unexpected_rejection_spike",
  "conflict_recurrence_spike",
  "oversized_bundle_spike"
] as const;

export type AnomalyVocabulary = (typeof ANOMALY_VOCABULARIES)[number];

export interface QualityDimensionScore {
  dimension: QualityDimension;
  score: number;
  rationale?: string;
}

export interface EvaluationMetric {
  key: string;
  value: number;
  kind: MetricKind;
  unit?: string;
}

export interface EvaluationFinding {
  code: FindingVocabulary;
  severity: FindingSeverity;
  summary: string;
  impacted_dimensions: QualityDimension[];
  recommended_action?: string;
}

export interface DriftSignal {
  drift_type: DriftVocabulary;
  magnitude: number;
  baseline_ref?: string;
  comparison_ref?: string;
  note?: string;
}

export interface AnomalySignal {
  anomaly_type: AnomalyVocabulary;
  confidence: number;
  summary: string;
  observed_at: string;
}
