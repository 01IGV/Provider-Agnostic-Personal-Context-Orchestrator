import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { AuthIamAdjacentAuthorityBoundaryShape } from "@orchestrator/governance";
import type { SurfaceBoundaryDenialProofSummaryShape } from "./surface-boundary-denial-proof-integration-types.js";

export type AuthorityBoundaryDenialProofContractVersion = "authority-boundary-denial-proof/v1";

export type AuthorityBoundaryDenialProofResult = "authority_boundary_denial_default_deny_proven";

export type AuthorityBoundaryDenialProofBoundary = "machine_checkable_authority_boundary_denial_proof_only";

export type AuthorityBoundaryDenialProofFailureCode =
  | "authority_boundary_not_auth_iam_adjacent"
  | "authority_boundary_not_authority_boundary"
  | "authority_boundary_not_identity_boundary"
  | "authority_boundary_not_delegation_boundary"
  | "authority_boundary_not_provenance_boundary"
  | "authority_boundary_not_permission_boundary"
  | "authentication_implemented_not_false"
  | "authorization_implemented_not_false"
  | "iam_provider_integrated_not_false"
  | "session_management_implemented_not_false"
  | "token_validation_implemented_not_false"
  | "policy_engine_integrated_not_false"
  | "permission_grant_issued_not_false"
  | "runtime_permission_granted_not_false"
  | "mcp_route_permission_granted_not_false"
  | "api_route_permission_granted_not_false"
  | "actual_contour_execution_not_false"
  | "denial_flags_not_all_false"
  | "identity_resolution_allowed"
  | "subject_authentication_allowed"
  | "delegated_authority_validation_allowed"
  | "provenance_verification_allowed"
  | "policy_evaluation_allowed"
  | "permission_grant_allowed"
  | "runtime_permission_grant_allowed"
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
  | "real_model_call_allowed"
  | "real_storage_write_allowed"
  | "authority_intent_authentication_implemented"
  | "authority_intent_authorization_implemented"
  | "authority_intent_permission_grant_issued"
  | "authority_intent_runtime_permission_granted"
  | "authority_intent_mcp_route_permission_granted"
  | "authority_intent_api_route_permission_granted"
  | "authority_intent_contour_execution_allowed"
  | "authority_readiness_identity_resolution_allowed"
  | "authority_readiness_subject_authentication_allowed"
  | "authority_readiness_delegated_authority_validation_allowed"
  | "authority_readiness_provenance_verification_allowed"
  | "authority_readiness_policy_evaluation_allowed"
  | "authority_readiness_permission_grant_allowed"
  | "authority_readiness_runtime_permission_granted"
  | "source_surface_boundary_denial_not_verified"
  | "source_surface_boundary_not_mcp_api_adjacent"
  | "source_surface_boundary_not_protocol_surface_boundary"
  | "source_surface_boundary_runtime_permission_not_false"
  | "source_surface_boundary_contour_execution_not_false"
  | "source_surface_boundary_denial_flags_not_false"
  | "source_surface_boundary_denial_proof_mismatch"
  | "source_surface_boundary_id_mismatch"
  | "source_handler_boundary_denial_proof_id_mismatch"
  | "source_invocation_denial_proof_id_mismatch"
  | "source_contour_target_mismatch";

export interface AuthorityBoundaryDenialProofFailureShape {
  code: AuthorityBoundaryDenialProofFailureCode;
  path: string;
  expected: true | false | string;
  actual: unknown;
  message: string;
}

export interface AuthorityBoundaryDenialProofSourceSurfaceBoundaryAssertionsShape {
  source_surface_boundary_denial_contract_version: "surface-boundary-denial-proof/v1";
  source_surface_boundary_denial_verified: true;
  source_surface_boundary_mcp_api_adjacent: true;
  source_surface_boundary_protocol_surface_boundary: true;
  source_surface_boundary_runtime_permission_granted: false;
  source_surface_boundary_actual_contour_execution_allowed_now: false;
  source_surface_boundary_denial_flags_all_false: true;
}

export interface AuthorityBoundaryDenialProofDenialAssertionsShape {
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

export interface AuthorityBoundaryDenialProofIntentAssertionsShape {
  authority_boundary_intent_id: string;
  intent_status: "authority_boundary_intent_recorded";
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
}

export interface AuthorityBoundaryDenialProofReadinessAssertionsShape {
  authority_boundary_readiness_id: string;
  readiness_status: "candidate_for_future_authority_boundary" | "not_ready_for_future_authority_boundary";
  identity_resolution_allowed_now: false;
  subject_authentication_allowed_now: false;
  delegated_authority_validation_allowed_now: false;
  provenance_verification_allowed_now: false;
  policy_evaluation_allowed_now: false;
  permission_grant_allowed_now: false;
  runtime_permission_granted: false;
}

export interface AuthorityBoundaryDenialProofSummaryShape {
  contract_version: AuthorityBoundaryDenialProofContractVersion;
  proof_id: string;
  proof_result: AuthorityBoundaryDenialProofResult;
  proof_boundary: AuthorityBoundaryDenialProofBoundary;
  authority_boundary_id: string;
  source_surface_boundary_id: string;
  source_surface_boundary_denial_proof_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: AuthIamAdjacentAuthorityBoundaryShape["source"]["source_contour_target"];
  boundary_status: AuthIamAdjacentAuthorityBoundaryShape["boundary_status"];
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
  source_surface_boundary_assertions: AuthorityBoundaryDenialProofSourceSurfaceBoundaryAssertionsShape;
  denial_assertions: AuthorityBoundaryDenialProofDenialAssertionsShape;
  intent_assertions: AuthorityBoundaryDenialProofIntentAssertionsShape;
  readiness_assertions: AuthorityBoundaryDenialProofReadinessAssertionsShape;
  failure_count: 0;
  failures: [];
  generated_at: IsoDateTimeString;
}

export interface AuthorityBoundaryDenialProofInputShape {
  authority_boundary: AuthIamAdjacentAuthorityBoundaryShape;
  source_surface_boundary_denial_proof: SurfaceBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}

export interface AuthorityBoundaryDenialProofBuilder {
  create(input: AuthorityBoundaryDenialProofInputShape): AuthorityBoundaryDenialProofSummaryShape;
  findFailures(input: AuthorityBoundaryDenialProofSummaryShape): AuthorityBoundaryDenialProofFailureShape[];
  assertDefaultDeny(input: AuthorityBoundaryDenialProofSummaryShape): true;
}

export type AuthorityBoundaryDenialProofVerificationResult =
  | "authority_boundary_denial_default_deny_verified"
  | "authority_boundary_denial_default_deny_failed";

export interface AuthorityBoundaryDenialProofVerificationSummaryShape {
  verification_result: AuthorityBoundaryDenialProofVerificationResult;
  contract_version: AuthorityBoundaryDenialProofContractVersion;
  proof_id: string;
  authority_boundary_id: string;
  source_surface_boundary_denial_proof_id: string;
  source_contour_target: AuthIamAdjacentAuthorityBoundaryShape["source"]["source_contour_target"];
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
  failure_count: number;
}
