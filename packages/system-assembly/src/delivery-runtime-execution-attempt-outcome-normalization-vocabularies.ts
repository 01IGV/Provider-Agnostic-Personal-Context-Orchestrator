export const DELIVERY_RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_FAMILIES = [
  "read_path_normalized_attempt_outcome",
  "pack_loop_normalized_attempt_outcome",
  "write_path_normalized_attempt_outcome",
  "handoff_normalized_attempt_outcome",
  "unknown_normalized_attempt_outcome"
] as const;

export type DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily =
  (typeof DELIVERY_RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_FAMILIES)[number];

export const DELIVERY_RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_STATUSES = [
  "queued_outcome",
  "prepared_outcome",
  "blocked_outcome",
  "deferred_outcome",
  "aborted_outcome",
  "expired_outcome",
  "cancelled_outcome",
  "not_dispatchable_outcome"
] as const;

export type DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus =
  (typeof DELIVERY_RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_STATUSES)[number];

export const DELIVERY_RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_RESULTS = [
  "placeholder_accepted",
  "placeholder_ready_for_future_runtime",
  "placeholder_rejected",
  "placeholder_terminal",
  "placeholder_error"
] as const;

export type DeliveryRuntimeNormalizedExecutionAttemptOutcomeResult =
  (typeof DELIVERY_RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_RESULTS)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_NORMALIZATION_WARNING_CODES = [
  "normalized_outcome_family_ambiguous",
  "normalized_outcome_status_mismatch",
  "normalized_outcome_lifecycle_result_mismatch",
  "normalized_outcome_runtime_boundary_only",
  "normalized_outcome_not_actual_handler_result",
  "normalized_outcome_not_actual_delivery_result",
  "normalized_outcome_not_provider_transport_result",
  "normalized_outcome_authority_context_placeholder_only",
  "normalized_outcome_provenance_context_placeholder_only",
  "normalized_outcome_delegation_context_placeholder_only",
  "normalized_outcome_runtime_surface_envelope_emitted",
  "normalized_outcome_integration_linkage_emitted",
  "normalized_outcome_audit_linkage_emitted"
] as const;

export type DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningCode =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_NORMALIZATION_WARNING_CODES)[number];

export const DELIVERY_RUNTIME_LIFECYCLE_STATE_TO_NORMALIZED_OUTCOME_STATUS = {
  queued: "queued_outcome",
  prepared: "prepared_outcome",
  blocked: "blocked_outcome",
  deferred: "deferred_outcome",
  aborted: "aborted_outcome",
  expired: "expired_outcome",
  cancelled: "cancelled_outcome",
  not_dispatchable: "not_dispatchable_outcome"
} as const;
