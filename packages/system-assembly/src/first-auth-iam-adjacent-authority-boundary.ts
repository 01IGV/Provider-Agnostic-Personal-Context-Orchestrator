import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createAuthIamAdjacentAuthorityBoundaryBuilder,
  type AuthIamAdjacentAuthorityBoundaryShape,
  type AuthIamAdjacentAuthorityBoundarySourceShape,
  type AuthIamAdjacentAuthorityBoundarySummaryShape,
  type AuthIamAdjacentAuthorityContextPlaceholderShape
} from "@orchestrator/governance";
import {
  createDeterministicSurfaceBoundaryDenialProofSummary
} from "./surface-boundary-denial-proof-integration.js";
import type { SurfaceBoundaryDenialProofSummaryShape } from "./surface-boundary-denial-proof-integration-types.js";
import type {
  FirstAuthIamAdjacentAuthorityBoundaryBuilder,
  FirstAuthIamAdjacentAuthorityBoundaryInputShape
} from "./first-auth-iam-adjacent-authority-boundary-types.js";

const DEFAULT_AUTHORITY_BOUNDARY_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const buildAuthorityBoundaryId = (proof: SurfaceBoundaryDenialProofSummaryShape): string =>
  `${proof.proof_id}:auth-iam-adjacent-authority-boundary`;

const buildSource = (proof: SurfaceBoundaryDenialProofSummaryShape): AuthIamAdjacentAuthorityBoundarySourceShape => ({
  source_surface_boundary_id: proof.source_surface_boundary_id,
  source_surface_boundary_denial_proof_id: proof.proof_id,
  source_handler_boundary_denial_proof_id: proof.source_handler_boundary_denial_proof_id,
  source_invocation_denial_proof_id: proof.source_invocation_denial_proof_id,
  source_contour_target: proof.source_contour_target,
  source_surface_boundary_status: proof.source_surface_boundary_status,
  source_surface_boundary_denial_contract_version: proof.contract_version,
  source_surface_boundary_denial_verified: true
});

const buildAuthorityContext = (
  proof: SurfaceBoundaryDenialProofSummaryShape
): AuthIamAdjacentAuthorityContextPlaceholderShape => {
  const source = proof.authority_context_placeholder;
  const boundaryId = buildAuthorityBoundaryId(proof);

  return {
    ...(source.authority_context_id ? { authority_context_id: source.authority_context_id } : {}),
    ...(source.subject_identity_ref ? { subject_identity_ref: source.subject_identity_ref } : {}),
    ...(source.delegated_authority_ref ? { delegated_authority_ref: source.delegated_authority_ref } : {}),
    ...(source.provenance_chain_ref ? { provenance_chain_ref: source.provenance_chain_ref } : {}),
    permission_scope_ref: `${boundaryId}:permission-scope-placeholder`,
    policy_context_ref: `${boundaryId}:policy-context-placeholder`,
    audit_trace_ref: `${boundaryId}:audit-trace-placeholder`,
    control_plane_boundary: source.control_plane_boundary,
    runtime_boundary: source.runtime_boundary,
    notes: [
      "Authority, identity, delegation, provenance, permission scope, policy context, and audit trace are shape-level placeholder references only.",
      "No authentication, authorization, IAM provider integration, token validation, session creation, policy evaluation, permission grant, runtime permission, route/controller access, handler execution, or contour execution is performed."
    ]
  };
};

const assertSurfaceBoundaryDenialProofDefaultDeny = (proof: SurfaceBoundaryDenialProofSummaryShape): true => {
  const allDenied =
    proof.mcp_api_adjacent === true &&
    proof.protocol_surface_boundary === true &&
    proof.route_controller_implemented === false &&
    proof.mcp_tool_registered === false &&
    proof.mcp_resource_registered === false &&
    proof.api_route_registered === false &&
    proof.api_controller_registered === false &&
    proof.runtime_handler_bound === false &&
    proof.runtime_permission_granted === false &&
    proof.actual_handler_execution_allowed_now === false &&
    proof.actual_contour_execution_allowed_now === false &&
    proof.denial_flags_all_false === true &&
    proof.failure_count === 0 &&
    proof.source_handler_boundary_assertions.source_handler_boundary_denial_verified === true &&
    proof.source_handler_boundary_assertions.source_handler_boundary_runtime_adjacent === true &&
    proof.source_handler_boundary_assertions.source_handler_boundary_runtime_handler_boundary === true &&
    proof.source_handler_boundary_assertions.source_handler_execution_allowed_now === false &&
    proof.source_handler_boundary_assertions.source_handler_runtime_permission_granted === false &&
    proof.source_handler_boundary_assertions.source_handler_actual_contour_execution_allowed_now === false &&
    proof.source_handler_boundary_assertions.source_handler_denial_flags_all_false === true &&
    proof.denial_assertions.mcp_tool_registration_allowed_now === false &&
    proof.denial_assertions.mcp_tool_invocation_allowed_now === false &&
    proof.denial_assertions.mcp_resource_registration_allowed_now === false &&
    proof.denial_assertions.api_route_registration_allowed_now === false &&
    proof.denial_assertions.api_route_invocation_allowed_now === false &&
    proof.denial_assertions.api_controller_allowed_now === false &&
    proof.denial_assertions.controller_execution_allowed_now === false &&
    proof.denial_assertions.runtime_handler_bound === false &&
    proof.denial_assertions.runtime_handler_invocation_allowed_now === false &&
    proof.denial_assertions.handler_execution_allowed_now === false &&
    proof.denial_assertions.provider_sdk_call_allowed_now === false &&
    proof.denial_assertions.transport_execution_allowed_now === false &&
    proof.denial_assertions.concrete_persistence_write_allowed_now === false &&
    proof.denial_assertions.direct_canonical_context_access_allowed_now === false &&
    proof.denial_assertions.direct_canonical_writeback_allowed_now === false &&
    proof.denial_assertions.actual_contour_execution_allowed_now === false &&
    proof.denial_assertions.runtime_permission_granted === false &&
    proof.denial_assertions.real_model_call_allowed_now === false &&
    proof.denial_assertions.real_storage_write_allowed_now === false &&
    proof.intent_assertions.route_controller_implemented === false &&
    proof.intent_assertions.mcp_tool_registered === false &&
    proof.intent_assertions.api_route_registered === false &&
    proof.intent_assertions.runtime_handler_bound === false &&
    proof.intent_assertions.runtime_permission_granted === false &&
    proof.intent_assertions.actual_handler_execution_allowed_now === false &&
    proof.intent_assertions.actual_contour_execution_allowed_now === false &&
    proof.readiness_assertions.mcp_tool_registration_allowed_now === false &&
    proof.readiness_assertions.api_route_registration_allowed_now === false &&
    proof.readiness_assertions.controller_execution_allowed_now === false &&
    proof.readiness_assertions.runtime_handler_invocation_allowed_now === false &&
    proof.readiness_assertions.runtime_permission_granted === false;

  if (!allDenied) {
    throw new Error("Surface-boundary denial proof is not default-deny; cannot derive auth/IAM-adjacent authority boundary.");
  }

  return true;
};

export const createFirstAuthIamAdjacentAuthorityBoundaryBuilder = (): FirstAuthIamAdjacentAuthorityBoundaryBuilder => ({
  create(input: FirstAuthIamAdjacentAuthorityBoundaryInputShape): AuthIamAdjacentAuthorityBoundaryShape {
    const proof = input.surface_boundary_denial_proof;
    assertSurfaceBoundaryDenialProofDefaultDeny(proof);

    return createAuthIamAdjacentAuthorityBoundaryBuilder().create({
      authority_boundary_id: buildAuthorityBoundaryId(proof),
      request_id: proof.source_invocation_seam_id,
      operation_id: proof.source_surface_boundary_id,
      source: buildSource(proof),
      authority_context_placeholder: buildAuthorityContext(proof),
      created_at: input.now ?? proof.generated_at ?? DEFAULT_AUTHORITY_BOUNDARY_TIME
    });
  },

  summarize(input: AuthIamAdjacentAuthorityBoundaryShape): AuthIamAdjacentAuthorityBoundarySummaryShape {
    return createAuthIamAdjacentAuthorityBoundaryBuilder().summarize(input);
  }
});

export const createDeterministicFirstAuthIamAdjacentAuthorityBoundary = (input?: {
  surface_boundary_denial_proof?: SurfaceBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): AuthIamAdjacentAuthorityBoundaryShape => {
  const proof = input?.surface_boundary_denial_proof ?? createDeterministicSurfaceBoundaryDenialProofSummary();

  return createFirstAuthIamAdjacentAuthorityBoundaryBuilder().create({
    surface_boundary_denial_proof: proof,
    ...(input?.now ? { now: input.now } : {})
  });
};

export const createDeterministicFirstAuthIamAdjacentAuthorityBoundarySummary = (input?: {
  surface_boundary_denial_proof?: SurfaceBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): AuthIamAdjacentAuthorityBoundarySummaryShape => {
  const builder = createFirstAuthIamAdjacentAuthorityBoundaryBuilder();
  const boundary = builder.create({
    surface_boundary_denial_proof: input?.surface_boundary_denial_proof ?? createDeterministicSurfaceBoundaryDenialProofSummary(),
    ...(input?.now ? { now: input.now } : {})
  });

  return builder.summarize(boundary);
};
