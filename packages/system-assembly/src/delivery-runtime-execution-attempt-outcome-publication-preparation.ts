import {
  createExecutionAttemptOutcomePublicationPreparationAuditLinkageBuilder,
  createExecutionAttemptOutcomePublicationPreparationTraceBuilder
} from "@orchestrator/audit-eval";
import { createExecutionAttemptOutcomePublicationPreparationLinkageBuilder } from "@orchestrator/integration-contracts";
import type {
  DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningShape,
  ExecutionAttemptOutcomePublicationPreparationFamilyMappingShape,
  ExecutionAttemptOutcomePublicationPreparationInputShape,
  ExecutionAttemptOutcomePublicationPreparationShape,
  ExecutionAttemptOutcomePublicationPreparationSummaryShape,
  NormalizedOutcomePublicationPreparationMappingShape
} from "./delivery-runtime-execution-attempt-outcome-publication-preparation-types.js";
import {
  DELIVERY_RUNTIME_NORMALIZED_OUTCOME_STATUS_TO_PUBLICATION_PREPARATION_STATUS,
  type DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily,
  type DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationResult,
  type DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus
} from "./delivery-runtime-execution-attempt-outcome-publication-preparation-vocabularies.js";
import type { NormalizedExecutionAttemptOutcomeShape } from "./delivery-runtime-execution-attempt-outcome-normalization-types.js";

type PublicationPreparationSurfaceStatus = "accepted" | "success" | "rejected" | "error";

const toPublicationPreparationFamily = (
  normalizedOutcome: NormalizedExecutionAttemptOutcomeShape
): DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily => {
  if (normalizedOutcome.normalized_outcome_family === "read_path_normalized_attempt_outcome") {
    return "read_path_outcome_publication_preparation";
  }
  if (normalizedOutcome.normalized_outcome_family === "pack_loop_normalized_attempt_outcome") {
    return "pack_loop_outcome_publication_preparation";
  }
  if (normalizedOutcome.normalized_outcome_family === "write_path_normalized_attempt_outcome") {
    return "write_path_outcome_publication_preparation";
  }
  if (normalizedOutcome.normalized_outcome_family === "handoff_normalized_attempt_outcome") {
    return "handoff_outcome_publication_preparation";
  }
  return "unknown_outcome_publication_preparation";
};

const toPublicationPreparationResult = (
  status: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus
): DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationResult => {
  if (status === "prepared_publication_preparation") return "publication_placeholder_ready";
  if (status === "queued_publication_preparation") return "publication_placeholder_queued";
  if (status === "blocked_publication_preparation") return "publication_placeholder_blocked";
  if (status === "deferred_publication_preparation") return "publication_placeholder_deferred";
  if (status === "not_dispatchable_publication_preparation") return "publication_placeholder_not_dispatchable";
  return "publication_placeholder_terminal";
};

const toSurfaceStatus = (
  status: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus
): PublicationPreparationSurfaceStatus => {
  if (status === "prepared_publication_preparation") return "success";
  if (status === "queued_publication_preparation" || status === "deferred_publication_preparation") return "accepted";
  if (status === "blocked_publication_preparation" || status === "not_dispatchable_publication_preparation") {
    return "rejected";
  }
  return "error";
};

const createFamilyMapping = (
  normalizedOutcome: NormalizedExecutionAttemptOutcomeShape
): ExecutionAttemptOutcomePublicationPreparationFamilyMappingShape => {
  return {
    normalized_outcome_family: normalizedOutcome.normalized_outcome_family,
    contour_target: normalizedOutcome.contour_target,
    publication_preparation_family: toPublicationPreparationFamily(normalizedOutcome)
  };
};

const createStatusMapping = (
  normalizedOutcome: NormalizedExecutionAttemptOutcomeShape
): NormalizedOutcomePublicationPreparationMappingShape => {
  const publicationPreparationStatus =
    DELIVERY_RUNTIME_NORMALIZED_OUTCOME_STATUS_TO_PUBLICATION_PREPARATION_STATUS[
      normalizedOutcome.normalized_outcome_status
    ];
  return {
    normalized_outcome_status: normalizedOutcome.normalized_outcome_status,
    lifecycle_state: normalizedOutcome.lifecycle_state,
    publication_preparation_status: publicationPreparationStatus,
    publication_preparation_result: toPublicationPreparationResult(publicationPreparationStatus),
    mapping_boundary: "normalized_outcome_to_publication_ready_placeholder"
  };
};

const createWarnings = (input: {
  normalizedOutcome: NormalizedExecutionAttemptOutcomeShape;
  publicationPreparationFamily: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily;
  publicationPreparationStatus: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus;
}): DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningShape[] => {
  return [
    ...(input.publicationPreparationFamily === "unknown_outcome_publication_preparation"
      ? [
          {
            code: "publication_preparation_family_ambiguous",
            message: "publication-preparation family resolved to unknown_outcome_publication_preparation"
          } as const
        ]
      : []),
    ...(input.publicationPreparationStatus.replace("_publication_preparation", "_outcome") !==
    input.normalizedOutcome.normalized_outcome_status
      ? [
          {
            code: "publication_preparation_status_mismatch",
            message: "publication-preparation status does not match normalized outcome status"
          } as const
        ]
      : []),
    {
      code: "publication_preparation_runtime_boundary_only",
      message: "publication-preparation is a contract-only placeholder and does not perform publication delivery"
    },
    {
      code: "publication_preparation_not_actual_dispatch_execution",
      message: "publication-preparation must not be interpreted as proof of actual dispatch execution"
    },
    {
      code: "publication_preparation_not_actual_publication_delivery",
      message: "publication-preparation must not be interpreted as proof of actual publication"
    },
    {
      code: "publication_preparation_not_actual_handler_result",
      message: "publication-preparation must not be interpreted as an actual handler result"
    },
    {
      code: "publication_preparation_not_actual_delivery_result",
      message: "publication-preparation must not be interpreted as delivery runtime output"
    },
    {
      code: "publication_preparation_not_provider_transport_result",
      message: "publication-preparation must not be interpreted as provider transport result"
    },
    {
      code: "publication_preparation_authority_context_placeholder_only",
      message: "authority context remains gateway/control-plane placeholder only"
    },
    {
      code: "publication_preparation_provenance_context_placeholder_only",
      message: "provenance context is carried only as a reference placeholder"
    },
    {
      code: "publication_preparation_delegation_context_placeholder_only",
      message: "delegation context is carried only as a reference placeholder"
    },
    {
      code: "publication_preparation_runtime_surface_envelope_emitted",
      message: "runtime-surface publication-preparation envelope emitted"
    },
    {
      code: "publication_preparation_integration_linkage_emitted",
      message: "integration publication-preparation linkage emitted"
    },
    {
      code: "publication_preparation_audit_linkage_emitted",
      message: "audit/eval publication-preparation linkage emitted"
    }
  ];
};

export interface ExecutionAttemptOutcomePublicationPreparationBuilder {
  prepare(input: ExecutionAttemptOutcomePublicationPreparationInputShape): ExecutionAttemptOutcomePublicationPreparationShape;
}

export interface ExecutionAttemptOutcomePublicationPreparationSummaryBuilder {
  summarize(input: {
    preparations: ExecutionAttemptOutcomePublicationPreparationShape[];
  }): ExecutionAttemptOutcomePublicationPreparationSummaryShape;
}

export const createExecutionAttemptOutcomePublicationPreparationBuilder =
  (): ExecutionAttemptOutcomePublicationPreparationBuilder => {
    const integrationBuilder = createExecutionAttemptOutcomePublicationPreparationLinkageBuilder();
    const auditTraceBuilder = createExecutionAttemptOutcomePublicationPreparationTraceBuilder();
    const auditLinkageBuilder = createExecutionAttemptOutcomePublicationPreparationAuditLinkageBuilder();

    return {
      prepare(
        input: ExecutionAttemptOutcomePublicationPreparationInputShape
      ): ExecutionAttemptOutcomePublicationPreparationShape {
        const now = input.now ?? ((new Date().toISOString() as unknown) as NormalizedExecutionAttemptOutcomeShape["created_at"]);
        const normalizedOutcome = input.normalized_outcome;
        const publicationPreparationId = `${normalizedOutcome.normalized_outcome_id}:publication-preparation`;
        const familyMapping = createFamilyMapping(normalizedOutcome);
        const statusMapping = createStatusMapping(normalizedOutcome);
        const publicationPreparationFamily = familyMapping.publication_preparation_family;
        const publicationPreparationStatus = statusMapping.publication_preparation_status;
        const publicationPreparationResult = statusMapping.publication_preparation_result;
        const warnings = createWarnings({
          normalizedOutcome,
          publicationPreparationFamily,
          publicationPreparationStatus
        });
        const surfaceStatus = toSurfaceStatus(publicationPreparationStatus);
        const publicationReadyPayload: Record<string, unknown> = {
          publication_preparation_id: publicationPreparationId,
          normalized_outcome_id: normalizedOutcome.normalized_outcome_id,
          attempt_id: normalizedOutcome.attempt_id,
          runtime_handoff_id: normalizedOutcome.runtime_handoff_id,
          publication_preparation_family: publicationPreparationFamily,
          publication_preparation_status: publicationPreparationStatus,
          publication_preparation_result: publicationPreparationResult,
          normalized_outcome_family: normalizedOutcome.normalized_outcome_family,
          normalized_outcome_status: normalizedOutcome.normalized_outcome_status,
          lifecycle_state: normalizedOutcome.lifecycle_state,
          contour_target: normalizedOutcome.contour_target,
          publication_ready_placeholder: true,
          actual_dispatch_execution: false,
          actual_publication_delivery: false,
          actual_handler_result: false,
          actual_delivery_result: false,
          provider_transport_result: false
        };
        const publicationBoundary = {
          publication_preparation_id: publicationPreparationId,
          normalized_outcome_id: normalizedOutcome.normalized_outcome_id,
          attempt_id: normalizedOutcome.attempt_id,
          boundary_status: "publication_preparation_contract_only_future_publication_boundary" as const,
          allowed_now: {
            normalized_outcome_to_publication_preparation_mapping: true as const,
            runtime_surface_publication_preparation_envelope_emission: true as const,
            integration_publication_preparation_linkage_emission: true as const,
            audit_eval_publication_preparation_linkage_emission: true as const
          },
          disallowed_now: {
            actual_dispatch_execution: true as const,
            actual_publication_delivery: true as const,
            handler_invocation: true as const,
            delivery_runtime_execution: true as const,
            transport_delivery: true as const,
            provider_sdk_execution: true as const,
            concrete_persistence_write: true as const,
            canonical_context_direct_access: true as const,
            canonical_context_direct_writeback: true as const
          }
        };
        const runtimeSurfacePublicationPreparationEnvelope = {
          publication_preparation_id: publicationPreparationId,
          normalized_outcome_id: normalizedOutcome.normalized_outcome_id,
          attempt_id: normalizedOutcome.attempt_id,
          request_id: normalizedOutcome.request_id,
          operation_id: normalizedOutcome.operation_id,
          precheck_id: normalizedOutcome.precheck_id,
          dispatch_intent_id: normalizedOutcome.dispatch_intent_id,
          runtime_handoff_id: normalizedOutcome.runtime_handoff_id,
          publication_preparation_family: publicationPreparationFamily,
          publication_preparation_status: publicationPreparationStatus,
          normalized_outcome_family: normalizedOutcome.normalized_outcome_family,
          normalized_outcome_status: normalizedOutcome.normalized_outcome_status,
          lifecycle_state: normalizedOutcome.lifecycle_state,
          contour_target: normalizedOutcome.contour_target,
          runtime_surface_status: surfaceStatus,
          authority_context_placeholder: {
            ...(normalizedOutcome.authority_context_placeholder.authority_context_id
              ? { authority_context_id: normalizedOutcome.authority_context_placeholder.authority_context_id }
              : {}),
            ...(normalizedOutcome.authority_context_placeholder.subject_identity_ref
              ? { subject_identity_ref: normalizedOutcome.authority_context_placeholder.subject_identity_ref }
              : {}),
            ...(normalizedOutcome.authority_context_placeholder.delegated_authority_ref
              ? { delegated_authority_ref: normalizedOutcome.authority_context_placeholder.delegated_authority_ref }
              : {}),
            ...(normalizedOutcome.authority_context_placeholder.provenance_chain_ref
              ? { provenance_chain_ref: normalizedOutcome.authority_context_placeholder.provenance_chain_ref }
              : {}),
            control_plane_boundary: normalizedOutcome.authority_context_placeholder.control_plane_boundary,
            runtime_boundary: normalizedOutcome.authority_context_placeholder.runtime_boundary
          },
          publication_boundary: {
            publication_preparation_boundary_status: "publication_ready_placeholder_only" as const,
            actual_dispatch_execution_allowed_now: false as const,
            actual_publication_delivery_allowed_now: false as const,
            handler_invocation_allowed_now: false as const,
            delivery_runtime_allowed_now: false as const,
            transport_delivery_allowed_now: false as const,
            provider_sdk_call_allowed_now: false as const,
            canonical_context_access_allowed_now: false as const,
            canonical_writeback_allowed_now: false as const
          },
          publication_ready_payload: publicationReadyPayload,
          warnings,
          emitted_at: now
        };
        const integrationPublicationPreparationLinkage = integrationBuilder.build({
          linkage_id: `${publicationPreparationId}:integration-linkage`,
          publication_preparation_id: publicationPreparationId,
          normalized_outcome_id: normalizedOutcome.normalized_outcome_id,
          request_id: normalizedOutcome.request_id,
          operation_id: normalizedOutcome.operation_id,
          precheck_id: normalizedOutcome.precheck_id,
          dispatch_intent_id: normalizedOutcome.dispatch_intent_id,
          runtime_handoff_id: normalizedOutcome.runtime_handoff_id,
          attempt_id: normalizedOutcome.attempt_id,
          publication_preparation_family: publicationPreparationFamily,
          publication_preparation_status: publicationPreparationStatus,
          normalized_outcome_family: normalizedOutcome.normalized_outcome_family,
          normalized_outcome_status: normalizedOutcome.normalized_outcome_status,
          lifecycle_state: normalizedOutcome.lifecycle_state,
          contour_target: normalizedOutcome.contour_target,
          integration_response_status: surfaceStatus,
          canonical_response: {
            request_id: normalizedOutcome.request_id,
            operation_id: normalizedOutcome.operation_id,
            status: surfaceStatus,
            result: publicationReadyPayload,
            warnings,
            served_at: now
          },
          typed_surface_response: {
            envelope: {
              request_id: normalizedOutcome.request_id,
              operation_id: normalizedOutcome.operation_id,
              status: surfaceStatus,
              result: publicationReadyPayload,
              warnings,
              served_at: now
            }
          },
          warnings,
          now
        });
        const publicationPreparationTrace = auditTraceBuilder.build({
          trace_id: `${publicationPreparationId}:trace`,
          publication_preparation_id: publicationPreparationId,
          normalized_outcome_id: normalizedOutcome.normalized_outcome_id,
          request_id: normalizedOutcome.request_id,
          operation_id: normalizedOutcome.operation_id,
          runtime_handoff_id: normalizedOutcome.runtime_handoff_id,
          attempt_id: normalizedOutcome.attempt_id,
          publication_preparation_family: publicationPreparationFamily,
          publication_preparation_status: publicationPreparationStatus,
          normalized_outcome_family: normalizedOutcome.normalized_outcome_family,
          normalized_outcome_status: normalizedOutcome.normalized_outcome_status,
          lifecycle_state: normalizedOutcome.lifecycle_state,
          contour_target: normalizedOutcome.contour_target,
          linked_normalized_outcome_trace_id: normalizedOutcome.outcome_trace.trace_id,
          warnings,
          now
        });
        const publicationPreparationAuditLinkage = auditLinkageBuilder.build({
          linkage_id: `${publicationPreparationId}:audit-linkage`,
          publication_preparation_id: publicationPreparationId,
          normalized_outcome_id: normalizedOutcome.normalized_outcome_id,
          attempt_id: normalizedOutcome.attempt_id,
          runtime_handoff_id: normalizedOutcome.runtime_handoff_id,
          publication_preparation_status: publicationPreparationStatus,
          normalized_outcome_status: normalizedOutcome.normalized_outcome_status,
          ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
          ...(normalizedOutcome.authority_context_placeholder.provenance_chain_ref
            ? { provenance_chain_ref: normalizedOutcome.authority_context_placeholder.provenance_chain_ref }
            : {}),
          warnings,
          now
        });

        return {
          publication_preparation_id: publicationPreparationId,
          normalized_outcome_id: normalizedOutcome.normalized_outcome_id,
          attempt_id: normalizedOutcome.attempt_id,
          request_id: normalizedOutcome.request_id,
          operation_id: normalizedOutcome.operation_id,
          precheck_id: normalizedOutcome.precheck_id,
          dispatch_intent_id: normalizedOutcome.dispatch_intent_id,
          runtime_handoff_id: normalizedOutcome.runtime_handoff_id,
          publication_preparation_family: publicationPreparationFamily,
          publication_preparation_status: publicationPreparationStatus,
          publication_preparation_result: publicationPreparationResult,
          normalized_outcome_family: normalizedOutcome.normalized_outcome_family,
          normalized_outcome_status: normalizedOutcome.normalized_outcome_status,
          lifecycle_state: normalizedOutcome.lifecycle_state,
          contour_target: normalizedOutcome.contour_target,
          family_mapping: familyMapping,
          status_mapping: statusMapping,
          authority_context_placeholder: normalizedOutcome.authority_context_placeholder,
          publication_boundary: publicationBoundary,
          runtime_surface_publication_preparation_envelope: runtimeSurfacePublicationPreparationEnvelope,
          integration_publication_preparation_linkage: integrationPublicationPreparationLinkage,
          publication_preparation_trace: publicationPreparationTrace,
          publication_preparation_audit_linkage: publicationPreparationAuditLinkage,
          warnings,
          created_at: now
        };
      }
    };
  };

export const createExecutionAttemptOutcomePublicationPreparationSummaryBuilder =
  (): ExecutionAttemptOutcomePublicationPreparationSummaryBuilder => {
    return {
      summarize(input: {
        preparations: ExecutionAttemptOutcomePublicationPreparationShape[];
      }): ExecutionAttemptOutcomePublicationPreparationSummaryShape {
        return {
          total: input.preparations.length,
          queued: input.preparations.filter(
            (item) => item.publication_preparation_status === "queued_publication_preparation"
          ).length,
          prepared: input.preparations.filter(
            (item) => item.publication_preparation_status === "prepared_publication_preparation"
          ).length,
          blocked: input.preparations.filter(
            (item) => item.publication_preparation_status === "blocked_publication_preparation"
          ).length,
          deferred: input.preparations.filter(
            (item) => item.publication_preparation_status === "deferred_publication_preparation"
          ).length,
          aborted: input.preparations.filter(
            (item) => item.publication_preparation_status === "aborted_publication_preparation"
          ).length,
          expired: input.preparations.filter(
            (item) => item.publication_preparation_status === "expired_publication_preparation"
          ).length,
          cancelled: input.preparations.filter(
            (item) => item.publication_preparation_status === "cancelled_publication_preparation"
          ).length,
          not_dispatchable: input.preparations.filter(
            (item) => item.publication_preparation_status === "not_dispatchable_publication_preparation"
          ).length,
          by_publication_preparation_family: {
            read_path_outcome_publication_preparation: input.preparations.filter(
              (item) => item.publication_preparation_family === "read_path_outcome_publication_preparation"
            ).length,
            pack_loop_outcome_publication_preparation: input.preparations.filter(
              (item) => item.publication_preparation_family === "pack_loop_outcome_publication_preparation"
            ).length,
            write_path_outcome_publication_preparation: input.preparations.filter(
              (item) => item.publication_preparation_family === "write_path_outcome_publication_preparation"
            ).length,
            handoff_outcome_publication_preparation: input.preparations.filter(
              (item) => item.publication_preparation_family === "handoff_outcome_publication_preparation"
            ).length,
            unknown_outcome_publication_preparation: input.preparations.filter(
              (item) => item.publication_preparation_family === "unknown_outcome_publication_preparation"
            ).length
          },
          warnings: input.preparations.flatMap((item) => item.warnings)
        };
      }
    };
  };
