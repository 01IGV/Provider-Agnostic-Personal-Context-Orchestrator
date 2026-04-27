import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { AuthIamAdjacentAuthorityBoundaryShape } from "@orchestrator/governance";
import { createDeterministicFirstAuthIamAdjacentAuthorityBoundary } from "./first-auth-iam-adjacent-authority-boundary.js";
import { createDeterministicSurfaceBoundaryDenialProofSummary } from "./surface-boundary-denial-proof-integration.js";
import type { SurfaceBoundaryDenialProofSummaryShape } from "./surface-boundary-denial-proof-integration-types.js";
import type {
  AuthorityBoundaryDenialProofBuilder,
  AuthorityBoundaryDenialProofDenialAssertionsShape,
  AuthorityBoundaryDenialProofFailureCode,
  AuthorityBoundaryDenialProofFailureShape,
  AuthorityBoundaryDenialProofInputShape,
  AuthorityBoundaryDenialProofIntentAssertionsShape,
  AuthorityBoundaryDenialProofReadinessAssertionsShape,
  AuthorityBoundaryDenialProofSourceSurfaceBoundaryAssertionsShape,
  AuthorityBoundaryDenialProofSummaryShape,
  AuthorityBoundaryDenialProofVerificationSummaryShape
} from "./authority-boundary-denial-proof-integration-types.js";

const DEFAULT_AUTHORITY_BOUNDARY_DENIAL_PROOF_TIME = "2026-04-27T00:00:00.000Z" as IsoDateTimeString;

const proofIdForBoundary = (boundary: AuthIamAdjacentAuthorityBoundaryShape): string =>
  `${boundary.authority_boundary_id}:authority-boundary-denial-proof`;

const denialAssertionsFromBoundary = (
  boundary: AuthIamAdjacentAuthorityBoundaryShape
): AuthorityBoundaryDenialProofDenialAssertionsShape => ({
  identity_resolution_allowed_now: boundary.denial_flags.identity_resolution_allowed_now,
  subject_authentication_allowed_now: boundary.denial_flags.subject_authentication_allowed_now,
  delegated_authority_validation_allowed_now: boundary.denial_flags.delegated_authority_validation_allowed_now,
  provenance_verification_allowed_now: boundary.denial_flags.provenance_verification_allowed_now,
  policy_evaluation_allowed_now: boundary.denial_flags.policy_evaluation_allowed_now,
  permission_grant_allowed_now: boundary.denial_flags.permission_grant_allowed_now,
  runtime_permission_grant_allowed_now: boundary.denial_flags.runtime_permission_grant_allowed_now,
  mcp_tool_registration_allowed_now: boundary.denial_flags.mcp_tool_registration_allowed_now,
  mcp_tool_invocation_allowed_now: boundary.denial_flags.mcp_tool_invocation_allowed_now,
  mcp_resource_registration_allowed_now: boundary.denial_flags.mcp_resource_registration_allowed_now,
  api_route_registration_allowed_now: boundary.denial_flags.api_route_registration_allowed_now,
  api_route_invocation_allowed_now: boundary.denial_flags.api_route_invocation_allowed_now,
  api_controller_allowed_now: boundary.denial_flags.api_controller_allowed_now,
  controller_execution_allowed_now: boundary.denial_flags.controller_execution_allowed_now,
  runtime_handler_invocation_allowed_now: boundary.denial_flags.runtime_handler_invocation_allowed_now,
  handler_execution_allowed_now: boundary.denial_flags.handler_execution_allowed_now,
  provider_sdk_call_allowed_now: boundary.denial_flags.provider_sdk_call_allowed_now,
  transport_execution_allowed_now: boundary.denial_flags.transport_execution_allowed_now,
  concrete_persistence_write_allowed_now: boundary.denial_flags.concrete_persistence_write_allowed_now,
  direct_canonical_context_access_allowed_now: boundary.denial_flags.direct_canonical_context_access_allowed_now,
  direct_canonical_writeback_allowed_now: boundary.denial_flags.direct_canonical_writeback_allowed_now,
  actual_contour_execution_allowed_now: boundary.denial_flags.actual_contour_execution_allowed_now,
  real_model_call_allowed_now: boundary.denial_flags.real_model_call_allowed_now,
  real_storage_write_allowed_now: boundary.denial_flags.real_storage_write_allowed_now
});

const intentAssertionsFromBoundary = (
  boundary: AuthIamAdjacentAuthorityBoundaryShape
): AuthorityBoundaryDenialProofIntentAssertionsShape => ({
  authority_boundary_intent_id: boundary.authority_boundary_intent.authority_boundary_intent_id,
  intent_status: boundary.authority_boundary_intent.intent_status,
  auth_iam_adjacent: boundary.authority_boundary_intent.auth_iam_adjacent,
  authority_boundary: boundary.authority_boundary_intent.authority_boundary,
  identity_boundary: boundary.authority_boundary_intent.identity_boundary,
  delegation_boundary: boundary.authority_boundary_intent.delegation_boundary,
  provenance_boundary: boundary.authority_boundary_intent.provenance_boundary,
  permission_boundary: boundary.authority_boundary_intent.permission_boundary,
  authentication_implemented: boundary.authority_boundary_intent.authentication_implemented,
  authorization_implemented: boundary.authority_boundary_intent.authorization_implemented,
  iam_provider_integrated: boundary.authority_boundary_intent.iam_provider_integrated,
  session_management_implemented: boundary.authority_boundary_intent.session_management_implemented,
  token_validation_implemented: boundary.authority_boundary_intent.token_validation_implemented,
  policy_engine_integrated: boundary.authority_boundary_intent.policy_engine_integrated,
  permission_grant_issued: boundary.authority_boundary_intent.permission_grant_issued,
  runtime_permission_granted: boundary.authority_boundary_intent.runtime_permission_granted,
  mcp_route_permission_granted: boundary.authority_boundary_intent.mcp_route_permission_granted,
  api_route_permission_granted: boundary.authority_boundary_intent.api_route_permission_granted,
  actual_contour_execution_allowed_now: boundary.authority_boundary_intent.actual_contour_execution_allowed_now
});

const readinessAssertionsFromBoundary = (
  boundary: AuthIamAdjacentAuthorityBoundaryShape
): AuthorityBoundaryDenialProofReadinessAssertionsShape => ({
  authority_boundary_readiness_id: boundary.authority_boundary_readiness.authority_boundary_readiness_id,
  readiness_status: boundary.authority_boundary_readiness.readiness_status,
  identity_resolution_allowed_now: boundary.authority_boundary_readiness.identity_resolution_allowed_now,
  subject_authentication_allowed_now: boundary.authority_boundary_readiness.subject_authentication_allowed_now,
  delegated_authority_validation_allowed_now: boundary.authority_boundary_readiness.delegated_authority_validation_allowed_now,
  provenance_verification_allowed_now: boundary.authority_boundary_readiness.provenance_verification_allowed_now,
  policy_evaluation_allowed_now: boundary.authority_boundary_readiness.policy_evaluation_allowed_now,
  permission_grant_allowed_now: boundary.authority_boundary_readiness.permission_grant_allowed_now,
  runtime_permission_granted: boundary.authority_boundary_readiness.runtime_permission_granted
});

const sourceSurfaceBoundaryAssertionsFromProof = (
  proof: SurfaceBoundaryDenialProofSummaryShape
): AuthorityBoundaryDenialProofSourceSurfaceBoundaryAssertionsShape => ({
  source_surface_boundary_denial_contract_version: proof.contract_version,
  source_surface_boundary_denial_verified: true,
  source_surface_boundary_mcp_api_adjacent: proof.mcp_api_adjacent,
  source_surface_boundary_protocol_surface_boundary: proof.protocol_surface_boundary,
  source_surface_boundary_runtime_permission_granted: proof.runtime_permission_granted,
  source_surface_boundary_actual_contour_execution_allowed_now: proof.actual_contour_execution_allowed_now,
  source_surface_boundary_denial_flags_all_false: proof.denial_flags_all_false
});

const createFailure = (input: {
  code: AuthorityBoundaryDenialProofFailureCode;
  path: string;
  expected: true | false | string;
  actual: unknown;
  message: string;
}): AuthorityBoundaryDenialProofFailureShape => ({
  code: input.code,
  path: input.path,
  expected: input.expected,
  actual: input.actual,
  message: input.message
});

const findFailuresFromSummary = (
  summary: AuthorityBoundaryDenialProofSummaryShape
): AuthorityBoundaryDenialProofFailureShape[] => {
  const failures: AuthorityBoundaryDenialProofFailureShape[] = [];

  const addFalseCheck = (input: {
    code: AuthorityBoundaryDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== false) {
      failures.push(createFailure({ ...input, expected: false }));
    }
  };

  const addTrueCheck = (input: {
    code: AuthorityBoundaryDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== true) {
      failures.push(createFailure({ ...input, expected: true }));
    }
  };

  addTrueCheck({ code: "authority_boundary_not_auth_iam_adjacent", path: "auth_iam_adjacent", actual: summary.auth_iam_adjacent, message: "Authority proof must remain auth/IAM-adjacent." });
  addTrueCheck({ code: "authority_boundary_not_authority_boundary", path: "authority_boundary", actual: summary.authority_boundary, message: "Authority proof must remain an authority boundary." });
  addTrueCheck({ code: "authority_boundary_not_identity_boundary", path: "identity_boundary", actual: summary.identity_boundary, message: "Authority proof must preserve identity boundary semantics." });
  addTrueCheck({ code: "authority_boundary_not_delegation_boundary", path: "delegation_boundary", actual: summary.delegation_boundary, message: "Authority proof must preserve delegation boundary semantics." });
  addTrueCheck({ code: "authority_boundary_not_provenance_boundary", path: "provenance_boundary", actual: summary.provenance_boundary, message: "Authority proof must preserve provenance boundary semantics." });
  addTrueCheck({ code: "authority_boundary_not_permission_boundary", path: "permission_boundary", actual: summary.permission_boundary, message: "Authority proof must preserve permission boundary semantics." });

  addFalseCheck({ code: "authentication_implemented_not_false", path: "authentication_implemented", actual: summary.authentication_implemented, message: "Authentication implementation must remain false." });
  addFalseCheck({ code: "authorization_implemented_not_false", path: "authorization_implemented", actual: summary.authorization_implemented, message: "Authorization implementation must remain false." });
  addFalseCheck({ code: "iam_provider_integrated_not_false", path: "iam_provider_integrated", actual: summary.iam_provider_integrated, message: "IAM provider integration must remain false." });
  addFalseCheck({ code: "session_management_implemented_not_false", path: "session_management_implemented", actual: summary.session_management_implemented, message: "Session management must remain false." });
  addFalseCheck({ code: "token_validation_implemented_not_false", path: "token_validation_implemented", actual: summary.token_validation_implemented, message: "Token validation must remain false." });
  addFalseCheck({ code: "policy_engine_integrated_not_false", path: "policy_engine_integrated", actual: summary.policy_engine_integrated, message: "Policy engine integration must remain false." });
  addFalseCheck({ code: "permission_grant_issued_not_false", path: "permission_grant_issued", actual: summary.permission_grant_issued, message: "Permission grant issuance must remain false." });
  addFalseCheck({ code: "runtime_permission_granted_not_false", path: "runtime_permission_granted", actual: summary.runtime_permission_granted, message: "Runtime permission must remain denied." });
  addFalseCheck({ code: "mcp_route_permission_granted_not_false", path: "mcp_route_permission_granted", actual: summary.mcp_route_permission_granted, message: "MCP route permission must remain denied." });
  addFalseCheck({ code: "api_route_permission_granted_not_false", path: "api_route_permission_granted", actual: summary.api_route_permission_granted, message: "API route permission must remain denied." });
  addFalseCheck({ code: "actual_contour_execution_not_false", path: "actual_contour_execution_allowed_now", actual: summary.actual_contour_execution_allowed_now, message: "Actual contour execution must remain denied." });
  addTrueCheck({ code: "denial_flags_not_all_false", path: "denial_flags_all_false", actual: summary.denial_flags_all_false, message: "Authority proof must confirm all denial flags are false." });

  const falseDenialChecks: Array<{
    code: AuthorityBoundaryDenialProofFailureCode;
    path: keyof AuthorityBoundaryDenialProofDenialAssertionsShape;
    message: string;
  }> = [
    { code: "identity_resolution_allowed", path: "identity_resolution_allowed_now", message: "Identity resolution must remain denied." },
    { code: "subject_authentication_allowed", path: "subject_authentication_allowed_now", message: "Subject authentication must remain denied." },
    { code: "delegated_authority_validation_allowed", path: "delegated_authority_validation_allowed_now", message: "Delegated authority validation must remain denied." },
    { code: "provenance_verification_allowed", path: "provenance_verification_allowed_now", message: "Provenance verification must remain denied." },
    { code: "policy_evaluation_allowed", path: "policy_evaluation_allowed_now", message: "Policy evaluation must remain denied." },
    { code: "permission_grant_allowed", path: "permission_grant_allowed_now", message: "Permission grant must remain denied." },
    { code: "runtime_permission_grant_allowed", path: "runtime_permission_grant_allowed_now", message: "Runtime permission grant must remain denied." },
    { code: "mcp_tool_registration_allowed", path: "mcp_tool_registration_allowed_now", message: "MCP tool registration must remain denied." },
    { code: "mcp_tool_invocation_allowed", path: "mcp_tool_invocation_allowed_now", message: "MCP tool invocation must remain denied." },
    { code: "mcp_resource_registration_allowed", path: "mcp_resource_registration_allowed_now", message: "MCP resource registration must remain denied." },
    { code: "api_route_registration_allowed", path: "api_route_registration_allowed_now", message: "API route registration must remain denied." },
    { code: "api_route_invocation_allowed", path: "api_route_invocation_allowed_now", message: "API route invocation must remain denied." },
    { code: "api_controller_allowed", path: "api_controller_allowed_now", message: "API controller availability must remain denied." },
    { code: "controller_execution_allowed", path: "controller_execution_allowed_now", message: "Controller execution must remain denied." },
    { code: "runtime_handler_invocation_allowed", path: "runtime_handler_invocation_allowed_now", message: "Runtime handler invocation must remain denied." },
    { code: "handler_execution_allowed", path: "handler_execution_allowed_now", message: "Handler execution must remain denied." },
    { code: "provider_sdk_call_allowed", path: "provider_sdk_call_allowed_now", message: "Provider SDK calls must remain denied." },
    { code: "transport_execution_allowed", path: "transport_execution_allowed_now", message: "Transport execution must remain denied." },
    { code: "concrete_persistence_write_allowed", path: "concrete_persistence_write_allowed_now", message: "Concrete persistence writes must remain denied." },
    { code: "direct_canonical_context_access_allowed", path: "direct_canonical_context_access_allowed_now", message: "Direct canonical context access must remain denied." },
    { code: "direct_canonical_writeback_allowed", path: "direct_canonical_writeback_allowed_now", message: "Direct canonical writeback must remain denied." },
    { code: "actual_contour_execution_not_false", path: "actual_contour_execution_allowed_now", message: "Actual contour execution must remain denied." },
    { code: "real_model_call_allowed", path: "real_model_call_allowed_now", message: "Real model calls must remain denied." },
    { code: "real_storage_write_allowed", path: "real_storage_write_allowed_now", message: "Real storage writes must remain denied." }
  ];

  falseDenialChecks.forEach((check) => {
    addFalseCheck({
      code: check.code,
      path: `denial_assertions.${check.path}`,
      actual: summary.denial_assertions[check.path],
      message: check.message
    });
  });

  addFalseCheck({ code: "authority_intent_authentication_implemented", path: "intent_assertions.authentication_implemented", actual: summary.intent_assertions.authentication_implemented, message: "Authority intent must not implement authentication." });
  addFalseCheck({ code: "authority_intent_authorization_implemented", path: "intent_assertions.authorization_implemented", actual: summary.intent_assertions.authorization_implemented, message: "Authority intent must not implement authorization." });
  addFalseCheck({ code: "authority_intent_permission_grant_issued", path: "intent_assertions.permission_grant_issued", actual: summary.intent_assertions.permission_grant_issued, message: "Authority intent must not issue permission grants." });
  addFalseCheck({ code: "authority_intent_runtime_permission_granted", path: "intent_assertions.runtime_permission_granted", actual: summary.intent_assertions.runtime_permission_granted, message: "Authority intent must not grant runtime permission." });
  addFalseCheck({ code: "authority_intent_mcp_route_permission_granted", path: "intent_assertions.mcp_route_permission_granted", actual: summary.intent_assertions.mcp_route_permission_granted, message: "Authority intent must not grant MCP route permission." });
  addFalseCheck({ code: "authority_intent_api_route_permission_granted", path: "intent_assertions.api_route_permission_granted", actual: summary.intent_assertions.api_route_permission_granted, message: "Authority intent must not grant API route permission." });
  addFalseCheck({ code: "authority_intent_contour_execution_allowed", path: "intent_assertions.actual_contour_execution_allowed_now", actual: summary.intent_assertions.actual_contour_execution_allowed_now, message: "Authority intent must not allow contour execution." });

  addFalseCheck({ code: "authority_readiness_identity_resolution_allowed", path: "readiness_assertions.identity_resolution_allowed_now", actual: summary.readiness_assertions.identity_resolution_allowed_now, message: "Authority readiness must not allow identity resolution." });
  addFalseCheck({ code: "authority_readiness_subject_authentication_allowed", path: "readiness_assertions.subject_authentication_allowed_now", actual: summary.readiness_assertions.subject_authentication_allowed_now, message: "Authority readiness must not allow subject authentication." });
  addFalseCheck({ code: "authority_readiness_delegated_authority_validation_allowed", path: "readiness_assertions.delegated_authority_validation_allowed_now", actual: summary.readiness_assertions.delegated_authority_validation_allowed_now, message: "Authority readiness must not allow delegated authority validation." });
  addFalseCheck({ code: "authority_readiness_provenance_verification_allowed", path: "readiness_assertions.provenance_verification_allowed_now", actual: summary.readiness_assertions.provenance_verification_allowed_now, message: "Authority readiness must not allow provenance verification." });
  addFalseCheck({ code: "authority_readiness_policy_evaluation_allowed", path: "readiness_assertions.policy_evaluation_allowed_now", actual: summary.readiness_assertions.policy_evaluation_allowed_now, message: "Authority readiness must not allow policy evaluation." });
  addFalseCheck({ code: "authority_readiness_permission_grant_allowed", path: "readiness_assertions.permission_grant_allowed_now", actual: summary.readiness_assertions.permission_grant_allowed_now, message: "Authority readiness must not allow permission grants." });
  addFalseCheck({ code: "authority_readiness_runtime_permission_granted", path: "readiness_assertions.runtime_permission_granted", actual: summary.readiness_assertions.runtime_permission_granted, message: "Authority readiness must not grant runtime permission." });

  addTrueCheck({ code: "source_surface_boundary_denial_not_verified", path: "source_surface_boundary_assertions.source_surface_boundary_denial_verified", actual: summary.source_surface_boundary_assertions.source_surface_boundary_denial_verified, message: "Source surface-boundary denial proof must remain verified." });
  addTrueCheck({ code: "source_surface_boundary_not_mcp_api_adjacent", path: "source_surface_boundary_assertions.source_surface_boundary_mcp_api_adjacent", actual: summary.source_surface_boundary_assertions.source_surface_boundary_mcp_api_adjacent, message: "Source surface-boundary proof must remain MCP/API-adjacent." });
  addTrueCheck({ code: "source_surface_boundary_not_protocol_surface_boundary", path: "source_surface_boundary_assertions.source_surface_boundary_protocol_surface_boundary", actual: summary.source_surface_boundary_assertions.source_surface_boundary_protocol_surface_boundary, message: "Source surface-boundary proof must remain protocol-surface boundary." });
  addFalseCheck({ code: "source_surface_boundary_runtime_permission_not_false", path: "source_surface_boundary_assertions.source_surface_boundary_runtime_permission_granted", actual: summary.source_surface_boundary_assertions.source_surface_boundary_runtime_permission_granted, message: "Source surface-boundary proof must not grant runtime permission." });
  addFalseCheck({ code: "source_surface_boundary_contour_execution_not_false", path: "source_surface_boundary_assertions.source_surface_boundary_actual_contour_execution_allowed_now", actual: summary.source_surface_boundary_assertions.source_surface_boundary_actual_contour_execution_allowed_now, message: "Source surface-boundary proof must not allow contour execution." });
  addTrueCheck({ code: "source_surface_boundary_denial_flags_not_false", path: "source_surface_boundary_assertions.source_surface_boundary_denial_flags_all_false", actual: summary.source_surface_boundary_assertions.source_surface_boundary_denial_flags_all_false, message: "Source surface-boundary proof must confirm all denial flags are false." });

  return failures;
};

const findSourceMismatchFailures = (input: {
  summary: AuthorityBoundaryDenialProofSummaryShape;
  authorityBoundary: AuthIamAdjacentAuthorityBoundaryShape;
  surfaceProof: SurfaceBoundaryDenialProofSummaryShape;
}): AuthorityBoundaryDenialProofFailureShape[] => {
  const failures: AuthorityBoundaryDenialProofFailureShape[] = [];

  const addStringCheck = (check: {
    code: AuthorityBoundaryDenialProofFailureCode;
    path: string;
    expected: string;
    actual: unknown;
    message: string;
  }): void => {
    if (check.actual !== check.expected) {
      failures.push(createFailure(check));
    }
  };

  addStringCheck({
    code: "source_surface_boundary_denial_proof_mismatch",
    path: "source_surface_boundary_denial_proof_id",
    expected: input.surfaceProof.proof_id,
    actual: input.summary.source_surface_boundary_denial_proof_id,
    message: "Authority proof must reference the exact source surface-boundary denial proof."
  });
  addStringCheck({
    code: "source_surface_boundary_id_mismatch",
    path: "source_surface_boundary_id",
    expected: input.surfaceProof.source_surface_boundary_id,
    actual: input.summary.source_surface_boundary_id,
    message: "Authority proof must preserve the source surface boundary reference."
  });
  addStringCheck({
    code: "source_handler_boundary_denial_proof_id_mismatch",
    path: "source_handler_boundary_denial_proof_id",
    expected: input.surfaceProof.source_handler_boundary_denial_proof_id,
    actual: input.summary.source_handler_boundary_denial_proof_id,
    message: "Authority proof must preserve the source handler-boundary denial proof reference."
  });
  addStringCheck({
    code: "source_invocation_denial_proof_id_mismatch",
    path: "source_invocation_denial_proof_id",
    expected: input.surfaceProof.source_invocation_denial_proof_id,
    actual: input.summary.source_invocation_denial_proof_id,
    message: "Authority proof must preserve the source invocation-denial proof reference."
  });
  addStringCheck({
    code: "source_contour_target_mismatch",
    path: "source_contour_target",
    expected: input.surfaceProof.source_contour_target,
    actual: input.summary.source_contour_target,
    message: "Authority proof must preserve the source contour target."
  });
  addStringCheck({
    code: "source_surface_boundary_denial_proof_mismatch",
    path: "authority_boundary.source.source_surface_boundary_denial_proof_id",
    expected: input.surfaceProof.proof_id,
    actual: input.authorityBoundary.source.source_surface_boundary_denial_proof_id,
    message: "Authority boundary must reference the exact source surface-boundary denial proof."
  });

  return failures;
};

export const createAuthorityBoundaryDenialProofBuilder = (): AuthorityBoundaryDenialProofBuilder => ({
  create(input: AuthorityBoundaryDenialProofInputShape): AuthorityBoundaryDenialProofSummaryShape {
    const boundary = input.authority_boundary;
    const sourceProof = input.source_surface_boundary_denial_proof;
    const now = input.now ?? boundary.created_at ?? sourceProof.generated_at ?? DEFAULT_AUTHORITY_BOUNDARY_DENIAL_PROOF_TIME;

    const summary: AuthorityBoundaryDenialProofSummaryShape = {
      contract_version: "authority-boundary-denial-proof/v1",
      proof_id: proofIdForBoundary(boundary),
      proof_result: "authority_boundary_denial_default_deny_proven",
      proof_boundary: "machine_checkable_authority_boundary_denial_proof_only",
      authority_boundary_id: boundary.authority_boundary_id,
      source_surface_boundary_id: boundary.source.source_surface_boundary_id,
      source_surface_boundary_denial_proof_id: boundary.source.source_surface_boundary_denial_proof_id,
      source_handler_boundary_denial_proof_id: boundary.source.source_handler_boundary_denial_proof_id,
      source_invocation_denial_proof_id: boundary.source.source_invocation_denial_proof_id,
      source_contour_target: boundary.source.source_contour_target,
      boundary_status: boundary.boundary_status,
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
      source_surface_boundary_assertions: sourceSurfaceBoundaryAssertionsFromProof(sourceProof),
      denial_assertions: denialAssertionsFromBoundary(boundary),
      intent_assertions: intentAssertionsFromBoundary(boundary),
      readiness_assertions: readinessAssertionsFromBoundary(boundary),
      failure_count: 0,
      failures: [],
      generated_at: now
    };

    const failures = [
      ...findFailuresFromSummary(summary),
      ...findSourceMismatchFailures({ summary, authorityBoundary: boundary, surfaceProof: sourceProof })
    ];

    if (failures.length > 0) {
      throw new Error(`Authority boundary denial proof failed: ${JSON.stringify(failures)}`);
    }

    return summary;
  },

  findFailures(input: AuthorityBoundaryDenialProofSummaryShape): AuthorityBoundaryDenialProofFailureShape[] {
    return findFailuresFromSummary(input);
  },

  assertDefaultDeny(input: AuthorityBoundaryDenialProofSummaryShape): true {
    const failures = findFailuresFromSummary(input);

    if (failures.length > 0) {
      throw new Error(`Authority boundary denial proof failed: ${JSON.stringify(failures)}`);
    }

    return true;
  }
});

export const createDeterministicAuthorityBoundaryDenialProofSummary = (input?: {
  authority_boundary?: AuthIamAdjacentAuthorityBoundaryShape;
  source_surface_boundary_denial_proof?: SurfaceBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): AuthorityBoundaryDenialProofSummaryShape => {
  const sourceProof = input?.source_surface_boundary_denial_proof ?? createDeterministicSurfaceBoundaryDenialProofSummary();
  const boundary = input?.authority_boundary ?? createDeterministicFirstAuthIamAdjacentAuthorityBoundary({
    surface_boundary_denial_proof: sourceProof,
    ...(input?.now ? { now: input.now } : {})
  });

  return createAuthorityBoundaryDenialProofBuilder().create({
    authority_boundary: boundary,
    source_surface_boundary_denial_proof: sourceProof,
    ...(input?.now ? { now: input.now } : {})
  });
};

export const findAuthorityBoundaryDenialProofFailures = (
  input: AuthorityBoundaryDenialProofSummaryShape
): AuthorityBoundaryDenialProofFailureShape[] => createAuthorityBoundaryDenialProofBuilder().findFailures(input);

export const assertAuthorityBoundaryDenialProofDefaultDeny = (
  input: AuthorityBoundaryDenialProofSummaryShape
): true => createAuthorityBoundaryDenialProofBuilder().assertDefaultDeny(input);

export const createAuthorityBoundaryDenialProofVerificationSummary = (
  input: AuthorityBoundaryDenialProofSummaryShape
): AuthorityBoundaryDenialProofVerificationSummaryShape => {
  const failures = findAuthorityBoundaryDenialProofFailures(input);

  if (failures.length > 0) {
    return {
      verification_result: "authority_boundary_denial_default_deny_failed",
      contract_version: input.contract_version,
      proof_id: input.proof_id,
      authority_boundary_id: input.authority_boundary_id,
      source_surface_boundary_denial_proof_id: input.source_surface_boundary_denial_proof_id,
      source_contour_target: input.source_contour_target,
      auth_iam_adjacent: input.auth_iam_adjacent,
      authority_boundary: input.authority_boundary,
      identity_boundary: input.identity_boundary,
      delegation_boundary: input.delegation_boundary,
      provenance_boundary: input.provenance_boundary,
      permission_boundary: input.permission_boundary,
      authentication_implemented: input.authentication_implemented,
      authorization_implemented: input.authorization_implemented,
      iam_provider_integrated: input.iam_provider_integrated,
      session_management_implemented: input.session_management_implemented,
      token_validation_implemented: input.token_validation_implemented,
      policy_engine_integrated: input.policy_engine_integrated,
      permission_grant_issued: input.permission_grant_issued,
      runtime_permission_granted: input.runtime_permission_granted,
      mcp_route_permission_granted: input.mcp_route_permission_granted,
      api_route_permission_granted: input.api_route_permission_granted,
      actual_contour_execution_allowed_now: input.actual_contour_execution_allowed_now,
      denial_flags_all_false: input.denial_flags_all_false,
      failure_count: failures.length
    };
  }

  return {
    verification_result: "authority_boundary_denial_default_deny_verified",
    contract_version: input.contract_version,
    proof_id: input.proof_id,
    authority_boundary_id: input.authority_boundary_id,
    source_surface_boundary_denial_proof_id: input.source_surface_boundary_denial_proof_id,
    source_contour_target: input.source_contour_target,
    auth_iam_adjacent: input.auth_iam_adjacent,
    authority_boundary: input.authority_boundary,
    identity_boundary: input.identity_boundary,
    delegation_boundary: input.delegation_boundary,
    provenance_boundary: input.provenance_boundary,
    permission_boundary: input.permission_boundary,
    authentication_implemented: input.authentication_implemented,
    authorization_implemented: input.authorization_implemented,
    iam_provider_integrated: input.iam_provider_integrated,
    session_management_implemented: input.session_management_implemented,
    token_validation_implemented: input.token_validation_implemented,
    policy_engine_integrated: input.policy_engine_integrated,
    permission_grant_issued: input.permission_grant_issued,
    runtime_permission_granted: input.runtime_permission_granted,
    mcp_route_permission_granted: input.mcp_route_permission_granted,
    api_route_permission_granted: input.api_route_permission_granted,
    actual_contour_execution_allowed_now: input.actual_contour_execution_allowed_now,
    denial_flags_all_false: input.denial_flags_all_false,
    failure_count: 0
  };
};
