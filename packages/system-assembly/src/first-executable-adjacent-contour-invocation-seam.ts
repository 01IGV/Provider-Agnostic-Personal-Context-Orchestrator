import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { EndToEndNonExecutingProofArtifactShape } from "./end-to-end-non-executing-proof-path-types.js";
import {
  composeDeterministicEndToEndNonExecutingProofPath
} from "./end-to-end-non-executing-proof-path.js";
import type {
  FirstExecutableAdjacentContourInvocationSeamBuilder,
  FirstExecutableAdjacentInvocationAuthorityContextPlaceholderShape,
  FirstExecutableAdjacentInvocationBoundaryShape,
  FirstExecutableAdjacentInvocationDenialFlagsShape,
  FirstExecutableAdjacentInvocationDenialReason,
  FirstExecutableAdjacentInvocationReadinessShape,
  FirstExecutableAdjacentInvocationSeamInputShape,
  FirstExecutableAdjacentInvocationSeamSummaryShape,
  FirstExecutableAdjacentInvocationSourceProofReferenceShape,
  FirstExecutableAdjacentInvocationWarningShape
} from "./first-executable-adjacent-contour-invocation-seam-types.js";
import type {
  FirstExecutableAdjacentContourInvocationTarget,
  FirstExecutableAdjacentInvocationBoundaryStatus
} from "./first-executable-adjacent-contour-invocation-seam-vocabularies.js";

const DEFAULT_SEAM_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const toSeamContourTarget = (
  target: EndToEndNonExecutingProofArtifactShape["contour_target"]
): FirstExecutableAdjacentContourInvocationTarget => {
  if (target === "read_path" || target === "pack_loop" || target === "write_path" || target === "handoff") {
    return target;
  }

  return "unknown";
};

const defaultDenialFlags = (): FirstExecutableAdjacentInvocationDenialFlagsShape => ({
  actual_contour_execution_allowed_now: false,
  runtime_handler_invocation_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  direct_canonical_context_access_allowed_now: false,
  direct_canonical_writeback_allowed_now: false,
  dispatch_execution_allowed_now: false,
  publication_delivery_allowed_now: false,
  delivery_runtime_allowed_now: false,
  transport_execution_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false
});

const defaultDenialReasons = (input: {
  contour_target: FirstExecutableAdjacentContourInvocationTarget;
}): FirstExecutableAdjacentInvocationDenialReason[] => {
  return [
    "actual_contour_execution_denied_by_default",
    "runtime_handler_invocation_denied_by_default",
    "provider_sdk_call_denied_by_default",
    "concrete_persistence_write_denied_by_default",
    "direct_canonical_context_access_denied_by_default",
    "direct_canonical_writeback_denied_by_default",
    "source_proof_artifact_non_executing_only",
    ...(input.contour_target === "unknown" ? ["unknown_contour_target_not_permitted" as const] : [])
  ];
};

const defaultWarnings = (): FirstExecutableAdjacentInvocationWarningShape[] => [
  {
    code: "executable_adjacent_not_executable",
    message: "Invocation seam is executable-adjacent contract shape only; no contour is invoked."
  },
  {
    code: "actual_contour_execution_still_denied",
    message: "Actual contour execution remains denied by default."
  },
  {
    code: "runtime_handler_invocation_still_denied",
    message: "Runtime handler invocation remains denied by default."
  },
  {
    code: "provider_sdk_call_still_denied",
    message: "Provider SDK calls remain denied by default."
  },
  {
    code: "concrete_persistence_write_still_denied",
    message: "Concrete persistence writes remain denied by default."
  },
  {
    code: "canonical_context_access_still_denied",
    message: "Direct canonical context access remains denied by default."
  },
  {
    code: "canonical_writeback_still_denied",
    message: "Direct canonical writeback remains denied by default."
  },
  {
    code: "authority_context_placeholder_only",
    message: "Authority, identity, and delegation are preserved as placeholder references only."
  },
  {
    code: "provenance_context_placeholder_only",
    message: "Provenance is preserved as a placeholder reference only."
  },
  {
    code: "source_proof_reference_only",
    message: "Source proof artifact is used as a reference only and does not grant runtime permission."
  }
];

const runtimeAssertionsAllFalse = (proof: EndToEndNonExecutingProofArtifactShape): true => {
  const assertions = proof.runtime_action_assertions;
  const allFalse =
    assertions.actual_dispatch_execution === false &&
    assertions.actual_publication_delivery === false &&
    assertions.handler_invocation === false &&
    assertions.delivery_runtime === false &&
    assertions.transport_execution === false &&
    assertions.provider_sdk_execution === false &&
    assertions.concrete_persistence === false &&
    assertions.direct_canonical_context_access === false &&
    assertions.direct_canonical_writeback === false &&
    assertions.runtime_permission === false &&
    assertions.actual_contour_execution === false &&
    assertions.real_model_call === false &&
    assertions.real_storage_write === false;

  if (!allFalse) {
    throw new Error("Source proof artifact contains runtime/action assertion drift.");
  }

  return true;
};

const buildSourceProofReference = (
  proof: EndToEndNonExecutingProofArtifactShape,
  contourTarget: FirstExecutableAdjacentContourInvocationTarget
): FirstExecutableAdjacentInvocationSourceProofReferenceShape => ({
  source_proof_reference_id: `${proof.proof_id}:first-executable-adjacent-contour-invocation-seam:source-proof`,
  proof_id: proof.proof_id,
  request_id: proof.request_id,
  operation_id: proof.operation_id,
  source_contour_target: contourTarget,
  source_proof_result: proof.proof_result,
  source_proof_boundary: proof.proof_boundary,
  source_normalized_outcome_id: proof.id_chain.normalized_outcome_id,
  source_delivery_dispatch_precheck_id: proof.id_chain.delivery_dispatch_precheck_id,
  source_runtime_action_assertions_all_false: runtimeAssertionsAllFalse(proof)
});

const buildAuthorityContext = (
  proof: EndToEndNonExecutingProofArtifactShape
): FirstExecutableAdjacentInvocationAuthorityContextPlaceholderShape => {
  const source = proof.authority_context_placeholder;

  return {
    ...(source.authority_context_id ? { authority_context_id: source.authority_context_id } : {}),
    ...(source.subject_identity_ref ? { subject_identity_ref: source.subject_identity_ref } : {}),
    ...(source.delegated_authority_ref ? { delegated_authority_ref: source.delegated_authority_ref } : {}),
    ...(source.provenance_chain_ref ? { provenance_chain_ref: source.provenance_chain_ref } : {}),
    control_plane_boundary: source.control_plane_boundary,
    runtime_boundary: source.runtime_boundary,
    notes: [
      "Authority context is carried forward as a placeholder reference only.",
      "No auth/IAM, policy engine, runtime permission, or direct context authority is executed."
    ]
  };
};

const resolveBoundaryStatus = (input: {
  requested_boundary_status?: FirstExecutableAdjacentInvocationBoundaryStatus;
  contour_target: FirstExecutableAdjacentContourInvocationTarget;
}): FirstExecutableAdjacentInvocationBoundaryStatus => {
  if (input.requested_boundary_status) {
    return input.requested_boundary_status;
  }

  return input.contour_target === "unknown" ? "invocation_not_permitted" : "invocation_candidate";
};

const buildReadiness = (input: {
  proof: EndToEndNonExecutingProofArtifactShape;
  contour_target: FirstExecutableAdjacentContourInvocationTarget;
  boundary_status: FirstExecutableAdjacentInvocationBoundaryStatus;
  denial_reasons: FirstExecutableAdjacentInvocationDenialReason[];
}): FirstExecutableAdjacentInvocationReadinessShape => ({
  invocation_readiness_id: `${input.proof.proof_id}:first-executable-adjacent-contour-invocation-seam:readiness`,
  request_id: input.proof.request_id,
  operation_id: input.proof.operation_id,
  contour_target: input.contour_target,
  readiness_status:
    input.boundary_status === "invocation_candidate"
      ? "candidate_for_future_execution_layer"
      : "not_ready_for_future_execution_layer",
  boundary_status: input.boundary_status,
  denial_reasons: input.denial_reasons,
  execution_layer_handoff_allowed_now: false,
  actual_execution_allowed_now: false,
  readiness_notes: [
    "Readiness is executable-adjacent only and does not permit actual execution.",
    "Future execution-layer handoff remains explicitly denied in this pass."
  ]
});

const guardrailNotes = (contourTarget: FirstExecutableAdjacentContourInvocationTarget): string[] => [
  "This seam is closer to execution than proof artifact output but is still non-executable.",
  "Actual contour execution is denied by default.",
  "Runtime handler invocation is denied by default.",
  "Provider SDK calls, transport execution, concrete persistence, model calls, and storage writes are denied by default.",
  "Authority, identity, delegation, and provenance are shape-level references only.",
  ...(contourTarget === "unknown" ? ["Unknown contour target is not permitted for future execution handoff."] : [])
];

export const createFirstExecutableAdjacentContourInvocationSeamBuilder = (): FirstExecutableAdjacentContourInvocationSeamBuilder => ({
  create(input: FirstExecutableAdjacentInvocationSeamInputShape): FirstExecutableAdjacentInvocationBoundaryShape {
    const proof = input.proof_artifact;
    const now = input.now ?? proof.generated_at ?? DEFAULT_SEAM_TIME;
    const contourTarget = toSeamContourTarget(proof.contour_target);
    const boundaryStatus = resolveBoundaryStatus({
      ...(input.requested_boundary_status ? { requested_boundary_status: input.requested_boundary_status } : {}),
      contour_target: contourTarget
    });
    const denialReasons = defaultDenialReasons({ contour_target: contourTarget });
    const sourceProofReference = buildSourceProofReference(proof, contourTarget);
    const guardrails = guardrailNotes(contourTarget);

    return {
      boundary_id: `${proof.proof_id}:first-executable-adjacent-contour-invocation-seam`,
      request_id: proof.request_id,
      operation_id: proof.operation_id,
      contour_target: contourTarget,
      boundary_status: boundaryStatus,
      source_proof_reference: sourceProofReference,
      authority_context_placeholder: buildAuthorityContext(proof),
      invocation_intent: {
        invocation_intent_id: `${proof.proof_id}:first-executable-adjacent-contour-invocation-seam:intent`,
        request_id: proof.request_id,
        operation_id: proof.operation_id,
        contour_target: contourTarget,
        intent_status: "future_contour_invocation_intent_recorded",
        intent_boundary: "executable_adjacent_contract_only",
        source_proof_reference_id: sourceProofReference.source_proof_reference_id,
        guardrail_notes: guardrails
      },
      invocation_readiness: buildReadiness({
        proof,
        contour_target: contourTarget,
        boundary_status: boundaryStatus,
        denial_reasons: denialReasons
      }),
      denial_flags: defaultDenialFlags(),
      denial_reasons: denialReasons,
      warnings: defaultWarnings(),
      guardrail_notes: guardrails,
      created_at: now
    };
  },

  summarize(input: FirstExecutableAdjacentInvocationBoundaryShape): FirstExecutableAdjacentInvocationSeamSummaryShape {
    return {
      seam_id: input.boundary_id,
      request_id: input.request_id,
      operation_id: input.operation_id,
      contour_target: input.contour_target,
      boundary_status: input.boundary_status,
      executable_adjacent: true,
      executable_now: false,
      source_proof_id: input.source_proof_reference.proof_id,
      denial_flags_all_false: true,
      runtime_permission_granted: false,
      guardrail_notes: input.guardrail_notes
    };
  }
});

export const createDeterministicFirstExecutableAdjacentContourInvocationSeam = (input?: {
  proof_artifact?: EndToEndNonExecutingProofArtifactShape;
  requested_boundary_status?: FirstExecutableAdjacentInvocationBoundaryStatus;
  now?: IsoDateTimeString;
}): FirstExecutableAdjacentInvocationBoundaryShape => {
  const proof = input?.proof_artifact ?? composeDeterministicEndToEndNonExecutingProofPath();
  return createFirstExecutableAdjacentContourInvocationSeamBuilder().create({
    proof_artifact: proof,
    ...(input?.requested_boundary_status ? { requested_boundary_status: input.requested_boundary_status } : {}),
    ...(input?.now ? { now: input.now } : {})
  });
};

export const createDeterministicFirstExecutableAdjacentContourInvocationSeamSummary = (input?: {
  proof_artifact?: EndToEndNonExecutingProofArtifactShape;
  requested_boundary_status?: FirstExecutableAdjacentInvocationBoundaryStatus;
  now?: IsoDateTimeString;
}): FirstExecutableAdjacentInvocationSeamSummaryShape => {
  const builder = createFirstExecutableAdjacentContourInvocationSeamBuilder();
  const seam = builder.create({
    proof_artifact: input?.proof_artifact ?? composeDeterministicEndToEndNonExecutingProofPath(),
    ...(input?.requested_boundary_status ? { requested_boundary_status: input.requested_boundary_status } : {}),
    ...(input?.now ? { now: input.now } : {})
  });

  return builder.summarize(seam);
};
