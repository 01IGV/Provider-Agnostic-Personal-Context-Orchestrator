export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_FAMILIES = [
  "read_path_execution_attempt",
  "pack_loop_execution_attempt",
  "write_path_execution_attempt",
  "handoff_execution_attempt",
  "unknown_execution_attempt"
] as const;

export type DeliveryRuntimeExecutionAttemptFamily = (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_FAMILIES)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_STATES = [
  "queued",
  "prepared",
  "blocked",
  "deferred",
  "aborted",
  "expired",
  "cancelled",
  "not_dispatchable"
] as const;

export type DeliveryRuntimeExecutionAttemptState = (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_STATES)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_RESULT_FAMILIES = [
  "queued_without_execution",
  "prepared_without_execution",
  "blocked_without_execution",
  "deferred_without_execution",
  "aborted_without_execution",
  "expired_without_execution",
  "cancelled_without_execution",
  "not_dispatchable_without_execution",
  "invalid_transition_without_execution"
] as const;

export type DeliveryRuntimeExecutionAttemptResultFamily =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_RESULT_FAMILIES)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_TRANSITION_EXPECTATIONS = [
  "allowed_contract_transition",
  "blocked_contract_transition",
  "deferred_contract_transition",
  "terminal_contract_transition",
  "invalid_contract_transition"
] as const;

export type DeliveryRuntimeExecutionAttemptTransitionExpectation =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_TRANSITION_EXPECTATIONS)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_WARNING_CODES = [
  "attempt_family_ambiguous",
  "attempt_started_from_non_ready_handoff",
  "attempt_not_dispatchable",
  "attempt_transition_invalid",
  "attempt_transition_terminal",
  "attempt_runtime_boundary_only",
  "attempt_authority_context_placeholder_only",
  "attempt_provenance_context_placeholder_only",
  "attempt_delegation_context_placeholder_only",
  "attempt_audit_lifecycle_linkage_emitted",
  "attempt_integration_lifecycle_linkage_emitted",
  "attempt_runtime_surface_lifecycle_envelope_emitted"
] as const;

export type DeliveryRuntimeExecutionAttemptWarningCode =
  (typeof DELIVERY_RUNTIME_EXECUTION_ATTEMPT_WARNING_CODES)[number];

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_ALLOWED_TRANSITIONS: Record<
  DeliveryRuntimeExecutionAttemptState,
  DeliveryRuntimeExecutionAttemptState[]
> = {
  queued: ["prepared", "blocked", "deferred", "aborted", "expired", "cancelled", "not_dispatchable"],
  prepared: ["deferred", "aborted", "expired", "cancelled", "not_dispatchable"],
  blocked: ["queued", "deferred", "aborted", "expired", "cancelled", "not_dispatchable"],
  deferred: ["queued", "blocked", "aborted", "expired", "cancelled", "not_dispatchable"],
  aborted: [],
  expired: [],
  cancelled: [],
  not_dispatchable: []
};

export const DELIVERY_RUNTIME_EXECUTION_ATTEMPT_STATE_TO_RESULT_FAMILY: Record<
  DeliveryRuntimeExecutionAttemptState,
  DeliveryRuntimeExecutionAttemptResultFamily
> = {
  queued: "queued_without_execution",
  prepared: "prepared_without_execution",
  blocked: "blocked_without_execution",
  deferred: "deferred_without_execution",
  aborted: "aborted_without_execution",
  expired: "expired_without_execution",
  cancelled: "cancelled_without_execution",
  not_dispatchable: "not_dispatchable_without_execution"
};
