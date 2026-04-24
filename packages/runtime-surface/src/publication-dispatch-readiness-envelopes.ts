import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export const RUNTIME_PUBLICATION_DISPATCH_READINESS_FAMILIES = [
  "read_path_publication_dispatch_readiness",
  "pack_loop_publication_dispatch_readiness",
  "write_path_publication_dispatch_readiness",
  "handoff_publication_dispatch_readiness",
  "unknown_publication_dispatch_readiness"
] as const;

export type RuntimePublicationDispatchReadinessFamily =
  (typeof RUNTIME_PUBLICATION_DISPATCH_READINESS_FAMILIES)[number];

export const RUNTIME_PUBLICATION_DISPATCH_READINESS_STATUSES = [
  "queued_dispatch_readiness",
  "prepared_dispatch_readiness",
  "blocked_dispatch_readiness",
  "deferred_dispatch_readiness",
  "aborted_dispatch_readiness",
  "expired_dispatch_readiness",
  "cancelled_dispatch_readiness",
  "not_dispatchable_dispatch_readiness"
] as const;

export type RuntimePublicationDispatchReadinessStatus =
  (typeof RUNTIME_PUBLICATION_DISPATCH_READINESS_STATUSES)[number];

export interface RuntimePublicationDispatchReadinessWarning {
  code: string;
  message: string;
}

export interface RuntimePublicationDispatchReadinessAuthorityContextShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface RuntimePublicationDispatchReadinessBoundaryShape {
  dispatch_readiness_boundary_status: "dispatch_ready_placeholder_only";
  actual_dispatch_execution_allowed_now: false;
  publication_delivery_allowed_now: false;
  handler_invocation_allowed_now: false;
  delivery_runtime_allowed_now: false;
  transport_delivery_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  canonical_context_access_allowed_now: false;
  canonical_writeback_allowed_now: false;
}

export interface RuntimePublicationDispatchReadinessEnvelopeShape {
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  dispatch_readiness_family: RuntimePublicationDispatchReadinessFamily;
  dispatch_readiness_status: RuntimePublicationDispatchReadinessStatus;
  publication_preparation_family: string;
  publication_preparation_status: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  runtime_surface_status: "accepted" | "success" | "rejected" | "error";
  authority_context_placeholder: RuntimePublicationDispatchReadinessAuthorityContextShape;
  dispatch_readiness_boundary: RuntimePublicationDispatchReadinessBoundaryShape;
  dispatch_readiness_payload: Record<string, unknown>;
  warnings: RuntimePublicationDispatchReadinessWarning[];
  emitted_at: IsoDateTimeString;
}
