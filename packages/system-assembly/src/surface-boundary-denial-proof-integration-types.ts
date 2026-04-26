import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { McpApiAdjacentSurfaceBoundaryShape } from "@orchestrator/integration-contracts";
import type { HandlerBoundaryDenialProofSummaryShape } from "./handler-boundary-denial-proof-integration-types.js";

export type SurfaceBoundaryDenialProofContractVersion = "surface-boundary-denial-proof/v1";

export type SurfaceBoundaryDenialProofResult = "surface_boundary_denial_default_deny_proven";

export type SurfaceBoundaryDenialProofBoundary = "machine_checkable_surface_boundary_denial_proof_only";

export type SurfaceBoundaryDenialProofFailureCode =
  | "surface_boundary_not_mcp_api_adjacent"
  | "surface_boundary_not_protocol_surface_boundary"
  | "route_controller_implemented_not_false"
  | "mcp_tool_registered_not_false"
  | "mcp_resource_registered_not_false"
  | "api_route_registered_not_false"
  | "api_controller_registered_not_false"
  | "runtime_handler_bound_not_false"
  | "runtime_permission_not_false"
  | "actual_handler_execution_not_false"
  | "actual_contour_execution_not_false"
  | "denial_flags_not_all_false"
  | "mcp_tool_registration_allowed"
  | "mcp_tool_invocation_allowed"
  | "mcp_resource_registration_allowed"
  | "api_route_registration_allowed"
  | "api_route_invocation_allowed"
  | "api_controller_allowed"
  | "controller_execution_allowed"
  | "runtime_handler_invocation_allowed"
  | "handler_execution_allowed"
  | "provider_sdk_call_allowed"
  | "transport_execution_allowed"
  | "concrete_persistence_write_allowed"
  | "direct_canonical_context_access_allowed"
  | "direct_canonical_writeback_allowed"
  | "actual_contour_execution_allowed"
  | "real_model_call_allowed"
  | "real_storage_write_allowed"
  | "source_handler_boundary_denial_not_verified"
  | "source_handler_boundary_not_runtime_adjacent"
  | "source_handler_boundary_not_runtime_handler_boundary"
  | "source_handler_boundary_execution_not_false"
  | "source_handler_boundary_runtime_permission_not_false"
  | "source_handler_boundary_actual_contour_execution_not_false"
  | "source_handler_boundary_denial_flags_not_false"
  | "surface_boundary_intent_route_controller_implemented"
  | "surface_boundary_intent_mcp_tool_registered"
  | "surface_boundary_intent_api_route_registered"
  | "surface_boundary_intent_runtime_handler_bound"
  | "surface_boundary_intent_runtime_permission_not_false"
  | "surface_boundary_intent_handler_execution_allowed"
  | "surface_boundary_intent_contour_execution_allowed"
  | "surface_boundary_readiness_mcp_tool_registration_allowed"
  | "surface_boundary_readiness_api_route_registration_allowed"
  | "surface_boundary_readiness_controller_execution_allowed"
  | "surface_boundary_readiness_handler_invocation_allowed"
  | "surface_boundary_readiness_runtime_permission_not_false"
  | "source_handler_boundary_denial_proof_mismatch"
  | "source_handler_boundary_id_mismatch"
  | "source_invocation_denial_proof_id_mismatch"
  | "source_invocation_seam_id_mismatch"
  | "source_contour_target_mismatch";

export interface SurfaceBoundaryDenialProofFailureShape {
  code: SurfaceBoundaryDenialProofFailureCode;
  path: string;
  expected: true | false | string;
  actual: unknown;
  message: string;
}

export interface SurfaceBoundaryDenialProofAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface SurfaceBoundaryDenialProofDenialAssertionsShape {
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

export interface SurfaceBoundaryDenialProofReadinessAssertionsShape {
  surface_boundary_readiness_id: string;
  readiness_status: "candidate_for_future_protocol_surface" | "not_ready_for_future_protocol_surface";
  mcp_tool_registration_allowed_now: false;
  api_route_registration_allowed_now: false;
  controller_execution_allowed_now: false;
  runtime_handler_invocation_allowed_now: false;
  runtime_permission_granted: false;
}

export interface SurfaceBoundaryDenialProofIntentAssertionsShape {
  surface_boundary_intent_id: string;
  intent_status: "surface_boundary_intent_recorded";
  mcp_api_adjacent: true;
  protocol_surface_boundary: true;
  route_controller_implemented: false;
  mcp_tool_registered: false;
  api_route_registered: false;
  runtime_handler_bound: false;
  runtime_permission_granted: false;
  actual_handler_execution_allowed_now: false;
  actual_contour_execution_allowed_now: false;
}

export interface SurfaceBoundaryDenialProofSourceHandlerBoundaryAssertionsShape {
  source_handler_boundary_denial_contract_version: "handler-boundary-denial-proof/v1";
  source_handler_boundary_denial_verified: true;
  source_handler_boundary_runtime_adjacent: true;
  source_handler_boundary_runtime_handler_boundary: true;
  source_handler_execution_allowed_now: false;
  source_handler_runtime_permission_granted: false;
  source_handler_actual_contour_execution_allowed_now: false;
  source_handler_denial_flags_all_false: true;
}

export interface SurfaceBoundaryDenialProofSourceShape {
  source_surface_boundary_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_handler_boundary_id: string;
  source_invocation_denial_proof_id: string;
  source_invocation_seam_id: string;
  source_contour_target: McpApiAdjacentSurfaceBoundaryShape["source"]["source_contour_target"];
  source_surface_boundary_status: McpApiAdjacentSurfaceBoundaryShape["boundary_status"];
}

export interface SurfaceBoundaryDenialProofSummaryShape extends SurfaceBoundaryDenialProofSourceShape {
  contract_version: SurfaceBoundaryDenialProofContractVersion;
  proof_id: string;
  proof_result: SurfaceBoundaryDenialProofResult;
  proof_boundary: SurfaceBoundaryDenialProofBoundary;
  mcp_api_adjacent: true;
  protocol_surface_boundary: true;
  route_controller_implemented: false;
  mcp_tool_registered: false;
  mcp_resource_registered: false;
  api_route_registered: false;
  api_controller_registered: false;
  runtime_handler_bound: false;
  runtime_permission_granted: false;
  actual_handler_execution_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  denial_flags_all_false: true;
  source_handler_boundary_assertions: SurfaceBoundaryDenialProofSourceHandlerBoundaryAssertionsShape;
  denial_assertions: SurfaceBoundaryDenialProofDenialAssertionsShape;
  readiness_assertions: SurfaceBoundaryDenialProofReadinessAssertionsShape;
  intent_assertions: SurfaceBoundaryDenialProofIntentAssertionsShape;
  authority_context_placeholder: SurfaceBoundaryDenialProofAuthorityContextPlaceholderShape;
  failure_count: 0;
  failures: [];
  generated_at: IsoDateTimeString;
}

export interface SurfaceBoundaryDenialProofInputShape {
  surface_boundary: McpApiAdjacentSurfaceBoundaryShape;
  source_handler_boundary_denial_proof: HandlerBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}

export interface SurfaceBoundaryDenialProofBuilder {
  create(input: SurfaceBoundaryDenialProofInputShape): SurfaceBoundaryDenialProofSummaryShape;
  findFailures(input: SurfaceBoundaryDenialProofSummaryShape): SurfaceBoundaryDenialProofFailureShape[];
  assertDefaultDeny(input: SurfaceBoundaryDenialProofSummaryShape): true;
}

export type SurfaceBoundaryDenialProofVerificationResult =
  | "surface_boundary_denial_default_deny_verified"
  | "surface_boundary_denial_default_deny_failed";

export interface SurfaceBoundaryDenialProofVerificationSummaryShape {
  verification_result: SurfaceBoundaryDenialProofVerificationResult;
  contract_version: SurfaceBoundaryDenialProofContractVersion;
  proof_id: string;
  source_surface_boundary_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_contour_target: McpApiAdjacentSurfaceBoundaryShape["source"]["source_contour_target"];
  mcp_api_adjacent: true;
  protocol_surface_boundary: true;
  route_controller_implemented: false;
  mcp_tool_registered: false;
  mcp_resource_registered: false;
  api_route_registered: false;
  api_controller_registered: false;
  runtime_handler_bound: false;
  runtime_permission_granted: false;
  actual_handler_execution_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  denial_flags_all_false: true;
  failure_count: number;
}
