import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export const RUNTIME_DELIVERY_DISPATCH_INTENT_FAMILIES = [
  "read_path_delivery_dispatch_intent",
  "pack_loop_delivery_dispatch_intent",
  "write_path_delivery_dispatch_intent",
  "handoff_delivery_dispatch_intent",
  "unknown_delivery_dispatch_intent"
] as const;

export type RuntimeDeliveryDispatchIntentFamily =
  (typeof RUNTIME_DELIVERY_DISPATCH_INTENT_FAMILIES)[number];

export const RUNTIME_DELIVERY_DISPATCH_INTENT_STATUSES = [
  "queued_delivery_dispatch_intent",
  "prepared_delivery_dispatch_intent",
  "blocked_delivery_dispatch_intent",
  "deferred_delivery_dispatch_intent",
  "aborted_delivery_dispatch_intent",
  "expired_delivery_dispatch_intent",
  "cancelled_delivery_dispatch_intent",
  "not_dispatchable_delivery_dispatch_intent"
] as const;

export type RuntimeDeliveryDispatchIntentStatus =
  (typeof RUNTIME_DELIVERY_DISPATCH_INTENT_STATUSES)[number];

export interface RuntimeDeliveryDispatchIntentWarning {
  code: string;
  message: string;
}

export interface RuntimeDeliveryDispatchIntentAuthorityContextShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface RuntimeDeliveryDispatchIntentBoundaryShape {
  delivery_dispatch_intent_boundary_status: "delivery_dispatch_intent_placeholder_only";
  actual_dispatch_execution_allowed_now: false;
  actual_publication_delivery_allowed_now: false;
  handler_invocation_allowed_now: false;
  delivery_runtime_allowed_now: false;
  transport_delivery_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  canonical_context_access_allowed_now: false;
  canonical_writeback_allowed_now: false;
}

export interface RuntimeDeliveryDispatchIntentEnvelopeShape {
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  source_dispatch_intent_id: string;
  runtime_handoff_id: string;
  delivery_dispatch_intent_family: RuntimeDeliveryDispatchIntentFamily;
  delivery_dispatch_intent_status: RuntimeDeliveryDispatchIntentStatus;
  dispatch_readiness_family: string;
  dispatch_readiness_status: string;
  publication_preparation_family: string;
  publication_preparation_status: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  runtime_surface_status: "accepted" | "success" | "rejected" | "error";
  authority_context_placeholder: RuntimeDeliveryDispatchIntentAuthorityContextShape;
  delivery_dispatch_intent_boundary: RuntimeDeliveryDispatchIntentBoundaryShape;
  delivery_dispatch_intent_payload: Record<string, unknown>;
  warnings: RuntimeDeliveryDispatchIntentWarning[];
  emitted_at: IsoDateTimeString;
}
