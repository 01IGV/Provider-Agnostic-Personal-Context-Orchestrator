import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createPublicationEgressResponseLinkageBuilder,
  type SurfaceErrorObject,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type { RuntimeSurfaceErrorShape } from "@orchestrator/runtime-surface";
import { createPublicationOutcomeAuditLinkageBuilder } from "@orchestrator/audit-eval";
import type {
  ExecutionOutcomePublicationInputShape,
  ExecutionOutcomePublicationShape,
  ExecutionOutcomePublicationSummaryShape,
  ExecutionPublicationWarningShape,
  PublicationStatusMappingShape
} from "./execution-outcome-publication-types.js";
import {
  PUBLICATION_STATUS_TO_SURFACE_STATUS,
  type ExecutionPublicationOutcomeFamily,
  type ExecutionPublicationStatus
} from "./execution-outcome-publication-vocabularies.js";

const toPublicationFamily = (input: ExecutionOutcomePublicationInputShape): ExecutionPublicationOutcomeFamily => {
  const family = input.finalization_result.finalized_outcome_family;
  if (family === "read_path_finalized") return "read_path_publication";
  if (family === "pack_loop_finalized") return "pack_loop_publication";
  if (family === "write_path_finalized") return "write_path_publication";
  if (family === "handoff_finalized") return "handoff_publication";
  return "unknown_publication";
};

const toPublicationStatus = (input: ExecutionOutcomePublicationInputShape): ExecutionPublicationStatus => {
  const status = input.finalization_result.finalization_status;
  if (status === "completed_finalized") return "publication_ready";
  if (status === "blocked_finalized") return "publication_blocked";
  if (status === "deferred_finalized") return "publication_deferred";
  if (status === "partial_finalized") return "publication_partial";
  if (status === "incomplete_finalization") return "publication_incomplete";
  if (status === "failed_finalized") return "publication_failed";
  return "publication_incomplete";
};

const buildWarnings = (input: {
  publicationStatus: ExecutionPublicationStatus;
  publicationInput: ExecutionOutcomePublicationInputShape;
}): ExecutionPublicationWarningShape[] => {
  return [
    ...(input.publicationInput.finalization_result.finalization_status === "completed_finalized"
      ? []
      : [
          {
            code: "finalized_status_not_ready_for_publication",
            message: "finalized outcome status requires non-ready publication contract"
          } as const
        ]),
    ...(input.publicationInput.finalization_result.finalized_outcome_family === "unknown_finalized"
      ? [{ code: "publication_family_ambiguous", message: "publication family resolved to unknown_publication" } as const]
      : []),
    ...(input.publicationStatus === "publication_incomplete" || input.publicationStatus === "publication_failed"
      ? [{ code: "publication_incomplete", message: "publication contract produced incomplete or failed egress envelope" } as const]
      : []),
    ...(input.publicationStatus === "publication_blocked"
      ? [{ code: "publication_blocked", message: "publication contract is blocked and cannot be delivered by future handlers" } as const]
      : []),
    ...(input.publicationStatus === "publication_deferred"
      ? [{ code: "publication_deferred", message: "publication contract is deferred pending future delivery window" } as const]
      : []),
    { code: "delivery_ready_surface_envelope_emitted", message: "delivery-ready surface envelope contract emitted" },
    { code: "integration_egress_envelope_emitted", message: "integration-ready egress envelope contract emitted" }
  ];
};

const toRuntimeSurfaceError = (
  status: ExecutionPublicationStatus
): RuntimeSurfaceErrorShape | undefined => {
  if (status === "publication_blocked") {
    return {
      error_code: "boundary_preservation_warning",
      error_family: "internal_orchestration_failure",
      message: "publication contract is blocked at delivery boundary",
      retryable: true
    };
  }

  if (status === "publication_failed" || status === "publication_incomplete") {
    return {
      error_code: "internal_surface_failure",
      error_family: "internal_orchestration_failure",
      message: "publication contract is incomplete or failed for delivery readiness",
      retryable: true
    };
  }

  return undefined;
};

const toIntegrationError = (runtimeError?: RuntimeSurfaceErrorShape): SurfaceErrorObject | undefined => {
  if (!runtimeError) return undefined;

  return {
    error_code: runtimeError.error_code === "boundary_preservation_warning" ? "transient_failure" : "internal_failure",
    error_family: runtimeError.error_family,
    message: runtimeError.message,
    retryable: runtimeError.retryable,
    ...(runtimeError.details ? { details: runtimeError.details } : {})
  };
};

export interface ExecutionOutcomePublicationBuilder {
  publish(input: ExecutionOutcomePublicationInputShape): ExecutionOutcomePublicationShape;
}

export interface ExecutionOutcomePublicationSummaryBuilder {
  summarize(input: { publication_results: ExecutionOutcomePublicationShape[] }): ExecutionOutcomePublicationSummaryShape;
}

export const createExecutionOutcomePublicationBuilder = (): ExecutionOutcomePublicationBuilder => {
  const egressBuilder = createPublicationEgressResponseLinkageBuilder();
  const auditBuilder = createPublicationOutcomeAuditLinkageBuilder();

  return {
    publish(input: ExecutionOutcomePublicationInputShape): ExecutionOutcomePublicationShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const publicationFamily = toPublicationFamily(input);
      const publicationStatus = toPublicationStatus(input);
      const warnings = buildWarnings({ publicationStatus, publicationInput: input });
      const surfaceStatusHint = PUBLICATION_STATUS_TO_SURFACE_STATUS[publicationStatus];
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
      const runtimeError = toRuntimeSurfaceError(publicationStatus);
      const integrationError = toIntegrationError(runtimeError);

      const deliveryPayload: Record<string, unknown> = {
        finalization_id: input.finalization_result.finalization_id,
        finalization_status: input.finalization_result.finalization_status,
        finalized_outcome_family: input.finalization_result.finalized_outcome_family,
        finalized_payload: input.finalization_result.finalized_surface_envelope.finalized_payload
      };

      const deliveryReadySurfaceEnvelope = {
        request_id: input.finalization_result.request_id,
        operation_id: input.finalization_result.operation_id,
        publication_family: publicationFamily,
        publication_status: publicationStatus,
        delivery_status_hint: surfaceStatusHint,
        delivery_payload: deliveryPayload,
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        ...(runtimeError ? { error: runtimeError } : {}),
        prepared_at: now
      } as const;

      const integrationReadyEgressEnvelope = egressBuilder.build({
        linkage_id: `${input.finalization_result.finalization_id}:publication-egress-linkage`,
        request_id: input.finalization_result.request_id,
        operation_id: input.finalization_result.operation_id,
        egress_status: surfaceStatus,
        canonical_response: {
          request_id: input.finalization_result.request_id,
          operation_id: input.finalization_result.operation_id,
          status: surfaceStatus,
          result: deliveryPayload,
          warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: input.finalization_result.request_id,
            operation_id: input.finalization_result.operation_id,
            status: surfaceStatus,
            result: deliveryPayload,
            warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
            served_at: now
          },
          ...(integrationError ? { error: integrationError } : {})
        },
        ...(integrationError ? { linked_error: integrationError } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const publicationAuditLinkage = auditBuilder.build({
        linkage_id: `${input.finalization_result.finalization_id}:publication-audit-linkage`,
        request_id: input.finalization_result.request_id,
        operation_id: input.finalization_result.operation_id,
        publication_status: publicationStatus,
        publication_family: publicationFamily,
        ...(input.finalization_result.finalized_audit_linkage.attempt_id
          ? { attempt_id: input.finalization_result.finalized_audit_linkage.attempt_id }
          : {}),
        ...(input.finalization_result.finalized_audit_linkage.contour_target
          ? { contour_target: input.finalization_result.finalized_audit_linkage.contour_target }
          : {}),
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const statusMapping: PublicationStatusMappingShape = {
        publication_status: publicationStatus,
        surface_status: surfaceStatus,
        publication_family: publicationFamily
      };

      const blockedPublication =
        publicationStatus === "publication_blocked"
          ? {
              status: "publication_blocked" as const,
              reason: "finalization resulted in blocked publication contract",
              payload: deliveryPayload
            }
          : undefined;

      const deferredPublication =
        publicationStatus === "publication_deferred"
          ? {
              status: "publication_deferred" as const,
              reason: "finalization resulted in deferred publication contract",
              payload: deliveryPayload
            }
          : undefined;

      const partialOrIncompletePublication =
        publicationStatus === "publication_partial" || publicationStatus === "publication_incomplete"
          ? {
              status: publicationStatus,
              reason:
                publicationStatus === "publication_partial"
                  ? "finalization produced partial publication contract"
                  : "finalization produced incomplete publication contract",
              payload: deliveryPayload
            }
          : undefined;

      return {
        publication_id: `${input.finalization_result.finalization_id}:publication`,
        request_id: input.finalization_result.request_id,
        operation_id: input.finalization_result.operation_id,
        publication_family: publicationFamily,
        publication_status: publicationStatus,
        finalized_linkage: {
          linkage_id: `${input.finalization_result.finalization_id}:finalization-publication-linkage`,
          finalization_id: input.finalization_result.finalization_id,
          request_id: input.finalization_result.request_id,
          operation_id: input.finalization_result.operation_id,
          finalized_outcome_family: input.finalization_result.finalized_outcome_family,
          publication_family: publicationFamily,
          linked_at: now,
          warnings
        },
        status_mapping: statusMapping,
        ...(blockedPublication ? { blocked_publication: blockedPublication } : {}),
        ...(deferredPublication ? { deferred_publication: deferredPublication } : {}),
        ...(partialOrIncompletePublication
          ? { partial_or_incomplete_publication: partialOrIncompletePublication }
          : {}),
        delivery_ready_surface_envelope: deliveryReadySurfaceEnvelope,
        integration_ready_egress_envelope: integrationReadyEgressEnvelope,
        publication_audit_linkage: publicationAuditLinkage,
        warnings,
        prepared_at: now
      };
    }
  };
};

export const createExecutionOutcomePublicationSummaryBuilder = (): ExecutionOutcomePublicationSummaryBuilder => {
  return {
    summarize(input: { publication_results: ExecutionOutcomePublicationShape[] }): ExecutionOutcomePublicationSummaryShape {
      return {
        total: input.publication_results.length,
        publication_ready: input.publication_results.filter((item) => item.publication_status === "publication_ready").length,
        publication_blocked: input.publication_results.filter((item) => item.publication_status === "publication_blocked").length,
        publication_deferred: input.publication_results.filter((item) => item.publication_status === "publication_deferred").length,
        publication_partial: input.publication_results.filter((item) => item.publication_status === "publication_partial").length,
        publication_incomplete: input.publication_results.filter((item) => item.publication_status === "publication_incomplete").length,
        publication_failed: input.publication_results.filter((item) => item.publication_status === "publication_failed").length,
        warnings: input.publication_results.flatMap((item) => item.warnings)
      };
    }
  };
};
