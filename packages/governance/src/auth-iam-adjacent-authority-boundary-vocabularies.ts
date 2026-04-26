export const AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_CONTOUR_TARGETS = [
  "read_path",
  "pack_loop",
  "write_path",
  "handoff",
  "unknown"
] as const;

export type AuthIamAdjacentAuthorityBoundaryContourTarget =
  (typeof AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_CONTOUR_TARGETS)[number];

export const AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_STATUSES = [
  "authority_boundary_candidate",
  "authority_boundary_blocked",
  "authority_boundary_not_permitted"
] as const;

export type AuthIamAdjacentAuthorityBoundaryStatus =
  (typeof AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_STATUSES)[number];

export const AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_DENIAL_REASONS = [
  "auth_iam_boundary_contract_only",
  "authentication_denied_by_default",
  "authorization_denied_by_default",
  "iam_provider_integration_denied_by_default",
  "session_management_denied_by_default",
  "token_validation_denied_by_default",
  "policy_engine_execution_denied_by_default",
  "permission_grant_denied_by_default",
  "runtime_permission_denied_by_default",
  "mcp_route_permission_denied_by_default",
  "api_route_permission_denied_by_default",
  "identity_resolution_denied_by_default",
  "delegated_authority_validation_denied_by_default",
  "provenance_verification_denied_by_default",
  "mcp_tool_registration_denied_by_default",
  "mcp_tool_invocation_denied_by_default",
  "mcp_resource_registration_denied_by_default",
  "api_route_registration_denied_by_default",
  "api_route_invocation_denied_by_default",
  "controller_execution_denied_by_default",
  "runtime_handler_invocation_denied_by_default",
  "handler_execution_denied_by_default",
  "provider_sdk_call_denied_by_default",
  "transport_execution_denied_by_default",
  "concrete_persistence_write_denied_by_default",
  "direct_canonical_context_access_denied_by_default",
  "direct_canonical_writeback_denied_by_default",
  "actual_contour_execution_denied_by_default",
  "source_surface_boundary_denial_proof_required",
  "unknown_authority_surface_not_permitted"
] as const;

export type AuthIamAdjacentAuthorityBoundaryDenialReason =
  (typeof AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_DENIAL_REASONS)[number];

export const AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_WARNING_CODES = [
  "auth_iam_adjacent_not_auth_implementation",
  "authority_boundary_not_permission_grant",
  "identity_refs_placeholder_only",
  "delegation_refs_placeholder_only",
  "provenance_refs_placeholder_only",
  "policy_context_placeholder_only",
  "runtime_permission_still_denied",
  "surface_boundary_denial_proof_reference_only"
] as const;

export type AuthIamAdjacentAuthorityBoundaryWarningCode =
  (typeof AUTH_IAM_ADJACENT_AUTHORITY_BOUNDARY_WARNING_CODES)[number];
