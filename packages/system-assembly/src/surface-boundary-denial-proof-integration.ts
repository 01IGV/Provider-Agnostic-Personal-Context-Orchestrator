import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { McpApiAdjacentSurfaceBoundaryShape } from "@orchestrator/integration-contracts";
import { createDeterministicFirstMcpApiAdjacentSurfaceBoundary } from "./first-mcp-api-adjacent-surface-boundary.js";
import { createDeterministicHandlerBoundaryDenialProofSummary } from "./handler-boundary-denial-proof-integration.js";
import type { HandlerBoundaryDenialProofSummaryShape } from "./handler-boundary-denial-proof-integration-types.js";
import type {
  SurfaceBoundaryDenialProofAuthorityContextPlaceholderShape,
  SurfaceBoundaryDenialProofBuilder,
  SurfaceBoundaryDenialProofDenialAssertionsShape,
  SurfaceBoundaryDenialProofFailureCode,
  SurfaceBoundaryDenialProofFailureShape,
  SurfaceBoundaryDenialProofInputShape,
  SurfaceBoundaryDenialProofIntentAssertionsShape,
  SurfaceBoundaryDenialProofReadinessAssertionsShape,
  SurfaceBoundaryDenialProofSourceHandlerBoundaryAssertionsShape,
  SurfaceBoundaryDenialProofSummaryShape,
  SurfaceBoundaryDenialProofVerificationSummaryShape
} from "./surface-boundary-denial-proof-integration-types.js";

const DEFAULT_SURFACE_BOUNDARY_DENIAL_PROOF_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const proofIdForBoundary = (boundary: McpApiAdjacentSurfaceBoundaryShape): string =>
  `${boundary.surface_boundary_id}:surface-boundary-denial-proof`;

const carryAuthorityContext = (
  source: McpApiAdjacentSurfaceBoundaryShape["authority_context_placeholder"]
): SurfaceBoundaryDenialProofAuthorityContextPlaceholderShape => ({
  ...(source.authority_context_id ? { authority_context_id: source.authority_context_id } : {}),
  ...(source.subject_identity_ref ? { subject_identity_ref: source.subject_identity_ref } : {}),
  ...(source.delegated_authority_ref ? { delegated_authority_ref: source.delegated_authority_ref } : {}),
  ...(source.provenance_chain_ref ? { provenance_chain_ref: source.provenance_chain_ref } : {}),
  control_plane_boundary: source.control_plane_boundary,
  runtime_boundary: source.runtime_boundary
});

const denialAssertionsFromBoundary = (
  boundary: McpApiAdjacentSurfaceBoundaryShape
): SurfaceBoundaryDenialProofDenialAssertionsShape => ({
  mcp_tool_registration_allowed_now: boundary.denial_flags.mcp_tool_registration_allowed_now,
  mcp_tool_invocation_allowed_now: boundary.denial_flags.mcp_tool_invocation_allowed_now,
  mcp_resource_registration_allowed_now: boundary.denial_flags.mcp_resource_registration_allowed_now,
  api_route_registration_allowed_now: boundary.denial_flags.api_route_registration_allowed_now,
  api_route_invocation_allowed_now: boundary.denial_flags.api_route_invocation_allowed_now,
  api_controller_allowed_now: boundary.denial_flags.api_controller_allowed_now,
  controller_execution_allowed_now: boundary.denial_flags.controller_execution_allowed_now,
  runtime_handler_bound: boundary.denial_flags.runtime_handler_bound,
  runtime_handler_invocation_allowed_now: boundary.denial_flags.runtime_handler_invocation_allowed_now,
  handler_execution_allowed_now: boundary.denial_flags.handler_execution_allowed_now,
  provider_sdk_call_allowed_now: boundary.denial_flags.provider_sdk_call_allowed_now,
  transport_execution_allowed_now: boundary.denial_flags.transport_execution_allowed_now,
  concrete_persistence_write_allowed_now: boundary.denial_flags.concrete_persistence_write_allowed_now,
  direct_canonical_context_access_allowed_now: boundary.denial_flags.direct_canonical_context_access_allowed_now,
  direct_canonical_writeback_allowed_now: boundary.denial_flags.direct_canonical_writeback_allowed_now,
  actual_contour_execution_allowed_now: boundary.denial_flags.actual_contour_execution_allowed_now,
  runtime_permission_granted: boundary.denial_flags.runtime_permission_granted,
  real_model_call_allowed_now: boundary.denial_flags.real_model_call_allowed_now,
  real_storage_write_allowed_now: boundary.denial_flags.real_storage_write_allowed_now
});

const readinessAssertionsFromBoundary = (
  boundary: McpApiAdjacentSurfaceBoundaryShape
): SurfaceBoundaryDenialProofReadinessAssertionsShape => ({
  surface_boundary_readiness_id: boundary.surface_boundary_readiness.surface_boundary_readiness_id,
  readiness_status: boundary.surface_boundary_readiness.readiness_status,
  mcp_tool_registration_allowed_now: boundary.surface_boundary_readiness.mcp_tool_registration_allowed_now,
  api_route_registration_allowed_now: boundary.surface_boundary_readiness.api_route_registration_allowed_now,
  controller_execution_allowed_now: boundary.surface_boundary_readiness.controller_execution_allowed_now,
  runtime_handler_invocation_allowed_now: boundary.surface_boundary_readiness.runtime_handler_invocation_allowed_now,
  runtime_permission_granted: boundary.surface_boundary_readiness.runtime_permission_granted
});

const intentAssertionsFromBoundary = (
  boundary: McpApiAdjacentSurfaceBoundaryShape
): SurfaceBoundaryDenialProofIntentAssertionsShape => ({
  surface_boundary_intent_id: boundary.surface_boundary_intent.surface_boundary_intent_id,
  intent_status: boundary.surface_boundary_intent.intent_status,
  mcp_api_adjacent: boundary.surface_boundary_intent.mcp_api_adjacent,
  protocol_surface_boundary: boundary.surface_boundary_intent.protocol_surface_boundary,
  route_controller_implemented: boundary.surface_boundary_intent.route_controller_implemented,
  mcp_tool_registered: boundary.surface_boundary_intent.mcp_tool_registered,
  api_route_registered: boundary.surface_boundary_intent.api_route_registered,
  runtime_handler_bound: boundary.surface_boundary_intent.runtime_handler_bound,
  runtime_permission_granted: boundary.surface_boundary_intent.runtime_permission_granted,
  actual_handler_execution_allowed_now: boundary.surface_boundary_intent.actual_handler_execution_allowed_now,
  actual_contour_execution_allowed_now: boundary.surface_boundary_intent.actual_contour_execution_allowed_now
});

const sourceHandlerAssertionsFromProof = (
  proof: HandlerBoundaryDenialProofSummaryShape
): SurfaceBoundaryDenialProofSourceHandlerBoundaryAssertionsShape => ({
  source_handler_boundary_denial_contract_version: proof.contract_version,
  source_handler_boundary_denial_verified: true,
  source_handler_boundary_runtime_adjacent: proof.runtime_adjacent,
  source_handler_boundary_runtime_handler_boundary: proof.runtime_handler_boundary,
  source_handler_execution_allowed_now: proof.handler_execution_allowed_now,
  source_handler_runtime_permission_granted: proof.runtime_permission_granted,
  source_handler_actual_contour_execution_allowed_now: proof.actual_contour_execution_allowed_now,
  source_handler_denial_flags_all_false: proof.denial_flags_all_false
});

const createFailure = (input: {
  code: SurfaceBoundaryDenialProofFailureCode;
  path: string;
  expected: true | false | string;
  actual: unknown;
  message: string;
}): SurfaceBoundaryDenialProofFailureShape => ({
  code: input.code,
  path: input.path,
  expected: input.expected,
  actual: input.actual,
  message: input.message
});

const findFailuresFromSummary = (
  summary: SurfaceBoundaryDenialProofSummaryShape
): SurfaceBoundaryDenialProofFailureShape[] => {
  const failures: SurfaceBoundaryDenialProofFailureShape[] = [];

  const addFalseCheck = (input: {
    code: SurfaceBoundaryDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== false) {
      failures.push(createFailure({ ...input, expected: false }));
    }
  };

  const addTrueCheck = (input: {
    code: SurfaceBoundaryDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== true) {
      failures.push(createFailure({ ...input, expected: true }));
    }
  };

  addTrueCheck({
    code: "surface_boundary_not_mcp_api_adjacent",
    path: "mcp_api_adjacent",
    actual: summary.mcp_api_adjacent,
    message: "Surface boundary denial proof must remain MCP/API-adjacent."
  });
  addTrueCheck({
    code: "surface_boundary_not_protocol_surface_boundary",
    path: "protocol_surface_boundary",
    actual: summary.protocol_surface_boundary,
    message: "Surface boundary denial proof must remain a protocol surface boundary."
  });
  addFalseCheck({
    code: "route_controller_implemented_not_false",
    path: "route_controller_implemented",
    actual: summary.route_controller_implemented,
    message: "Route/controller implementation must remain false."
  });
  addFalseCheck({
    code: "mcp_tool_registered_not_false",
    path: "mcp_tool_registered",
    actual: summary.mcp_tool_registered,
    message: "MCP tool registration must remain false."
  });
  addFalseCheck({
    code: "mcp_resource_registered_not_false",
    path: "mcp_resource_registered",
    actual: summary.mcp_resource_registered,
    message: "MCP resource registration must remain false."
  });
  addFalseCheck({
    code: "api_route_registered_not_false",
    path: "api_route_registered",
    actual: summary.api_route_registered,
    message: "API route registration must remain false."
  });
  addFalseCheck({
    code: "api_controller_registered_not_false",
    path: "api_controller_registered",
    actual: summary.api_controller_registered,
    message: "API controller registration must remain false."
  });
  addFalseCheck({
    code: "runtime_handler_bound_not_false",
    path: "runtime_handler_bound",
    actual: summary.runtime_handler_bound,
    message: "Runtime handler binding must remain false."
  });
  addFalseCheck({
    code: "runtime_permission_not_false",
    path: "runtime_permission_granted",
    actual: summary.runtime_permission_granted,
    message: "Runtime permission must remain denied."
  });
  addFalseCheck({
    code: "actual_handler_execution_not_false",
    path: "actual_handler_execution_allowed_now",
    actual: summary.actual_handler_execution_allowed_now,
    message: "Actual handler execution must remain denied."
  });
  addFalseCheck({
    code: "actual_contour_execution_not_false",
    path: "actual_contour_execution_allowed_now",
    actual: summary.actual_contour_execution_allowed_now,
    message: "Actual contour execution must remain denied."
  });
  addTrueCheck({
    code: "denial_flags_not_all_false",
    path: "denial_flags_all_false",
    actual: summary.denial_flags_all_false,
    message: "Surface boundary denial proof must confirm all denial flags are false."
  });

  const falseDenialChecks: Array<{
    code: SurfaceBoundaryDenialProofFailureCode;
    path: keyof SurfaceBoundaryDenialProofDenialAssertionsShape;
    message: string;
  }> = [
    { code: "mcp_tool_registration_allowed", path: "mcp_tool_registration_allowed_now", message: "MCP tool registration must remain denied." },
    { code: "mcp_tool_invocation_allowed", path: "mcp_tool_invocation_allowed_now", message: "MCP tool invocation must remain denied." },
    { code: "mcp_resource_registration_allowed", path: "mcp_resource_registration_allowed_now", message: "MCP resource registration must remain denied." },
    { code: "api_route_registration_allowed", path: "api_route_registration_allowed_now", message: "API route registration must remain denied." },
    { code: "api_route_invocation_allowed", path: "api_route_invocation_allowed_now", message: "API route invocation must remain denied." },
    { code: "api_controller_allowed", path: "api_controller_allowed_now", message: "API controller availability must remain denied." },
    { code: "controller_execution_allowed", path: "controller_execution_allowed_now", message: "Controller execution must remain denied." },
    { code: "runtime_handler_bound_not_false", path: "runtime_handler_bound", message: "Runtime handler binding must remain denied." },
    { code: "runtime_handler_invocation_allowed", path: "runtime_handler_invocation_allowed_now", message: "Runtime handler invocation must remain denied." },
    { code: "handler_execution_allowed", path: "handler_execution_allowed_now", message: "Handler execution must remain denied." },
    { code: "provider_sdk_call_allowed", path: "provider_sdk_call_allowed_now", message: "Provider SDK calls must remain denied." },
    { code: "transport_execution_allowed", path: "transport_execution_allowed_now", message: "Transport execution must remain denied." },
    { code: "concrete_persistence_write_allowed", path: "concrete_persistence_write_allowed_now", message: "Concrete persistence writes must remain denied." },
    { code: "direct_canonical_context_access_allowed", path: "direct_canonical_context_access_allowed_now", message: "Direct canonical context access must remain denied." },
    { code: "direct_canonical_writeback_allowed", path: "direct_canonical_writeback_allowed_now", message: "Direct canonical writeback must remain denied." },
    { code: "actual_contour_execution_allowed", path: "actual_contour_execution_allowed_now", message: "Actual contour execution must remain denied." },
    { code: "runtime_permission_not_false", path: "runtime_permission_granted", message: "Runtime permission must remain denied." },
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

  addTrueCheck({
    code: "source_handler_boundary_denial_not_verified",
    path: "source_handler_boundary_assertions.source_handler_boundary_denial_verified",
    actual: summary.source_handler_boundary_assertions.source_handler_boundary_denial_verified,
    message: "Source handler-boundary denial proof must remain verified."
  });
  addTrueCheck({
    code: "source_handler_boundary_not_runtime_adjacent",
    path: "source_handler_boundary_assertions.source_handler_boundary_runtime_adjacent",
    actual: summary.source_handler_boundary_assertions.source_handler_boundary_runtime_adjacent,
    message: "Source handler-boundary proof must remain runtime-adjacent."
  });
  addTrueCheck({
    code: "source_handler_boundary_not_runtime_handler_boundary",
    path: "source_handler_boundary_assertions.source_handler_boundary_runtime_handler_boundary",
    actual: summary.source_handler_boundary_assertions.source_handler_boundary_runtime_handler_boundary,
    message: "Source handler-boundary proof must remain a runtime handler boundary."
  });
  addFalseCheck({
    code: "source_handler_boundary_execution_not_false",
    path: "source_handler_boundary_assertions.source_handler_execution_allowed_now",
    actual: summary.source_handler_boundary_assertions.source_handler_execution_allowed_now,
    message: "Source handler-boundary proof must not allow handler execution."
  });
  addFalseCheck({
    code: "source_handler_boundary_runtime_permission_not_false",
    path: "source_handler_boundary_assertions.source_handler_runtime_permission_granted",
    actual: summary.source_handler_boundary_assertions.source_handler_runtime_permission_granted,
    message: "Source handler-boundary proof must not grant runtime permission."
  });
  addFalseCheck({
    code: "source_handler_boundary_actual_contour_execution_not_false",
    path: "source_handler_boundary_assertions.source_handler_actual_contour_execution_allowed_now",
    actual: summary.source_handler_boundary_assertions.source_handler_actual_contour_execution_allowed_now,
    message: "Source handler-boundary proof must not allow actual contour execution."
  });
  addTrueCheck({
    code: "source_handler_boundary_denial_flags_not_false",
    path: "source_handler_boundary_assertions.source_handler_denial_flags_all_false",
    actual: summary.source_handler_boundary_assertions.source_handler_denial_flags_all_false,
    message: "Source handler-boundary proof must confirm all denial flags are false."
  });

  addFalseCheck({
    code: "surface_boundary_intent_route_controller_implemented",
    path: "intent_assertions.route_controller_implemented",
    actual: summary.intent_assertions.route_controller_implemented,
    message: "Surface boundary intent must not implement route/controller behavior."
  });
  addFalseCheck({
    code: "surface_boundary_intent_mcp_tool_registered",
    path: "intent_assertions.mcp_tool_registered",
    actual: summary.intent_assertions.mcp_tool_registered,
    message: "Surface boundary intent must not register MCP tools."
  });
  addFalseCheck({
    code: "surface_boundary_intent_api_route_registered",
    path: "intent_assertions.api_route_registered",
    actual: summary.intent_assertions.api_route_registered,
    message: "Surface boundary intent must not register API routes."
  });
  addFalseCheck({
    code: "surface_boundary_intent_runtime_handler_bound",
    path: "intent_assertions.runtime_handler_bound",
    actual: summary.intent_assertions.runtime_handler_bound,
    message: "Surface boundary intent must not bind runtime handlers."
  });
  addFalseCheck({
    code: "surface_boundary_intent_runtime_permission_not_false",
    path: "intent_assertions.runtime_permission_granted",
    actual: summary.intent_assertions.runtime_permission_granted,
    message: "Surface boundary intent must not grant runtime permission."
  });
  addFalseCheck({
    code: "surface_boundary_intent_handler_execution_allowed",
    path: "intent_assertions.actual_handler_execution_allowed_now",
    actual: summary.intent_assertions.actual_handler_execution_allowed_now,
    message: "Surface boundary intent must not allow handler execution."
  });
  addFalseCheck({
    code: "surface_boundary_intent_contour_execution_allowed",
    path: "intent_assertions.actual_contour_execution_allowed_now",
    actual: summary.intent_assertions.actual_contour_execution_allowed_now,
    message: "Surface boundary intent must not allow contour execution."
  });

  addFalseCheck({
    code: "surface_boundary_readiness_mcp_tool_registration_allowed",
    path: "readiness_assertions.mcp_tool_registration_allowed_now",
    actual: summary.readiness_assertions.mcp_tool_registration_allowed_now,
    message: "Surface boundary readiness must not allow MCP tool registration."
  });
  addFalseCheck({
    code: "surface_boundary_readiness_api_route_registration_allowed",
    path: "readiness_assertions.api_route_registration_allowed_now",
    actual: summary.readiness_assertions.api_route_registration_allowed_now,
    message: "Surface boundary readiness must not allow API route registration."
  });
  addFalseCheck({
    code: "surface_boundary_readiness_controller_execution_allowed",
    path: "readiness_assertions.controller_execution_allowed_now",
    actual: summary.readiness_assertions.controller_execution_allowed_now,
    message: "Surface boundary readiness must not allow controller execution."
  });
  addFalseCheck({
    code: "surface_boundary_readiness_handler_invocation_allowed",
    path: "readiness_assertions.runtime_handler_invocation_allowed_now",
    actual: summary.readiness_assertions.runtime_handler_invocation_allowed_now,
    message: "Surface boundary readiness must not allow handler invocation."
  });
  addFalseCheck({
    code: "surface_boundary_readiness_runtime_permission_not_false",
    path: "readiness_assertions.runtime_permission_granted",
    actual: summary.readiness_assertions.runtime_permission_granted,
    message: "Surface boundary readiness must not grant runtime permission."
  });

  return failures;
};

const findSourceMismatchFailures = (input: {
  summary: SurfaceBoundaryDenialProofSummaryShape;
  surfaceBoundary: McpApiAdjacentSurfaceBoundaryShape;
  handlerProof: HandlerBoundaryDenialProofSummaryShape;
}): SurfaceBoundaryDenialProofFailureShape[] => {
  const failures: SurfaceBoundaryDenialProofFailureShape[] = [];

  const addStringCheck = (check: {
    code: SurfaceBoundaryDenialProofFailureCode;
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
    code: "source_handler_boundary_denial_proof_mismatch",
    path: "source_handler_boundary_denial_proof_id",
    expected: input.handlerProof.proof_id,
    actual: input.summary.source_handler_boundary_denial_proof_id,
    message: "Surface proof must reference the exact source handler-boundary denial proof."
  });
  addStringCheck({
    code: "source_handler_boundary_id_mismatch",
    path: "source_handler_boundary_id",
    expected: input.handlerProof.source_handler_boundary_id,
    actual: input.summary.source_handler_boundary_id,
    message: "Surface proof must reference the same source handler boundary as the source proof."
  });
  addStringCheck({
    code: "source_invocation_denial_proof_id_mismatch",
    path: "source_invocation_denial_proof_id",
    expected: input.handlerProof.source_invocation_denial_proof_id,
    actual: input.summary.source_invocation_denial_proof_id,
    message: "Surface proof must preserve the source invocation-denial proof reference."
  });
  addStringCheck({
    code: "source_invocation_seam_id_mismatch",
    path: "source_invocation_seam_id",
    expected: input.handlerProof.source_invocation_seam_id,
    actual: input.summary.source_invocation_seam_id,
    message: "Surface proof must preserve the source invocation seam reference."
  });
  addStringCheck({
    code: "source_contour_target_mismatch",
    path: "source_contour_target",
    expected: input.handlerProof.source_contour_target,
    actual: input.summary.source_contour_target,
    message: "Surface proof must preserve the source contour target."
  });

  addStringCheck({
    code: "source_handler_boundary_denial_proof_mismatch",
    path: "surface_boundary.source.source_handler_boundary_denial_proof_id",
    expected: input.handlerProof.proof_id,
    actual: input.surfaceBoundary.source.source_handler_boundary_denial_proof_id,
    message: "Surface boundary must reference the exact source handler-boundary denial proof."
  });

  return failures;
};

export const createSurfaceBoundaryDenialProofBuilder = (): SurfaceBoundaryDenialProofBuilder => ({
  create(input: SurfaceBoundaryDenialProofInputShape): SurfaceBoundaryDenialProofSummaryShape {
    const boundary = input.surface_boundary;
    const sourceProof = input.source_handler_boundary_denial_proof;
    const now = input.now ?? boundary.created_at ?? sourceProof.generated_at ?? DEFAULT_SURFACE_BOUNDARY_DENIAL_PROOF_TIME;

    const summary: SurfaceBoundaryDenialProofSummaryShape = {
      contract_version: "surface-boundary-denial-proof/v1",
      proof_id: proofIdForBoundary(boundary),
      proof_result: "surface_boundary_denial_default_deny_proven",
      proof_boundary: "machine_checkable_surface_boundary_denial_proof_only",
      source_surface_boundary_id: boundary.surface_boundary_id,
      source_handler_boundary_denial_proof_id: boundary.source.source_handler_boundary_denial_proof_id,
      source_handler_boundary_id: boundary.source.source_handler_boundary_id,
      source_invocation_denial_proof_id: boundary.source.source_invocation_denial_proof_id,
      source_invocation_seam_id: boundary.source.source_invocation_seam_id,
      source_contour_target: boundary.source.source_contour_target,
      source_surface_boundary_status: boundary.boundary_status,
      mcp_api_adjacent: true,
      protocol_surface_boundary: true,
      route_controller_implemented: false,
      mcp_tool_registered: false,
      mcp_resource_registered: false,
      api_route_registered: false,
      api_controller_registered: false,
      runtime_handler_bound: false,
      runtime_permission_granted: false,
      actual_handler_execution_allowed_now: false,
      actual_contour_execution_allowed_now: false,
      denial_flags_all_false: true,
      source_handler_boundary_assertions: sourceHandlerAssertionsFromProof(sourceProof),
      denial_assertions: denialAssertionsFromBoundary(boundary),
      readiness_assertions: readinessAssertionsFromBoundary(boundary),
      intent_assertions: intentAssertionsFromBoundary(boundary),
      authority_context_placeholder: carryAuthorityContext(boundary.authority_context_placeholder),
      failure_count: 0,
      failures: [],
      generated_at: now
    };

    const failures = [
      ...findFailuresFromSummary(summary),
      ...findSourceMismatchFailures({ summary, surfaceBoundary: boundary, handlerProof: sourceProof })
    ];

    if (failures.length > 0) {
      throw new Error(`Surface boundary denial proof failed: ${JSON.stringify(failures)}`);
    }

    return summary;
  },

  findFailures(input: SurfaceBoundaryDenialProofSummaryShape): SurfaceBoundaryDenialProofFailureShape[] {
    return findFailuresFromSummary(input);
  },

  assertDefaultDeny(input: SurfaceBoundaryDenialProofSummaryShape): true {
    const failures = findFailuresFromSummary(input);

    if (failures.length > 0) {
      throw new Error(`Surface boundary denial proof failed: ${JSON.stringify(failures)}`);
    }

    return true;
  }
});

export const createDeterministicSurfaceBoundaryDenialProofSummary = (input?: {
  surface_boundary?: McpApiAdjacentSurfaceBoundaryShape;
  source_handler_boundary_denial_proof?: HandlerBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): SurfaceBoundaryDenialProofSummaryShape => {
  const sourceProof = input?.source_handler_boundary_denial_proof ?? createDeterministicHandlerBoundaryDenialProofSummary();
  const boundary = input?.surface_boundary ?? createDeterministicFirstMcpApiAdjacentSurfaceBoundary({
    handler_boundary_denial_proof: sourceProof,
    ...(input?.now ? { now: input.now } : {})
  });

  return createSurfaceBoundaryDenialProofBuilder().create({
    surface_boundary: boundary,
    source_handler_boundary_denial_proof: sourceProof,
    ...(input?.now ? { now: input.now } : {})
  });
};

export const findSurfaceBoundaryDenialProofFailures = (
  input: SurfaceBoundaryDenialProofSummaryShape
): SurfaceBoundaryDenialProofFailureShape[] => createSurfaceBoundaryDenialProofBuilder().findFailures(input);

export const assertSurfaceBoundaryDenialProofDefaultDeny = (
  input: SurfaceBoundaryDenialProofSummaryShape
): true => createSurfaceBoundaryDenialProofBuilder().assertDefaultDeny(input);

export const createSurfaceBoundaryDenialProofVerificationSummary = (
  input: SurfaceBoundaryDenialProofSummaryShape
): SurfaceBoundaryDenialProofVerificationSummaryShape => {
  const failures = findSurfaceBoundaryDenialProofFailures(input);

  if (failures.length > 0) {
    return {
      verification_result: "surface_boundary_denial_default_deny_failed",
      contract_version: input.contract_version,
      proof_id: input.proof_id,
      source_surface_boundary_id: input.source_surface_boundary_id,
      source_handler_boundary_denial_proof_id: input.source_handler_boundary_denial_proof_id,
      source_contour_target: input.source_contour_target,
      mcp_api_adjacent: input.mcp_api_adjacent,
      protocol_surface_boundary: input.protocol_surface_boundary,
      route_controller_implemented: input.route_controller_implemented,
      mcp_tool_registered: input.mcp_tool_registered,
      mcp_resource_registered: input.mcp_resource_registered,
      api_route_registered: input.api_route_registered,
      api_controller_registered: input.api_controller_registered,
      runtime_handler_bound: input.runtime_handler_bound,
      runtime_permission_granted: input.runtime_permission_granted,
      actual_handler_execution_allowed_now: input.actual_handler_execution_allowed_now,
      actual_contour_execution_allowed_now: input.actual_contour_execution_allowed_now,
      denial_flags_all_false: input.denial_flags_all_false,
      failure_count: failures.length
    };
  }

  return {
    verification_result: "surface_boundary_denial_default_deny_verified",
    contract_version: input.contract_version,
    proof_id: input.proof_id,
    source_surface_boundary_id: input.source_surface_boundary_id,
    source_handler_boundary_denial_proof_id: input.source_handler_boundary_denial_proof_id,
    source_contour_target: input.source_contour_target,
    mcp_api_adjacent: input.mcp_api_adjacent,
    protocol_surface_boundary: input.protocol_surface_boundary,
    route_controller_implemented: input.route_controller_implemented,
    mcp_tool_registered: input.mcp_tool_registered,
    mcp_resource_registered: input.mcp_resource_registered,
    api_route_registered: input.api_route_registered,
    api_controller_registered: input.api_controller_registered,
    runtime_handler_bound: input.runtime_handler_bound,
    runtime_permission_granted: input.runtime_permission_granted,
    actual_handler_execution_allowed_now: input.actual_handler_execution_allowed_now,
    actual_contour_execution_allowed_now: input.actual_contour_execution_allowed_now,
    denial_flags_all_false: input.denial_flags_all_false,
    failure_count: 0
  };
};
