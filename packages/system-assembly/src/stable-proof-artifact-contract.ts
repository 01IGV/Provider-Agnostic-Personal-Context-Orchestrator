import type { EndToEndNonExecutingProofArtifactShape } from "./end-to-end-non-executing-proof-path-types.js";
import {
  STABLE_PROOF_ARTIFACT_CONTRACT_VERSION,
  STABLE_PROOF_ARTIFACT_GENERATED_AT,
  STABLE_PROOF_ARTIFACT_RUNTIME_ACTION_ASSERTION_KEYS,
  type StableProofArtifactRuntimeActionAssertionFailureShape,
  type StableProofArtifactSummaryShape
} from "./stable-proof-artifact-contract-types.js";

const NON_EXECUTING_STATEMENT: StableProofArtifactSummaryShape["non_executing_statement"] = {
  actual_dispatch_execution: false,
  actual_publication_delivery: false,
  handler_invocation: false,
  delivery_runtime: false,
  transport_execution: false,
  provider_sdk_execution: false,
  concrete_persistence: false,
  direct_canonical_context_access: false,
  direct_canonical_writeback: false,
  runtime_permission: false,
  actual_contour_execution: false,
  real_model_call: false,
  real_storage_write: false
};

export const findStableProofArtifactRuntimeActionAssertionFailures = (
  summary: Pick<StableProofArtifactSummaryShape, "runtime_action_assertions" | "non_executing_statement">
): StableProofArtifactRuntimeActionAssertionFailureShape[] => {
  return STABLE_PROOF_ARTIFACT_RUNTIME_ACTION_ASSERTION_KEYS.flatMap((key) => {
    const runtimeAssertionValue = summary.runtime_action_assertions[key];
    const nonExecutingStatementValue = summary.non_executing_statement[key];
    const failures: StableProofArtifactRuntimeActionAssertionFailureShape[] = [];

    if (runtimeAssertionValue !== false) {
      failures.push({ key, value: runtimeAssertionValue });
    }

    if (nonExecutingStatementValue !== false) {
      failures.push({ key, value: nonExecutingStatementValue });
    }

    return failures;
  });
};

export const assertStableProofArtifactRuntimeActionAssertionsFalse = (
  summary: Pick<StableProofArtifactSummaryShape, "runtime_action_assertions" | "non_executing_statement">
): void => {
  const failures = findStableProofArtifactRuntimeActionAssertionFailures(summary);

  if (failures.length > 0) {
    throw new Error(
      `Stable proof artifact runtime/action assertions must remain false: ${JSON.stringify(failures)}`
    );
  }
};

export const createStableProofArtifactSummary = (
  proof: EndToEndNonExecutingProofArtifactShape
): StableProofArtifactSummaryShape => {
  const summary: StableProofArtifactSummaryShape = {
    contract_version: STABLE_PROOF_ARTIFACT_CONTRACT_VERSION,
    proof_result: proof.proof_result,
    proof_boundary: proof.proof_boundary,
    proof_id: proof.proof_id,
    request_id: proof.request_id,
    operation_id: proof.operation_id,
    contour_target: proof.contour_target,
    stage_chain: proof.upstream_placeholders.map((stage) => ({
      stage_name: stage.stage_name,
      stage_status: stage.stage_status,
      artifact_id: stage.artifact_id,
      contour_target: stage.contour_target,
      source_packages: stage.source_packages,
      actual_contour_execution: stage.actual_contour_execution,
      actual_runtime_execution: stage.actual_runtime_execution,
      actual_dispatch_execution: stage.actual_dispatch_execution,
      actual_publication_delivery: stage.actual_publication_delivery,
      actual_handler_invocation: stage.actual_handler_invocation,
      actual_provider_sdk_call: stage.actual_provider_sdk_call,
      actual_transport_execution: stage.actual_transport_execution,
      actual_concrete_persistence: stage.actual_concrete_persistence,
      direct_canonical_context_access: stage.direct_canonical_context_access,
      direct_canonical_writeback: stage.direct_canonical_writeback
    })),
    delivery_adjacent_chain: {
      normalized_outcome_id: proof.id_chain.normalized_outcome_id,
      publication_preparation_id: proof.id_chain.publication_preparation_id,
      dispatch_readiness_id: proof.id_chain.dispatch_readiness_id,
      delivery_dispatch_intent_id: proof.id_chain.delivery_dispatch_intent_id,
      delivery_dispatch_precheck_id: proof.id_chain.delivery_dispatch_precheck_id
    },
    status_chain: proof.status_chain,
    family_chain: proof.family_chain,
    integration_linkage_chain: proof.integration_linkage_chain,
    audit_trace_chain: proof.audit_trace_chain,
    authority_context_placeholder: {
      authority_context_id: proof.authority_context_placeholder.authority_context_id,
      subject_identity_ref: proof.authority_context_placeholder.subject_identity_ref,
      delegated_authority_ref: proof.authority_context_placeholder.delegated_authority_ref,
      provenance_chain_ref: proof.authority_context_placeholder.provenance_chain_ref,
      control_plane_boundary: proof.authority_context_placeholder.control_plane_boundary,
      runtime_boundary: proof.authority_context_placeholder.runtime_boundary
    },
    runtime_action_assertions: proof.runtime_action_assertions,
    boundary_summary: proof.boundary_summary,
    non_executing_statement: NON_EXECUTING_STATEMENT,
    generated_at: STABLE_PROOF_ARTIFACT_GENERATED_AT
  };

  assertStableProofArtifactRuntimeActionAssertionsFalse(summary);

  return summary;
};
