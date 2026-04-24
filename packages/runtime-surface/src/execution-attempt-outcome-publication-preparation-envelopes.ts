import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export const RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_FAMILIES = [
  "read_path_outcome_publication_preparation",
  "pack_loop_outcome_publication_preparation",
  "write_path_outcome_publication_preparation",
  "handoff_outcome_publication_preparation",
  "unknown_outcome_publication_preparation"
] as const;

export type RuntimeExecutionAttemptOutcomePublicationPreparationFamily =
  (typeof RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_FAMILIES)[number];

export const RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_STATUSES = [
  "queued_publication_preparation",
  "prepared_publication_preparation",
  "blocked_publication_preparation",
  "deferred_publication_preparation",
  "aborted_publication_preparation",
  "expired_publication_preparation",
  "cancelled_publication_preparation",
  "not_dispatchable_publication_preparation"
] as const;

export type RuntimeExecutionAttemptOutcomePublicationPreparationStatus =
  (typeof RUNTIME_EXECUTION_ATTEMPT_OUTCOME_PUBLICATION_PREPARATION_STATUSES)[number];

export interface RuntimeExecutionAttemptOutcomePublicationPreparationWarning {
  code: string;
  message: string;
}

export interface RuntimeExecutionAttemptOutcomePublicationPreparationAuthorityContextShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface RuntimeExecutionAttemptOutcomePublicationPreparationBoundaryShape {
  publication_preparation_boundary_status: "publication_ready_placeholder_only";
  publication_delivery_allowed_now: false;
  handler_invocation_allowed_now: false;
  delivery_runtime_allowed_now: false;
  transport_delivery_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  canonical_context_access_allowed_now: false;
  canonical_writeback_allowed_now: false;
}

export interface RuntimeExecutionAttemptOutcomePublicationPreparationEnvelopeShape {
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  publication_preparation_family: RuntimeExecutionAttemptOutcomePublicationPreparationFamily;
  publication_preparation_status: RuntimeExecutionAttemptOutcomePublicationPreparationStatus;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  runtime_surface_status: "accepted" | "success" | "rejected" | "error";
  authority_context_placeholder: RuntimeExecutionAttemptOutcomePublicationPreparationAuthorityContextShape;
  publication_boundary: RuntimeExecutionAttemptOutcomePublicationPreparationBoundaryShape;
  publication_ready_payload: Record<string, unknown>;
  warnings: RuntimeExecutionAttemptOutcomePublicationPreparationWarning[];
  emitted_at: IsoDateTimeString;
}
