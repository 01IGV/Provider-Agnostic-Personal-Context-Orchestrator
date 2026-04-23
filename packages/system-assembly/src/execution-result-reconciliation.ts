import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createReconciledIntegrationResponseLinkageBuilder,
  type SurfaceErrorObject,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type { RuntimeSurfaceErrorShape, RuntimeSurfaceReconciledOutcomeShape } from "@orchestrator/runtime-surface";
import { createReconciledOutcomeAuditLinkageBuilder } from "@orchestrator/audit-eval";
import type {
  ExecutionResultReconciliationInputShape,
  ExecutionResultReconciliationShape,
  ExecutionResultReconciliationSummaryShape,
  ExecutionOutcomeFamilyShape,
  ReconciliationWarningShape
} from "./execution-result-reconciliation-types.js";
import {
  RECONCILIATION_STATUS_TO_SURFACE_STATUS,
  type ExecutionOutcomeFamily,
  type ReconciledOutcomeStatus
} from "./execution-result-reconciliation-vocabularies.js";

const toOutcomeFamily = (input: ExecutionResultReconciliationInputShape): ExecutionOutcomeFamily => {
  const target = input.handoff_result.gate_linkage.contour_target;
  if (target === "read_path") return "read_path_result";
  if (target === "pack_loop") return "pack_loop_result";
  if (target === "write_path") return "write_path_result";
  if (target === "handoff") return "handoff_result";
  return "unknown_result";
};

const toReconciledStatus = (input: ExecutionResultReconciliationInputShape): ReconciledOutcomeStatus => {
  if (input.handoff_result.status === "ready_contract") {
    return "ready_placeholder";
  }

  if (input.handoff_result.status === "blocked_contract") {
    return "blocked_placeholder";
  }

  if (input.handoff_result.status === "deferred_contract") {
    return "deferred_placeholder";
  }

  if (input.handoff_result.status === "missing_gate_result") {
    return "incomplete_outcome";
  }

  if (input.handoff_result.status === "unsupported_target") {
    return "failed_placeholder";
  }

  return "incomplete_outcome";
};

const toWarnings = (input: {
  reconciliationStatus: ReconciledOutcomeStatus;
  handoffInput: ExecutionResultReconciliationInputShape;
}): ReconciliationWarningShape[] => {
  return [
    ...(input.handoffInput.handoff_result.attempt
      ? []
      : [{ code: "attempt_missing", message: "execution handoff has no concrete attempt contract to reconcile" } as const]),
    ...(input.reconciliationStatus === "incomplete_outcome"
      ? [{ code: "handoff_result_incomplete", message: "handoff result is incomplete for strict reconciliation mapping" } as const]
      : []),
    ...(input.reconciliationStatus === "ready_placeholder" || input.reconciliationStatus === "completed_placeholder"
      ? [{ code: "placeholder_only", message: "reconciliation produced placeholder outcome pending future execution layer" } as const]
      : []),
    ...(input.handoffInput.handoff_result.gate_linkage.contour_target
      ? []
      : [{ code: "status_family_ambiguous", message: "missing contour target forced fallback to unknown outcome family" } as const]),
    { code: "integration_response_normalized", message: "integration response linkage normalized from execution handoff placeholder outcome" }
  ];
};

const toRuntimeSurfaceError = (
  status: ReconciledOutcomeStatus
): RuntimeSurfaceErrorShape | undefined => {
  if (status === "blocked_placeholder") {
    return {
      error_code: "boundary_preservation_warning",
      error_family: "internal_orchestration_failure",
      message: "execution reconciliation remains blocked at contract boundary",
      retryable: true
    };
  }

  if (status === "failed_placeholder" || status === "incomplete_outcome") {
    return {
      error_code: "internal_surface_failure",
      error_family: "internal_orchestration_failure",
      message: "execution reconciliation produced a failed or incomplete placeholder outcome",
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

export interface ExecutionResultReconciliationBuilder {
  reconcile(input: ExecutionResultReconciliationInputShape): ExecutionResultReconciliationShape;
}

export interface ExecutionResultReconciliationSummaryBuilder {
  summarize(input: { reconciled_results: ExecutionResultReconciliationShape[] }): ExecutionResultReconciliationSummaryShape;
}

export const createExecutionResultReconciliationBuilder = (): ExecutionResultReconciliationBuilder => {
  const integrationLinkageBuilder = createReconciledIntegrationResponseLinkageBuilder();
  const auditLinkageBuilder = createReconciledOutcomeAuditLinkageBuilder();

  return {
    reconcile(input: ExecutionResultReconciliationInputShape): ExecutionResultReconciliationShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const outcomeFamily = toOutcomeFamily(input);
      const reconciliationStatus = toReconciledStatus(input);
      const warnings = toWarnings({ reconciliationStatus, handoffInput: input });
      const runtimeError = toRuntimeSurfaceError(reconciliationStatus);
      const integrationError = toIntegrationError(runtimeError);
      const surfaceStatusHint = RECONCILIATION_STATUS_TO_SURFACE_STATUS[reconciliationStatus];
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

      const executionOutcomeFamily: ExecutionOutcomeFamilyShape = {
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        ...(input.handoff_result.gate_linkage.contour_target
          ? { contour_target: input.handoff_result.gate_linkage.contour_target }
          : {}),
        ...(input.handoff_result.placeholder_result
          ? { expected_result_kind: input.handoff_result.placeholder_result.expected_result_kind }
          : {}),
        outcome_family: outcomeFamily
      };

      const placeholderPayload: Record<string, unknown> = {
        handoff_result_id: input.handoff_result.handoff_result_id,
        handoff_status: input.handoff_result.status,
        ...(input.handoff_result.attempt ? { attempt_id: input.handoff_result.attempt.identifier.attempt_id } : {})
      };

      const runtimeSurfaceOutcome: RuntimeSurfaceReconciledOutcomeShape = {
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        outcome_family:
          outcomeFamily === "read_path_result"
            ? "read_path"
            : outcomeFamily === "pack_loop_result"
              ? "pack_loop"
              : outcomeFamily === "write_path_result"
                ? "write_path"
                : outcomeFamily === "handoff_result"
                  ? "handoff"
                  : "unknown",
        outcome_status: reconciliationStatus,
        surface_status_hint: surfaceStatusHint,
        normalized: true,
        placeholder_payload: placeholderPayload,
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        ...(runtimeError ? { error: runtimeError } : {}),
        produced_at: now
      };

      const integrationLinkage = integrationLinkageBuilder.build({
        linkage_id: `${input.handoff_result.handoff_result_id}:integration-reconciliation`,
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        response_status: surfaceStatus,
        canonical_response: {
          request_id: input.handoff_result.gate_linkage.request_id,
          operation_id: input.handoff_result.gate_linkage.operation_id,
          status: surfaceStatus,
          result: placeholderPayload,
          warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: input.handoff_result.gate_linkage.request_id,
            operation_id: input.handoff_result.gate_linkage.operation_id,
            status: surfaceStatus,
            result: placeholderPayload,
            warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
            served_at: now
          },
          ...(integrationError ? { error: integrationError } : {})
        },
        ...(integrationError ? { linked_error: integrationError } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const auditLinkage = auditLinkageBuilder.build({
        linkage_id: `${input.handoff_result.handoff_result_id}:audit-reconciliation`,
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        reconciled_status: reconciliationStatus,
        expected_result_kind: input.handoff_result.placeholder_result?.expected_result_kind ?? "unknown",
        ...(input.handoff_result.attempt ? { attempt_id: input.handoff_result.attempt.identifier.attempt_id } : {}),
        ...(input.handoff_result.gate_linkage.contour_target
          ? { contour_target: input.handoff_result.gate_linkage.contour_target }
          : {}),
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      return {
        reconciliation_id: `${input.handoff_result.handoff_result_id}:reconciliation`,
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        outcome_family: executionOutcomeFamily,
        attempt_reconciliation: {
          reconciliation_id: `${input.handoff_result.handoff_result_id}:attempt-reconciliation`,
          handoff_result_id: input.handoff_result.handoff_result_id,
          request_id: input.handoff_result.gate_linkage.request_id,
          operation_id: input.handoff_result.gate_linkage.operation_id,
          handoff_status: input.handoff_result.status,
          reconciled_status: reconciliationStatus,
          warnings
        },
        placeholder_outcome: {
          request_id: input.handoff_result.gate_linkage.request_id,
          operation_id: input.handoff_result.gate_linkage.operation_id,
          ...(input.handoff_result.attempt ? { attempt_id: input.handoff_result.attempt.identifier.attempt_id } : {}),
          reconciled_status: reconciliationStatus,
          ...(input.handoff_result.placeholder_result
            ? { expected_result_kind: input.handoff_result.placeholder_result.expected_result_kind }
            : {}),
          placeholder_payload: placeholderPayload
        },
        runtime_surface_result: {
          runtime_surface_outcome: runtimeSurfaceOutcome,
          surface_status: surfaceStatus,
          warnings
        },
        integration_response_linkage: {
          integration_response: integrationLinkage,
          warnings
        },
        audit_linkage: {
          audit_linkage: auditLinkage,
          warnings
        },
        warnings,
        reconciled_at: now
      };
    }
  };
};

export const createExecutionResultReconciliationSummaryBuilder = (): ExecutionResultReconciliationSummaryBuilder => {
  return {
    summarize(input: { reconciled_results: ExecutionResultReconciliationShape[] }): ExecutionResultReconciliationSummaryShape {
      const failedOrIncomplete = input.reconciled_results.filter((item) => {
        const status = item.attempt_reconciliation.reconciled_status;
        return status === "failed_placeholder" || status === "incomplete_outcome";
      }).length;

      return {
        total: input.reconciled_results.length,
        completed_placeholders: input.reconciled_results.filter(
          (item) => item.attempt_reconciliation.reconciled_status === "completed_placeholder"
        ).length,
        ready_placeholders: input.reconciled_results.filter(
          (item) => item.attempt_reconciliation.reconciled_status === "ready_placeholder"
        ).length,
        blocked_placeholders: input.reconciled_results.filter(
          (item) => item.attempt_reconciliation.reconciled_status === "blocked_placeholder"
        ).length,
        deferred_placeholders: input.reconciled_results.filter(
          (item) => item.attempt_reconciliation.reconciled_status === "deferred_placeholder"
        ).length,
        failed_or_incomplete: failedOrIncomplete,
        warnings: input.reconciled_results.flatMap((item) => item.warnings)
      };
    }
  };
};
