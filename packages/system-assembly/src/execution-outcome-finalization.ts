import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createFinalizedIntegrationResponseLinkageBuilder,
  type SurfaceErrorObject,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type { RuntimeSurfaceErrorShape } from "@orchestrator/runtime-surface";
import { createFinalizedOutcomeAuditLinkageBuilder } from "@orchestrator/audit-eval";
import type {
  ExecutionOutcomeFinalizationInputShape,
  ExecutionOutcomeFinalizationShape,
  ExecutionOutcomeFinalizationSummaryShape,
  ExecutionFinalizationWarningShape,
  FinalizedOutcomePlaceholderFamiliesShape,
  FinalizationStatusMappingShape
} from "./execution-outcome-finalization-types.js";
import {
  FINALIZATION_STATUS_TO_SURFACE_STATUS,
  type ExecutionFinalizationStatus,
  type ExecutionFinalizedOutcomeFamily
} from "./execution-outcome-finalization-vocabularies.js";

const toFinalizedOutcomeFamily = (input: ExecutionOutcomeFinalizationInputShape): ExecutionFinalizedOutcomeFamily => {
  const family = input.reconciliation_result.outcome_family.outcome_family;
  if (family === "read_path_result") return "read_path_finalized";
  if (family === "pack_loop_result") return "pack_loop_finalized";
  if (family === "write_path_result") return "write_path_finalized";
  if (family === "handoff_result") return "handoff_finalized";
  return "unknown_finalized";
};

const toFinalizationStatus = (input: ExecutionOutcomeFinalizationInputShape): ExecutionFinalizationStatus => {
  if (input.completion_ingress_result.status !== "accepted_completion") {
    return "incomplete_finalization";
  }

  const reconciledStatus = input.reconciliation_result.attempt_reconciliation.reconciled_status;
  if (reconciledStatus === "completed_placeholder") return "completed_finalized";
  if (reconciledStatus === "ready_placeholder") return "partial_finalized";
  if (reconciledStatus === "blocked_placeholder") return "blocked_finalized";
  if (reconciledStatus === "deferred_placeholder") return "deferred_finalized";
  if (reconciledStatus === "failed_placeholder") return "failed_finalized";
  return "incomplete_finalization";
};

const buildWarnings = (input: {
  finalizationStatus: ExecutionFinalizationStatus;
  finalizationInput: ExecutionOutcomeFinalizationInputShape;
}): ExecutionFinalizationWarningShape[] => {
  const completionResult = input.finalizationInput.completion_ingress_result;
  const reconciliationResult = input.finalizationInput.reconciliation_result;

  return [
    ...(completionResult.status === "accepted_completion"
      ? []
      : [
          {
            code: "completion_not_accepted",
            message: "finalization input received completion ingress result that is not accepted"
          } as const
        ]),
    ...(completionResult.request_id === reconciliationResult.request_id &&
    completionResult.operation_id === reconciliationResult.operation_id
      ? []
      : [
          {
            code: "completion_and_reconciliation_mismatch",
            message: "completion ingress request/operation does not match reconciliation request/operation"
          } as const
        ]),
    ...(input.finalizationStatus === "incomplete_finalization"
      ? [
          {
            code: "reconciliation_status_ambiguous",
            message: "reconciliation outcome status could not be finalized into a stable finalized status"
          } as const
        ]
      : []),
    ...(input.finalizationStatus === "partial_finalized"
      ? [{ code: "partial_finalization_generated", message: "finalization produced partial finalized output contract" } as const]
      : []),
    { code: "finalized_surface_envelope_emitted", message: "finalized runtime-surface envelope contract emitted" },
    { code: "finalized_integration_envelope_emitted", message: "finalized integration envelope contract emitted" }
  ];
};

const toRuntimeSurfaceError = (
  status: ExecutionFinalizationStatus
): RuntimeSurfaceErrorShape | undefined => {
  if (status === "blocked_finalized") {
    return {
      error_code: "boundary_preservation_warning",
      error_family: "internal_orchestration_failure",
      message: "finalization indicates blocked outcome at contract boundary",
      retryable: true
    };
  }

  if (status === "failed_finalized" || status === "incomplete_finalization") {
    return {
      error_code: "internal_surface_failure",
      error_family: "internal_orchestration_failure",
      message: "finalization indicates failed or incomplete finalized outcome",
      retryable: true
    };
  }

  return undefined;
};

const toIntegrationError = (runtimeError?: RuntimeSurfaceErrorShape): SurfaceErrorObject | undefined => {
  if (!runtimeError) {
    return undefined;
  }

  return {
    error_code: runtimeError.error_code === "boundary_preservation_warning" ? "transient_failure" : "internal_failure",
    error_family: runtimeError.error_family,
    message: runtimeError.message,
    retryable: runtimeError.retryable,
    ...(runtimeError.details ? { details: runtimeError.details } : {})
  };
};

const toPlaceholderFamilies = (input: {
  status: ExecutionFinalizationStatus;
  finalizationInput: ExecutionOutcomeFinalizationInputShape;
}): FinalizedOutcomePlaceholderFamiliesShape => {
  const payload = {
    reconciliation_id: input.finalizationInput.reconciliation_result.reconciliation_id,
    completion_ingress_result_id: input.finalizationInput.completion_ingress_result.ingress_result_id,
    status: input.status
  };

  if (input.status === "completed_finalized") {
    return { completed_placeholder: payload };
  }

  if (input.status === "blocked_finalized") {
    return { blocked_placeholder: payload };
  }

  if (input.status === "deferred_finalized") {
    return { deferred_placeholder: payload };
  }

  if (input.status === "failed_finalized" || input.status === "incomplete_finalization") {
    return { failed_placeholder: payload };
  }

  return { deferred_placeholder: payload };
};

export interface ExecutionOutcomeFinalizationBuilder {
  finalize(input: ExecutionOutcomeFinalizationInputShape): ExecutionOutcomeFinalizationShape;
}

export interface ExecutionOutcomeFinalizationSummaryBuilder {
  summarize(input: { finalization_results: ExecutionOutcomeFinalizationShape[] }): ExecutionOutcomeFinalizationSummaryShape;
}

export const createExecutionOutcomeFinalizationBuilder = (): ExecutionOutcomeFinalizationBuilder => {
  const finalizedIntegrationBuilder = createFinalizedIntegrationResponseLinkageBuilder();
  const finalizedAuditBuilder = createFinalizedOutcomeAuditLinkageBuilder();

  return {
    finalize(input: ExecutionOutcomeFinalizationInputShape): ExecutionOutcomeFinalizationShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const finalizationStatus = toFinalizationStatus(input);
      const finalizedOutcomeFamily = toFinalizedOutcomeFamily(input);
      const warnings = buildWarnings({ finalizationStatus, finalizationInput: input });
      const surfaceStatusHint = FINALIZATION_STATUS_TO_SURFACE_STATUS[finalizationStatus];
      const surfaceStatus: SurfaceResponseStatus =
        surfaceStatusHint === "success"
          ? "success"
          : surfaceStatusHint === "accepted"
            ? "accepted"
            : surfaceStatusHint === "partial"
              ? "partial"
              : surfaceStatusHint === "rejected"
                ? "rejected"
                : "error";
      const runtimeError = toRuntimeSurfaceError(finalizationStatus);
      const integrationError = toIntegrationError(runtimeError);

      const finalizedPayload: Record<string, unknown> = {
        completion_ingress_result_id: input.completion_ingress_result.ingress_result_id,
        reconciliation_id: input.reconciliation_result.reconciliation_id,
        completion_family: input.completion_ingress_result.completion_family,
        reconciliation_status: input.reconciliation_result.attempt_reconciliation.reconciled_status,
        completion_artifact_payload:
          input.completion_ingress_result.outcome.completion_envelope.artifact_payload
      };
      const completionArtifactMetadata: Record<string, unknown> = {
        artifact_id: input.completion_ingress_result.outcome.completion_envelope.artifact_metadata.artifact_id,
        artifact_kind: input.completion_ingress_result.outcome.completion_envelope.artifact_metadata.artifact_kind,
        produced_at: input.completion_ingress_result.outcome.completion_envelope.artifact_metadata.produced_at,
        ...(input.completion_ingress_result.outcome.completion_envelope.artifact_metadata.producer_label
          ? {
              producer_label:
                input.completion_ingress_result.outcome.completion_envelope.artifact_metadata.producer_label
            }
          : {}),
        ...(input.completion_ingress_result.outcome.completion_envelope.artifact_metadata.artifact_version
          ? {
              artifact_version:
                input.completion_ingress_result.outcome.completion_envelope.artifact_metadata.artifact_version
            }
          : {})
      };

      const finalizedSurfaceEnvelope = {
        request_id: input.reconciliation_result.request_id,
        operation_id: input.reconciliation_result.operation_id,
        outcome_family:
          finalizedOutcomeFamily === "read_path_finalized"
            ? "read_path"
            : finalizedOutcomeFamily === "pack_loop_finalized"
              ? "pack_loop"
              : finalizedOutcomeFamily === "write_path_finalized"
                ? "write_path"
                : finalizedOutcomeFamily === "handoff_finalized"
                  ? "handoff"
                  : "unknown",
        finalization_status: finalizationStatus,
        surface_status: surfaceStatusHint,
        finalized_payload: finalizedPayload,
        completion_artifact_metadata: completionArtifactMetadata,
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        ...(runtimeError ? { error: runtimeError } : {}),
        finalized_at: now
      } as const;

      const finalizedIntegrationEnvelope = finalizedIntegrationBuilder.build({
        linkage_id: `${input.reconciliation_result.reconciliation_id}:finalized-integration-linkage`,
        request_id: input.reconciliation_result.request_id,
        operation_id: input.reconciliation_result.operation_id,
        response_status: surfaceStatus,
        canonical_response: {
          request_id: input.reconciliation_result.request_id,
          operation_id: input.reconciliation_result.operation_id,
          status: surfaceStatus,
          result: finalizedPayload,
          warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: input.reconciliation_result.request_id,
            operation_id: input.reconciliation_result.operation_id,
            status: surfaceStatus,
            result: finalizedPayload,
            warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
            served_at: now
          },
          ...(integrationError ? { error: integrationError } : {})
        },
        ...(integrationError ? { linked_error: integrationError } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const finalizedAuditLinkage = finalizedAuditBuilder.build({
        linkage_id: `${input.reconciliation_result.reconciliation_id}:finalized-audit-linkage`,
        request_id: input.reconciliation_result.request_id,
        operation_id: input.reconciliation_result.operation_id,
        finalization_status: finalizationStatus,
        outcome_family: finalizedOutcomeFamily,
        ...(input.reconciliation_result.placeholder_outcome.attempt_id
          ? { attempt_id: input.reconciliation_result.placeholder_outcome.attempt_id }
          : {}),
        ...(input.reconciliation_result.outcome_family.contour_target
          ? { contour_target: input.reconciliation_result.outcome_family.contour_target }
          : {}),
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const statusMapping: FinalizationStatusMappingShape = {
        finalization_status: finalizationStatus,
        surface_status: surfaceStatus,
        outcome_family: finalizedOutcomeFamily
      };

      return {
        finalization_id: `${input.reconciliation_result.reconciliation_id}:finalization`,
        request_id: input.reconciliation_result.request_id,
        operation_id: input.reconciliation_result.operation_id,
        finalization_status: finalizationStatus,
        finalized_outcome_family: finalizedOutcomeFamily,
        ...(input.completion_ingress_result.status === "accepted_completion"
          ? {
              accepted_completion_linkage: {
                linkage_id: `${input.completion_ingress_result.ingress_result_id}:accepted-finalization-linkage`,
                completion_ingress_result_id: input.completion_ingress_result.ingress_result_id,
                reconciliation_id: input.reconciliation_result.reconciliation_id,
                request_id: input.reconciliation_result.request_id,
                operation_id: input.reconciliation_result.operation_id,
                completion_family: input.completion_ingress_result.completion_family,
                linked_at: now,
                warnings
              }
            }
          : {}),
        status_mapping: statusMapping,
        ...(finalizationStatus === "partial_finalized"
          ? {
              partial_finalization: {
                status: "partial_finalized",
                reason: "accepted completion linked to non-completed reconciliation placeholder",
                placeholder_families: toPlaceholderFamilies({ status: finalizationStatus, finalizationInput: input })
              }
            }
          : {}),
        finalized_surface_envelope: finalizedSurfaceEnvelope,
        finalized_integration_envelope: finalizedIntegrationEnvelope,
        finalized_audit_linkage: finalizedAuditLinkage,
        warnings,
        finalized_at: now
      };
    }
  };
};

export const createExecutionOutcomeFinalizationSummaryBuilder = (): ExecutionOutcomeFinalizationSummaryBuilder => {
  return {
    summarize(input: { finalization_results: ExecutionOutcomeFinalizationShape[] }): ExecutionOutcomeFinalizationSummaryShape {
      return {
        total: input.finalization_results.length,
        completed_finalized: input.finalization_results.filter((item) => item.finalization_status === "completed_finalized").length,
        partial_finalized: input.finalization_results.filter((item) => item.finalization_status === "partial_finalized").length,
        blocked_finalized: input.finalization_results.filter((item) => item.finalization_status === "blocked_finalized").length,
        deferred_finalized: input.finalization_results.filter((item) => item.finalization_status === "deferred_finalized").length,
        failed_finalized: input.finalization_results.filter((item) => item.finalization_status === "failed_finalized").length,
        incomplete_finalization: input.finalization_results.filter(
          (item) => item.finalization_status === "incomplete_finalization"
        ).length,
        warnings: input.finalization_results.flatMap((item) => item.warnings)
      };
    }
  };
};
