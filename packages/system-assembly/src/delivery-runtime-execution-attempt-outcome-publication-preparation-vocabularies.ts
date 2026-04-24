export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_FAMILIES = [
  "read_path_outcome_publication_preparation",
  "pack_loop_outcome_publication_preparation",
  "write_path_outcome_publication_preparation",
  "handoff_outcome_publication_preparation",
  "unknown_outcome_publication_preparation"
] as const;

export type DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_FAMILIES)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_STATUSES = [
  "queued_publication_preparation",
  "prepared_publication_preparation",
  "blocked_publication_preparation",
  "deferred_publication_preparation",
  "aborted_publication_preparation",
  "expired_publication_preparation",
  "cancelled_publication_preparation",
  "not_dispatchable_publication_preparation"
] as const;

export type DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_STATUSES)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_RESULTS = [
  "publication_placeholder_queued",
  "publication_placeholder_ready",
  "publication_placeholder_blocked",
  "publication_placeholder_deferred",
  "publication_placeholder_terminal",
  "publication_placeholder_not_dispatchable"
] as const;

export type DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationResult =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_RESULTS)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_WARNING_CODES = [
  "publication_preparation_family_ambiguous",
  "publication_preparation_status_mismatch",
  "publication_preparation_runtime_boundary_only",
  "publication_preparation_not_actual_dispatch_execution",
  "publication_preparation_not_actual_publication_delivery",
  "publication_preparation_not_actual_handler_result",
  "publication_preparation_not_actual_delivery_result",
  "publication_preparation_not_provider_transport_result",
  "publication_preparation_authority_context_placeholder_only",
  "publication_preparation_provenance_context_placeholder_only",
  "publication_preparation_delegation_context_placeholder_only",
  "publication_preparation_runtime_surface_envelope_emitted",
  "publication_preparation_integration_linkage_emitted",
  "publication_preparation_audit_linkage_emitted"
] as const;

export type DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningCode =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_WARNING_CODES)[number];

export const DELIVERY_RUNTIME_NORMALIZED_OUTCOME_STATUS_TO_PUBLICATION_PREPARATION_STATUS = {
  queued_outcome: "queued_publication_preparation",
  prepared_outcome: "prepared_publication_preparation",
  blocked_outcome: "blocked_publication_preparation",
  deferred_outcome: "deferred_publication_preparation",
  aborted_outcome: "aborted_publication_preparation",
  expired_outcome: "expired_publication_preparation",
  cancelled_outcome: "cancelled_publication_preparation",
  not_dispatchable_outcome: "not_dispatchable_publication_preparation"
} as const;
