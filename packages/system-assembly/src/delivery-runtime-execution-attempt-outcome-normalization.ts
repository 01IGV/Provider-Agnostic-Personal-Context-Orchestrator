import {
  createNormalizedExecutionAttemptOutcomeAuditLinkageBuilder,
  createNormalizedExecutionAttemptOutcomeTraceBuilder
} from "@orchestrator/audit-eval";
import {
  createNormalizedExecutionAttemptOutcomeLinkageBuilder,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type {
  DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningShape,
  ExecutionAttemptOutcomeFamilyMappingShape,
  ExecutionAttemptLifecycleStateOutcomeMappingShape,
  ExecutionAttemptOutcomeNormalizationInputShape,
  NormalizedExecutionAttemptOutcomeShape,
  NormalizedExecutionAttemptOutcomeSummaryShape
} from "./delivery-runtime-execution-attempt-outcome-normalization-types.js";
import {
  DELIVERY_RUNTIME_LIFECYCLE_STATE_TO_NORMALIZED_OUTCOME_STATUS,
  type DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily,
  type DeliveryRuntimeNormalizedExecutionAttemptOutcomeResult,
  type DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus
} from "./delivery-runtime-execution-attempt-outcome-normalization-vocabularies.js";
import type { ExecutionAttemptLifecycleShape } from "./delivery-runtime-execution-attempt-lifecycle-types.js";

const toNormalizedOutcomeFamily = (
  lifecycleArtifact: ExecutionAttemptLifecycleShape
): DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily => {
  if (lifecycleArtifact.attempt_family === "read_path_execution_attempt") return "read_path_normalized_attempt_outcome";
  if (lifecycleArtifact.attempt_family === "pack_loop_execution_attempt") return "pack_loop_normalized_attempt_outcome";
  if (lifecycleArtifact.attempt_family === "write_path_execution_attempt") return "write_path_normalized_attempt_outcome";
  if (lifecycleArtifact.attempt_family === "handoff_execution_attempt") return "handoff_normalized_attempt_outcome";
  return "unknown_normalized_attempt_outcome";
};

const toNormalizedOutcomeResult = (
  status: DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus
): DeliveryRuntimeNormalizedExecutionAttemptOutcomeResult => {
  if (status === "prepared_outcome") return "placeholder_ready_for_future_runtime";
  if (status === "queued_outcome" || status === "deferred_outcome") return "placeholder_accepted";
  if (status === "blocked_outcome" || status === "not_dispatchable_outcome") return "placeholder_rejected";
  if (["aborted_outcome", "expired_outcome", "cancelled_outcome"].includes(status)) return "placeholder_terminal";
  return "placeholder_error";
};

const toSurfaceStatus = (status: DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus): SurfaceResponseStatus => {
  if (status === "prepared_outcome") return "success";
  if (status === "queued_outcome" || status === "deferred_outcome") return "accepted";
  if (status === "blocked_outcome" || status === "not_dispatchable_outcome") return "rejected";
  return "error";
};

const createFamilyMapping = (
  lifecycleArtifact: ExecutionAttemptLifecycleShape
): ExecutionAttemptOutcomeFamilyMappingShape => {
  return {
    attempt_family: lifecycleArtifact.attempt_family,
    contour_target: lifecycleArtifact.contour_target,
    normalized_outcome_family: toNormalizedOutcomeFamily(lifecycleArtifact)
  };
};

const createLifecycleStateOutcomeMapping = (
  lifecycleArtifact: ExecutionAttemptLifecycleShape
): ExecutionAttemptLifecycleStateOutcomeMappingShape => {
  const normalizedOutcomeStatus = DELIVERY_RUNTIME_LIFECYCLE_STATE_TO_NORMALIZED_OUTCOME_STATUS[
    lifecycleArtifact.lifecycle_state
  ];
  return {
    lifecycle_state: lifecycleArtifact.lifecycle_state,
    lifecycle_result_family: lifecycleArtifact.result_family,
    normalized_outcome_status: normalizedOutcomeStatus,
    normalized_outcome_result: toNormalizedOutcomeResult(normalizedOutcomeStatus),
    mapping_boundary: "lifecycle_state_to_non_executing_outcome_placeholder"
  };
};

const createWarnings = (input: {
  lifecycleArtifact: ExecutionAttemptLifecycleShape;
  normalizedOutcomeFamily: DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily;
  normalizedOutcomeStatus: DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus;
}): DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningShape[] => {
  return [
    ...(input.normalizedOutcomeFamily === "unknown_normalized_attempt_outcome"
      ? [
          {
            code: "normalized_outcome_family_ambiguous",
            message: "normalized execution-attempt outcome family resolved to unknown_normalized_attempt_outcome"
          } as const
        ]
      : []),
    ...(input.normalizedOutcomeStatus.replace("_outcome", "") !== input.lifecycleArtifact.lifecycle_state
      ? [
          {
            code: "normalized_outcome_status_mismatch",
            message: "normalized outcome status does not match lifecycle state"
          } as const
        ]
      : []),
    {
      code: "normalized_outcome_runtime_boundary_only",
      message: "normalized execution-attempt outcome is a non-executing placeholder contract"
    },
    {
      code: "normalized_outcome_not_actual_handler_result",
      message: "normalized outcome must not be interpreted as an actual handler result"
    },
    {
      code: "normalized_outcome_not_actual_delivery_result",
      message: "normalized outcome must not be interpreted as actual delivery runtime output"
    },
    {
      code: "normalized_outcome_not_provider_transport_result",
      message: "normalized outcome must not be interpreted as provider SDK or transport result"
    },
    {
      code: "normalized_outcome_authority_context_placeholder_only",
      message: "authority context remains gateway/control-plane placeholder only"
    },
    {
      code: "normalized_outcome_provenance_context_placeholder_only",
      message: "provenance context is carried only as a reference placeholder"
    },
    {
      code: "normalized_outcome_delegation_context_placeholder_only",
      message: "delegation context is carried only as a reference placeholder"
    },
    {
      code: "normalized_outcome_runtime_surface_envelope_emitted",
      message: "runtime-surface normalized outcome envelope emitted"
    },
    {
      code: "normalized_outcome_integration_linkage_emitted",
      message: "integration normalized outcome linkage emitted"
    },
    {
      code: "normalized_outcome_audit_linkage_emitted",
      message: "audit/eval normalized outcome linkage emitted"
    }
  ];
};

export interface ExecutionAttemptOutcomeNormalizationBuilder {
  normalize(input: ExecutionAttemptOutcomeNormalizationInputShape): NormalizedExecutionAttemptOutcomeShape;
}

export interface ExecutionAttemptOutcomeNormalizationSummaryBuilder {
  summarize(input: { outcomes: NormalizedExecutionAttemptOutcomeShape[] }): NormalizedExecutionAttemptOutcomeSummaryShape;
}

export const createExecutionAttemptOutcomeNormalizationBuilder = (): ExecutionAttemptOutcomeNormalizationBuilder => {
  const integrationBuilder = createNormalizedExecutionAttemptOutcomeLinkageBuilder();
  const auditTraceBuilder = createNormalizedExecutionAttemptOutcomeTraceBuilder();
  const auditLinkageBuilder = createNormalizedExecutionAttemptOutcomeAuditLinkageBuilder();

  return {
    normalize(input: ExecutionAttemptOutcomeNormalizationInputShape): NormalizedExecutionAttemptOutcomeShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as ExecutionAttemptLifecycleShape["created_at"]);
      const lifecycleArtifact = input.lifecycle_artifact;
      const normalizedOutcomeId = `${lifecycleArtifact.attempt_id}:normalized-outcome`;
      const outcomeFamilyMapping = createFamilyMapping(lifecycleArtifact);
      const lifecycleStateOutcomeMapping = createLifecycleStateOutcomeMapping(lifecycleArtifact);
      const normalizedOutcomeFamily = outcomeFamilyMapping.normalized_outcome_family;
      const normalizedOutcomeStatus = lifecycleStateOutcomeMapping.normalized_outcome_status;
      const normalizedOutcomeResult = lifecycleStateOutcomeMapping.normalized_outcome_result;
      const warnings = createWarnings({ lifecycleArtifact, normalizedOutcomeFamily, normalizedOutcomeStatus });
      const surfaceStatus = toSurfaceStatus(normalizedOutcomeStatus);
      const outcomePayload: Record<string, unknown> = {
        normalized_outcome_id: normalizedOutcomeId,
        attempt_id: lifecycleArtifact.attempt_id,
        runtime_handoff_id: lifecycleArtifact.runtime_handoff_id,
        lifecycle_state: lifecycleArtifact.lifecycle_state,
        lifecycle_result_family: lifecycleArtifact.result_family,
        normalized_outcome_family: normalizedOutcomeFamily,
        normalized_outcome_status: normalizedOutcomeStatus,
        normalized_outcome_result: normalizedOutcomeResult,
        contour_target: lifecycleArtifact.contour_target,
        placeholder_only: true,
        actual_handler_result: false,
        actual_delivery_result: false,
        provider_transport_result: false
      };
      const futureRuntimeBoundary = {
        future_handler_runtime_linkage_id: `${normalizedOutcomeId}:future-handler-runtime-boundary`,
        normalized_outcome_id: normalizedOutcomeId,
        attempt_id: lifecycleArtifact.attempt_id,
        boundary_status: "normalized_outcome_contract_only_future_runtime_boundary" as const,
        allowed_now: {
          lifecycle_state_to_outcome_mapping: true as const,
          runtime_surface_outcome_envelope_emission: true as const,
          integration_outcome_linkage_emission: true as const,
          audit_eval_outcome_linkage_emission: true as const
        },
        disallowed_now: {
          handler_invocation: true as const,
          delivery_runtime_execution: true as const,
          transport_delivery: true as const,
          provider_sdk_execution: true as const,
          concrete_persistence_write: true as const,
          canonical_context_direct_access: true as const,
          canonical_context_direct_writeback: true as const
        }
      };
      const runtimeSurfaceOutcomeEnvelope = {
        normalized_outcome_id: normalizedOutcomeId,
        attempt_id: lifecycleArtifact.attempt_id,
        request_id: lifecycleArtifact.request_id,
        operation_id: lifecycleArtifact.operation_id,
        precheck_id: lifecycleArtifact.precheck_id,
        dispatch_intent_id: lifecycleArtifact.dispatch_intent_id,
        runtime_handoff_id: lifecycleArtifact.runtime_handoff_id,
        normalized_outcome_family: normalizedOutcomeFamily,
        normalized_outcome_status: normalizedOutcomeStatus,
        lifecycle_state: lifecycleArtifact.lifecycle_state,
        lifecycle_result_family: lifecycleArtifact.result_family,
        contour_target: lifecycleArtifact.contour_target,
        runtime_surface_status: surfaceStatus,
        authority_context_placeholder: {
          ...(lifecycleArtifact.authority_context_placeholder.authority_context_id
            ? { authority_context_id: lifecycleArtifact.authority_context_placeholder.authority_context_id }
            : {}),
          ...(lifecycleArtifact.authority_context_placeholder.subject_identity_ref
            ? { subject_identity_ref: lifecycleArtifact.authority_context_placeholder.subject_identity_ref }
            : {}),
          ...(lifecycleArtifact.authority_context_placeholder.delegated_authority_ref
            ? { delegated_authority_ref: lifecycleArtifact.authority_context_placeholder.delegated_authority_ref }
            : {}),
          ...(lifecycleArtifact.authority_context_placeholder.provenance_chain_ref
            ? { provenance_chain_ref: lifecycleArtifact.authority_context_placeholder.provenance_chain_ref }
            : {}),
          control_plane_boundary: lifecycleArtifact.authority_context_placeholder.control_plane_boundary,
          runtime_boundary: lifecycleArtifact.authority_context_placeholder.runtime_boundary
        },
        future_runtime_boundary: {
          outcome_boundary_status: "normalized_placeholder_outcome_only" as const,
          handler_invocation_allowed_now: false as const,
          delivery_runtime_allowed_now: false as const,
          transport_delivery_allowed_now: false as const,
          provider_sdk_call_allowed_now: false as const,
          canonical_context_access_allowed_now: false as const,
          canonical_writeback_allowed_now: false as const
        },
        outcome_payload: outcomePayload,
        warnings,
        emitted_at: now
      };
      const integrationOutcomeLinkage = integrationBuilder.build({
        linkage_id: `${normalizedOutcomeId}:integration-outcome-linkage`,
        normalized_outcome_id: normalizedOutcomeId,
        request_id: lifecycleArtifact.request_id,
        operation_id: lifecycleArtifact.operation_id,
        precheck_id: lifecycleArtifact.precheck_id,
        dispatch_intent_id: lifecycleArtifact.dispatch_intent_id,
        runtime_handoff_id: lifecycleArtifact.runtime_handoff_id,
        attempt_id: lifecycleArtifact.attempt_id,
        normalized_outcome_family: normalizedOutcomeFamily,
        normalized_outcome_status: normalizedOutcomeStatus,
        lifecycle_state: lifecycleArtifact.lifecycle_state,
        lifecycle_result_family: lifecycleArtifact.result_family,
        contour_target: lifecycleArtifact.contour_target,
        integration_response_status: surfaceStatus,
        canonical_response: {
          request_id: lifecycleArtifact.request_id,
          operation_id: lifecycleArtifact.operation_id,
          status: surfaceStatus,
          result: outcomePayload,
          warnings,
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: lifecycleArtifact.request_id,
            operation_id: lifecycleArtifact.operation_id,
            status: surfaceStatus,
            result: outcomePayload,
            warnings,
            served_at: now
          }
        },
        warnings,
        now
      });
      const outcomeTrace = auditTraceBuilder.build({
        trace_id: `${normalizedOutcomeId}:trace`,
        normalized_outcome_id: normalizedOutcomeId,
        request_id: lifecycleArtifact.request_id,
        operation_id: lifecycleArtifact.operation_id,
        runtime_handoff_id: lifecycleArtifact.runtime_handoff_id,
        attempt_id: lifecycleArtifact.attempt_id,
        normalized_outcome_family: normalizedOutcomeFamily,
        normalized_outcome_status: normalizedOutcomeStatus,
        lifecycle_state: lifecycleArtifact.lifecycle_state,
        lifecycle_result_family: lifecycleArtifact.result_family,
        contour_target: lifecycleArtifact.contour_target,
        linked_lifecycle_trace_id: lifecycleArtifact.lifecycle_trace.trace_id,
        warnings,
        now
      });
      const outcomeAuditLinkage = auditLinkageBuilder.build({
        linkage_id: `${normalizedOutcomeId}:audit-linkage`,
        normalized_outcome_id: normalizedOutcomeId,
        attempt_id: lifecycleArtifact.attempt_id,
        runtime_handoff_id: lifecycleArtifact.runtime_handoff_id,
        lifecycle_state: lifecycleArtifact.lifecycle_state,
        normalized_outcome_status: normalizedOutcomeStatus,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        ...(lifecycleArtifact.authority_context_placeholder.provenance_chain_ref
          ? { provenance_chain_ref: lifecycleArtifact.authority_context_placeholder.provenance_chain_ref }
          : {}),
        warnings,
        now
      });

      return {
        normalized_outcome_id: normalizedOutcomeId,
        attempt_id: lifecycleArtifact.attempt_id,
        request_id: lifecycleArtifact.request_id,
        operation_id: lifecycleArtifact.operation_id,
        precheck_id: lifecycleArtifact.precheck_id,
        dispatch_intent_id: lifecycleArtifact.dispatch_intent_id,
        runtime_handoff_id: lifecycleArtifact.runtime_handoff_id,
        normalized_outcome_family: normalizedOutcomeFamily,
        normalized_outcome_status: normalizedOutcomeStatus,
        normalized_outcome_result: normalizedOutcomeResult,
        lifecycle_state: lifecycleArtifact.lifecycle_state,
        lifecycle_result_family: lifecycleArtifact.result_family,
        contour_target: lifecycleArtifact.contour_target,
        outcome_family_mapping: outcomeFamilyMapping,
        lifecycle_state_outcome_mapping: lifecycleStateOutcomeMapping,
        authority_context_placeholder: lifecycleArtifact.authority_context_placeholder,
        future_runtime_boundary: futureRuntimeBoundary,
        runtime_surface_outcome_envelope: runtimeSurfaceOutcomeEnvelope,
        integration_outcome_linkage: integrationOutcomeLinkage,
        outcome_trace: outcomeTrace,
        outcome_audit_linkage: outcomeAuditLinkage,
        warnings,
        created_at: now
      };
    }
  };
};

export const createExecutionAttemptOutcomeNormalizationSummaryBuilder =
  (): ExecutionAttemptOutcomeNormalizationSummaryBuilder => {
    return {
      summarize(input: { outcomes: NormalizedExecutionAttemptOutcomeShape[] }): NormalizedExecutionAttemptOutcomeSummaryShape {
        return {
          total: input.outcomes.length,
          queued: input.outcomes.filter((item) => item.normalized_outcome_status === "queued_outcome").length,
          prepared: input.outcomes.filter((item) => item.normalized_outcome_status === "prepared_outcome").length,
          blocked: input.outcomes.filter((item) => item.normalized_outcome_status === "blocked_outcome").length,
          deferred: input.outcomes.filter((item) => item.normalized_outcome_status === "deferred_outcome").length,
          aborted: input.outcomes.filter((item) => item.normalized_outcome_status === "aborted_outcome").length,
          expired: input.outcomes.filter((item) => item.normalized_outcome_status === "expired_outcome").length,
          cancelled: input.outcomes.filter((item) => item.normalized_outcome_status === "cancelled_outcome").length,
          not_dispatchable: input.outcomes.filter((item) => item.normalized_outcome_status === "not_dispatchable_outcome").length,
          by_normalized_outcome_family: {
            read_path_normalized_attempt_outcome: input.outcomes.filter(
              (item) => item.normalized_outcome_family === "read_path_normalized_attempt_outcome"
            ).length,
            pack_loop_normalized_attempt_outcome: input.outcomes.filter(
              (item) => item.normalized_outcome_family === "pack_loop_normalized_attempt_outcome"
            ).length,
            write_path_normalized_attempt_outcome: input.outcomes.filter(
              (item) => item.normalized_outcome_family === "write_path_normalized_attempt_outcome"
            ).length,
            handoff_normalized_attempt_outcome: input.outcomes.filter(
              (item) => item.normalized_outcome_family === "handoff_normalized_attempt_outcome"
            ).length,
            unknown_normalized_attempt_outcome: input.outcomes.filter(
              (item) => item.normalized_outcome_family === "unknown_normalized_attempt_outcome"
            ).length
          },
          warnings: input.outcomes.flatMap((item) => item.warnings)
        };
      }
    };
  };
