import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AuthIamAdjacentAuthorityBoundaryContourTarget,
  AuthIamAdjacentAuthorityBoundaryDenialReason,
  AuthIamAdjacentAuthorityBoundaryStatus,
  AuthIamAdjacentAuthorityBoundaryWarningCode
} from "./auth-iam-adjacent-authority-boundary-vocabularies.js";

export interface AuthIamAdjacentAuthorityBoundaryWarningShape {
  code: AuthIamAdjacentAuthorityBoundaryWarningCode;
  message: string;
}

export interface AuthIamAdjacentAuthorityBoundarySourceShape {
  source_surface_boundary_id: string;
  source_surface_boundary_denial_proof_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: AuthIamAdjacentAuthorityBoundaryContourTarget;
  source_surface_boundary_status: string;
  source_surface_boundary_denial_contract_version: "surface-boundary-denial-proof/v1";
  source_surface_boundary_denial_verified: true;
}

export interface AuthIamAdjacentAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  permission_scope_ref?: string;
  policy_context_ref?: string;
  audit_trace_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
  notes: string[];
}

export interface AuthIamAdjacentAuthorityBoundaryDenialFlagsShape {
  identity_resolution_allowed_now: false;
  subject_authentication_allowed_now: false;
  delegated_authority_validation_allowed_now: false;
  provenance_verification_allowed_now: false;
  policy_evaluation_allowed_now: false;
  permission_grant_allowed_now: false;
  runtime_permission_grant_allowed_now: false;
  mcp_tool_registration_allowed_now: false;
  mcp_tool_invocation_allowed_now: false;
  mcp_resource_registration_allowed_now: false;
  api_route_registration_allowed_now: false;
  api_route_invocation_allowed_now: false;
  api_controller_allowed_now: false;
  controller_execution_allowed_now: false;
  runtime_handler_invocation_allowed_now: false;
  handler_execution_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  transport_execution_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  direct_canonical_context_access_allowed_now: false;
  direct_canonical_writeback_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
}

export interface AuthIamAdjacentAuthorityBoundaryIntentShape {
  authority_boundary_intent_id: string;
  authority_boundary_id: string;
  source_surface_boundary_denial_proof_id: string;
  source_contour_target: AuthIamAdjacentAuthorityBoundaryContourTarget;
  intent_status: "authority_boundary_intent_recorded";
  intent_boundary: "auth_iam_adjacent_authority_boundary_contract_only";
  auth_iam_adjacent: true;
  authority_boundary: true;
  identity_boundary: true;
  delegation_boundary: true;
  provenance_boundary: true;
  permission_boundary: true;
  authentication_implemented: false;
  authorization_implemented: false;
  iam_provider_integrated: false;
  session_management_implemented: false;
  token_validation_implemented: false;
  policy_engine_integrated: false;
  permission_grant_issued: false;
  runtime_permission_granted: false;
  mcp_route_permission_granted: false;
  api_route_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  notes: string[];
}

export interface AuthIamAdjacentAuthorityBoundaryReadinessShape {
  authority_boundary_readiness_id: string;
  authority_boundary_id: string;
  source_surface_boundary_denial_proof_id: string;
  source_contour_target: AuthIamAdjacentAuthorityBoundaryContourTarget;
  boundary_status: AuthIamAdjacentAuthorityBoundaryStatus;
  readiness_status: "candidate_for_future_authority_boundary" | "not_ready_for_future_authority_boundary";
  identity_resolution_allowed_now: false;
  subject_authentication_allowed_now: false;
  delegated_authority_validation_allowed_now: false;
  provenance_verification_allowed_now: false;
  policy_evaluation_allowed_now: false;
  permission_grant_allowed_now: false;
  runtime_permission_granted: false;
  denial_reasons: AuthIamAdjacentAuthorityBoundaryDenialReason[];
  notes: string[];
}

export interface AuthIamAdjacentAuthorityBoundaryShape {
  authority_boundary_id: string;
  request_id: string;
  operation_id: string;
  source: AuthIamAdjacentAuthorityBoundarySourceShape;
  authority_context_placeholder: AuthIamAdjacentAuthorityContextPlaceholderShape;
  boundary_status: AuthIamAdjacentAuthorityBoundaryStatus;
  auth_iam_adjacent: true;
  authority_boundary: true;
  identity_boundary: true;
  delegation_boundary: true;
  provenance_boundary: true;
  permission_boundary: true;
  authentication_implemented: false;
  authorization_implemented: false;
  iam_provider_integrated: false;
  session_management_implemented: false;
  token_validation_implemented: false;
  policy_engine_integrated: false;
  permission_grant_issued: false;
  runtime_permission_granted: false;
  mcp_route_permission_granted: false;
  api_route_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  authority_boundary_intent: AuthIamAdjacentAuthorityBoundaryIntentShape;
  authority_boundary_readiness: AuthIamAdjacentAuthorityBoundaryReadinessShape;
  denial_flags: AuthIamAdjacentAuthorityBoundaryDenialFlagsShape;
  denial_reasons: AuthIamAdjacentAuthorityBoundaryDenialReason[];
  warnings: AuthIamAdjacentAuthorityBoundaryWarningShape[];
  guardrail_notes: string[];
  created_at: IsoDateTimeString;
}

export interface AuthIamAdjacentAuthorityBoundarySummaryShape {
  authority_boundary_id: string;
  source_surface_boundary_id: string;
  source_surface_boundary_denial_proof_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: AuthIamAdjacentAuthorityBoundaryContourTarget;
  source_surface_boundary_status: string;
  boundary_status: AuthIamAdjacentAuthorityBoundaryStatus;
  auth_iam_adjacent: true;
  authority_boundary: true;
  identity_boundary: true;
  delegation_boundary: true;
  provenance_boundary: true;
  permission_boundary: true;
  authentication_implemented: false;
  authorization_implemented: false;
  iam_provider_integrated: false;
  session_management_implemented: false;
  token_validation_implemented: false;
  policy_engine_integrated: false;
  permission_grant_issued: false;
  runtime_permission_granted: false;
  mcp_route_permission_granted: false;
  api_route_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  denial_flags_all_false: true;
  guardrail_notes: string[];
}

export interface AuthIamAdjacentAuthorityBoundaryBuilderInputShape {
  authority_boundary_id: string;
  request_id: string;
  operation_id: string;
  source: AuthIamAdjacentAuthorityBoundarySourceShape;
  authority_context_placeholder: AuthIamAdjacentAuthorityContextPlaceholderShape;
  boundary_status?: AuthIamAdjacentAuthorityBoundaryStatus;
  denial_reasons?: AuthIamAdjacentAuthorityBoundaryDenialReason[];
  warnings?: AuthIamAdjacentAuthorityBoundaryWarningShape[];
  guardrail_notes?: string[];
  created_at: IsoDateTimeString;
}

export interface AuthIamAdjacentAuthorityBoundaryBuilder {
  create(input: AuthIamAdjacentAuthorityBoundaryBuilderInputShape): AuthIamAdjacentAuthorityBoundaryShape;
  summarize(input: AuthIamAdjacentAuthorityBoundaryShape): AuthIamAdjacentAuthorityBoundarySummaryShape;
}
