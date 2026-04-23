import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createDeliveryPrecheckLinkageBuilder,
  type SurfaceErrorObject,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type {
  RuntimeDeliveryPrecheckFamily,
  RuntimeDeliveryPrecheckStatus,
  RuntimeTargetHandlerFamily,
  RuntimeSurfaceErrorShape
} from "@orchestrator/runtime-surface";
import {
  createDeliveryPrecheckAuditLinkageBuilder,
  createDeliveryPrecheckTraceBuilder
} from "@orchestrator/audit-eval";
import type {
  DeliveryPrecheckInputShape,
  DeliveryPrecheckShape,
  DeliveryPrecheckSummaryShape,
  DeliveryPrecheckWarningShape,
  HandlerReadinessShape,
  ChannelReadinessShape,
  DeliveryCapabilityFitShape,
  HandlerBoundaryExpectationShape,
  DeliveryPrecheckStatusMappingShape
} from "./delivery-precheck-types.js";
import {
  DELIVERY_PRECHECK_STATUS_TO_SURFACE_STATUS,
  type DeliveryPrecheckFamily,
  type DeliveryPrecheckStatus,
  type TargetHandlerFamily
} from "./delivery-precheck-vocabularies.js";

const toPrecheckFamily = (input: DeliveryPrecheckInputShape): DeliveryPrecheckFamily => {
  const family = input.dispatch_intent.dispatch_intent_family;
  if (family === "read_path_dispatch_intent") return "read_path_delivery_precheck";
  if (family === "pack_loop_dispatch_intent") return "pack_loop_delivery_precheck";
  if (family === "write_path_dispatch_intent") return "write_path_delivery_precheck";
  if (family === "handoff_dispatch_intent") return "handoff_delivery_precheck";
  return "unknown_delivery_precheck";
};

const toTargetHandlerFamily = (input: DeliveryPrecheckInputShape): TargetHandlerFamily => {
  const target = input.dispatch_intent.dispatch_target_expectation.dispatch_target_family;
  if (target === "mcp_handler_target") return "mcp_handler_family";
  if (target === "api_handler_target") return "api_handler_family";
  if (target === "hybrid_handler_target") return "hybrid_handler_family";
  return "unknown_handler_family";
};

const toPrecheckStatus = (input: {
  dispatchStatus: DeliveryPrecheckInputShape["dispatch_intent"]["dispatch_intent_status"];
  targetHandlerFamily: TargetHandlerFamily;
  capabilityFit: DeliveryCapabilityFitShape["fit"];
}): DeliveryPrecheckStatus => {
  if (input.targetHandlerFamily === "unknown_handler_family") return "unavailable";
  if (input.dispatchStatus === "dispatch_allowed") {
    if (input.capabilityFit === "fit") return "ready";
    if (input.capabilityFit === "partial_fit") return "partially_ready";
    if (input.capabilityFit === "no_fit") return "unsupported";
    return "unavailable";
  }
  if (input.dispatchStatus === "dispatch_blocked") return "blocked";
  if (input.dispatchStatus === "dispatch_deferred") return "deferred";
  if (input.dispatchStatus === "dispatch_unsupported") return "unsupported";
  return "unavailable";
};

const toRuntimeError = (status: DeliveryPrecheckStatus): RuntimeSurfaceErrorShape | undefined => {
  if (status === "blocked" || status === "deferred") {
    return {
      error_code: "boundary_preservation_warning",
      error_family: "internal_orchestration_failure",
      message: "delivery precheck status does not allow immediate handler-boundary progression",
      retryable: true
    };
  }
  if (status === "unavailable" || status === "unsupported") {
    return {
      error_code: "internal_surface_failure",
      error_family: "internal_orchestration_failure",
      message: "delivery precheck status indicates unavailable or unsupported handler boundary",
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
  precheckFamily: DeliveryPrecheckFamily;
  targetHandlerFamily: TargetHandlerFamily;
  capabilityFit: DeliveryCapabilityFitShape["fit"];
  precheckStatus: DeliveryPrecheckStatus;
}): DeliveryPrecheckWarningShape[] => {
  return [
    ...(input.precheckFamily === "unknown_delivery_precheck"
      ? [{ code: "precheck_family_ambiguous", message: "delivery precheck family resolved to unknown_delivery_precheck" } as const]
      : []),
    ...(input.targetHandlerFamily === "unknown_handler_family"
      ? [{ code: "handler_boundary_ambiguous", message: "target handler family resolved to unknown_handler_family" } as const]
      : []),
    ...(input.capabilityFit === "partial_fit"
      ? [{ code: "capability_fit_partial", message: "delivery capability fit is partial for handler boundary expectation" } as const]
      : []),
    ...(input.capabilityFit === "no_fit"
      ? [{ code: "capability_fit_mismatch", message: "delivery capability fit does not satisfy handler boundary expectation" } as const]
      : []),
    ...(input.precheckStatus === "blocked"
      ? [{ code: "precheck_blocked", message: "delivery precheck produced blocked result" } as const]
      : []),
    ...(input.precheckStatus === "deferred"
      ? [{ code: "precheck_deferred", message: "delivery precheck produced deferred result" } as const]
      : []),
    ...(input.precheckStatus === "unsupported"
      ? [{ code: "precheck_unsupported", message: "delivery precheck produced unsupported result" } as const]
      : []),
    ...(input.precheckStatus === "unavailable"
      ? [
          { code: "handler_unavailable", message: "target handler family is unavailable for delivery precheck" } as const,
          { code: "precheck_incomplete_handler_boundary", message: "delivery precheck could not establish complete handler boundary readiness" } as const
        ]
      : []),
    { code: "surface_precheck_envelope_emitted", message: "runtime-surface delivery precheck envelope contract emitted" },
    { code: "integration_precheck_linkage_emitted", message: "integration delivery precheck linkage contract emitted" }
  ];
};

const toAvailableCapabilities = (targetHandlerFamily: TargetHandlerFamily): string[] => {
  if (targetHandlerFamily === "mcp_handler_family") return ["mcp_channel_dispatch", "mcp_handler_readiness_probe"];
  if (targetHandlerFamily === "api_handler_family") return ["api_channel_dispatch", "api_handler_readiness_probe"];
  if (targetHandlerFamily === "hybrid_handler_family") {
    return ["mcp_channel_dispatch", "api_channel_dispatch", "hybrid_handler_readiness_probe"];
  }
  return [];
};

const toCapabilityFit = (input: {
  required: string[];
  available: string[];
  dispatchStatus: DeliveryPrecheckInputShape["dispatch_intent"]["dispatch_intent_status"];
}): DeliveryCapabilityFitShape["fit"] => {
  if (input.available.length === 0) return "unknown_fit";
  if (input.dispatchStatus === "dispatch_deferred") return "partial_fit";
  const covered = input.required.filter((item) => input.available.includes(item));
  if (covered.length === input.required.length) return "fit";
  if (covered.length > 0) return "partial_fit";
  return "no_fit";
};

export interface DeliveryPrecheckBuilder {
  evaluate(input: DeliveryPrecheckInputShape): DeliveryPrecheckShape;
}

export interface DeliveryPrecheckSummaryBuilder {
  summarize(input: { prechecks: DeliveryPrecheckShape[] }): DeliveryPrecheckSummaryShape;
}

export const createDeliveryPrecheckBuilder = (): DeliveryPrecheckBuilder => {
  const integrationBuilder = createDeliveryPrecheckLinkageBuilder();
  const traceBuilder = createDeliveryPrecheckTraceBuilder();
  const auditBuilder = createDeliveryPrecheckAuditLinkageBuilder();

  return {
    evaluate(input: DeliveryPrecheckInputShape): DeliveryPrecheckShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const precheckFamily = toPrecheckFamily(input);
      const targetHandlerFamily = toTargetHandlerFamily(input);
      const requiredCapabilities = input.dispatch_intent.dispatch_target_expectation.required_dispatch_capabilities;
      const availableCapabilities = toAvailableCapabilities(targetHandlerFamily);
      const capabilityFitValue = toCapabilityFit({
        required: requiredCapabilities,
        available: availableCapabilities,
        dispatchStatus: input.dispatch_intent.dispatch_intent_status
      });
      const precheckStatus = toPrecheckStatus({
        dispatchStatus: input.dispatch_intent.dispatch_intent_status,
        targetHandlerFamily,
        capabilityFit: capabilityFitValue
      });
      const warnings = buildWarnings({
        precheckFamily,
        targetHandlerFamily,
        capabilityFit: capabilityFitValue,
        precheckStatus
      });
      const surfaceHint = DELIVERY_PRECHECK_STATUS_TO_SURFACE_STATUS[precheckStatus];
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
      const runtimeError = toRuntimeError(precheckStatus);
      const integrationError = toIntegrationError(runtimeError);

      const handlerReadiness: HandlerReadinessShape = {
        target_handler_family: targetHandlerFamily,
        handler_boundary: input.dispatch_intent.dispatch_target_expectation.expected_handler_boundary,
        readiness:
          precheckStatus === "ready"
            ? "ready"
            : precheckStatus === "partially_ready"
              ? "partially_ready"
              : precheckStatus === "unsupported"
                ? "unsupported"
                : precheckStatus === "unavailable"
                  ? "unavailable"
                  : "unknown",
        reason:
          precheckStatus === "ready"
            ? "handler family is contractually ready for future delivery boundary"
            : precheckStatus === "partially_ready"
              ? "handler family is partially ready based on capability fit"
              : precheckStatus === "unsupported"
                ? "handler family does not satisfy required delivery capabilities"
                : precheckStatus === "unavailable"
                  ? "handler family is unavailable at delivery precheck boundary"
                  : "handler readiness depends on future delivery runtime resolution",
        warnings
      };

      const channelReadiness: ChannelReadinessShape = {
        channel_family: input.dispatch_intent.dispatch_target_expectation.expected_channel_family,
        readiness:
          precheckStatus === "ready"
            ? "ready"
            : precheckStatus === "partially_ready"
              ? "partially_ready"
              : precheckStatus === "unsupported"
                ? "unsupported"
                : precheckStatus === "unavailable"
                  ? "unavailable"
                  : "unknown",
        reason:
          precheckStatus === "blocked"
            ? "channel remains blocked by upstream dispatch-intent result"
            : precheckStatus === "deferred"
              ? "channel readiness is deferred for future delivery window"
              : precheckStatus === "unavailable"
                ? "channel readiness could not be established from handler-boundary contracts"
                : "channel readiness mapped from dispatch-intent and handler-boundary contracts",
        warnings
      };

      const deliveryCapabilityFit: DeliveryCapabilityFitShape = {
        required_capabilities: requiredCapabilities,
        available_capabilities: availableCapabilities,
        fit: capabilityFitValue,
        reason:
          capabilityFitValue === "fit"
            ? "all required dispatch capabilities are represented in handler-boundary capability surface"
            : capabilityFitValue === "partial_fit"
              ? "subset of required dispatch capabilities are represented in handler-boundary capability surface"
              : capabilityFitValue === "no_fit"
                ? "required dispatch capabilities are not represented in handler-boundary capability surface"
                : "handler-boundary capability surface is unknown for dispatch intent",
        warnings
      };

      const handlerBoundaryExpectation: HandlerBoundaryExpectationShape = {
        target_handler_family: targetHandlerFamily,
        handler_boundary: input.dispatch_intent.dispatch_target_expectation.expected_handler_boundary,
        expected_dispatch_mode: input.dispatch_intent.dispatch_target_expectation.expected_dispatch_mode,
        required_dispatch_capabilities: requiredCapabilities,
        readiness_status: precheckStatus,
        warnings
      };

      const deliveryTargetExpectation = {
        precheck_family: precheckFamily,
        channel_family: input.dispatch_intent.dispatch_target_expectation.expected_channel_family,
        target_handler_family: targetHandlerFamily,
        handler_boundary_expectation: handlerBoundaryExpectation,
        warnings
      } as const;

      const runtimePrecheckStatus = precheckStatus as RuntimeDeliveryPrecheckStatus;
      const runtimePrecheckFamily = precheckFamily as RuntimeDeliveryPrecheckFamily;
      const runtimeTargetHandlerFamily = targetHandlerFamily as RuntimeTargetHandlerFamily;

      const precheckPayload: Record<string, unknown> = {
        dispatch_intent_id: input.dispatch_intent.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent.dispatch_intent_family,
        dispatch_target_family: input.dispatch_intent.dispatch_target_expectation.dispatch_target_family,
        precheck_family: precheckFamily,
        precheck_status: precheckStatus,
        handler_boundary: input.dispatch_intent.dispatch_target_expectation.expected_handler_boundary,
        required_capabilities: requiredCapabilities,
        available_capabilities: availableCapabilities
      };

      const runtimePrecheckEnvelope = {
        request_id: input.dispatch_intent.request_id,
        operation_id: input.dispatch_intent.operation_id,
        dispatch_intent_id: input.dispatch_intent.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent.dispatch_intent_family,
        precheck_family: runtimePrecheckFamily,
        precheck_status: runtimePrecheckStatus,
        target_handler_family: runtimeTargetHandlerFamily,
        dispatch_status_hint: surfaceHint,
        handler_boundary_expectation: {
          target_handler_family: runtimeTargetHandlerFamily,
          handler_boundary: handlerBoundaryExpectation.handler_boundary,
          expected_dispatch_mode: handlerBoundaryExpectation.expected_dispatch_mode,
          required_dispatch_capabilities: handlerBoundaryExpectation.required_dispatch_capabilities,
          readiness_status: runtimePrecheckStatus
        },
        precheck_payload: precheckPayload,
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        ...(runtimeError ? { error: runtimeError } : {}),
        prepared_at: now
      } as const;

      const integrationPrecheckLinkage = integrationBuilder.build({
        linkage_id: `${input.dispatch_intent.dispatch_intent_id}:delivery-precheck-linkage`,
        request_id: input.dispatch_intent.request_id,
        operation_id: input.dispatch_intent.operation_id,
        dispatch_intent_id: input.dispatch_intent.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent.dispatch_intent_family,
        precheck_family: precheckFamily,
        precheck_status: precheckStatus,
        target_handler_family: targetHandlerFamily,
        handler_boundary_expectation: {
          target_handler_family: targetHandlerFamily,
          handler_boundary: handlerBoundaryExpectation.handler_boundary,
          expected_dispatch_mode: handlerBoundaryExpectation.expected_dispatch_mode,
          required_dispatch_capabilities: handlerBoundaryExpectation.required_dispatch_capabilities,
          readiness_status: precheckStatus
        },
        precheck_response_status: surfaceStatus,
        canonical_response: {
          request_id: input.dispatch_intent.request_id,
          operation_id: input.dispatch_intent.operation_id,
          status: surfaceStatus,
          result: precheckPayload,
          warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: input.dispatch_intent.request_id,
            operation_id: input.dispatch_intent.operation_id,
            status: surfaceStatus,
            result: precheckPayload,
            warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
            served_at: now
          },
          ...(integrationError ? { error: integrationError } : {})
        },
        ...(integrationError ? { linked_error: integrationError } : {}),
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        now
      });

      const precheckTrace = traceBuilder.build({
        trace_id: `${input.dispatch_intent.dispatch_intent_id}:delivery-precheck-trace`,
        request_id: input.dispatch_intent.request_id,
        operation_id: input.dispatch_intent.operation_id,
        dispatch_intent_id: input.dispatch_intent.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent.dispatch_intent_family,
        precheck_family: precheckFamily,
        precheck_status: precheckStatus,
        target_handler_family: targetHandlerFamily,
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        now
      });

      const precheckAuditLinkage = auditBuilder.build({
        linkage_id: `${input.dispatch_intent.dispatch_intent_id}:delivery-precheck-audit-linkage`,
        request_id: input.dispatch_intent.request_id,
        operation_id: input.dispatch_intent.operation_id,
        dispatch_intent_id: input.dispatch_intent.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent.dispatch_intent_family,
        precheck_family: precheckFamily,
        precheck_status: precheckStatus,
        target_handler_family: targetHandlerFamily,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: warnings.map((item) => ({ code: item.code, message: item.message })),
        now
      });

      const statusMapping: DeliveryPrecheckStatusMappingShape = {
        precheck_status: precheckStatus,
        runtime_status: runtimePrecheckStatus,
        surface_status: surfaceStatus
      };

      const linkage = {
        linkage_id: `${input.dispatch_intent.dispatch_intent_id}:precheck-handler-boundary-linkage`,
        dispatch_intent_id: input.dispatch_intent.dispatch_intent_id,
        request_id: input.dispatch_intent.request_id,
        operation_id: input.dispatch_intent.operation_id,
        precheck_family: precheckFamily,
        target_handler_family: targetHandlerFamily,
        linked_at: now,
        warnings
      } as const;

      const readyPrecheck =
        precheckStatus === "ready"
          ? { status: "ready" as const, reason: "delivery precheck confirms ready-to-bind handler boundary contract", payload: precheckPayload }
          : undefined;
      const blockedPrecheck =
        precheckStatus === "blocked"
          ? { status: "blocked" as const, reason: "delivery precheck blocked by upstream dispatch intent status", payload: precheckPayload }
          : undefined;
      const deferredPrecheck =
        precheckStatus === "deferred"
          ? { status: "deferred" as const, reason: "delivery precheck deferred for future handler boundary readiness", payload: precheckPayload }
          : undefined;
      const unavailablePrecheck =
        precheckStatus === "unavailable"
          ? { status: "unavailable" as const, reason: "delivery precheck could not resolve available handler-boundary readiness", payload: precheckPayload }
          : undefined;
      const unsupportedPrecheck =
        precheckStatus === "unsupported"
          ? { status: "unsupported" as const, reason: "delivery precheck determined handler boundary is unsupported", payload: precheckPayload }
          : undefined;
      const partiallyReadyPrecheck =
        precheckStatus === "partially_ready"
          ? { status: "partially_ready" as const, reason: "delivery precheck determined partial handler-boundary readiness", payload: precheckPayload }
          : undefined;

      return {
        precheck_id: `${input.dispatch_intent.dispatch_intent_id}:delivery-precheck`,
        request_id: input.dispatch_intent.request_id,
        operation_id: input.dispatch_intent.operation_id,
        dispatch_intent_id: input.dispatch_intent.dispatch_intent_id,
        precheck_family: precheckFamily,
        precheck_status: precheckStatus,
        status_mapping: statusMapping,
        handler_readiness: handlerReadiness,
        channel_readiness: channelReadiness,
        delivery_capability_fit: deliveryCapabilityFit,
        delivery_target_expectation: deliveryTargetExpectation,
        precheck_handler_boundary_linkage: linkage,
        ...(readyPrecheck ? { ready_precheck: readyPrecheck } : {}),
        ...(blockedPrecheck ? { blocked_precheck: blockedPrecheck } : {}),
        ...(deferredPrecheck ? { deferred_precheck: deferredPrecheck } : {}),
        ...(unavailablePrecheck ? { unavailable_precheck: unavailablePrecheck } : {}),
        ...(unsupportedPrecheck ? { unsupported_precheck: unsupportedPrecheck } : {}),
        ...(partiallyReadyPrecheck ? { partially_ready_precheck: partiallyReadyPrecheck } : {}),
        runtime_precheck_envelope: runtimePrecheckEnvelope,
        integration_precheck_linkage: integrationPrecheckLinkage,
        precheck_trace: precheckTrace,
        precheck_audit_linkage: precheckAuditLinkage,
        warnings,
        prepared_at: now
      };
    }
  };
};

export const createDeliveryPrecheckSummaryBuilder = (): DeliveryPrecheckSummaryBuilder => {
  return {
    summarize(input: { prechecks: DeliveryPrecheckShape[] }): DeliveryPrecheckSummaryShape {
      return {
        total: input.prechecks.length,
        ready: input.prechecks.filter((item) => item.precheck_status === "ready").length,
        blocked: input.prechecks.filter((item) => item.precheck_status === "blocked").length,
        deferred: input.prechecks.filter((item) => item.precheck_status === "deferred").length,
        unavailable: input.prechecks.filter((item) => item.precheck_status === "unavailable").length,
        unsupported: input.prechecks.filter((item) => item.precheck_status === "unsupported").length,
        partially_ready: input.prechecks.filter((item) => item.precheck_status === "partially_ready").length,
        by_target_handler_family: {
          mcp_handler_family: input.prechecks.filter(
            (item) => item.delivery_target_expectation.target_handler_family === "mcp_handler_family"
          ).length,
          api_handler_family: input.prechecks.filter(
            (item) => item.delivery_target_expectation.target_handler_family === "api_handler_family"
          ).length,
          hybrid_handler_family: input.prechecks.filter(
            (item) => item.delivery_target_expectation.target_handler_family === "hybrid_handler_family"
          ).length,
          unknown_handler_family: input.prechecks.filter(
            (item) => item.delivery_target_expectation.target_handler_family === "unknown_handler_family"
          ).length
        },
        warnings: input.prechecks.flatMap((item) => item.warnings)
      };
    }
  };
};
