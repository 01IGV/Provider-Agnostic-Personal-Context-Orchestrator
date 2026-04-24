import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export const RUNTIME_EXECUTION_ATTEMPT_LIFECYCLE_STATES = [
  "queued",
  "prepared",
  "blocked",
  "deferred",
  "aborted",
  "expired",
  "cancelled",
  "not_dispatchable"
] as const;

export type RuntimeExecutionAttemptLifecycleState = (typeof RUNTIME_EXECUTION_ATTEMPT_LIFECYCLE_STATES)[number];

export interface RuntimeExecutionAttemptLifecycleWarning {
  code: string;
  message: string;
}

export interface RuntimeExecutionAttemptAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface RuntimeExecutionAttemptTransitionEnvelopeShape {
  transition_id: string;
  attempt_id: string;
  from_state: RuntimeExecutionAttemptLifecycleState;
  to_state: RuntimeExecutionAttemptLifecycleState;
  transition_expectation:
    | "allowed_contract_transition"
    | "blocked_contract_transition"
    | "deferred_contract_transition"
    | "terminal_contract_transition"
    | "invalid_contract_transition";
  transition_reason: string;
  warnings: RuntimeExecutionAttemptLifecycleWarning[];
  transitioned_at: IsoDateTimeString;
}

export interface RuntimeExecutionAttemptLifecycleEnvelopeShape {
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  attempt_family:
    | "read_path_execution_attempt"
    | "pack_loop_execution_attempt"
    | "write_path_execution_attempt"
    | "handoff_execution_attempt"
    | "unknown_execution_attempt";
  contour_target: OperationalContour | "unknown";
  lifecycle_state: RuntimeExecutionAttemptLifecycleState;
  result_family:
    | "queued_without_execution"
    | "prepared_without_execution"
    | "blocked_without_execution"
    | "deferred_without_execution"
    | "aborted_without_execution"
    | "expired_without_execution"
    | "cancelled_without_execution"
    | "not_dispatchable_without_execution"
    | "invalid_transition_without_execution";
  runtime_handoff_status: string;
  runtime_target_family: string;
  readiness_expectation: "ready_for_future_runtime" | "not_ready_for_future_runtime" | "requires_future_review";
  future_runtime_boundary: {
    handler_invocation_allowed_now: false;
    transport_delivery_allowed_now: false;
    provider_sdk_call_allowed_now: false;
    canonical_context_access_allowed_now: false;
    canonical_writeback_allowed_now: false;
  };
  authority_context_placeholder: RuntimeExecutionAttemptAuthorityContextPlaceholderShape;
  transition_expectations: RuntimeExecutionAttemptTransitionEnvelopeShape[];
  warnings: RuntimeExecutionAttemptLifecycleWarning[];
  emitted_at: IsoDateTimeString;
}
