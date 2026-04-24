import {
  createPublicationDispatchReadinessAuditLinkageBuilder,
  createPublicationDispatchReadinessTraceBuilder
} from "@orchestrator/audit-eval";
import { createPublicationDispatchReadinessLinkageBuilder } from "@orchestrator/integration-contracts";
import type {
  PublicationDispatchReadinessFamilyMappingShape,
  PublicationDispatchReadinessInputShape,
  PublicationDispatchReadinessShape,
  PublicationDispatchReadinessSummaryShape,
  PublicationDispatchReadinessWarningShape,
  PublicationPreparationDispatchReadinessMappingShape
} from "./publication-preparation-to-dispatch-readiness-types.js";
import {
  PUBLICATION_PREPARATION_STATUS_TO_DISPATCH_READINESS_STATUS,
  type PublicationDispatchReadinessFamily,
  type PublicationDispatchReadinessResult,
  type PublicationDispatchReadinessStatus
} from "./publication-preparation-to-dispatch-readiness-vocabularies.js";
import type { ExecutionAttemptOutcomePublicationPreparationShape } from "./delivery-runtime-execution-attempt-outcome-publication-preparation-types.js";

type DispatchReadinessSurfaceStatus = "accepted" | "success" | "rejected" | "error";

const toDispatchReadinessFamily = (
  publicationPreparation: ExecutionAttemptOutcomePublicationPreparationShape
): PublicationDispatchReadinessFamily => {
  if (publicationPreparation.publication_preparation_family === "read_path_outcome_publication_preparation") {
    return "read_path_publication_dispatch_readiness";
  }
  if (publicationPreparation.publication_preparation_family === "pack_loop_outcome_publication_preparation") {
    return "pack_loop_publication_dispatch_readiness";
  }
  if (publicationPreparation.publication_preparation_family === "write_path_outcome_publication_preparation") {
    return "write_path_publication_dispatch_readiness";
  }
  if (publicationPreparation.publication_preparation_family === "handoff_outcome_publication_preparation") {
    return "handoff_publication_dispatch_readiness";
  }
  return "unknown_publication_dispatch_readiness";
};

const toDispatchReadinessResult = (
  status: PublicationDispatchReadinessStatus
): PublicationDispatchReadinessResult => {
  if (status === "prepared_dispatch_readiness") return "dispatch_placeholder_ready";
  if (status === "queued_dispatch_readiness") return "dispatch_placeholder_queued";
  if (status === "blocked_dispatch_readiness") return "dispatch_placeholder_blocked";
  if (status === "deferred_dispatch_readiness") return "dispatch_placeholder_deferred";
  if (status === "not_dispatchable_dispatch_readiness") return "dispatch_placeholder_not_dispatchable";
  return "dispatch_placeholder_terminal";
};

const toSurfaceStatus = (status: PublicationDispatchReadinessStatus): DispatchReadinessSurfaceStatus => {
  if (status === "prepared_dispatch_readiness") return "success";
  if (status === "queued_dispatch_readiness" || status === "deferred_dispatch_readiness") return "accepted";
  if (status === "blocked_dispatch_readiness" || status === "not_dispatchable_dispatch_readiness") {
    return "rejected";
  }
  return "error";
};

const createFamilyMapping = (
  publicationPreparation: ExecutionAttemptOutcomePublicationPreparationShape
): PublicationDispatchReadinessFamilyMappingShape => {
  return {
    publication_preparation_family: publicationPreparation.publication_preparation_family,
    contour_target: publicationPreparation.contour_target,
    dispatch_readiness_family: toDispatchReadinessFamily(publicationPreparation)
  };
};

const createStatusMapping = (
  publicationPreparation: ExecutionAttemptOutcomePublicationPreparationShape
): PublicationPreparationDispatchReadinessMappingShape => {
  const dispatchReadinessStatus =
    PUBLICATION_PREPARATION_STATUS_TO_DISPATCH_READINESS_STATUS[
      publicationPreparation.publication_preparation_status
    ];
  return {
    publication_preparation_status: publicationPreparation.publication_preparation_status,
    normalized_outcome_status: publicationPreparation.normalized_outcome_status,
    lifecycle_state: publicationPreparation.lifecycle_state,
    dispatch_readiness_status: dispatchReadinessStatus,
    dispatch_readiness_result: toDispatchReadinessResult(dispatchReadinessStatus),
    mapping_boundary: "publication_ready_placeholder_to_dispatch_readiness_placeholder"
  };
};

const createWarnings = (input: {
  publicationPreparation: ExecutionAttemptOutcomePublicationPreparationShape;
  dispatchReadinessFamily: PublicationDispatchReadinessFamily;
  dispatchReadinessStatus: PublicationDispatchReadinessStatus;
}): PublicationDispatchReadinessWarningShape[] => {
  return [
    ...(input.dispatchReadinessFamily === "unknown_publication_dispatch_readiness"
      ? [
          {
            code: "dispatch_readiness_family_ambiguous",
            message: "dispatch-readiness family resolved to unknown_publication_dispatch_readiness"
          } as const
        ]
      : []),
    ...(input.dispatchReadinessStatus.replace("_dispatch_readiness", "_publication_preparation") !==
    input.publicationPreparation.publication_preparation_status
      ? [
          {
            code: "dispatch_readiness_status_mismatch",
            message: "dispatch-readiness status does not match publication-preparation status"
          } as const
        ]
      : []),
    {
      code: "dispatch_readiness_runtime_boundary_only",
      message: "dispatch-readiness is a contract-only placeholder and does not perform dispatch execution"
    },
    {
      code: "dispatch_readiness_not_actual_dispatch_execution",
      message: "dispatch-readiness must not be interpreted as proof of actual dispatch"
    },
    {
      code: "dispatch_readiness_not_actual_publication_delivery",
      message: "dispatch-readiness must not be interpreted as proof of actual publication delivery"
    },
    {
      code: "dispatch_readiness_not_actual_handler_result",
      message: "dispatch-readiness must not be interpreted as an actual handler result"
    },
    {
      code: "dispatch_readiness_not_actual_delivery_result",
      message: "dispatch-readiness must not be interpreted as delivery runtime output"
    },
    {
      code: "dispatch_readiness_not_provider_transport_result",
      message: "dispatch-readiness must not be interpreted as provider transport result"
    },
    {
      code: "dispatch_readiness_authority_context_placeholder_only",
      message: "authority context remains gateway/control-plane placeholder only"
    },
    {
      code: "dispatch_readiness_provenance_context_placeholder_only",
      message: "provenance context is carried only as a reference placeholder"
    },
    {
      code: "dispatch_readiness_delegation_context_placeholder_only",
      message: "delegation context is carried only as a reference placeholder"
    },
    {
      code: "dispatch_readiness_runtime_surface_envelope_emitted",
      message: "runtime-surface dispatch-readiness envelope emitted"
    },
    {
      code: "dispatch_readiness_integration_linkage_emitted",
      message: "integration dispatch-readiness linkage emitted"
    },
    {
      code: "dispatch_readiness_audit_linkage_emitted",
      message: "audit/eval dispatch-readiness linkage emitted"
    }
  ];
};

export interface PublicationDispatchReadinessBuilder {
  prepare(input: PublicationDispatchReadinessInputShape): PublicationDispatchReadinessShape;
}

export interface PublicationDispatchReadinessSummaryBuilder {
  summarize(input: { readiness: PublicationDispatchReadinessShape[] }): PublicationDispatchReadinessSummaryShape;
}

export const createPublicationDispatchReadinessBuilder = (): PublicationDispatchReadinessBuilder => {
  const integrationBuilder = createPublicationDispatchReadinessLinkageBuilder();
  const auditTraceBuilder = createPublicationDispatchReadinessTraceBuilder();
  const auditLinkageBuilder = createPublicationDispatchReadinessAuditLinkageBuilder();

  return {
    prepare(input: PublicationDispatchReadinessInputShape): PublicationDispatchReadinessShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as ExecutionAttemptOutcomePublicationPreparationShape["created_at"]);
      const publicationPreparation = input.publication_preparation;
      const dispatchReadinessId = `${publicationPreparation.publication_preparation_id}:dispatch-readiness`;
      const familyMapping = createFamilyMapping(publicationPreparation);
      const statusMapping = createStatusMapping(publicationPreparation);
      const dispatchReadinessFamily = familyMapping.dispatch_readiness_family;
      const dispatchReadinessStatus = statusMapping.dispatch_readiness_status;
      const dispatchReadinessResult = statusMapping.dispatch_readiness_result;
      const warnings = createWarnings({
        publicationPreparation,
        dispatchReadinessFamily,
        dispatchReadinessStatus
      });
      const surfaceStatus = toSurfaceStatus(dispatchReadinessStatus);
      const dispatchReadinessPayload: Record<string, unknown> = {
        dispatch_readiness_id: dispatchReadinessId,
        publication_preparation_id: publicationPreparation.publication_preparation_id,
        normalized_outcome_id: publicationPreparation.normalized_outcome_id,
        attempt_id: publicationPreparation.attempt_id,
        runtime_handoff_id: publicationPreparation.runtime_handoff_id,
        dispatch_readiness_family: dispatchReadinessFamily,
        dispatch_readiness_status: dispatchReadinessStatus,
        dispatch_readiness_result: dispatchReadinessResult,
        publication_preparation_family: publicationPreparation.publication_preparation_family,
        publication_preparation_status: publicationPreparation.publication_preparation_status,
        normalized_outcome_family: publicationPreparation.normalized_outcome_family,
        normalized_outcome_status: publicationPreparation.normalized_outcome_status,
        lifecycle_state: publicationPreparation.lifecycle_state,
        contour_target: publicationPreparation.contour_target,
        dispatch_ready_placeholder: true,
        actual_dispatch_execution: false,
        actual_publication_delivery: false,
        actual_handler_result: false,
        actual_delivery_result: false,
        provider_transport_result: false
      };
      const dispatchReadinessBoundary = {
        dispatch_readiness_id: dispatchReadinessId,
        publication_preparation_id: publicationPreparation.publication_preparation_id,
        normalized_outcome_id: publicationPreparation.normalized_outcome_id,
        attempt_id: publicationPreparation.attempt_id,
        boundary_status: "dispatch_readiness_contract_only_future_dispatch_boundary" as const,
        allowed_now: {
          publication_preparation_to_dispatch_readiness_mapping: true as const,
          runtime_surface_dispatch_readiness_envelope_emission: true as const,
          integration_dispatch_readiness_linkage_emission: true as const,
          audit_eval_dispatch_readiness_linkage_emission: true as const
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
      const runtimeSurfaceDispatchReadinessEnvelope = {
        dispatch_readiness_id: dispatchReadinessId,
        publication_preparation_id: publicationPreparation.publication_preparation_id,
        normalized_outcome_id: publicationPreparation.normalized_outcome_id,
        attempt_id: publicationPreparation.attempt_id,
        request_id: publicationPreparation.request_id,
        operation_id: publicationPreparation.operation_id,
        precheck_id: publicationPreparation.precheck_id,
        dispatch_intent_id: publicationPreparation.dispatch_intent_id,
        runtime_handoff_id: publicationPreparation.runtime_handoff_id,
        dispatch_readiness_family: dispatchReadinessFamily,
        dispatch_readiness_status: dispatchReadinessStatus,
        publication_preparation_family: publicationPreparation.publication_preparation_family,
        publication_preparation_status: publicationPreparation.publication_preparation_status,
        normalized_outcome_family: publicationPreparation.normalized_outcome_family,
        normalized_outcome_status: publicationPreparation.normalized_outcome_status,
        lifecycle_state: publicationPreparation.lifecycle_state,
        contour_target: publicationPreparation.contour_target,
        runtime_surface_status: surfaceStatus,
        authority_context_placeholder: {
          ...(publicationPreparation.authority_context_placeholder.authority_context_id
            ? { authority_context_id: publicationPreparation.authority_context_placeholder.authority_context_id }
            : {}),
          ...(publicationPreparation.authority_context_placeholder.subject_identity_ref
            ? { subject_identity_ref: publicationPreparation.authority_context_placeholder.subject_identity_ref }
            : {}),
          ...(publicationPreparation.authority_context_placeholder.delegated_authority_ref
            ? { delegated_authority_ref: publicationPreparation.authority_context_placeholder.delegated_authority_ref }
            : {}),
          ...(publicationPreparation.authority_context_placeholder.provenance_chain_ref
            ? { provenance_chain_ref: publicationPreparation.authority_context_placeholder.provenance_chain_ref }
            : {}),
          control_plane_boundary: publicationPreparation.authority_context_placeholder.control_plane_boundary,
          runtime_boundary: publicationPreparation.authority_context_placeholder.runtime_boundary
        },
        dispatch_readiness_boundary: {
          dispatch_readiness_boundary_status: "dispatch_ready_placeholder_only" as const,
          actual_dispatch_execution_allowed_now: false as const,
          publication_delivery_allowed_now: false as const,
          handler_invocation_allowed_now: false as const,
          delivery_runtime_allowed_now: false as const,
          transport_delivery_allowed_now: false as const,
          provider_sdk_call_allowed_now: false as const,
          canonical_context_access_allowed_now: false as const,
          canonical_writeback_allowed_now: false as const
        },
        dispatch_readiness_payload: dispatchReadinessPayload,
        warnings,
        emitted_at: now
      };
      const integrationDispatchReadinessLinkage = integrationBuilder.build({
        linkage_id: `${dispatchReadinessId}:integration-linkage`,
        dispatch_readiness_id: dispatchReadinessId,
        publication_preparation_id: publicationPreparation.publication_preparation_id,
        normalized_outcome_id: publicationPreparation.normalized_outcome_id,
        request_id: publicationPreparation.request_id,
        operation_id: publicationPreparation.operation_id,
        precheck_id: publicationPreparation.precheck_id,
        dispatch_intent_id: publicationPreparation.dispatch_intent_id,
        runtime_handoff_id: publicationPreparation.runtime_handoff_id,
        attempt_id: publicationPreparation.attempt_id,
        dispatch_readiness_family: dispatchReadinessFamily,
        dispatch_readiness_status: dispatchReadinessStatus,
        publication_preparation_family: publicationPreparation.publication_preparation_family,
        publication_preparation_status: publicationPreparation.publication_preparation_status,
        normalized_outcome_family: publicationPreparation.normalized_outcome_family,
        normalized_outcome_status: publicationPreparation.normalized_outcome_status,
        lifecycle_state: publicationPreparation.lifecycle_state,
        contour_target: publicationPreparation.contour_target,
        integration_response_status: surfaceStatus,
        canonical_response: {
          request_id: publicationPreparation.request_id,
          operation_id: publicationPreparation.operation_id,
          status: surfaceStatus,
          result: dispatchReadinessPayload,
          warnings,
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: publicationPreparation.request_id,
            operation_id: publicationPreparation.operation_id,
            status: surfaceStatus,
            result: dispatchReadinessPayload,
            warnings,
            served_at: now
          }
        },
        warnings,
        now
      });
      const dispatchReadinessTrace = auditTraceBuilder.build({
        trace_id: `${dispatchReadinessId}:trace`,
        dispatch_readiness_id: dispatchReadinessId,
        publication_preparation_id: publicationPreparation.publication_preparation_id,
        normalized_outcome_id: publicationPreparation.normalized_outcome_id,
        request_id: publicationPreparation.request_id,
        operation_id: publicationPreparation.operation_id,
        runtime_handoff_id: publicationPreparation.runtime_handoff_id,
        attempt_id: publicationPreparation.attempt_id,
        dispatch_readiness_family: dispatchReadinessFamily,
        dispatch_readiness_status: dispatchReadinessStatus,
        publication_preparation_family: publicationPreparation.publication_preparation_family,
        publication_preparation_status: publicationPreparation.publication_preparation_status,
        normalized_outcome_family: publicationPreparation.normalized_outcome_family,
        normalized_outcome_status: publicationPreparation.normalized_outcome_status,
        lifecycle_state: publicationPreparation.lifecycle_state,
        contour_target: publicationPreparation.contour_target,
        linked_publication_preparation_trace_id: publicationPreparation.publication_preparation_trace.trace_id,
        warnings,
        now
      });
      const dispatchReadinessAuditLinkage = auditLinkageBuilder.build({
        linkage_id: `${dispatchReadinessId}:audit-linkage`,
        dispatch_readiness_id: dispatchReadinessId,
        publication_preparation_id: publicationPreparation.publication_preparation_id,
        normalized_outcome_id: publicationPreparation.normalized_outcome_id,
        attempt_id: publicationPreparation.attempt_id,
        runtime_handoff_id: publicationPreparation.runtime_handoff_id,
        dispatch_readiness_status: dispatchReadinessStatus,
        publication_preparation_status: publicationPreparation.publication_preparation_status,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        ...(publicationPreparation.authority_context_placeholder.provenance_chain_ref
          ? { provenance_chain_ref: publicationPreparation.authority_context_placeholder.provenance_chain_ref }
          : {}),
        warnings,
        now
      });

      return {
        dispatch_readiness_id: dispatchReadinessId,
        publication_preparation_id: publicationPreparation.publication_preparation_id,
        normalized_outcome_id: publicationPreparation.normalized_outcome_id,
        attempt_id: publicationPreparation.attempt_id,
        request_id: publicationPreparation.request_id,
        operation_id: publicationPreparation.operation_id,
        precheck_id: publicationPreparation.precheck_id,
        dispatch_intent_id: publicationPreparation.dispatch_intent_id,
        runtime_handoff_id: publicationPreparation.runtime_handoff_id,
        dispatch_readiness_family: dispatchReadinessFamily,
        dispatch_readiness_status: dispatchReadinessStatus,
        dispatch_readiness_result: dispatchReadinessResult,
        publication_preparation_family: publicationPreparation.publication_preparation_family,
        publication_preparation_status: publicationPreparation.publication_preparation_status,
        normalized_outcome_family: publicationPreparation.normalized_outcome_family,
        normalized_outcome_status: publicationPreparation.normalized_outcome_status,
        lifecycle_state: publicationPreparation.lifecycle_state,
        contour_target: publicationPreparation.contour_target,
        family_mapping: familyMapping,
        status_mapping: statusMapping,
        authority_context_placeholder: publicationPreparation.authority_context_placeholder,
        dispatch_readiness_boundary: dispatchReadinessBoundary,
        runtime_surface_dispatch_readiness_envelope: runtimeSurfaceDispatchReadinessEnvelope,
        integration_dispatch_readiness_linkage: integrationDispatchReadinessLinkage,
        dispatch_readiness_trace: dispatchReadinessTrace,
        dispatch_readiness_audit_linkage: dispatchReadinessAuditLinkage,
        warnings,
        created_at: now
      };
    }
  };
};

export const createPublicationDispatchReadinessSummaryBuilder =
  (): PublicationDispatchReadinessSummaryBuilder => {
    return {
      summarize(input: { readiness: PublicationDispatchReadinessShape[] }): PublicationDispatchReadinessSummaryShape {
        return {
          total: input.readiness.length,
          queued: input.readiness.filter((item) => item.dispatch_readiness_status === "queued_dispatch_readiness").length,
          prepared: input.readiness.filter((item) => item.dispatch_readiness_status === "prepared_dispatch_readiness").length,
          blocked: input.readiness.filter((item) => item.dispatch_readiness_status === "blocked_dispatch_readiness").length,
          deferred: input.readiness.filter((item) => item.dispatch_readiness_status === "deferred_dispatch_readiness").length,
          aborted: input.readiness.filter((item) => item.dispatch_readiness_status === "aborted_dispatch_readiness").length,
          expired: input.readiness.filter((item) => item.dispatch_readiness_status === "expired_dispatch_readiness").length,
          cancelled: input.readiness.filter((item) => item.dispatch_readiness_status === "cancelled_dispatch_readiness").length,
          not_dispatchable: input.readiness.filter((item) => item.dispatch_readiness_status === "not_dispatchable_dispatch_readiness").length,
          by_dispatch_readiness_family: {
            read_path_publication_dispatch_readiness: input.readiness.filter(
              (item) => item.dispatch_readiness_family === "read_path_publication_dispatch_readiness"
            ).length,
            pack_loop_publication_dispatch_readiness: input.readiness.filter(
              (item) => item.dispatch_readiness_family === "pack_loop_publication_dispatch_readiness"
            ).length,
            write_path_publication_dispatch_readiness: input.readiness.filter(
              (item) => item.dispatch_readiness_family === "write_path_publication_dispatch_readiness"
            ).length,
            handoff_publication_dispatch_readiness: input.readiness.filter(
              (item) => item.dispatch_readiness_family === "handoff_publication_dispatch_readiness"
            ).length,
            unknown_publication_dispatch_readiness: input.readiness.filter(
              (item) => item.dispatch_readiness_family === "unknown_publication_dispatch_readiness"
            ).length
          },
          warnings: input.readiness.flatMap((item) => item.warnings)
        };
      }
    };
  };
