import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  RuntimeAdjacentHandlerBoundaryContourTarget,
  RuntimeAdjacentHandlerBoundaryDenialReason,
  RuntimeAdjacentHandlerBoundaryStatus,
  RuntimeAdjacentHandlerBoundaryWarningCode
} from "./runtime-adjacent-handler-boundary-vocabularies.js";

export interface RuntimeAdjacentHandlerBoundaryWarningShape {
  code: RuntimeAdjacentHandlerBoundaryWarningCode;
  message: string;
}

export interface RuntimeAdjacentHandlerBoundarySourceShape {
  source_invocation_seam_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: RuntimeAdjacentHandlerBoundaryContourTarget;
  source_seam_status: string;
  source_invocation_denial_contract_version: "invocation-denial-proof/v1";
  source_invocation_denial_verified: true;
}

export interface RuntimeAdjacentHandlerBoundaryAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
  notes: string[];
}

export interface RuntimeAdjacentHandlerBoundaryDenialFlagsShape {
  handler_invocation_allowed_now: false;
  handler_execution_allowed_now: false;
  runtime_dispatch_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  transport_execution_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  direct_canonical_context_access_allowed_now: false;
  direct_canonical_writeback_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  runtime_permission_granted: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
}

export interface RuntimeAdjacentHandlerBoundaryIntentShape {
  handler_boundary_intent_id: string;
  handler_boundary_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: RuntimeAdjacentHandlerBoundaryContourTarget;
  intent_status: "handler_boundary_intent_recorded";
  intent_boundary: "runtime_adjacent_handler_boundary_contract_only";
  runtime_adjacent: true;
  runtime_handler_boundary: true;
  handler_execution_allowed_now: false;
  runtime_permission_granted: false;
  notes: string[];
}

export interface RuntimeAdjacentHandlerBoundaryReadinessShape {
  handler_boundary_readiness_id: string;
  handler_boundary_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: RuntimeAdjacentHandlerBoundaryContourTarget;
  boundary_status: RuntimeAdjacentHandlerBoundaryStatus;
  readiness_status: "candidate_for_future_handler_runtime" | "not_ready_for_future_handler_runtime";
  handler_invocation_allowed_now: false;
  handler_execution_allowed_now: false;
  runtime_dispatch_allowed_now: false;
  runtime_permission_granted: false;
  denial_reasons: RuntimeAdjacentHandlerBoundaryDenialReason[];
  notes: string[];
}

export interface RuntimeAdjacentHandlerBoundaryShape {
  handler_boundary_id: string;
  request_id: string;
  operation_id: string;
  source: RuntimeAdjacentHandlerBoundarySourceShape;
  authority_context_placeholder: RuntimeAdjacentHandlerBoundaryAuthorityContextPlaceholderShape;
  boundary_status: RuntimeAdjacentHandlerBoundaryStatus;
  runtime_adjacent: true;
  runtime_handler_boundary: true;
  handler_execution_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  handler_boundary_intent: RuntimeAdjacentHandlerBoundaryIntentShape;
  handler_boundary_readiness: RuntimeAdjacentHandlerBoundaryReadinessShape;
  denial_flags: RuntimeAdjacentHandlerBoundaryDenialFlagsShape;
  denial_reasons: RuntimeAdjacentHandlerBoundaryDenialReason[];
  warnings: RuntimeAdjacentHandlerBoundaryWarningShape[];
  guardrail_notes: string[];
  created_at: IsoDateTimeString;
}

export interface RuntimeAdjacentHandlerBoundarySummaryShape {
  handler_boundary_id: string;
  source_invocation_seam_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: RuntimeAdjacentHandlerBoundaryContourTarget;
  boundary_status: RuntimeAdjacentHandlerBoundaryStatus;
  runtime_adjacent: true;
  runtime_handler_boundary: true;
  handler_execution_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  denial_flags_all_false: true;
  guardrail_notes: string[];
}

export interface RuntimeAdjacentHandlerBoundaryBuilderInputShape {
  handler_boundary_id: string;
  request_id: string;
  operation_id: string;
  source: RuntimeAdjacentHandlerBoundarySourceShape;
  authority_context_placeholder: RuntimeAdjacentHandlerBoundaryAuthorityContextPlaceholderShape;
  boundary_status?: RuntimeAdjacentHandlerBoundaryStatus;
  denial_reasons?: RuntimeAdjacentHandlerBoundaryDenialReason[];
  warnings?: RuntimeAdjacentHandlerBoundaryWarningShape[];
  guardrail_notes?: string[];
  created_at: IsoDateTimeString;
}

export interface RuntimeAdjacentHandlerBoundaryBuilder {
  create(input: RuntimeAdjacentHandlerBoundaryBuilderInputShape): RuntimeAdjacentHandlerBoundaryShape;
  summarize(input: RuntimeAdjacentHandlerBoundaryShape): RuntimeAdjacentHandlerBoundarySummaryShape;
}
