import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export const RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_FAMILIES = [
  "read_path_normalized_attempt_outcome",
  "pack_loop_normalized_attempt_outcome",
  "write_path_normalized_attempt_outcome",
  "handoff_normalized_attempt_outcome",
  "unknown_normalized_attempt_outcome"
] as const;

export type RuntimeNormalizedExecutionAttemptOutcomeFamily =
  (typeof RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_FAMILIES)[number];

export const RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_STATUSES = [
  "queued_outcome",
  "prepared_outcome",
  "blocked_outcome",
  "deferred_outcome",
  "aborted_outcome",
  "expired_outcome",
  "cancelled_outcome",
  "not_dispatchable_outcome"
] as const;

export type RuntimeNormalizedExecutionAttemptOutcomeStatus =
  (typeof RUNTIME_NORMALIZED_EXECUTION_ATTEMPT_OUTCOME_STATUSES)[number];

export interface RuntimeNormalizedExecutionAttemptOutcomeWarning {
  code: string;
  message: string;
}

export interface RuntimeNormalizedExecutionAttemptOutcomeAuthorityContextShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface RuntimeNormalizedExecutionAttemptOutcomeBoundaryShape {
  outcome_boundary_status: "normalized_placeholder_outcome_only";
  handler_invocation_allowed_now: false;
  delivery_runtime_allowed_now: false;
  transport_delivery_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  canonical_context_access_allowed_now: false;
  canonical_writeback_allowed_now: false;
}

export interface RuntimeNormalizedExecutionAttemptOutcomeEnvelopeShape {
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  normalized_outcome_family: RuntimeNormalizedExecutionAttemptOutcomeFamily;
  normalized_outcome_status: RuntimeNormalizedExecutionAttemptOutcomeStatus;
  lifecycle_state: string;
  lifecycle_result_family: string;
  contour_target: OperationalContour | "unknown";
  runtime_surface_status: "accepted" | "success" | "rejected" | "error";
  authority_context_placeholder: RuntimeNormalizedExecutionAttemptOutcomeAuthorityContextShape;
  future_runtime_boundary: RuntimeNormalizedExecutionAttemptOutcomeBoundaryShape;
  outcome_payload: Record<string, unknown>;
  warnings: RuntimeNormalizedExecutionAttemptOutcomeWarning[];
  emitted_at: IsoDateTimeString;
}
