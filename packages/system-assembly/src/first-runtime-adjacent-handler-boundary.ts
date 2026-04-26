import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createRuntimeAdjacentHandlerBoundaryBuilder,
  type RuntimeAdjacentHandlerBoundaryAuthorityContextPlaceholderShape,
  type RuntimeAdjacentHandlerBoundaryShape,
  type RuntimeAdjacentHandlerBoundarySourceShape,
  type RuntimeAdjacentHandlerBoundarySummaryShape
} from "@orchestrator/runtime-surface";
import {
  createDeterministicInvocationDenialProofSummary
} from "./invocation-denial-proof-integration.js";
import type { InvocationDenialProofSummaryShape } from "./invocation-denial-proof-integration-types.js";
import type {
  FirstRuntimeAdjacentHandlerBoundaryBuilder,
  FirstRuntimeAdjacentHandlerBoundaryInputShape
} from "./first-runtime-adjacent-handler-boundary-types.js";

const DEFAULT_HANDLER_BOUNDARY_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const buildHandlerBoundaryId = (proof: InvocationDenialProofSummaryShape): string =>
  `${proof.proof_id}:runtime-adjacent-handler-boundary`;

const buildSource = (proof: InvocationDenialProofSummaryShape): RuntimeAdjacentHandlerBoundarySourceShape => ({
  source_invocation_seam_id: proof.source_invocation_seam_id,
  source_invocation_denial_proof_id: proof.proof_id,
  source_contour_target: proof.source_contour_target,
  source_seam_status: proof.source_seam_status,
  source_invocation_denial_contract_version: proof.contract_version,
  source_invocation_denial_verified: true
});

const buildAuthorityContext = (
  proof: InvocationDenialProofSummaryShape
): RuntimeAdjacentHandlerBoundaryAuthorityContextPlaceholderShape => {
  const source = proof.authority_context_placeholder;

  return {
    ...(source.authority_context_id ? { authority_context_id: source.authority_context_id } : {}),
    ...(source.subject_identity_ref ? { subject_identity_ref: source.subject_identity_ref } : {}),
    ...(source.delegated_authority_ref ? { delegated_authority_ref: source.delegated_authority_ref } : {}),
    ...(source.provenance_chain_ref ? { provenance_chain_ref: source.provenance_chain_ref } : {}),
    control_plane_boundary: source.control_plane_boundary,
    runtime_boundary: source.runtime_boundary,
    notes: [
      "Authority context is carried forward from invocation denial proof as placeholder references only.",
      "No auth/IAM, runtime permission, direct context authority, or handler invocation is executed."
    ]
  };
};

const assertSourceDenialProofDefaultDeny = (proof: InvocationDenialProofSummaryShape): true => {
  const allDenied =
    proof.executable_adjacent === true &&
    proof.executable_now === false &&
    proof.runtime_permission_granted === false &&
    proof.denial_flags_all_false === true &&
    proof.failure_count === 0 &&
    proof.denial_assertions.actual_contour_execution_allowed_now === false &&
    proof.denial_assertions.runtime_handler_invocation_allowed_now === false &&
    proof.denial_assertions.provider_sdk_call_allowed_now === false &&
    proof.denial_assertions.concrete_persistence_write_allowed_now === false &&
    proof.denial_assertions.direct_canonical_context_access_allowed_now === false &&
    proof.denial_assertions.direct_canonical_writeback_allowed_now === false &&
    proof.denial_assertions.dispatch_execution_allowed_now === false &&
    proof.denial_assertions.publication_delivery_allowed_now === false &&
    proof.denial_assertions.delivery_runtime_allowed_now === false &&
    proof.denial_assertions.transport_execution_allowed_now === false &&
    proof.denial_assertions.real_model_call_allowed_now === false &&
    proof.denial_assertions.real_storage_write_allowed_now === false &&
    proof.readiness_assertions.execution_layer_handoff_allowed_now === false &&
    proof.readiness_assertions.actual_execution_allowed_now === false;

  if (!allDenied) {
    throw new Error("Invocation denial proof is not default-deny; cannot derive runtime-adjacent handler boundary.");
  }

  return true;
};

export const createFirstRuntimeAdjacentHandlerBoundaryBuilder = (): FirstRuntimeAdjacentHandlerBoundaryBuilder => ({
  create(input: FirstRuntimeAdjacentHandlerBoundaryInputShape): RuntimeAdjacentHandlerBoundaryShape {
    const proof = input.invocation_denial_proof;
    assertSourceDenialProofDefaultDeny(proof);

    return createRuntimeAdjacentHandlerBoundaryBuilder().create({
      handler_boundary_id: buildHandlerBoundaryId(proof),
      request_id: proof.source_invocation_seam_id,
      operation_id: proof.source_proof_artifact_ref,
      source: buildSource(proof),
      authority_context_placeholder: buildAuthorityContext(proof),
      created_at: input.now ?? proof.generated_at ?? DEFAULT_HANDLER_BOUNDARY_TIME
    });
  },

  summarize(input: RuntimeAdjacentHandlerBoundaryShape): RuntimeAdjacentHandlerBoundarySummaryShape {
    return createRuntimeAdjacentHandlerBoundaryBuilder().summarize(input);
  }
});

export const createDeterministicFirstRuntimeAdjacentHandlerBoundary = (input?: {
  invocation_denial_proof?: InvocationDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): RuntimeAdjacentHandlerBoundaryShape => {
  const proof = input?.invocation_denial_proof ?? createDeterministicInvocationDenialProofSummary();

  return createFirstRuntimeAdjacentHandlerBoundaryBuilder().create({
    invocation_denial_proof: proof,
    ...(input?.now ? { now: input.now } : {})
  });
};

export const createDeterministicFirstRuntimeAdjacentHandlerBoundarySummary = (input?: {
  invocation_denial_proof?: InvocationDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): RuntimeAdjacentHandlerBoundarySummaryShape => {
  const builder = createFirstRuntimeAdjacentHandlerBoundaryBuilder();
  const boundary = builder.create({
    invocation_denial_proof: input?.invocation_denial_proof ?? createDeterministicInvocationDenialProofSummary(),
    ...(input?.now ? { now: input.now } : {})
  });

  return builder.summarize(boundary);
};
