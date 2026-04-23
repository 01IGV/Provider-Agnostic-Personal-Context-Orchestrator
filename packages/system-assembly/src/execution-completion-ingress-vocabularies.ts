export const COMPLETION_INGRESS_STATUSES = [
  "accepted_completion",
  "rejected_completion",
  "incomplete_completion",
  "mismatched_completion"
] as const;

export type CompletionIngressStatus = (typeof COMPLETION_INGRESS_STATUSES)[number];

export const COMPLETION_VALIDATION_STATUSES = ["accepted", "rejected", "incomplete", "mismatched"] as const;

export type CompletionValidationStatus = (typeof COMPLETION_VALIDATION_STATUSES)[number];

export const COMPLETION_ARTIFACT_FAMILIES = ["read_path", "pack_loop", "write_path", "handoff", "unknown"] as const;

export type CompletionArtifactFamily = (typeof COMPLETION_ARTIFACT_FAMILIES)[number];

export const COMPLETION_REJECTION_REASON_CODES = [
  "missing_completion_envelope",
  "missing_attempt_linkage",
  "identifier_mismatch",
  "contour_target_mismatch",
  "artifact_family_mismatch",
  "artifact_payload_missing",
  "handoff_not_eligible_for_completion",
  "handoff_placeholder_missing"
] as const;

export type CompletionRejectionReasonCode = (typeof COMPLETION_REJECTION_REASON_CODES)[number];

export const COMPLETION_INGRESS_WARNING_CODES = [
  "completion_envelope_missing_attempt_id",
  "completion_envelope_missing_contour_target",
  "completion_artifact_incomplete",
  "completion_artifact_ambiguous",
  "completion_forwarded_to_reconciliation",
  "completion_not_forwarded_to_reconciliation"
] as const;

export type CompletionIngressWarningCode = (typeof COMPLETION_INGRESS_WARNING_CODES)[number];
