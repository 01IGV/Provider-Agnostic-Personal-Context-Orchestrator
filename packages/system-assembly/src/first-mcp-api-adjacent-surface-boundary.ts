import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createMcpApiAdjacentSurfaceBoundaryBuilder,
  type McpApiAdjacentSurfaceBoundaryAuthorityContextPlaceholderShape,
  type McpApiAdjacentSurfaceBoundaryShape,
  type McpApiAdjacentSurfaceBoundarySourceShape,
  type McpApiAdjacentSurfaceBoundarySummaryShape
} from "@orchestrator/integration-contracts";
import {
  createDeterministicHandlerBoundaryDenialProofSummary
} from "./handler-boundary-denial-proof-integration.js";
import type { HandlerBoundaryDenialProofSummaryShape } from "./handler-boundary-denial-proof-integration-types.js";
import type {
  FirstMcpApiAdjacentSurfaceBoundaryBuilder,
  FirstMcpApiAdjacentSurfaceBoundaryInputShape
} from "./first-mcp-api-adjacent-surface-boundary-types.js";

const DEFAULT_SURFACE_BOUNDARY_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const buildSurfaceBoundaryId = (proof: HandlerBoundaryDenialProofSummaryShape): string =>
  `${proof.proof_id}:mcp-api-adjacent-surface-boundary`;

const buildSource = (proof: HandlerBoundaryDenialProofSummaryShape): McpApiAdjacentSurfaceBoundarySourceShape => ({
  source_handler_boundary_id: proof.source_handler_boundary_id,
  source_handler_boundary_denial_proof_id: proof.proof_id,
  source_invocation_denial_proof_id: proof.source_invocation_denial_proof_id,
  source_invocation_seam_id: proof.source_invocation_seam_id,
  source_contour_target: proof.source_contour_target,
  source_handler_boundary_status: proof.source_handler_boundary_status,
  source_handler_boundary_denial_contract_version: proof.contract_version,
  source_handler_boundary_denial_verified: true
});

const buildAuthorityContext = (
  proof: HandlerBoundaryDenialProofSummaryShape
): McpApiAdjacentSurfaceBoundaryAuthorityContextPlaceholderShape => {
  const source = proof.authority_context_placeholder;

  return {
    ...(source.authority_context_id ? { authority_context_id: source.authority_context_id } : {}),
    ...(source.subject_identity_ref ? { subject_identity_ref: source.subject_identity_ref } : {}),
    ...(source.delegated_authority_ref ? { delegated_authority_ref: source.delegated_authority_ref } : {}),
    ...(source.provenance_chain_ref ? { provenance_chain_ref: source.provenance_chain_ref } : {}),
    control_plane_boundary: source.control_plane_boundary,
    runtime_boundary: source.runtime_boundary,
    notes: [
      "Authority context is carried forward from handler-boundary denial proof as placeholder references only.",
      "No auth/IAM, protocol registration, route/controller implementation, runtime permission, direct context authority, or handler invocation is executed."
    ]
  };
};

const assertHandlerBoundaryDenialProofDefaultDeny = (proof: HandlerBoundaryDenialProofSummaryShape): true => {
  const allDenied =
    proof.runtime_adjacent === true &&
    proof.runtime_handler_boundary === true &&
    proof.handler_execution_allowed_now === false &&
    proof.runtime_permission_granted === false &&
    proof.actual_contour_execution_allowed_now === false &&
    proof.denial_flags_all_false === true &&
    proof.failure_count === 0 &&
    proof.source_invocation_assertions.source_invocation_denial_verified === true &&
    proof.source_invocation_assertions.source_invocation_executable_adjacent === true &&
    proof.source_invocation_assertions.source_invocation_executable_now === false &&
    proof.source_invocation_assertions.source_invocation_runtime_permission_granted === false &&
    proof.source_invocation_assertions.source_invocation_denial_flags_all_false === true &&
    proof.denial_assertions.handler_invocation_allowed_now === false &&
    proof.denial_assertions.handler_execution_allowed_now === false &&
    proof.denial_assertions.runtime_dispatch_allowed_now === false &&
    proof.denial_assertions.provider_sdk_call_allowed_now === false &&
    proof.denial_assertions.transport_execution_allowed_now === false &&
    proof.denial_assertions.concrete_persistence_write_allowed_now === false &&
    proof.denial_assertions.direct_canonical_context_access_allowed_now === false &&
    proof.denial_assertions.direct_canonical_writeback_allowed_now === false &&
    proof.denial_assertions.actual_contour_execution_allowed_now === false &&
    proof.denial_assertions.runtime_permission_granted === false &&
    proof.denial_assertions.real_model_call_allowed_now === false &&
    proof.denial_assertions.real_storage_write_allowed_now === false &&
    proof.readiness_assertions.handler_invocation_allowed_now === false &&
    proof.readiness_assertions.handler_execution_allowed_now === false &&
    proof.readiness_assertions.runtime_dispatch_allowed_now === false &&
    proof.readiness_assertions.runtime_permission_granted === false &&
    proof.intent_assertions.handler_execution_allowed_now === false &&
    proof.intent_assertions.runtime_permission_granted === false;

  if (!allDenied) {
    throw new Error("Handler-boundary denial proof is not default-deny; cannot derive MCP/API-adjacent surface boundary.");
  }

  return true;
};

export const createFirstMcpApiAdjacentSurfaceBoundaryBuilder = (): FirstMcpApiAdjacentSurfaceBoundaryBuilder => ({
  create(input: FirstMcpApiAdjacentSurfaceBoundaryInputShape): McpApiAdjacentSurfaceBoundaryShape {
    const proof = input.handler_boundary_denial_proof;
    assertHandlerBoundaryDenialProofDefaultDeny(proof);

    return createMcpApiAdjacentSurfaceBoundaryBuilder().create({
      surface_boundary_id: buildSurfaceBoundaryId(proof),
      request_id: proof.source_invocation_seam_id,
      operation_id: proof.source_handler_boundary_id,
      source: buildSource(proof),
      authority_context_placeholder: buildAuthorityContext(proof),
      created_at: input.now ?? proof.generated_at ?? DEFAULT_SURFACE_BOUNDARY_TIME
    });
  },

  summarize(input: McpApiAdjacentSurfaceBoundaryShape): McpApiAdjacentSurfaceBoundarySummaryShape {
    return createMcpApiAdjacentSurfaceBoundaryBuilder().summarize(input);
  }
});

export const createDeterministicFirstMcpApiAdjacentSurfaceBoundary = (input?: {
  handler_boundary_denial_proof?: HandlerBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): McpApiAdjacentSurfaceBoundaryShape => {
  const proof = input?.handler_boundary_denial_proof ?? createDeterministicHandlerBoundaryDenialProofSummary();

  return createFirstMcpApiAdjacentSurfaceBoundaryBuilder().create({
    handler_boundary_denial_proof: proof,
    ...(input?.now ? { now: input.now } : {})
  });
};

export const createDeterministicFirstMcpApiAdjacentSurfaceBoundarySummary = (input?: {
  handler_boundary_denial_proof?: HandlerBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): McpApiAdjacentSurfaceBoundarySummaryShape => {
  const builder = createFirstMcpApiAdjacentSurfaceBoundaryBuilder();
  const boundary = builder.create({
    handler_boundary_denial_proof: input?.handler_boundary_denial_proof ?? createDeterministicHandlerBoundaryDenialProofSummary(),
    ...(input?.now ? { now: input.now } : {})
  });

  return builder.summarize(boundary);
};
