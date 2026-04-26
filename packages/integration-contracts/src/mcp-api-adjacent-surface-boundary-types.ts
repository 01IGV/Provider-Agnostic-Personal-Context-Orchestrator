import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  McpApiAdjacentSurfaceBoundaryContourTarget,
  McpApiAdjacentSurfaceBoundaryDenialReason,
  McpApiAdjacentSurfaceBoundaryStatus,
  McpApiAdjacentSurfaceBoundaryWarningCode,
  McpApiAdjacentSurfaceKind
} from "./mcp-api-adjacent-surface-boundary-vocabularies.js";

export interface McpApiAdjacentSurfaceBoundaryWarningShape {
  code: McpApiAdjacentSurfaceBoundaryWarningCode;
  message: string;
}

export interface McpApiAdjacentSurfaceBoundarySourceShape {
  source_handler_boundary_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_invocation_denial_proof_id: string;
  source_invocation_seam_id: string;
  source_contour_target: McpApiAdjacentSurfaceBoundaryContourTarget;
  source_handler_boundary_status: string;
  source_handler_boundary_denial_contract_version: "handler-boundary-denial-proof/v1";
  source_handler_boundary_denial_verified: true;
}

export interface McpApiAdjacentSurfaceBoundaryAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
  notes: string[];
}

export interface McpApiAdjacentSurfaceBoundaryDenialFlagsShape {
  mcp_tool_registration_allowed_now: false;
  mcp_tool_invocation_allowed_now: false;
  mcp_resource_registration_allowed_now: false;
  api_route_registration_allowed_now: false;
  api_route_invocation_allowed_now: false;
  api_controller_allowed_now: false;
  controller_execution_allowed_now: false;
  runtime_handler_bound: false;
  runtime_handler_invocation_allowed_now: false;
  handler_execution_allowed_now: false;
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

export interface McpApiAdjacentSurfaceBoundaryIntentShape {
  surface_boundary_intent_id: string;
  surface_boundary_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_contour_target: McpApiAdjacentSurfaceBoundaryContourTarget;
  surface_kind: McpApiAdjacentSurfaceKind;
  intent_status: "surface_boundary_intent_recorded";
  intent_boundary: "mcp_api_adjacent_surface_boundary_contract_only";
  mcp_api_adjacent: true;
  protocol_surface_boundary: true;
  route_controller_implemented: false;
  mcp_tool_registered: false;
  api_route_registered: false;
  runtime_handler_bound: false;
  runtime_permission_granted: false;
  actual_handler_execution_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  notes: string[];
}

export interface McpApiAdjacentSurfaceBoundaryReadinessShape {
  surface_boundary_readiness_id: string;
  surface_boundary_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_contour_target: McpApiAdjacentSurfaceBoundaryContourTarget;
  surface_kind: McpApiAdjacentSurfaceKind;
  boundary_status: McpApiAdjacentSurfaceBoundaryStatus;
  readiness_status: "candidate_for_future_protocol_surface" | "not_ready_for_future_protocol_surface";
  mcp_tool_registration_allowed_now: false;
  api_route_registration_allowed_now: false;
  controller_execution_allowed_now: false;
  runtime_handler_invocation_allowed_now: false;
  runtime_permission_granted: false;
  denial_reasons: McpApiAdjacentSurfaceBoundaryDenialReason[];
  notes: string[];
}

export interface McpApiAdjacentSurfaceBoundaryShape {
  surface_boundary_id: string;
  request_id: string;
  operation_id: string;
  source: McpApiAdjacentSurfaceBoundarySourceShape;
  authority_context_placeholder: McpApiAdjacentSurfaceBoundaryAuthorityContextPlaceholderShape;
  surface_kind: McpApiAdjacentSurfaceKind;
  boundary_status: McpApiAdjacentSurfaceBoundaryStatus;
  mcp_api_adjacent: true;
  protocol_surface_boundary: true;
  route_controller_implemented: false;
  mcp_tool_registered: false;
  api_route_registered: false;
  runtime_handler_bound: false;
  runtime_permission_granted: false;
  actual_handler_execution_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  surface_boundary_intent: McpApiAdjacentSurfaceBoundaryIntentShape;
  surface_boundary_readiness: McpApiAdjacentSurfaceBoundaryReadinessShape;
  denial_flags: McpApiAdjacentSurfaceBoundaryDenialFlagsShape;
  denial_reasons: McpApiAdjacentSurfaceBoundaryDenialReason[];
  warnings: McpApiAdjacentSurfaceBoundaryWarningShape[];
  guardrail_notes: string[];
  created_at: IsoDateTimeString;
}

export interface McpApiAdjacentSurfaceBoundarySummaryShape {
  surface_boundary_id: string;
  source_handler_boundary_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: McpApiAdjacentSurfaceBoundaryContourTarget;
  source_handler_boundary_status: string;
  surface_kind: McpApiAdjacentSurfaceKind;
  boundary_status: McpApiAdjacentSurfaceBoundaryStatus;
  mcp_api_adjacent: true;
  protocol_surface_boundary: true;
  route_controller_implemented: false;
  mcp_tool_registered: false;
  api_route_registered: false;
  runtime_handler_bound: false;
  runtime_permission_granted: false;
  actual_handler_execution_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  denial_flags_all_false: true;
  guardrail_notes: string[];
}

export interface McpApiAdjacentSurfaceBoundaryBuilderInputShape {
  surface_boundary_id: string;
  request_id: string;
  operation_id: string;
  source: McpApiAdjacentSurfaceBoundarySourceShape;
  authority_context_placeholder: McpApiAdjacentSurfaceBoundaryAuthorityContextPlaceholderShape;
  surface_kind?: McpApiAdjacentSurfaceKind;
  boundary_status?: McpApiAdjacentSurfaceBoundaryStatus;
  denial_reasons?: McpApiAdjacentSurfaceBoundaryDenialReason[];
  warnings?: McpApiAdjacentSurfaceBoundaryWarningShape[];
  guardrail_notes?: string[];
  created_at: IsoDateTimeString;
}

export interface McpApiAdjacentSurfaceBoundaryBuilder {
  create(input: McpApiAdjacentSurfaceBoundaryBuilderInputShape): McpApiAdjacentSurfaceBoundaryShape;
  summarize(input: McpApiAdjacentSurfaceBoundaryShape): McpApiAdjacentSurfaceBoundarySummaryShape;
}
