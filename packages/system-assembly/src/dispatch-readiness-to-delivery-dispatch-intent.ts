import {
  createDeliveryDispatchIntentAuditLinkageBuilder,
  createDeliveryDispatchIntentTraceBuilder
} from "@orchestrator/audit-eval";
import { createDeliveryDispatchIntentLinkageBuilder } from "@orchestrator/integration-contracts";
import type {
  DeliveryDispatchIntentFamilyMappingShape,
  DeliveryDispatchIntentInputShape,
  DeliveryDispatchIntentShape,
  DeliveryDispatchIntentSummaryShape,
  DeliveryDispatchIntentWarningShape,
  DispatchReadinessDeliveryDispatchIntentMappingShape
} from "./dispatch-readiness-to-delivery-dispatch-intent-types.js";
import {
  DISPATCH_READINESS_STATUS_TO_DELIVERY_DISPATCH_INTENT_STATUS,
  type DeliveryDispatchIntentFamily,
  type DeliveryDispatchIntentResult,
  type DeliveryDispatchIntentStatus
} from "./dispatch-readiness-to-delivery-dispatch-intent-vocabularies.js";
import type { PublicationDispatchReadinessShape } from "./publication-preparation-to-dispatch-readiness-types.js";

type DeliveryDispatchIntentSurfaceStatus = "accepted" | "success" | "rejected" | "error";

const toDeliveryDispatchIntentFamily = (
  dispatchReadiness: PublicationDispatchReadinessShape
): DeliveryDispatchIntentFamily => {
  if (dispatchReadiness.dispatch_readiness_family === "read_path_publication_dispatch_readiness") {
    return "read_path_delivery_dispatch_intent";
  }
  if (dispatchReadiness.dispatch_readiness_family === "pack_loop_publication_dispatch_readiness") {
    return "pack_loop_delivery_dispatch_intent";
  }
  if (dispatchReadiness.dispatch_readiness_family === "write_path_publication_dispatch_readiness") {
    return "write_path_delivery_dispatch_intent";
  }
  if (dispatchReadiness.dispatch_readiness_family === "handoff_publication_dispatch_readiness") {
    return "handoff_delivery_dispatch_intent";
  }
  return "unknown_delivery_dispatch_intent";
};

const toDeliveryDispatchIntentResult = (status: DeliveryDispatchIntentStatus): DeliveryDispatchIntentResult => {
  if (status === "prepared_delivery_dispatch_intent") return "delivery_dispatch_intent_placeholder_ready";
  if (status === "queued_delivery_dispatch_intent") return "delivery_dispatch_intent_placeholder_queued";
  if (status === "blocked_delivery_dispatch_intent") return "delivery_dispatch_intent_placeholder_blocked";
  if (status === "deferred_delivery_dispatch_intent") return "delivery_dispatch_intent_placeholder_deferred";
  if (status === "not_dispatchable_delivery_dispatch_intent") return "delivery_dispatch_intent_placeholder_not_dispatchable";
  return "delivery_dispatch_intent_placeholder_terminal";
};

const toSurfaceStatus = (status: DeliveryDispatchIntentStatus): DeliveryDispatchIntentSurfaceStatus => {
  if (status === "prepared_delivery_dispatch_intent") return "success";
  if (status === "queued_delivery_dispatch_intent" || status === "deferred_delivery_dispatch_intent") {
    return "accepted";
  }
  if (status === "blocked_delivery_dispatch_intent" || status === "not_dispatchable_delivery_dispatch_intent") {
    return "rejected";
  }
  return "error";
};

const createFamilyMapping = (
  dispatchReadiness: PublicationDispatchReadinessShape
): DeliveryDispatchIntentFamilyMappingShape => {
  return {
    dispatch_readiness_family: dispatchReadiness.dispatch_readiness_family,
    contour_target: dispatchReadiness.contour_target,
    delivery_dispatch_intent_family: toDeliveryDispatchIntentFamily(dispatchReadiness)
  };
};

const createStatusMapping = (
  dispatchReadiness: PublicationDispatchReadinessShape
): DispatchReadinessDeliveryDispatchIntentMappingShape => {
  const deliveryDispatchIntentStatus =
    DISPATCH_READINESS_STATUS_TO_DELIVERY_DISPATCH_INTENT_STATUS[dispatchReadiness.dispatch_readiness_status];
  return {
    dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
    publication_preparation_status: dispatchReadiness.publication_preparation_status,
    normalized_outcome_status: dispatchReadiness.normalized_outcome_status,
    lifecycle_state: dispatchReadiness.lifecycle_state,
    delivery_dispatch_intent_status: deliveryDispatchIntentStatus,
    delivery_dispatch_intent_result: toDeliveryDispatchIntentResult(deliveryDispatchIntentStatus),
    mapping_boundary: "dispatch_readiness_placeholder_to_delivery_dispatch_intent_placeholder"
  };
};

const createWarnings = (input: {
  dispatchReadiness: PublicationDispatchReadinessShape;
  deliveryDispatchIntentFamily: DeliveryDispatchIntentFamily;
  deliveryDispatchIntentStatus: DeliveryDispatchIntentStatus;
}): DeliveryDispatchIntentWarningShape[] => {
  return [
    ...(input.deliveryDispatchIntentFamily === "unknown_delivery_dispatch_intent"
      ? [
          {
            code: "delivery_dispatch_intent_family_ambiguous",
            message: "delivery-dispatch intent family resolved to unknown_delivery_dispatch_intent"
          } as const
        ]
      : []),
    ...(input.deliveryDispatchIntentStatus.replace("_delivery_dispatch_intent", "_dispatch_readiness") !==
    input.dispatchReadiness.dispatch_readiness_status
      ? [
          {
            code: "delivery_dispatch_intent_status_mismatch",
            message: "delivery-dispatch intent status does not match dispatch-readiness status"
          } as const
        ]
      : []),
    {
      code: "delivery_dispatch_intent_runtime_boundary_only",
      message: "delivery-dispatch intent is a contract-only placeholder and does not perform dispatch execution"
    },
    {
      code: "delivery_dispatch_intent_not_actual_dispatch_execution",
      message: "delivery-dispatch intent must not be interpreted as proof of actual dispatch"
    },
    {
      code: "delivery_dispatch_intent_not_actual_publication_delivery",
      message: "delivery-dispatch intent must not be interpreted as proof of actual publication delivery"
    },
    {
      code: "delivery_dispatch_intent_not_actual_handler_result",
      message: "delivery-dispatch intent must not be interpreted as an actual handler result"
    },
    {
      code: "delivery_dispatch_intent_not_actual_delivery_result",
      message: "delivery-dispatch intent must not be interpreted as delivery runtime output"
    },
    {
      code: "delivery_dispatch_intent_not_provider_transport_result",
      message: "delivery-dispatch intent must not be interpreted as provider transport result"
    },
    {
      code: "delivery_dispatch_intent_authority_context_placeholder_only",
      message: "authority context remains gateway/control-plane placeholder only"
    },
    {
      code: "delivery_dispatch_intent_provenance_context_placeholder_only",
      message: "provenance context is carried only as a reference placeholder"
    },
    {
      code: "delivery_dispatch_intent_delegation_context_placeholder_only",
      message: "delegation context is carried only as a reference placeholder"
    },
    {
      code: "delivery_dispatch_intent_runtime_surface_envelope_emitted",
      message: "runtime-surface delivery-dispatch intent envelope emitted"
    },
    {
      code: "delivery_dispatch_intent_integration_linkage_emitted",
      message: "integration delivery-dispatch intent linkage emitted"
    },
    {
      code: "delivery_dispatch_intent_audit_linkage_emitted",
      message: "audit/eval delivery-dispatch intent linkage emitted"
    }
  ];
};

export interface DeliveryDispatchIntentBuilder {
  prepare(input: DeliveryDispatchIntentInputShape): DeliveryDispatchIntentShape;
}

export interface DeliveryDispatchIntentSummaryBuilder {
  summarize(input: { intents: DeliveryDispatchIntentShape[] }): DeliveryDispatchIntentSummaryShape;
}

export const createDeliveryDispatchIntentBuilder = (): DeliveryDispatchIntentBuilder => {
  const integrationBuilder = createDeliveryDispatchIntentLinkageBuilder();
  const auditTraceBuilder = createDeliveryDispatchIntentTraceBuilder();
  const auditLinkageBuilder = createDeliveryDispatchIntentAuditLinkageBuilder();

  return {
    prepare(input: DeliveryDispatchIntentInputShape): DeliveryDispatchIntentShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as PublicationDispatchReadinessShape["created_at"]);
      const dispatchReadiness = input.dispatch_readiness;
      const deliveryDispatchIntentId = `${dispatchReadiness.dispatch_readiness_id}:delivery-dispatch-intent`;
      const familyMapping = createFamilyMapping(dispatchReadiness);
      const statusMapping = createStatusMapping(dispatchReadiness);
      const deliveryDispatchIntentFamily = familyMapping.delivery_dispatch_intent_family;
      const deliveryDispatchIntentStatus = statusMapping.delivery_dispatch_intent_status;
      const deliveryDispatchIntentResult = statusMapping.delivery_dispatch_intent_result;
      const warnings = createWarnings({
        dispatchReadiness,
        deliveryDispatchIntentFamily,
        deliveryDispatchIntentStatus
      });
      const surfaceStatus = toSurfaceStatus(deliveryDispatchIntentStatus);
      const deliveryDispatchIntentPayload: Record<string, unknown> = {
        delivery_dispatch_intent_id: deliveryDispatchIntentId,
        dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
        publication_preparation_id: dispatchReadiness.publication_preparation_id,
        normalized_outcome_id: dispatchReadiness.normalized_outcome_id,
        attempt_id: dispatchReadiness.attempt_id,
        runtime_handoff_id: dispatchReadiness.runtime_handoff_id,
        delivery_dispatch_intent_family: deliveryDispatchIntentFamily,
        delivery_dispatch_intent_status: deliveryDispatchIntentStatus,
        delivery_dispatch_intent_result: deliveryDispatchIntentResult,
        dispatch_readiness_family: dispatchReadiness.dispatch_readiness_family,
        dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
        publication_preparation_family: dispatchReadiness.publication_preparation_family,
        publication_preparation_status: dispatchReadiness.publication_preparation_status,
        normalized_outcome_family: dispatchReadiness.normalized_outcome_family,
        normalized_outcome_status: dispatchReadiness.normalized_outcome_status,
        lifecycle_state: dispatchReadiness.lifecycle_state,
        contour_target: dispatchReadiness.contour_target,
        delivery_dispatch_intent_placeholder: true,
        actual_dispatch_execution: false,
        actual_publication_delivery: false,
        actual_handler_result: false,
        actual_delivery_result: false,
        provider_transport_result: false
      };
      const deliveryDispatchIntentBoundary = {
        delivery_dispatch_intent_id: deliveryDispatchIntentId,
        dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
        publication_preparation_id: dispatchReadiness.publication_preparation_id,
        normalized_outcome_id: dispatchReadiness.normalized_outcome_id,
        attempt_id: dispatchReadiness.attempt_id,
        boundary_status: "delivery_dispatch_intent_contract_only_future_dispatch_boundary" as const,
        allowed_now: {
          dispatch_readiness_to_delivery_dispatch_intent_mapping: true as const,
          runtime_surface_delivery_dispatch_intent_envelope_emission: true as const,
          integration_delivery_dispatch_intent_linkage_emission: true as const,
          audit_eval_delivery_dispatch_intent_linkage_emission: true as const
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
      const runtimeSurfaceDeliveryDispatchIntentEnvelope = {
        delivery_dispatch_intent_id: deliveryDispatchIntentId,
        dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
        publication_preparation_id: dispatchReadiness.publication_preparation_id,
        normalized_outcome_id: dispatchReadiness.normalized_outcome_id,
        attempt_id: dispatchReadiness.attempt_id,
        request_id: dispatchReadiness.request_id,
        operation_id: dispatchReadiness.operation_id,
        precheck_id: dispatchReadiness.precheck_id,
        source_dispatch_intent_id: dispatchReadiness.dispatch_intent_id,
        runtime_handoff_id: dispatchReadiness.runtime_handoff_id,
        delivery_dispatch_intent_family: deliveryDispatchIntentFamily,
        delivery_dispatch_intent_status: deliveryDispatchIntentStatus,
        dispatch_readiness_family: dispatchReadiness.dispatch_readiness_family,
        dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
        publication_preparation_family: dispatchReadiness.publication_preparation_family,
        publication_preparation_status: dispatchReadiness.publication_preparation_status,
        normalized_outcome_family: dispatchReadiness.normalized_outcome_family,
        normalized_outcome_status: dispatchReadiness.normalized_outcome_status,
        lifecycle_state: dispatchReadiness.lifecycle_state,
        contour_target: dispatchReadiness.contour_target,
        runtime_surface_status: surfaceStatus,
        authority_context_placeholder: {
          ...(dispatchReadiness.authority_context_placeholder.authority_context_id
            ? { authority_context_id: dispatchReadiness.authority_context_placeholder.authority_context_id }
            : {}),
          ...(dispatchReadiness.authority_context_placeholder.subject_identity_ref
            ? { subject_identity_ref: dispatchReadiness.authority_context_placeholder.subject_identity_ref }
            : {}),
          ...(dispatchReadiness.authority_context_placeholder.delegated_authority_ref
            ? { delegated_authority_ref: dispatchReadiness.authority_context_placeholder.delegated_authority_ref }
            : {}),
          ...(dispatchReadiness.authority_context_placeholder.provenance_chain_ref
            ? { provenance_chain_ref: dispatchReadiness.authority_context_placeholder.provenance_chain_ref }
            : {}),
          control_plane_boundary: dispatchReadiness.authority_context_placeholder.control_plane_boundary,
          runtime_boundary: dispatchReadiness.authority_context_placeholder.runtime_boundary
        },
        delivery_dispatch_intent_boundary: {
          delivery_dispatch_intent_boundary_status: "delivery_dispatch_intent_placeholder_only" as const,
          actual_dispatch_execution_allowed_now: false as const,
          actual_publication_delivery_allowed_now: false as const,
          handler_invocation_allowed_now: false as const,
          delivery_runtime_allowed_now: false as const,
          transport_delivery_allowed_now: false as const,
          provider_sdk_call_allowed_now: false as const,
          canonical_context_access_allowed_now: false as const,
          canonical_writeback_allowed_now: false as const
        },
        delivery_dispatch_intent_payload: deliveryDispatchIntentPayload,
        warnings,
        emitted_at: now
      };
      const integrationDeliveryDispatchIntentLinkage = integrationBuilder.build({
        linkage_id: `${deliveryDispatchIntentId}:integration-linkage`,
        delivery_dispatch_intent_id: deliveryDispatchIntentId,
        dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
        publication_preparation_id: dispatchReadiness.publication_preparation_id,
        normalized_outcome_id: dispatchReadiness.normalized_outcome_id,
        request_id: dispatchReadiness.request_id,
        operation_id: dispatchReadiness.operation_id,
        precheck_id: dispatchReadiness.precheck_id,
        source_dispatch_intent_id: dispatchReadiness.dispatch_intent_id,
        runtime_handoff_id: dispatchReadiness.runtime_handoff_id,
        attempt_id: dispatchReadiness.attempt_id,
        delivery_dispatch_intent_family: deliveryDispatchIntentFamily,
        delivery_dispatch_intent_status: deliveryDispatchIntentStatus,
        dispatch_readiness_family: dispatchReadiness.dispatch_readiness_family,
        dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
        publication_preparation_family: dispatchReadiness.publication_preparation_family,
        publication_preparation_status: dispatchReadiness.publication_preparation_status,
        normalized_outcome_family: dispatchReadiness.normalized_outcome_family,
        normalized_outcome_status: dispatchReadiness.normalized_outcome_status,
        lifecycle_state: dispatchReadiness.lifecycle_state,
        contour_target: dispatchReadiness.contour_target,
        integration_response_status: surfaceStatus,
        canonical_response: {
          request_id: dispatchReadiness.request_id,
          operation_id: dispatchReadiness.operation_id,
          status: surfaceStatus,
          result: deliveryDispatchIntentPayload,
          warnings,
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: dispatchReadiness.request_id,
            operation_id: dispatchReadiness.operation_id,
            status: surfaceStatus,
            result: deliveryDispatchIntentPayload,
            warnings,
            served_at: now
          }
        },
        warnings,
        now
      });
      const deliveryDispatchIntentTrace = auditTraceBuilder.build({
        trace_id: `${deliveryDispatchIntentId}:trace`,
        delivery_dispatch_intent_id: deliveryDispatchIntentId,
        dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
        publication_preparation_id: dispatchReadiness.publication_preparation_id,
        normalized_outcome_id: dispatchReadiness.normalized_outcome_id,
        request_id: dispatchReadiness.request_id,
        operation_id: dispatchReadiness.operation_id,
        runtime_handoff_id: dispatchReadiness.runtime_handoff_id,
        attempt_id: dispatchReadiness.attempt_id,
        delivery_dispatch_intent_family: deliveryDispatchIntentFamily,
        delivery_dispatch_intent_status: deliveryDispatchIntentStatus,
        dispatch_readiness_family: dispatchReadiness.dispatch_readiness_family,
        dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
        publication_preparation_family: dispatchReadiness.publication_preparation_family,
        publication_preparation_status: dispatchReadiness.publication_preparation_status,
        normalized_outcome_family: dispatchReadiness.normalized_outcome_family,
        normalized_outcome_status: dispatchReadiness.normalized_outcome_status,
        lifecycle_state: dispatchReadiness.lifecycle_state,
        contour_target: dispatchReadiness.contour_target,
        linked_dispatch_readiness_trace_id: dispatchReadiness.dispatch_readiness_trace.trace_id,
        warnings,
        now
      });
      const deliveryDispatchIntentAuditLinkage = auditLinkageBuilder.build({
        linkage_id: `${deliveryDispatchIntentId}:audit-linkage`,
        delivery_dispatch_intent_id: deliveryDispatchIntentId,
        dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
        publication_preparation_id: dispatchReadiness.publication_preparation_id,
        normalized_outcome_id: dispatchReadiness.normalized_outcome_id,
        attempt_id: dispatchReadiness.attempt_id,
        runtime_handoff_id: dispatchReadiness.runtime_handoff_id,
        delivery_dispatch_intent_status: deliveryDispatchIntentStatus,
        dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        ...(dispatchReadiness.authority_context_placeholder.provenance_chain_ref
          ? { provenance_chain_ref: dispatchReadiness.authority_context_placeholder.provenance_chain_ref }
          : {}),
        warnings,
        now
      });

      return {
        delivery_dispatch_intent_id: deliveryDispatchIntentId,
        dispatch_readiness_id: dispatchReadiness.dispatch_readiness_id,
        publication_preparation_id: dispatchReadiness.publication_preparation_id,
        normalized_outcome_id: dispatchReadiness.normalized_outcome_id,
        attempt_id: dispatchReadiness.attempt_id,
        request_id: dispatchReadiness.request_id,
        operation_id: dispatchReadiness.operation_id,
        precheck_id: dispatchReadiness.precheck_id,
        source_dispatch_intent_id: dispatchReadiness.dispatch_intent_id,
        runtime_handoff_id: dispatchReadiness.runtime_handoff_id,
        delivery_dispatch_intent_family: deliveryDispatchIntentFamily,
        delivery_dispatch_intent_status: deliveryDispatchIntentStatus,
        delivery_dispatch_intent_result: deliveryDispatchIntentResult,
        dispatch_readiness_family: dispatchReadiness.dispatch_readiness_family,
        dispatch_readiness_status: dispatchReadiness.dispatch_readiness_status,
        publication_preparation_family: dispatchReadiness.publication_preparation_family,
        publication_preparation_status: dispatchReadiness.publication_preparation_status,
        normalized_outcome_family: dispatchReadiness.normalized_outcome_family,
        normalized_outcome_status: dispatchReadiness.normalized_outcome_status,
        lifecycle_state: dispatchReadiness.lifecycle_state,
        contour_target: dispatchReadiness.contour_target,
        family_mapping: familyMapping,
        status_mapping: statusMapping,
        authority_context_placeholder: dispatchReadiness.authority_context_placeholder,
        delivery_dispatch_intent_boundary: deliveryDispatchIntentBoundary,
        runtime_surface_delivery_dispatch_intent_envelope: runtimeSurfaceDeliveryDispatchIntentEnvelope,
        integration_delivery_dispatch_intent_linkage: integrationDeliveryDispatchIntentLinkage,
        delivery_dispatch_intent_trace: deliveryDispatchIntentTrace,
        delivery_dispatch_intent_audit_linkage: deliveryDispatchIntentAuditLinkage,
        warnings,
        created_at: now
      };
    }
  };
};

export const createDeliveryDispatchIntentSummaryBuilder = (): DeliveryDispatchIntentSummaryBuilder => {
  return {
    summarize(input: { intents: DeliveryDispatchIntentShape[] }): DeliveryDispatchIntentSummaryShape {
      return {
        total: input.intents.length,
        queued: input.intents.filter((item) => item.delivery_dispatch_intent_status === "queued_delivery_dispatch_intent").length,
        prepared: input.intents.filter((item) => item.delivery_dispatch_intent_status === "prepared_delivery_dispatch_intent").length,
        blocked: input.intents.filter((item) => item.delivery_dispatch_intent_status === "blocked_delivery_dispatch_intent").length,
        deferred: input.intents.filter((item) => item.delivery_dispatch_intent_status === "deferred_delivery_dispatch_intent").length,
        aborted: input.intents.filter((item) => item.delivery_dispatch_intent_status === "aborted_delivery_dispatch_intent").length,
        expired: input.intents.filter((item) => item.delivery_dispatch_intent_status === "expired_delivery_dispatch_intent").length,
        cancelled: input.intents.filter((item) => item.delivery_dispatch_intent_status === "cancelled_delivery_dispatch_intent").length,
        not_dispatchable: input.intents.filter(
          (item) => item.delivery_dispatch_intent_status === "not_dispatchable_delivery_dispatch_intent"
        ).length,
        by_delivery_dispatch_intent_family: {
          read_path_delivery_dispatch_intent: input.intents.filter(
            (item) => item.delivery_dispatch_intent_family === "read_path_delivery_dispatch_intent"
          ).length,
          pack_loop_delivery_dispatch_intent: input.intents.filter(
            (item) => item.delivery_dispatch_intent_family === "pack_loop_delivery_dispatch_intent"
          ).length,
          write_path_delivery_dispatch_intent: input.intents.filter(
            (item) => item.delivery_dispatch_intent_family === "write_path_delivery_dispatch_intent"
          ).length,
          handoff_delivery_dispatch_intent: input.intents.filter(
            (item) => item.delivery_dispatch_intent_family === "handoff_delivery_dispatch_intent"
          ).length,
          unknown_delivery_dispatch_intent: input.intents.filter(
            (item) => item.delivery_dispatch_intent_family === "unknown_delivery_dispatch_intent"
          ).length
        },
        warnings: input.intents.flatMap((item) => item.warnings)
      };
    }
  };
};
