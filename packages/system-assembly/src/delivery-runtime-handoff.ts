import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createDeliveryRuntimeHandoffLinkageBuilder,
  type SurfaceErrorObject,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type {
  RuntimeDeliveryRuntimeHandoffFamily,
  RuntimeDeliveryRuntimeHandoffStatus,
  RuntimeHandoffTargetFamilyShape,
  RuntimeSurfaceErrorShape
} from "@orchestrator/runtime-surface";
import {
  createDeliveryRuntimeHandoffAuditLinkageBuilder,
  createDeliveryRuntimeHandoffTraceBuilder
} from "@orchestrator/audit-eval";
import type {
  DeliveryRuntimeHandoffInputShape,
  DeliveryRuntimeHandoffShape,
  DeliveryRuntimeHandoffSummaryShape,
  DeliveryRuntimeHandoffWarningShape,
  HandlerInvocationPlaceholderShape,
  RuntimeTargetExpectationShape,
  RuntimeHandoffStatusMappingShape
} from "./delivery-runtime-handoff-types.js";
import {
  DELIVERY_RUNTIME_HANDOFF_STATUS_TO_SURFACE_STATUS,
  type DeliveryRuntimeHandoffFamily,
  type DeliveryRuntimeHandoffStatus,
  type RuntimeHandoffTargetFamily
} from "./delivery-runtime-handoff-vocabularies.js";

const toRuntimeHandoffFamily = (input: DeliveryRuntimeHandoffInputShape): DeliveryRuntimeHandoffFamily => {
  const family = input.delivery_precheck.precheck_family;
  if (family === "read_path_delivery_precheck") return "read_path_runtime_handoff";
  if (family === "pack_loop_delivery_precheck") return "pack_loop_runtime_handoff";
  if (family === "write_path_delivery_precheck") return "write_path_runtime_handoff";
  if (family === "handoff_delivery_precheck") return "handoff_runtime_handoff";
  return "unknown_runtime_handoff";
};

const toRuntimeTargetFamily = (input: DeliveryRuntimeHandoffInputShape): RuntimeHandoffTargetFamily => {
  const handlerFamily = input.delivery_precheck.delivery_target_expectation.target_handler_family;
  if (handlerFamily === "mcp_handler_family") return "mcp_runtime_target";
  if (handlerFamily === "api_handler_family") return "api_runtime_target";
  if (handlerFamily === "hybrid_handler_family") return "hybrid_runtime_target";
  return "unknown_runtime_target";
};

const toRuntimeHandoffStatus = (
  precheckStatus: DeliveryRuntimeHandoffInputShape["delivery_precheck"]["precheck_status"]
): DeliveryRuntimeHandoffStatus => {
  if (precheckStatus === "ready") return "ready_to_handoff";
  if (precheckStatus === "blocked") return "blocked";
  if (precheckStatus === "deferred") return "deferred";
  if (precheckStatus === "unavailable") return "unavailable";
  if (precheckStatus === "unsupported") return "unsupported";
  return "partially_ready";
};

const toRuntimeSurface = (targetFamily: RuntimeHandoffTargetFamily): RuntimeTargetExpectationShape["expected_runtime_surface"] => {
  if (targetFamily === "mcp_runtime_target") return "mcp_runtime_surface";
  if (targetFamily === "api_runtime_target") return "api_runtime_surface";
  if (targetFamily === "hybrid_runtime_target") return "hybrid_runtime_surface";
  return "unknown_runtime_surface";
};

const toRuntimeError = (status: DeliveryRuntimeHandoffStatus): RuntimeSurfaceErrorShape | undefined => {
  if (status === "blocked" || status === "deferred") {
    return {
      error_code: "boundary_preservation_warning",
      error_family: "internal_orchestration_failure",
      message: "runtime handoff placeholder status does not allow immediate delivery runtime progression",
      retryable: true
    };
  }
  if (status === "unavailable" || status === "unsupported") {
    return {
      error_code: "internal_surface_failure",
      error_family: "internal_orchestration_failure",
      message: "runtime handoff placeholder status indicates unavailable or unsupported runtime target",
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

const buildWarnings = (input: {
  runtimeHandoffFamily: DeliveryRuntimeHandoffFamily;
  runtimeTargetFamily: RuntimeHandoffTargetFamily;
  handoffStatus: DeliveryRuntimeHandoffStatus;
}): DeliveryRuntimeHandoffWarningShape[] => {
  return [
    ...(input.runtimeHandoffFamily === "unknown_runtime_handoff"
      ? [{ code: "runtime_handoff_family_ambiguous", message: "runtime handoff family resolved to unknown_runtime_handoff" } as const]
      : []),
    ...(input.runtimeTargetFamily === "unknown_runtime_target"
      ? [{ code: "runtime_handoff_target_ambiguous", message: "runtime handoff target resolved to unknown_runtime_target" } as const]
      : []),
    ...(input.handoffStatus === "blocked"
      ? [{ code: "runtime_handoff_blocked", message: "runtime handoff placeholder status is blocked" } as const]
      : []),
    ...(input.handoffStatus === "deferred"
      ? [{ code: "runtime_handoff_deferred", message: "runtime handoff placeholder status is deferred" } as const]
      : []),
    ...(input.handoffStatus === "unavailable"
      ? [{ code: "runtime_handoff_unavailable", message: "runtime handoff placeholder status is unavailable" } as const]
      : []),
    ...(input.handoffStatus === "unsupported"
      ? [{ code: "runtime_handoff_unsupported", message: "runtime handoff placeholder status is unsupported" } as const]
      : []),
    ...(input.handoffStatus === "partially_ready"
      ? [{ code: "runtime_handoff_partially_ready", message: "runtime handoff placeholder status is partially ready" } as const]
      : []),
    ...(input.handoffStatus === "unavailable" || input.handoffStatus === "unsupported"
      ? [{ code: "runtime_handoff_placeholder_incomplete", message: "runtime handoff placeholder remains incomplete for runtime delivery layer" } as const]
      : []),
    { code: "runtime_surface_handoff_placeholder_envelope_emitted", message: "runtime-surface handoff placeholder envelope contract emitted" },
    { code: "integration_handoff_placeholder_linkage_emitted", message: "integration handoff placeholder linkage contract emitted" }
  ];
};

export interface DeliveryRuntimeHandoffBuilder {
  map(input: DeliveryRuntimeHandoffInputShape): DeliveryRuntimeHandoffShape;
}

export interface DeliveryRuntimeHandoffSummaryBuilder {
  summarize(input: { handoffs: DeliveryRuntimeHandoffShape[] }): DeliveryRuntimeHandoffSummaryShape;
}

export const createDeliveryRuntimeHandoffBuilder = (): DeliveryRuntimeHandoffBuilder => {
  const integrationBuilder = createDeliveryRuntimeHandoffLinkageBuilder();
  const traceBuilder = createDeliveryRuntimeHandoffTraceBuilder();
  const auditBuilder = createDeliveryRuntimeHandoffAuditLinkageBuilder();

  return {
    map(input: DeliveryRuntimeHandoffInputShape): DeliveryRuntimeHandoffShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const runtimeHandoffFamily = toRuntimeHandoffFamily(input);
      const runtimeTargetFamily = toRuntimeTargetFamily(input);
      const handoffStatus = toRuntimeHandoffStatus(input.delivery_precheck.precheck_status);
      const warnings = buildWarnings({ runtimeHandoffFamily, runtimeTargetFamily, handoffStatus });
      const surfaceHint = DELIVERY_RUNTIME_HANDOFF_STATUS_TO_SURFACE_STATUS[handoffStatus];
      const surfaceStatus: SurfaceResponseStatus =
        surfaceHint === "success"
          ? "success"
          : surfaceHint === "accepted"
            ? "accepted"
            : surfaceHint === "partial"
              ? "partial"
              : surfaceHint === "rejected"
                ? "rejected"
                : "error";
      const runtimeError = toRuntimeError(handoffStatus);
      const integrationError = toIntegrationError(runtimeError);

      const runtimeTargetExpectation: RuntimeTargetExpectationShape = {
        target_family: runtimeTargetFamily,
        expected_runtime_surface: toRuntimeSurface(runtimeTargetFamily),
        expected_channel_family: input.delivery_precheck.delivery_target_expectation.channel_family,
        expected_handler_boundary:
          input.delivery_precheck.delivery_target_expectation.handler_boundary_expectation.handler_boundary,
        required_capabilities:
          input.delivery_precheck.delivery_target_expectation.handler_boundary_expectation.required_dispatch_capabilities,
        warnings
      };

      const placeholderPayload: Record<string, unknown> = {
        precheck_id: input.delivery_precheck.precheck_id,
        precheck_family: input.delivery_precheck.precheck_family,
        precheck_status: input.delivery_precheck.precheck_status,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        runtime_handoff_family: runtimeHandoffFamily,
        runtime_handoff_status: handoffStatus,
        runtime_target_family: runtimeTargetFamily,
        required_capabilities:
          input.delivery_precheck.delivery_target_expectation.handler_boundary_expectation.required_dispatch_capabilities
      };

      const handlerInvocationPlaceholder: HandlerInvocationPlaceholderShape = {
        placeholder_id: `${input.delivery_precheck.precheck_id}:handler-invocation-placeholder`,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        precheck_id: input.delivery_precheck.precheck_id,
        target_handler_family: runtimeTargetFamily,
        handler_boundary:
          input.delivery_precheck.delivery_target_expectation.handler_boundary_expectation.handler_boundary,
        invocation_mode:
          input.delivery_precheck.delivery_target_expectation.handler_boundary_expectation.expected_dispatch_mode,
        required_capabilities:
          input.delivery_precheck.delivery_target_expectation.handler_boundary_expectation.required_dispatch_capabilities,
        placeholder_payload: placeholderPayload,
        warnings
      };

      const runtimeStatus = handoffStatus as RuntimeDeliveryRuntimeHandoffStatus;
      const runtimeFamily = runtimeHandoffFamily as RuntimeDeliveryRuntimeHandoffFamily;
      const runtimeTarget = runtimeTargetFamily as RuntimeHandoffTargetFamilyShape;

      const runtimePlaceholderEnvelope = {
        request_id: input.delivery_precheck.request_id,
        operation_id: input.delivery_precheck.operation_id,
        precheck_id: input.delivery_precheck.precheck_id,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        runtime_handoff_family: runtimeFamily,
        runtime_handoff_status: runtimeStatus,
        runtime_target_family: runtimeTarget,
        dispatch_status_hint: surfaceHint,
        runtime_target_expectation: {
          target_family: runtimeTarget,
          expected_runtime_surface: runtimeTargetExpectation.expected_runtime_surface,
          expected_channel_family: runtimeTargetExpectation.expected_channel_family,
          expected_handler_boundary: runtimeTargetExpectation.expected_handler_boundary,
          required_capabilities: runtimeTargetExpectation.required_capabilities
        },
        handler_invocation_placeholder: {
          placeholder_id: handlerInvocationPlaceholder.placeholder_id,
          target_handler_family: runtimeTarget,
          handler_boundary: handlerInvocationPlaceholder.handler_boundary,
          invocation_mode: handlerInvocationPlaceholder.invocation_mode,
          required_capabilities: handlerInvocationPlaceholder.required_capabilities,
          placeholder_payload: handlerInvocationPlaceholder.placeholder_payload
        },
        placeholder_payload: placeholderPayload,
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        ...(runtimeError ? { error: runtimeError } : {}),
        prepared_at: now
      } as const;

      const integrationHandoffLinkage = integrationBuilder.build({
        linkage_id: `${input.delivery_precheck.precheck_id}:delivery-runtime-handoff-linkage`,
        request_id: input.delivery_precheck.request_id,
        operation_id: input.delivery_precheck.operation_id,
        precheck_id: input.delivery_precheck.precheck_id,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        runtime_handoff_family: runtimeHandoffFamily,
        runtime_handoff_status: handoffStatus,
        runtime_target_family: runtimeTargetFamily,
        runtime_target_expectation: {
          target_family: runtimeTargetFamily,
          expected_runtime_surface: runtimeTargetExpectation.expected_runtime_surface,
          expected_channel_family: runtimeTargetExpectation.expected_channel_family,
          expected_handler_boundary: runtimeTargetExpectation.expected_handler_boundary,
          required_capabilities: runtimeTargetExpectation.required_capabilities
        },
        handler_invocation_placeholder: {
          placeholder_id: handlerInvocationPlaceholder.placeholder_id,
          target_handler_family: runtimeTargetFamily,
          handler_boundary: handlerInvocationPlaceholder.handler_boundary,
          invocation_mode: handlerInvocationPlaceholder.invocation_mode,
          required_capabilities: handlerInvocationPlaceholder.required_capabilities,
          placeholder_payload: handlerInvocationPlaceholder.placeholder_payload
        },
        handoff_response_status: surfaceStatus,
        canonical_response: {
          request_id: input.delivery_precheck.request_id,
          operation_id: input.delivery_precheck.operation_id,
          status: surfaceStatus,
          result: placeholderPayload,
          warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: input.delivery_precheck.request_id,
            operation_id: input.delivery_precheck.operation_id,
            status: surfaceStatus,
            result: placeholderPayload,
            warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
            served_at: now
          },
          ...(integrationError ? { error: integrationError } : {})
        },
        ...(integrationError ? { linked_error: integrationError } : {}),
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        now
      });

      const runtimeHandoffTrace = traceBuilder.build({
        trace_id: `${input.delivery_precheck.precheck_id}:delivery-runtime-handoff-trace`,
        request_id: input.delivery_precheck.request_id,
        operation_id: input.delivery_precheck.operation_id,
        precheck_id: input.delivery_precheck.precheck_id,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        runtime_handoff_family: runtimeHandoffFamily,
        runtime_handoff_status: handoffStatus,
        runtime_target_family: runtimeTargetFamily,
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        now
      });

      const runtimeHandoffAuditLinkage = auditBuilder.build({
        linkage_id: `${input.delivery_precheck.precheck_id}:delivery-runtime-handoff-audit-linkage`,
        request_id: input.delivery_precheck.request_id,
        operation_id: input.delivery_precheck.operation_id,
        precheck_id: input.delivery_precheck.precheck_id,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        runtime_handoff_family: runtimeHandoffFamily,
        runtime_handoff_status: handoffStatus,
        runtime_target_family: runtimeTargetFamily,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        now
      });

      const statusMapping: RuntimeHandoffStatusMappingShape = {
        handoff_status: handoffStatus,
        runtime_status: runtimeStatus,
        surface_status: surfaceStatus
      };

      const precheckToRuntimeHandoffLinkage = {
        linkage_id: `${input.delivery_precheck.precheck_id}:precheck-runtime-handoff-linkage`,
        precheck_id: input.delivery_precheck.precheck_id,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        request_id: input.delivery_precheck.request_id,
        operation_id: input.delivery_precheck.operation_id,
        runtime_handoff_family: runtimeHandoffFamily,
        runtime_target_family: runtimeTargetFamily,
        linked_at: now,
        warnings
      } as const;

      const readyToHandoff =
        handoffStatus === "ready_to_handoff"
          ? {
              status: "ready_to_handoff" as const,
              reason: "delivery precheck outcome supports runtime handoff placeholder readiness",
              payload: placeholderPayload
            }
          : undefined;
      const blockedHandoff =
        handoffStatus === "blocked"
          ? { status: "blocked" as const, reason: "delivery precheck outcome blocked runtime handoff placeholder", payload: placeholderPayload }
          : undefined;
      const deferredHandoff =
        handoffStatus === "deferred"
          ? { status: "deferred" as const, reason: "delivery precheck outcome deferred runtime handoff placeholder", payload: placeholderPayload }
          : undefined;
      const unavailableHandoff =
        handoffStatus === "unavailable"
          ? { status: "unavailable" as const, reason: "delivery precheck outcome unavailable for runtime handoff placeholder", payload: placeholderPayload }
          : undefined;
      const unsupportedHandoff =
        handoffStatus === "unsupported"
          ? { status: "unsupported" as const, reason: "delivery precheck outcome unsupported for runtime handoff placeholder", payload: placeholderPayload }
          : undefined;
      const partiallyReadyHandoff =
        handoffStatus === "partially_ready"
          ? { status: "partially_ready" as const, reason: "delivery precheck outcome partially ready for runtime handoff placeholder", payload: placeholderPayload }
          : undefined;

      return {
        runtime_handoff_id: `${input.delivery_precheck.precheck_id}:delivery-runtime-handoff`,
        request_id: input.delivery_precheck.request_id,
        operation_id: input.delivery_precheck.operation_id,
        precheck_id: input.delivery_precheck.precheck_id,
        dispatch_intent_id: input.delivery_precheck.dispatch_intent_id,
        runtime_handoff_family: runtimeHandoffFamily,
        runtime_target_expectation: runtimeTargetExpectation,
        handoff_status: handoffStatus,
        status_mapping: statusMapping,
        precheck_to_runtime_handoff_linkage: precheckToRuntimeHandoffLinkage,
        handler_invocation_placeholder: handlerInvocationPlaceholder,
        ...(readyToHandoff ? { ready_to_handoff: readyToHandoff } : {}),
        ...(blockedHandoff ? { blocked_handoff: blockedHandoff } : {}),
        ...(deferredHandoff ? { deferred_handoff: deferredHandoff } : {}),
        ...(unavailableHandoff ? { unavailable_handoff: unavailableHandoff } : {}),
        ...(unsupportedHandoff ? { unsupported_handoff: unsupportedHandoff } : {}),
        ...(partiallyReadyHandoff ? { partially_ready_handoff: partiallyReadyHandoff } : {}),
        runtime_handoff_placeholder_envelope: runtimePlaceholderEnvelope,
        integration_handoff_linkage: integrationHandoffLinkage,
        runtime_handoff_trace: runtimeHandoffTrace,
        runtime_handoff_audit_linkage: runtimeHandoffAuditLinkage,
        warnings,
        prepared_at: now
      };
    }
  };
};

export const createDeliveryRuntimeHandoffSummaryBuilder = (): DeliveryRuntimeHandoffSummaryBuilder => {
  return {
    summarize(input: { handoffs: DeliveryRuntimeHandoffShape[] }): DeliveryRuntimeHandoffSummaryShape {
      return {
        total: input.handoffs.length,
        ready_to_handoff: input.handoffs.filter((item) => item.handoff_status === "ready_to_handoff").length,
        blocked: input.handoffs.filter((item) => item.handoff_status === "blocked").length,
        deferred: input.handoffs.filter((item) => item.handoff_status === "deferred").length,
        unavailable: input.handoffs.filter((item) => item.handoff_status === "unavailable").length,
        unsupported: input.handoffs.filter((item) => item.handoff_status === "unsupported").length,
        partially_ready: input.handoffs.filter((item) => item.handoff_status === "partially_ready").length,
        by_runtime_target_family: {
          mcp_runtime_target: input.handoffs.filter((item) => item.runtime_target_expectation.target_family === "mcp_runtime_target").length,
          api_runtime_target: input.handoffs.filter((item) => item.runtime_target_expectation.target_family === "api_runtime_target").length,
          hybrid_runtime_target: input.handoffs.filter((item) => item.runtime_target_expectation.target_family === "hybrid_runtime_target").length,
          unknown_runtime_target: input.handoffs.filter((item) => item.runtime_target_expectation.target_family === "unknown_runtime_target").length
        },
        warnings: input.handoffs.flatMap((item) => item.warnings)
      };
    }
  };
};
