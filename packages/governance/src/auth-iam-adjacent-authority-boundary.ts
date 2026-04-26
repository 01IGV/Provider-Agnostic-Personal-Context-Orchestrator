import type {
  AuthIamAdjacentAuthorityBoundaryBuilder,
  AuthIamAdjacentAuthorityBoundaryBuilderInputShape,
  AuthIamAdjacentAuthorityBoundaryDenialFlagsShape,
  AuthIamAdjacentAuthorityBoundaryReadinessShape,
  AuthIamAdjacentAuthorityBoundaryShape,
  AuthIamAdjacentAuthorityBoundarySummaryShape,
  AuthIamAdjacentAuthorityBoundaryWarningShape
} from "./auth-iam-adjacent-authority-boundary-types.js";
import type {
  AuthIamAdjacentAuthorityBoundaryDenialReason,
  AuthIamAdjacentAuthorityBoundaryStatus
} from "./auth-iam-adjacent-authority-boundary-vocabularies.js";

const defaultDenialFlags = (): AuthIamAdjacentAuthorityBoundaryDenialFlagsShape => ({
  identity_resolution_allowed_now: false,
  subject_authentication_allowed_now: false,
  delegated_authority_validation_allowed_now: false,
  provenance_verification_allowed_now: false,
  policy_evaluation_allowed_now: false,
  permission_grant_allowed_now: false,
  runtime_permission_grant_allowed_now: false,
  mcp_tool_registration_allowed_now: false,
  mcp_tool_invocation_allowed_now: false,
  mcp_resource_registration_allowed_now: false,
  api_route_registration_allowed_now: false,
  api_route_invocation_allowed_now: false,
  api_controller_allowed_now: false,
  controller_execution_allowed_now: false,
  runtime_handler_invocation_allowed_now: false,
  handler_execution_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  direct_canonical_context_access_allowed_now: false,
  direct_canonical_writeback_allowed_now: false,
  actual_contour_execution_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false
});

const resolveBoundaryStatus = (
  input: AuthIamAdjacentAuthorityBoundaryBuilderInputShape
): AuthIamAdjacentAuthorityBoundaryStatus => {
  if (input.boundary_status) {
    return input.boundary_status;
  }

  return input.source.source_contour_target === "unknown"
    ? "authority_boundary_not_permitted"
    : "authority_boundary_candidate";
};

const defaultDenialReasons = (
  input: AuthIamAdjacentAuthorityBoundaryBuilderInputShape,
  status: AuthIamAdjacentAuthorityBoundaryStatus
): AuthIamAdjacentAuthorityBoundaryDenialReason[] => [
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
  ...(status === "authority_boundary_not_permitted" || input.source.source_contour_target === "unknown"
    ? ["unknown_authority_surface_not_permitted" as const]
    : [])
];

const defaultWarnings = (): AuthIamAdjacentAuthorityBoundaryWarningShape[] => [
  {
    code: "auth_iam_adjacent_not_auth_implementation",
    message: "Auth/IAM-adjacent authority boundary is a contract shape only; no authentication or authorization implementation is created."
  },
  {
    code: "authority_boundary_not_permission_grant",
    message: "Authority boundary records permission denial and does not issue a permission grant."
  },
  {
    code: "identity_refs_placeholder_only",
    message: "Identity references are preserved as placeholder references only."
  },
  {
    code: "delegation_refs_placeholder_only",
    message: "Delegation references are preserved as placeholder references only."
  },
  {
    code: "provenance_refs_placeholder_only",
    message: "Provenance references are preserved as placeholder references only."
  },
  {
    code: "policy_context_placeholder_only",
    message: "Policy context is preserved as a placeholder reference only."
  },
  {
    code: "runtime_permission_still_denied",
    message: "Runtime permission remains denied by default."
  },
  {
    code: "surface_boundary_denial_proof_reference_only",
    message: "Source surface-boundary denial proof is referenced only and does not grant protocol, authority, or runtime permission."
  }
];

const defaultGuardrails = (): string[] => [
  "This boundary is auth/IAM-adjacent but is not an auth/IAM implementation.",
  "No login, session management, token validation, IAM provider integration, or policy engine execution is implemented.",
  "No permission grant, runtime permission, MCP route permission, or API route permission is issued.",
  "MCP/API protocol surfaces remain default-deny and non-executing.",
  "Authority, identity, delegation, policy, and provenance remain shape-level references only.",
  "This boundary is not runtime permission and not evidence of actual contour execution."
];

const buildReadiness = (input: {
  authority_boundary_id: string;
  source_surface_boundary_denial_proof_id: string;
  source_contour_target: AuthIamAdjacentAuthorityBoundaryShape["source"]["source_contour_target"];
  boundary_status: AuthIamAdjacentAuthorityBoundaryStatus;
  denial_reasons: AuthIamAdjacentAuthorityBoundaryDenialReason[];
}): AuthIamAdjacentAuthorityBoundaryReadinessShape => ({
  authority_boundary_readiness_id: `${input.authority_boundary_id}:readiness`,
  authority_boundary_id: input.authority_boundary_id,
  source_surface_boundary_denial_proof_id: input.source_surface_boundary_denial_proof_id,
  source_contour_target: input.source_contour_target,
  boundary_status: input.boundary_status,
  readiness_status:
    input.boundary_status === "authority_boundary_candidate"
      ? "candidate_for_future_authority_boundary"
      : "not_ready_for_future_authority_boundary",
  identity_resolution_allowed_now: false,
  subject_authentication_allowed_now: false,
  delegated_authority_validation_allowed_now: false,
  provenance_verification_allowed_now: false,
  policy_evaluation_allowed_now: false,
  permission_grant_allowed_now: false,
  runtime_permission_granted: false,
  denial_reasons: input.denial_reasons,
  notes: [
    "Readiness is auth/IAM-adjacent only and does not permit authentication, authorization, or permission grant.",
    "Future MCP/API exposure remains explicitly denied until an authority path is separately implemented."
  ]
});

export const createAuthIamAdjacentAuthorityBoundaryBuilder = (): AuthIamAdjacentAuthorityBoundaryBuilder => ({
  create(input: AuthIamAdjacentAuthorityBoundaryBuilderInputShape): AuthIamAdjacentAuthorityBoundaryShape {
    const boundaryStatus = resolveBoundaryStatus(input);
    const denialReasons = input.denial_reasons ?? defaultDenialReasons(input, boundaryStatus);
    const guardrails = input.guardrail_notes ?? defaultGuardrails();
    const warnings = input.warnings ?? defaultWarnings();

    return {
      authority_boundary_id: input.authority_boundary_id,
      request_id: input.request_id,
      operation_id: input.operation_id,
      source: input.source,
      authority_context_placeholder: input.authority_context_placeholder,
      boundary_status: boundaryStatus,
      auth_iam_adjacent: true,
      authority_boundary: true,
      identity_boundary: true,
      delegation_boundary: true,
      provenance_boundary: true,
      permission_boundary: true,
      authentication_implemented: false,
      authorization_implemented: false,
      iam_provider_integrated: false,
      session_management_implemented: false,
      token_validation_implemented: false,
      policy_engine_integrated: false,
      permission_grant_issued: false,
      runtime_permission_granted: false,
      mcp_route_permission_granted: false,
      api_route_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      authority_boundary_intent: {
        authority_boundary_intent_id: `${input.authority_boundary_id}:intent`,
        authority_boundary_id: input.authority_boundary_id,
        source_surface_boundary_denial_proof_id: input.source.source_surface_boundary_denial_proof_id,
        source_contour_target: input.source.source_contour_target,
        intent_status: "authority_boundary_intent_recorded",
        intent_boundary: "auth_iam_adjacent_authority_boundary_contract_only",
        auth_iam_adjacent: true,
        authority_boundary: true,
        identity_boundary: true,
        delegation_boundary: true,
        provenance_boundary: true,
        permission_boundary: true,
        authentication_implemented: false,
        authorization_implemented: false,
        iam_provider_integrated: false,
        session_management_implemented: false,
        token_validation_implemented: false,
        policy_engine_integrated: false,
        permission_grant_issued: false,
        runtime_permission_granted: false,
        mcp_route_permission_granted: false,
        api_route_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        notes: guardrails
      },
      authority_boundary_readiness: buildReadiness({
        authority_boundary_id: input.authority_boundary_id,
        source_surface_boundary_denial_proof_id: input.source.source_surface_boundary_denial_proof_id,
        source_contour_target: input.source.source_contour_target,
        boundary_status: boundaryStatus,
        denial_reasons: denialReasons
      }),
      denial_flags: defaultDenialFlags(),
      denial_reasons: denialReasons,
      warnings,
      guardrail_notes: guardrails,
      created_at: input.created_at
    };
  },

  summarize(input: AuthIamAdjacentAuthorityBoundaryShape): AuthIamAdjacentAuthorityBoundarySummaryShape {
    return {
      authority_boundary_id: input.authority_boundary_id,
      source_surface_boundary_id: input.source.source_surface_boundary_id,
      source_surface_boundary_denial_proof_id: input.source.source_surface_boundary_denial_proof_id,
      source_handler_boundary_denial_proof_id: input.source.source_handler_boundary_denial_proof_id,
      source_invocation_denial_proof_id: input.source.source_invocation_denial_proof_id,
      source_contour_target: input.source.source_contour_target,
      source_surface_boundary_status: input.source.source_surface_boundary_status,
      boundary_status: input.boundary_status,
      auth_iam_adjacent: true,
      authority_boundary: true,
      identity_boundary: true,
      delegation_boundary: true,
      provenance_boundary: true,
      permission_boundary: true,
      authentication_implemented: false,
      authorization_implemented: false,
      iam_provider_integrated: false,
      session_management_implemented: false,
      token_validation_implemented: false,
      policy_engine_integrated: false,
      permission_grant_issued: false,
      runtime_permission_granted: false,
      mcp_route_permission_granted: false,
      api_route_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      denial_flags_all_false: true,
      guardrail_notes: input.guardrail_notes
    };
  }
});
