import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type { NormalizedExecutionAttemptOutcomeAuditLinkageShape, NormalizedExecutionAttemptOutcomeTraceShape } from "@orchestrator/audit-eval";
import type { NormalizedExecutionAttemptOutcomeLinkageShape } from "@orchestrator/integration-contracts";
import type { RuntimeNormalizedExecutionAttemptOutcomeEnvelopeShape } from "@orchestrator/runtime-surface";
import { createDeliveryDispatchPrecheckBuilder } from "./delivery-dispatch-intent-to-delivery-dispatch-precheck.js";
import { createDeliveryDispatchIntentBuilder } from "./dispatch-readiness-to-delivery-dispatch-intent.js";
import { createExecutionAttemptOutcomePublicationPreparationBuilder } from "./delivery-runtime-execution-attempt-outcome-publication-preparation.js";
import { createPublicationDispatchReadinessBuilder } from "./publication-preparation-to-dispatch-readiness.js";
import type {
  EndToEndNonExecutingProofArtifactShape,
  EndToEndNonExecutingProofInputShape,
  EndToEndNonExecutingProofPathBuilder,
  EndToEndNonExecutingProofStageShape
} from "./end-to-end-non-executing-proof-path-types.js";
import type { NormalizedExecutionAttemptOutcomeShape } from "./delivery-runtime-execution-attempt-outcome-normalization-types.js";

const DEFAULT_PROOF_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const actionAllowedFalse = (value: false): false => value;
const disallowedNow = (value: true): false => {
  void value;
  return false;
};

const createPlaceholderStage = (input: {
  stage_name: EndToEndNonExecutingProofStageShape["stage_name"];
  source_packages: EndToEndNonExecutingProofStageShape["source_packages"];
  artifact_id: string;
  contour_target: OperationalContour | "unknown";
  notes: string[];
}): EndToEndNonExecutingProofStageShape => ({
  stage_name: input.stage_name,
  stage_status: "placeholder_only",
  source_packages: input.source_packages,
  artifact_id: input.artifact_id,
  contour_target: input.contour_target,
  actual_contour_execution: false,
  actual_runtime_execution: false,
  actual_dispatch_execution: false,
  actual_publication_delivery: false,
  actual_handler_invocation: false,
  actual_provider_sdk_call: false,
  actual_transport_execution: false,
  actual_concrete_persistence: false,
  direct_canonical_context_access: false,
  direct_canonical_writeback: false,
  notes: input.notes
});

export const createDeterministicEndToEndNonExecutingProofUpstreamPlaceholders = (input?: {
  proof_id?: string;
  request_id?: string;
  operation_id?: string;
  contour_target?: OperationalContour | "unknown";
}): EndToEndNonExecutingProofStageShape[] => {
  const proofId = input?.proof_id ?? "proof:end-to-end:non-executing:deterministic";
  const requestId = input?.request_id ?? "request:end-to-end:non-executing:deterministic";
  const operationId = input?.operation_id ?? "operation:end-to-end:non-executing:deterministic";
  const contourTarget = input?.contour_target ?? "read_path";

  return [
    createPlaceholderStage({
      stage_name: "request",
      source_packages: ["integration-contracts", "system-assembly"],
      artifact_id: requestId,
      contour_target: contourTarget,
      notes: ["Deterministic canonical request placeholder only; no external invocation is performed."]
    }),
    createPlaceholderStage({
      stage_name: "scope_context_resolution_placeholder",
      source_packages: ["read-path", "system-assembly"],
      artifact_id: `${proofId}:scope-context-resolution`,
      contour_target: contourTarget,
      notes: ["Represents scope/context resolution shape only; no canonical context is accessed."]
    }),
    createPlaceholderStage({
      stage_name: "context_selection_placeholder",
      source_packages: ["read-path", "system-assembly"],
      artifact_id: `${proofId}:context-selection`,
      contour_target: contourTarget,
      notes: ["Represents context selection shape only; no read-path pipeline is executed."]
    }),
    createPlaceholderStage({
      stage_name: "bounded_bundle_placeholder",
      source_packages: ["pack-loop", "system-assembly"],
      artifact_id: `${proofId}:bounded-bundle`,
      contour_target: contourTarget,
      notes: ["Represents bounded bundle shape only; no bundle packing pipeline is executed."]
    }),
    createPlaceholderStage({
      stage_name: "model_consumption_placeholder",
      source_packages: ["runtime-surface", "provider-adapters", "system-assembly"],
      artifact_id: `${proofId}:model-consumption`,
      contour_target: contourTarget,
      notes: ["Represents model-consumption boundary only; no model call or provider SDK call is performed."]
    }),
    createPlaceholderStage({
      stage_name: "writeback_candidate_placeholder",
      source_packages: ["write-path", "system-assembly"],
      artifact_id: `${proofId}:writeback-candidate`,
      contour_target: contourTarget,
      notes: ["Represents writeback candidate shape only; no write-path pipeline or storage write is executed."]
    }),
    createPlaceholderStage({
      stage_name: "governance_decision_placeholder",
      source_packages: ["governance", "system-assembly"],
      artifact_id: `${proofId}:governance-decision`,
      contour_target: contourTarget,
      notes: ["Represents governance decision shape only; no policy engine or IAM implementation is executed."]
    }),
    createPlaceholderStage({
      stage_name: "audit_trace_placeholder",
      source_packages: ["audit-eval", "system-assembly"],
      artifact_id: `${proofId}:audit-trace`,
      contour_target: contourTarget,
      notes: ["Represents audit trace shape only; no runtime monitoring implementation is executed."]
    }),
    createPlaceholderStage({
      stage_name: "normalized_execution_attempt_outcome",
      source_packages: ["system-assembly", "runtime-surface", "integration-contracts", "audit-eval"],
      artifact_id: `${proofId}:normalized-outcome`,
      contour_target: contourTarget,
      notes: ["Represents normalized execution-attempt outcome contract artifact used as proof-path input."]
    })
  ];
};

export const createDeterministicNormalizedExecutionAttemptOutcomeFixture = (input?: {
  proof_id?: string;
  request_id?: string;
  operation_id?: string;
  contour_target?: OperationalContour | "unknown";
  now?: IsoDateTimeString;
}): NormalizedExecutionAttemptOutcomeShape => {
  const proofId = input?.proof_id ?? "proof:end-to-end:non-executing:deterministic";
  const requestId = input?.request_id ?? "request:end-to-end:non-executing:deterministic";
  const operationId = input?.operation_id ?? "operation:end-to-end:non-executing:deterministic";
  const contourTarget = input?.contour_target ?? "read_path";
  const now = input?.now ?? DEFAULT_PROOF_TIME;
  const attemptId = `${proofId}:attempt`;
  const runtimeHandoffId = `${proofId}:runtime-handoff`;
  const normalizedOutcomeId = `${proofId}:normalized-outcome`;
  const precheckId = `${proofId}:source-precheck`;
  const dispatchIntentId = `${proofId}:source-dispatch-intent`;
  const warnings = [
    {
      code: "normalized_outcome_runtime_boundary_only" as const,
      message: "Normalized outcome is a deterministic non-executing proof fixture."
    },
    {
      code: "normalized_outcome_authority_context_placeholder_only" as const,
      message: "Authority context is carried as a placeholder reference only."
    },
    {
      code: "normalized_outcome_provenance_context_placeholder_only" as const,
      message: "Provenance context is carried as a placeholder reference only."
    },
    {
      code: "normalized_outcome_delegation_context_placeholder_only" as const,
      message: "Delegation context is carried as a placeholder reference only."
    }
  ];
  const authorityContext = {
    authority_context_id: `${proofId}:authority-context`,
    subject_identity_ref: `${proofId}:subject-identity`,
    delegated_authority_ref: `${proofId}:delegated-authority`,
    provenance_chain_ref: `${proofId}:provenance-chain`,
    control_plane_boundary: "gateway_control_plane_authority" as const,
    runtime_boundary: "delivery_runtime_no_direct_context_authority" as const,
    notes: [
      "Proof fixture carries authority/delegation/provenance as references only.",
      "No auth/IAM, policy engine, or runtime permission is executed."
    ]
  };
  const outcomePayload = {
    normalized_outcome_id: normalizedOutcomeId,
    attempt_id: attemptId,
    runtime_handoff_id: runtimeHandoffId,
    normalized_outcome_family: "read_path_normalized_attempt_outcome",
    normalized_outcome_status: "prepared_outcome",
    normalized_outcome_result: "placeholder_ready_for_future_runtime",
    lifecycle_state: "prepared",
    contour_target: contourTarget,
    actual_handler_result: false,
    actual_delivery_result: false,
    provider_transport_result: false,
    actual_dispatch_execution: false,
    actual_publication_delivery: false
  } as const;
  const runtimeSurfaceOutcomeEnvelope: RuntimeNormalizedExecutionAttemptOutcomeEnvelopeShape = {
    normalized_outcome_id: normalizedOutcomeId,
    attempt_id: attemptId,
    request_id: requestId,
    operation_id: operationId,
    precheck_id: precheckId,
    dispatch_intent_id: dispatchIntentId,
    runtime_handoff_id: runtimeHandoffId,
    normalized_outcome_family: "read_path_normalized_attempt_outcome",
    normalized_outcome_status: "prepared_outcome",
    lifecycle_state: "prepared",
    lifecycle_result_family: "prepared_without_execution",
    contour_target: contourTarget,
    runtime_surface_status: "success",
    authority_context_placeholder: {
      authority_context_id: authorityContext.authority_context_id,
      subject_identity_ref: authorityContext.subject_identity_ref,
      delegated_authority_ref: authorityContext.delegated_authority_ref,
      provenance_chain_ref: authorityContext.provenance_chain_ref,
      control_plane_boundary: authorityContext.control_plane_boundary,
      runtime_boundary: authorityContext.runtime_boundary
    },
    future_runtime_boundary: {
      outcome_boundary_status: "normalized_placeholder_outcome_only",
      handler_invocation_allowed_now: false,
      delivery_runtime_allowed_now: false,
      transport_delivery_allowed_now: false,
      provider_sdk_call_allowed_now: false,
      canonical_context_access_allowed_now: false,
      canonical_writeback_allowed_now: false
    },
    outcome_payload: outcomePayload,
    warnings,
    emitted_at: now
  };
  const integrationOutcomeLinkage: NormalizedExecutionAttemptOutcomeLinkageShape<Record<string, unknown>> = {
    linkage_id: `${normalizedOutcomeId}:integration-linkage`,
    normalized_outcome_id: normalizedOutcomeId,
    request_id: requestId,
    operation_id: operationId,
    precheck_id: precheckId,
    dispatch_intent_id: dispatchIntentId,
    runtime_handoff_id: runtimeHandoffId,
    attempt_id: attemptId,
    normalized_outcome_family: "read_path_normalized_attempt_outcome",
    normalized_outcome_status: "prepared_outcome",
    lifecycle_state: "prepared",
    lifecycle_result_family: "prepared_without_execution",
    contour_target: contourTarget,
    integration_response_status: "success",
    canonical_response: {
      request_id: requestId,
      operation_id: operationId,
      status: "success",
      result: outcomePayload,
      warnings,
      served_at: now
    },
    typed_surface_response: {
      envelope: {
        request_id: requestId,
        operation_id: operationId,
        status: "success",
        result: outcomePayload,
        warnings,
        served_at: now
      }
    },
    linkage_boundary: {
      normalized_placeholder_only: true,
      actual_handler_result: false,
      actual_delivery_result: false,
      provider_transport_result: false
    },
    warnings,
    linked_at: now
  };
  const outcomeTrace: NormalizedExecutionAttemptOutcomeTraceShape = {
    trace_id: `${normalizedOutcomeId}:trace`,
    normalized_outcome_id: normalizedOutcomeId,
    request_id: requestId,
    operation_id: operationId,
    runtime_handoff_id: runtimeHandoffId,
    attempt_id: attemptId,
    normalized_outcome_family: "read_path_normalized_attempt_outcome",
    normalized_outcome_status: "prepared_outcome",
    lifecycle_state: "prepared",
    lifecycle_result_family: "prepared_without_execution",
    contour_target: contourTarget,
    outcome_boundary: "normalized_placeholder_outcome_only",
    linked_lifecycle_trace_id: `${attemptId}:lifecycle-trace`,
    warnings,
    traced_at: now
  };
  const outcomeAuditLinkage: NormalizedExecutionAttemptOutcomeAuditLinkageShape = {
    linkage_id: `${normalizedOutcomeId}:audit-linkage`,
    normalized_outcome_id: normalizedOutcomeId,
    attempt_id: attemptId,
    runtime_handoff_id: runtimeHandoffId,
    lifecycle_state: "prepared",
    normalized_outcome_status: "prepared_outcome",
    blocked_or_deferred_or_terminal: false,
    provenance_chain_ref: authorityContext.provenance_chain_ref,
    hook_status: "pending_normalized_attempt_outcome_audit",
    warnings,
    linked_at: now
  };

  return {
    normalized_outcome_id: normalizedOutcomeId,
    attempt_id: attemptId,
    request_id: requestId,
    operation_id: operationId,
    precheck_id: precheckId,
    dispatch_intent_id: dispatchIntentId,
    runtime_handoff_id: runtimeHandoffId,
    normalized_outcome_family: "read_path_normalized_attempt_outcome",
    normalized_outcome_status: "prepared_outcome",
    normalized_outcome_result: "placeholder_ready_for_future_runtime",
    lifecycle_state: "prepared",
    lifecycle_result_family: "prepared_without_execution",
    contour_target: contourTarget,
    outcome_family_mapping: {
      attempt_family: "read_path_execution_attempt",
      contour_target: contourTarget,
      normalized_outcome_family: "read_path_normalized_attempt_outcome"
    },
    lifecycle_state_outcome_mapping: {
      lifecycle_state: "prepared",
      lifecycle_result_family: "prepared_without_execution",
      normalized_outcome_status: "prepared_outcome",
      normalized_outcome_result: "placeholder_ready_for_future_runtime",
      mapping_boundary: "lifecycle_state_to_non_executing_outcome_placeholder"
    },
    authority_context_placeholder: authorityContext,
    future_runtime_boundary: {
      future_handler_runtime_linkage_id: `${normalizedOutcomeId}:future-runtime-boundary`,
      normalized_outcome_id: normalizedOutcomeId,
      attempt_id: attemptId,
      boundary_status: "normalized_outcome_contract_only_future_runtime_boundary",
      allowed_now: {
        lifecycle_state_to_outcome_mapping: true,
        runtime_surface_outcome_envelope_emission: true,
        integration_outcome_linkage_emission: true,
        audit_eval_outcome_linkage_emission: true
      },
      disallowed_now: {
        handler_invocation: true,
        delivery_runtime_execution: true,
        transport_delivery: true,
        provider_sdk_execution: true,
        concrete_persistence_write: true,
        canonical_context_direct_access: true,
        canonical_context_direct_writeback: true
      }
    },
    runtime_surface_outcome_envelope: runtimeSurfaceOutcomeEnvelope,
    integration_outcome_linkage: integrationOutcomeLinkage,
    outcome_trace: outcomeTrace,
    outcome_audit_linkage: outcomeAuditLinkage,
    warnings,
    created_at: now
  };
};

export const createDeterministicEndToEndNonExecutingProofInput = (input?: {
  proof_id?: string;
  request_id?: string;
  operation_id?: string;
  contour_target?: OperationalContour | "unknown";
  now?: IsoDateTimeString;
}): EndToEndNonExecutingProofInputShape => {
  const proofId = input?.proof_id ?? "proof:end-to-end:non-executing:deterministic";
  const requestId = input?.request_id ?? "request:end-to-end:non-executing:deterministic";
  const operationId = input?.operation_id ?? "operation:end-to-end:non-executing:deterministic";
  const contourTarget = input?.contour_target ?? "read_path";
  const now = input?.now ?? DEFAULT_PROOF_TIME;
  const normalizedOutcome = createDeterministicNormalizedExecutionAttemptOutcomeFixture({
    proof_id: proofId,
    request_id: requestId,
    operation_id: operationId,
    contour_target: contourTarget,
    now
  });

  return {
    proof_id: proofId,
    request_id: requestId,
    operation_id: operationId,
    contour_target: contourTarget,
    requested_at: now,
    authority_context_placeholder: normalizedOutcome.authority_context_placeholder,
    normalized_outcome: normalizedOutcome,
    upstream_placeholders: createDeterministicEndToEndNonExecutingProofUpstreamPlaceholders({
      proof_id: proofId,
      request_id: requestId,
      operation_id: operationId,
      contour_target: contourTarget
    }),
    now
  };
};

export const createEndToEndNonExecutingProofPathBuilder = (): EndToEndNonExecutingProofPathBuilder => {
  const publicationPreparationBuilder = createExecutionAttemptOutcomePublicationPreparationBuilder();
  const dispatchReadinessBuilder = createPublicationDispatchReadinessBuilder();
  const deliveryDispatchIntentBuilder = createDeliveryDispatchIntentBuilder();
  const deliveryDispatchPrecheckBuilder = createDeliveryDispatchPrecheckBuilder();

  return {
    compose(input: EndToEndNonExecutingProofInputShape): EndToEndNonExecutingProofArtifactShape {
      const now = input.now ?? input.requested_at;
      const publicationPreparation = publicationPreparationBuilder.prepare({
        normalized_outcome: input.normalized_outcome,
        now
      });
      const dispatchReadiness = dispatchReadinessBuilder.prepare({
        publication_preparation: publicationPreparation,
        now
      });
      const deliveryDispatchIntent = deliveryDispatchIntentBuilder.prepare({
        dispatch_readiness: dispatchReadiness,
        now
      });
      const deliveryDispatchPrecheck = deliveryDispatchPrecheckBuilder.prepare({
        delivery_dispatch_intent: deliveryDispatchIntent,
        now
      });
      const proofWarnings = [
        ...input.normalized_outcome.warnings,
        ...publicationPreparation.warnings,
        ...dispatchReadiness.warnings,
        ...deliveryDispatchIntent.warnings,
        ...deliveryDispatchPrecheck.warnings,
        {
          code: "end_to_end_non_executing_proof_path_composed",
          message: "End-to-end proof path composed through existing contract builders without runtime execution."
        },
        {
          code: "end_to_end_non_executing_proof_path_no_new_placeholder_layer",
          message: "Proof path composes existing corridor and does not add a new conceptual placeholder layer."
        }
      ];

      return {
        proof_id: input.proof_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        contour_target: input.contour_target,
        proof_result: "end_to_end_non_executing_proof_path_composed",
        proof_boundary: "non_executing_contract_composition_only",
        authority_context_placeholder: input.authority_context_placeholder,
        upstream_placeholders: input.upstream_placeholders,
        normalized_outcome: input.normalized_outcome,
        publication_preparation: publicationPreparation,
        dispatch_readiness: dispatchReadiness,
        delivery_dispatch_intent: deliveryDispatchIntent,
        delivery_dispatch_precheck: deliveryDispatchPrecheck,
        id_chain: {
          proof_id: input.proof_id,
          request_id: input.request_id,
          operation_id: input.operation_id,
          attempt_id: input.normalized_outcome.attempt_id,
          runtime_handoff_id: input.normalized_outcome.runtime_handoff_id,
          normalized_outcome_id: input.normalized_outcome.normalized_outcome_id,
          publication_preparation_id: publicationPreparation.publication_preparation_id,
          dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
          delivery_dispatch_intent_id: deliveryDispatchIntent.delivery_dispatch_intent_id,
          delivery_dispatch_precheck_id: deliveryDispatchPrecheck.delivery_dispatch_precheck_id
        },
        status_chain: {
          lifecycle_state: input.normalized_outcome.lifecycle_state,
          normalized_outcome_status: input.normalized_outcome.normalized_outcome_status,
          publication_preparation_status: publicationPreparation.publication_preparation_status,
          dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
          delivery_dispatch_intent_status: deliveryDispatchIntent.delivery_dispatch_intent_status,
          delivery_dispatch_precheck_status: deliveryDispatchPrecheck.delivery_dispatch_precheck_status
        },
        family_chain: {
          normalized_outcome_family: input.normalized_outcome.normalized_outcome_family,
          publication_preparation_family: publicationPreparation.publication_preparation_family,
          dispatch_readiness_family: dispatchReadiness.dispatch_readiness_family,
          delivery_dispatch_intent_family: deliveryDispatchIntent.delivery_dispatch_intent_family,
          delivery_dispatch_precheck_family: deliveryDispatchPrecheck.delivery_dispatch_precheck_family
        },
        integration_linkage_chain: {
          normalized_outcome_linkage_id: input.normalized_outcome.integration_outcome_linkage.linkage_id,
          publication_preparation_linkage_id: publicationPreparation.integration_publication_preparation_linkage.linkage_id,
          dispatch_readiness_linkage_id: dispatchReadiness.integration_dispatch_readiness_linkage.linkage_id,
          delivery_dispatch_intent_linkage_id: deliveryDispatchIntent.integration_delivery_dispatch_intent_linkage.linkage_id,
          delivery_dispatch_precheck_linkage_id: deliveryDispatchPrecheck.integration_delivery_dispatch_precheck_linkage.linkage_id
        },
        audit_trace_chain: {
          normalized_outcome_trace_id: input.normalized_outcome.outcome_trace.trace_id,
          publication_preparation_trace_id: publicationPreparation.publication_preparation_trace.trace_id,
          dispatch_readiness_trace_id: dispatchReadiness.dispatch_readiness_trace.trace_id,
          delivery_dispatch_intent_trace_id: deliveryDispatchIntent.delivery_dispatch_intent_trace.trace_id,
          delivery_dispatch_precheck_trace_id: deliveryDispatchPrecheck.delivery_dispatch_precheck_trace.trace_id
        },
        runtime_action_assertions: {
          actual_dispatch_execution: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.actual_dispatch_execution_allowed_now
          ),
          actual_publication_delivery: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.actual_publication_delivery_allowed_now
          ),
          handler_invocation: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.handler_invocation_allowed_now
          ),
          delivery_runtime: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.delivery_runtime_allowed_now
          ),
          transport_execution: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.transport_delivery_allowed_now
          ),
          provider_sdk_execution: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.provider_sdk_call_allowed_now
          ),
          concrete_persistence: disallowedNow(
            deliveryDispatchPrecheck.delivery_dispatch_precheck_boundary.disallowed_now.concrete_persistence_write
          ),
          direct_canonical_context_access: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.canonical_context_access_allowed_now
          ),
          direct_canonical_writeback: actionAllowedFalse(
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope
              .delivery_dispatch_precheck_boundary.canonical_writeback_allowed_now
          ),
          runtime_permission: false,
          actual_contour_execution: false,
          real_model_call: false,
          real_storage_write: false
        },
        boundary_summary: {
          normalized_outcome_boundary:
            input.normalized_outcome.runtime_surface_outcome_envelope.future_runtime_boundary.outcome_boundary_status,
          publication_preparation_boundary:
            publicationPreparation.runtime_surface_publication_preparation_envelope.publication_boundary
              .publication_preparation_boundary_status,
          dispatch_readiness_boundary:
            dispatchReadiness.runtime_surface_dispatch_readiness_envelope.dispatch_readiness_boundary
              .dispatch_readiness_boundary_status,
          delivery_dispatch_intent_boundary:
            deliveryDispatchIntent.runtime_surface_delivery_dispatch_intent_envelope.delivery_dispatch_intent_boundary
              .delivery_dispatch_intent_boundary_status,
          delivery_dispatch_precheck_boundary:
            deliveryDispatchPrecheck.runtime_surface_delivery_dispatch_precheck_envelope.delivery_dispatch_precheck_boundary
              .delivery_dispatch_precheck_boundary_status,
          new_placeholder_layer_added: false,
          existing_contract_builders_reused: true
        },
        warnings: proofWarnings,
        generated_at: now
      };
    }
  };
};

export const composeDeterministicEndToEndNonExecutingProofPath = (
  input?: Parameters<typeof createDeterministicEndToEndNonExecutingProofInput>[0]
): EndToEndNonExecutingProofArtifactShape => {
  const proofInput = createDeterministicEndToEndNonExecutingProofInput(input);
  return createEndToEndNonExecutingProofPathBuilder().compose(proofInput);
};
