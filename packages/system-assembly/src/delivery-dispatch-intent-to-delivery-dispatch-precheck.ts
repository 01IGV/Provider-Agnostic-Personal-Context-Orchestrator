import {
  createDeliveryDispatchPrecheckAuditLinkageBuilder,
  createDeliveryDispatchPrecheckTraceBuilder
} from "@orchestrator/audit-eval";
import { createDeliveryDispatchPrecheckLinkageBuilder } from "@orchestrator/integration-contracts";
import type {
  DeliveryDispatchIntentPrecheckMappingShape,
  DeliveryDispatchPrecheckFamilyMappingShape,
  DeliveryDispatchPrecheckInputShape,
  DeliveryDispatchPrecheckShape,
  DeliveryDispatchPrecheckSummaryShape,
  DeliveryDispatchPrecheckWarningShape
} from "./delivery-dispatch-intent-to-delivery-dispatch-precheck-types.js";
import {
  DELIVERY_DISPATCH_INTENT_STATUS_TO_DELIVERY_DISPATCH_PRECHECK_STATUS,
  type DeliveryDispatchPrecheckFamily,
  type DeliveryDispatchPrecheckResult,
  type DeliveryDispatchPrecheckStatus
} from "./delivery-dispatch-intent-to-delivery-dispatch-precheck-vocabularies.js";
import type { DeliveryDispatchIntentShape } from "./dispatch-readiness-to-delivery-dispatch-intent-types.js";

type DeliveryDispatchPrecheckSurfaceStatus = "accepted" | "success" | "rejected" | "error";

const toDeliveryDispatchPrecheckFamily = (
  intent: DeliveryDispatchIntentShape
): DeliveryDispatchPrecheckFamily => {
  if (intent.delivery_dispatch_intent_family === "read_path_delivery_dispatch_intent") {
    return "read_path_delivery_dispatch_precheck";
  }
  if (intent.delivery_dispatch_intent_family === "pack_loop_delivery_dispatch_intent") {
    return "pack_loop_delivery_dispatch_precheck";
  }
  if (intent.delivery_dispatch_intent_family === "write_path_delivery_dispatch_intent") {
    return "write_path_delivery_dispatch_precheck";
  }
  if (intent.delivery_dispatch_intent_family === "handoff_delivery_dispatch_intent") {
    return "handoff_delivery_dispatch_precheck";
  }
  return "unknown_delivery_dispatch_precheck";
};

const toDeliveryDispatchPrecheckResult = (
  status: DeliveryDispatchPrecheckStatus
): DeliveryDispatchPrecheckResult => {
  if (status === "prepared_delivery_dispatch_precheck") return "delivery_dispatch_precheck_placeholder_ready";
  if (status === "queued_delivery_dispatch_precheck") return "delivery_dispatch_precheck_placeholder_queued";
  if (status === "blocked_delivery_dispatch_precheck") return "delivery_dispatch_precheck_placeholder_blocked";
  if (status === "deferred_delivery_dispatch_precheck") return "delivery_dispatch_precheck_placeholder_deferred";
  if (status === "not_dispatchable_delivery_dispatch_precheck") {
    return "delivery_dispatch_precheck_placeholder_not_dispatchable";
  }
  return "delivery_dispatch_precheck_placeholder_terminal";
};

const toSurfaceStatus = (status: DeliveryDispatchPrecheckStatus): DeliveryDispatchPrecheckSurfaceStatus => {
  if (status === "prepared_delivery_dispatch_precheck") return "success";
  if (status === "queued_delivery_dispatch_precheck" || status === "deferred_delivery_dispatch_precheck") {
    return "accepted";
  }
  if (status === "blocked_delivery_dispatch_precheck" || status === "not_dispatchable_delivery_dispatch_precheck") {
    return "rejected";
  }
  return "error";
};

const createFamilyMapping = (
  intent: DeliveryDispatchIntentShape
): DeliveryDispatchPrecheckFamilyMappingShape => {
  return {
    delivery_dispatch_intent_family: intent.delivery_dispatch_intent_family,
    contour_target: intent.contour_target,
    delivery_dispatch_precheck_family: toDeliveryDispatchPrecheckFamily(intent)
  };
};

const createStatusMapping = (
  intent: DeliveryDispatchIntentShape
): DeliveryDispatchIntentPrecheckMappingShape => {
  const precheckStatus =
    DELIVERY_DISPATCH_INTENT_STATUS_TO_DELIVERY_DISPATCH_PRECHECK_STATUS[
      intent.delivery_dispatch_intent_status
    ];
  return {
    delivery_dispatch_intent_status: intent.delivery_dispatch_intent_status,
    dispatch_readiness_status: intent.dispatch_readiness_status,
    publication_preparation_status: intent.publication_preparation_status,
    normalized_outcome_status: intent.normalized_outcome_status,
    lifecycle_state: intent.lifecycle_state,
    delivery_dispatch_precheck_status: precheckStatus,
    delivery_dispatch_precheck_result: toDeliveryDispatchPrecheckResult(precheckStatus),
    mapping_boundary: "delivery_dispatch_intent_placeholder_to_delivery_dispatch_precheck_placeholder"
  };
};

const createWarnings = (input: {
  intent: DeliveryDispatchIntentShape;
  precheckFamily: DeliveryDispatchPrecheckFamily;
  precheckStatus: DeliveryDispatchPrecheckStatus;
}): DeliveryDispatchPrecheckWarningShape[] => {
  return [
    ...(input.precheckFamily === "unknown_delivery_dispatch_precheck"
      ? [
          {
            code: "delivery_dispatch_precheck_family_ambiguous",
            message: "delivery-dispatch precheck family resolved to unknown_delivery_dispatch_precheck"
          } as const
        ]
      : []),
    ...(input.precheckStatus.replace("_delivery_dispatch_precheck", "_delivery_dispatch_intent") !==
    input.intent.delivery_dispatch_intent_status
      ? [
          {
            code: "delivery_dispatch_precheck_status_mismatch",
            message: "delivery-dispatch precheck status does not match delivery-dispatch intent status"
          } as const
        ]
      : []),
    {
      code: "delivery_dispatch_precheck_runtime_boundary_only",
      message: "delivery-dispatch precheck is a contract-only placeholder and does not grant runtime permission"
    },
    {
      code: "delivery_dispatch_precheck_not_actual_dispatch_execution",
      message: "delivery-dispatch precheck must not be interpreted as proof of actual dispatch"
    },
    {
      code: "delivery_dispatch_precheck_not_actual_publication_delivery",
      message: "delivery-dispatch precheck must not be interpreted as proof of actual publication delivery"
    },
    {
      code: "delivery_dispatch_precheck_not_actual_handler_result",
      message: "delivery-dispatch precheck must not be interpreted as an actual handler result"
    },
    {
      code: "delivery_dispatch_precheck_not_actual_delivery_result",
      message: "delivery-dispatch precheck must not be interpreted as delivery runtime output"
    },
    {
      code: "delivery_dispatch_precheck_not_provider_transport_result",
      message: "delivery-dispatch precheck must not be interpreted as provider transport result"
    },
    {
      code: "delivery_dispatch_precheck_authority_context_placeholder_only",
      message: "authority context remains gateway/control-plane placeholder only"
    },
    {
      code: "delivery_dispatch_precheck_provenance_context_placeholder_only",
      message: "provenance context is carried only as a reference placeholder"
    },
    {
      code: "delivery_dispatch_precheck_delegation_context_placeholder_only",
      message: "delegation context is carried only as a reference placeholder"
    },
    {
      code: "delivery_dispatch_precheck_runtime_surface_envelope_emitted",
      message: "runtime-surface delivery-dispatch precheck envelope emitted"
    },
    {
      code: "delivery_dispatch_precheck_integration_linkage_emitted",
      message: "integration delivery-dispatch precheck linkage emitted"
    },
    {
      code: "delivery_dispatch_precheck_audit_linkage_emitted",
      message: "audit/eval delivery-dispatch precheck linkage emitted"
    }
  ];
};

export interface DeliveryDispatchPrecheckBuilder {
  prepare(input: DeliveryDispatchPrecheckInputShape): DeliveryDispatchPrecheckShape;
}

export interface DeliveryDispatchPrecheckSummaryBuilder {
  summarize(input: { prechecks: DeliveryDispatchPrecheckShape[] }): DeliveryDispatchPrecheckSummaryShape;
}

export const createDeliveryDispatchPrecheckBuilder = (): DeliveryDispatchPrecheckBuilder => {
  const integrationBuilder = createDeliveryDispatchPrecheckLinkageBuilder();
  const auditTraceBuilder = createDeliveryDispatchPrecheckTraceBuilder();
  const auditLinkageBuilder = createDeliveryDispatchPrecheckAuditLinkageBuilder();

  return {
    prepare(input: DeliveryDispatchPrecheckInputShape): DeliveryDispatchPrecheckShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as DeliveryDispatchIntentShape["created_at"]);
      const intent = input.delivery_dispatch_intent;
      const precheckId = `${intent.delivery_dispatch_intent_id}:delivery-dispatch-precheck`;
      const familyMapping = createFamilyMapping(intent);
      const statusMapping = createStatusMapping(intent);
      const precheckFamily = familyMapping.delivery_dispatch_precheck_family;
      const precheckStatus = statusMapping.delivery_dispatch_precheck_status;
      const precheckResult = statusMapping.delivery_dispatch_precheck_result;
      const warnings = createWarnings({ intent, precheckFamily, precheckStatus });
      const surfaceStatus = toSurfaceStatus(precheckStatus);
      const payload: Record<string, unknown> = {
        delivery_dispatch_precheck_id: precheckId,
        delivery_dispatch_intent_id: intent.delivery_dispatch_intent_id,
        dispatch_readiness_id: intent.dispatch_readiness_id,
        publication_preparation_id: intent.publication_preparation_id,
        normalized_outcome_id: intent.normalized_outcome_id,
        attempt_id: intent.attempt_id,
        runtime_handoff_id: intent.runtime_handoff_id,
        delivery_dispatch_precheck_family: precheckFamily,
        delivery_dispatch_precheck_status: precheckStatus,
        delivery_dispatch_precheck_result: precheckResult,
        delivery_dispatch_intent_family: intent.delivery_dispatch_intent_family,
        delivery_dispatch_intent_status: intent.delivery_dispatch_intent_status,
        dispatch_readiness_family: intent.dispatch_readiness_family,
        dispatch_readiness_status: intent.dispatch_readiness_status,
        publication_preparation_family: intent.publication_preparation_family,
        publication_preparation_status: intent.publication_preparation_status,
        normalized_outcome_family: intent.normalized_outcome_family,
        normalized_outcome_status: intent.normalized_outcome_status,
        lifecycle_state: intent.lifecycle_state,
        contour_target: intent.contour_target,
        delivery_dispatch_precheck_placeholder: true,
        actual_dispatch_execution: false,
        actual_publication_delivery: false,
        actual_handler_result: false,
        actual_delivery_result: false,
        provider_transport_result: false,
        runtime_permission: false
      };
      const boundary = {
        delivery_dispatch_precheck_id: precheckId,
        delivery_dispatch_intent_id: intent.delivery_dispatch_intent_id,
        dispatch_readiness_id: intent.dispatch_readiness_id,
        publication_preparation_id: intent.publication_preparation_id,
        normalized_outcome_id: intent.normalized_outcome_id,
        attempt_id: intent.attempt_id,
        boundary_status: "delivery_dispatch_precheck_contract_only_future_dispatch_boundary" as const,
        allowed_now: {
          delivery_dispatch_intent_to_delivery_dispatch_precheck_mapping: true as const,
          runtime_surface_delivery_dispatch_precheck_envelope_emission: true as const,
          integration_delivery_dispatch_precheck_linkage_emission: true as const,
          audit_eval_delivery_dispatch_precheck_linkage_emission: true as const
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
      const runtimeEnvelope = {
        delivery_dispatch_precheck_id: precheckId,
        delivery_dispatch_intent_id: intent.delivery_dispatch_intent_id,
        dispatch_readiness_id: intent.dispatch_readiness_id,
        publication_preparation_id: intent.publication_preparation_id,
        normalized_outcome_id: intent.normalized_outcome_id,
        attempt_id: intent.attempt_id,
        request_id: intent.request_id,
        operation_id: intent.operation_id,
        source_precheck_id: intent.precheck_id,
        source_dispatch_intent_id: intent.source_dispatch_intent_id,
        runtime_handoff_id: intent.runtime_handoff_id,
        delivery_dispatch_precheck_family: precheckFamily,
        delivery_dispatch_precheck_status: precheckStatus,
        delivery_dispatch_intent_family: intent.delivery_dispatch_intent_family,
        delivery_dispatch_intent_status: intent.delivery_dispatch_intent_status,
        dispatch_readiness_family: intent.dispatch_readiness_family,
        dispatch_readiness_status: intent.dispatch_readiness_status,
        publication_preparation_family: intent.publication_preparation_family,
        publication_preparation_status: intent.publication_preparation_status,
        normalized_outcome_family: intent.normalized_outcome_family,
        normalized_outcome_status: intent.normalized_outcome_status,
        lifecycle_state: intent.lifecycle_state,
        contour_target: intent.contour_target,
        runtime_surface_status: surfaceStatus,
        authority_context_placeholder: {
          ...(intent.authority_context_placeholder.authority_context_id
            ? { authority_context_id: intent.authority_context_placeholder.authority_context_id }
            : {}),
          ...(intent.authority_context_placeholder.subject_identity_ref
            ? { subject_identity_ref: intent.authority_context_placeholder.subject_identity_ref }
            : {}),
          ...(intent.authority_context_placeholder.delegated_authority_ref
            ? { delegated_authority_ref: intent.authority_context_placeholder.delegated_authority_ref }
            : {}),
          ...(intent.authority_context_placeholder.provenance_chain_ref
            ? { provenance_chain_ref: intent.authority_context_placeholder.provenance_chain_ref }
            : {}),
          control_plane_boundary: intent.authority_context_placeholder.control_plane_boundary,
          runtime_boundary: intent.authority_context_placeholder.runtime_boundary
        },
        delivery_dispatch_precheck_boundary: {
          delivery_dispatch_precheck_boundary_status: "delivery_dispatch_precheck_placeholder_only" as const,
          actual_dispatch_execution_allowed_now: false as const,
          actual_publication_delivery_allowed_now: false as const,
          handler_invocation_allowed_now: false as const,
          delivery_runtime_allowed_now: false as const,
          transport_delivery_allowed_now: false as const,
          provider_sdk_call_allowed_now: false as const,
          canonical_context_access_allowed_now: false as const,
          canonical_writeback_allowed_now: false as const
        },
        delivery_dispatch_precheck_payload: payload,
        warnings,
        emitted_at: now
      };
      const integrationLinkage = integrationBuilder.build({
        linkage_id: `${precheckId}:integration-linkage`,
        delivery_dispatch_precheck_id: precheckId,
        delivery_dispatch_intent_id: intent.delivery_dispatch_intent_id,
        dispatch_readiness_id: intent.dispatch_readiness_id,
        publication_preparation_id: intent.publication_preparation_id,
        normalized_outcome_id: intent.normalized_outcome_id,
        request_id: intent.request_id,
        operation_id: intent.operation_id,
        source_precheck_id: intent.precheck_id,
        source_dispatch_intent_id: intent.source_dispatch_intent_id,
        runtime_handoff_id: intent.runtime_handoff_id,
        attempt_id: intent.attempt_id,
        delivery_dispatch_precheck_family: precheckFamily,
        delivery_dispatch_precheck_status: precheckStatus,
        delivery_dispatch_intent_family: intent.delivery_dispatch_intent_family,
        delivery_dispatch_intent_status: intent.delivery_dispatch_intent_status,
        dispatch_readiness_family: intent.dispatch_readiness_family,
        dispatch_readiness_status: intent.dispatch_readiness_status,
        publication_preparation_family: intent.publication_preparation_family,
        publication_preparation_status: intent.publication_preparation_status,
        normalized_outcome_family: intent.normalized_outcome_family,
        normalized_outcome_status: intent.normalized_outcome_status,
        lifecycle_state: intent.lifecycle_state,
        contour_target: intent.contour_target,
        integration_response_status: surfaceStatus,
        canonical_response: {
          request_id: intent.request_id,
          operation_id: intent.operation_id,
          status: surfaceStatus,
          result: payload,
          warnings,
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: intent.request_id,
            operation_id: intent.operation_id,
            status: surfaceStatus,
            result: payload,
            warnings,
            served_at: now
          }
        },
        warnings,
        now
      });
      const trace = auditTraceBuilder.build({
        trace_id: `${precheckId}:trace`,
        delivery_dispatch_precheck_id: precheckId,
        delivery_dispatch_intent_id: intent.delivery_dispatch_intent_id,
        dispatch_readiness_id: intent.dispatch_readiness_id,
        publication_preparation_id: intent.publication_preparation_id,
        normalized_outcome_id: intent.normalized_outcome_id,
        request_id: intent.request_id,
        operation_id: intent.operation_id,
        runtime_handoff_id: intent.runtime_handoff_id,
        attempt_id: intent.attempt_id,
        delivery_dispatch_precheck_family: precheckFamily,
        delivery_dispatch_precheck_status: precheckStatus,
        delivery_dispatch_intent_family: intent.delivery_dispatch_intent_family,
        delivery_dispatch_intent_status: intent.delivery_dispatch_intent_status,
        dispatch_readiness_family: intent.dispatch_readiness_family,
        dispatch_readiness_status: intent.dispatch_readiness_status,
        publication_preparation_family: intent.publication_preparation_family,
        publication_preparation_status: intent.publication_preparation_status,
        normalized_outcome_family: intent.normalized_outcome_family,
        normalized_outcome_status: intent.normalized_outcome_status,
        lifecycle_state: intent.lifecycle_state,
        contour_target: intent.contour_target,
        linked_delivery_dispatch_intent_trace_id: intent.delivery_dispatch_intent_trace.trace_id,
        warnings,
        now
      });
      const auditLinkage = auditLinkageBuilder.build({
        linkage_id: `${precheckId}:audit-linkage`,
        delivery_dispatch_precheck_id: precheckId,
        delivery_dispatch_intent_id: intent.delivery_dispatch_intent_id,
        dispatch_readiness_id: intent.dispatch_readiness_id,
        publication_preparation_id: intent.publication_preparation_id,
        normalized_outcome_id: intent.normalized_outcome_id,
        attempt_id: intent.attempt_id,
        runtime_handoff_id: intent.runtime_handoff_id,
        delivery_dispatch_precheck_status: precheckStatus,
        delivery_dispatch_intent_status: intent.delivery_dispatch_intent_status,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        ...(intent.authority_context_placeholder.provenance_chain_ref
          ? { provenance_chain_ref: intent.authority_context_placeholder.provenance_chain_ref }
          : {}),
        warnings,
        now
      });

      return {
        delivery_dispatch_precheck_id: precheckId,
        delivery_dispatch_intent_id: intent.delivery_dispatch_intent_id,
        dispatch_readiness_id: intent.dispatch_readiness_id,
        publication_preparation_id: intent.publication_preparation_id,
        normalized_outcome_id: intent.normalized_outcome_id,
        attempt_id: intent.attempt_id,
        request_id: intent.request_id,
        operation_id: intent.operation_id,
        source_precheck_id: intent.precheck_id,
        source_dispatch_intent_id: intent.source_dispatch_intent_id,
        runtime_handoff_id: intent.runtime_handoff_id,
        delivery_dispatch_precheck_family: precheckFamily,
        delivery_dispatch_precheck_status: precheckStatus,
        delivery_dispatch_precheck_result: precheckResult,
        delivery_dispatch_intent_family: intent.delivery_dispatch_intent_family,
        delivery_dispatch_intent_status: intent.delivery_dispatch_intent_status,
        dispatch_readiness_family: intent.dispatch_readiness_family,
        dispatch_readiness_status: intent.dispatch_readiness_status,
        publication_preparation_family: intent.publication_preparation_family,
        publication_preparation_status: intent.publication_preparation_status,
        normalized_outcome_family: intent.normalized_outcome_family,
        normalized_outcome_status: intent.normalized_outcome_status,
        lifecycle_state: intent.lifecycle_state,
        contour_target: intent.contour_target,
        family_mapping: familyMapping,
        status_mapping: statusMapping,
        authority_context_placeholder: intent.authority_context_placeholder,
        delivery_dispatch_precheck_boundary: boundary,
        runtime_surface_delivery_dispatch_precheck_envelope: runtimeEnvelope,
        integration_delivery_dispatch_precheck_linkage: integrationLinkage,
        delivery_dispatch_precheck_trace: trace,
        delivery_dispatch_precheck_audit_linkage: auditLinkage,
        warnings,
        created_at: now
      };
    }
  };
};

export const createDeliveryDispatchPrecheckSummaryBuilder = (): DeliveryDispatchPrecheckSummaryBuilder => {
  return {
    summarize(input: { prechecks: DeliveryDispatchPrecheckShape[] }): DeliveryDispatchPrecheckSummaryShape {
      return {
        total: input.prechecks.length,
        queued: input.prechecks.filter((item) => item.delivery_dispatch_precheck_status === "queued_delivery_dispatch_precheck").length,
        prepared: input.prechecks.filter((item) => item.delivery_dispatch_precheck_status === "prepared_delivery_dispatch_precheck").length,
        blocked: input.prechecks.filter((item) => item.delivery_dispatch_precheck_status === "blocked_delivery_dispatch_precheck").length,
        deferred: input.prechecks.filter((item) => item.delivery_dispatch_precheck_status === "deferred_delivery_dispatch_precheck").length,
        aborted: input.prechecks.filter((item) => item.delivery_dispatch_precheck_status === "aborted_delivery_dispatch_precheck").length,
        expired: input.prechecks.filter((item) => item.delivery_dispatch_precheck_status === "expired_delivery_dispatch_precheck").length,
        cancelled: input.prechecks.filter((item) => item.delivery_dispatch_precheck_status === "cancelled_delivery_dispatch_precheck").length,
        not_dispatchable: input.prechecks.filter(
          (item) => item.delivery_dispatch_precheck_status === "not_dispatchable_delivery_dispatch_precheck"
        ).length,
        by_delivery_dispatch_precheck_family: {
          read_path_delivery_dispatch_precheck: input.prechecks.filter(
            (item) => item.delivery_dispatch_precheck_family === "read_path_delivery_dispatch_precheck"
          ).length,
          pack_loop_delivery_dispatch_precheck: input.prechecks.filter(
            (item) => item.delivery_dispatch_precheck_family === "pack_loop_delivery_dispatch_precheck"
          ).length,
          write_path_delivery_dispatch_precheck: input.prechecks.filter(
            (item) => item.delivery_dispatch_precheck_family === "write_path_delivery_dispatch_precheck"
          ).length,
          handoff_delivery_dispatch_precheck: input.prechecks.filter(
            (item) => item.delivery_dispatch_precheck_family === "handoff_delivery_dispatch_precheck"
          ).length,
          unknown_delivery_dispatch_precheck: input.prechecks.filter(
            (item) => item.delivery_dispatch_precheck_family === "unknown_delivery_dispatch_precheck"
          ).length
        },
        warnings: input.prechecks.flatMap((item) => item.warnings)
      };
    }
  };
};
