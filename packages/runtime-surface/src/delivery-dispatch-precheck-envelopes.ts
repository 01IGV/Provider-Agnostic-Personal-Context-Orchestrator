import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export const RUNTIME_DELIVERY_DISPATCH_PRECHECK_FAMILIES = [
  "read_path_delivery_dispatch_precheck",
  "pack_loop_delivery_dispatch_precheck",
  "write_path_delivery_dispatch_precheck",
  "handoff_delivery_dispatch_precheck",
  "unknown_delivery_dispatch_precheck"
] as const;

export type RuntimeDeliveryDispatchPrecheckFamily =
  (typeof RUNTIME_DELIVERY_DISPATCH_PRECHECK_FAMILIES)[number];

export const RUNTIME_DELIVERY_DISPATCH_PRECHECK_STATUSES = [
  "queued_delivery_dispatch_precheck",
  "prepared_delivery_dispatch_precheck",
  "blocked_delivery_dispatch_precheck",
  "deferred_delivery_dispatch_precheck",
  "aborted_delivery_dispatch_precheck",
  "expired_delivery_dispatch_precheck",
  "cancelled_delivery_dispatch_precheck",
  "not_dispatchable_delivery_dispatch_precheck"
] as const;

export type RuntimeDeliveryDispatchPrecheckStatus =
  (typeof RUNTIME_DELIVERY_DISPATCH_PRECHECK_STATUSES)[number];

export interface RuntimeDeliveryDispatchPrecheckWarning {
  code: string;
  message: string;
}

export interface RuntimeDeliveryDispatchPrecheckAuthorityContextShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface RuntimeDeliveryDispatchPrecheckBoundaryShape {
  delivery_dispatch_precheck_boundary_status: "delivery_dispatch_precheck_placeholder_only";
  actual_dispatch_execution_allowed_now: false;
  actual_publication_delivery_allowed_now: false;
  handler_invocation_allowed_now: false;
  delivery_runtime_allowed_now: false;
  transport_delivery_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  canonical_context_access_allowed_now: false;
  canonical_writeback_allowed_now: false;
}

export interface RuntimeDeliveryDispatchPrecheckEnvelopeShape {
  delivery_dispatch_precheck_id: string;
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  source_precheck_id: string;
  source_dispatch_intent_id: string;
  runtime_handoff_id: string;
  delivery_dispatch_precheck_family: RuntimeDeliveryDispatchPrecheckFamily;
  delivery_dispatch_precheck_status: RuntimeDeliveryDispatchPrecheckStatus;
  delivery_dispatch_intent_family: string;
  delivery_dispatch_intent_status: string;
  dispatch_readiness_family: string;
  dispatch_readiness_status: string;
  publication_preparation_family: string;
  publication_preparation_status: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  runtime_surface_status: "accepted" | "success" | "rejected" | "error";
  authority_context_placeholder: RuntimeDeliveryDispatchPrecheckAuthorityContextShape;
  delivery_dispatch_precheck_boundary: RuntimeDeliveryDispatchPrecheckBoundaryShape;
  delivery_dispatch_precheck_payload: Record<string, unknown>;
  warnings: RuntimeDeliveryDispatchPrecheckWarning[];
  emitted_at: IsoDateTimeString;
}
