import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createPublicationDispatchIntentLinkageBuilder,
  type SurfaceErrorObject,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type {
  RuntimePublicationDispatchIntentFamily,
  RuntimePublicationDispatchIntentStatus,
  RuntimePublicationDispatchTargetFamily,
  RuntimeSurfaceErrorShape
} from "@orchestrator/runtime-surface";
import {
  createPublicationDispatchIntentAuditLinkageBuilder,
  createPublicationDispatchIntentTraceBuilder
} from "@orchestrator/audit-eval";
import type {
  DispatchTargetExpectationShape,
  PublicationDispatchIntentInputShape,
  PublicationDispatchIntentShape,
  PublicationDispatchIntentSummaryShape,
  PublicationDispatchIntentWarningShape,
  DispatchIntentStatusMappingShape
} from "./publication-dispatch-intent-types.js";
import {
  DISPATCH_INTENT_STATUS_TO_SURFACE_STATUS,
  type PublicationDispatchIntentFamily,
  type PublicationDispatchIntentStatus,
  type PublicationDispatchTargetFamily
} from "./publication-dispatch-intent-vocabularies.js";

const toDispatchIntentFamily = (input: PublicationDispatchIntentInputShape): PublicationDispatchIntentFamily => {
  const publicationFamily = input.channel_egress_result.channel_binding.publication_family;
  if (publicationFamily === "read_path_publication") return "read_path_dispatch_intent";
  if (publicationFamily === "pack_loop_publication") return "pack_loop_dispatch_intent";
  if (publicationFamily === "write_path_publication") return "write_path_dispatch_intent";
  if (publicationFamily === "handoff_publication") return "handoff_dispatch_intent";
  return "unknown_dispatch_intent";
};

const toDispatchTargetFamily = (input: PublicationDispatchIntentInputShape): PublicationDispatchTargetFamily => {
  const channelFamily = input.channel_egress_result.channel_binding.selected_channel_family;
  if (channelFamily === "mcp_channel") return "mcp_handler_target";
  if (channelFamily === "api_channel") return "api_handler_target";
  if (channelFamily === "hybrid_channel") return "hybrid_handler_target";
  return "unknown_handler_target";
};

const toDispatchStatus = (input: PublicationDispatchIntentInputShape): PublicationDispatchIntentStatus => {
  const gateStatus = input.channel_egress_result.egress_gate_result.gate_status;
  if (gateStatus === "allowed") return "dispatch_allowed";
  if (gateStatus === "blocked") return "dispatch_blocked";
  if (gateStatus === "deferred" || gateStatus === "partially_bindable") return "dispatch_deferred";
  if (gateStatus === "unsupported") return "dispatch_unsupported";
  return "dispatch_incomplete";
};

const toRuntimeError = (status: PublicationDispatchIntentStatus): RuntimeSurfaceErrorShape | undefined => {
  if (status === "dispatch_blocked") {
    return {
      error_code: "boundary_preservation_warning",
      error_family: "internal_orchestration_failure",
      message: "dispatch intent is blocked at future handler boundary",
      retryable: true
    };
  }

  if (status === "dispatch_unsupported" || status === "dispatch_incomplete") {
    return {
      error_code: "internal_surface_failure",
      error_family: "internal_orchestration_failure",
      message: "dispatch intent is unsupported or incomplete for future delivery boundary",
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
  dispatchIntentFamily: PublicationDispatchIntentFamily;
  dispatchTargetFamily: PublicationDispatchTargetFamily;
  dispatchStatus: PublicationDispatchIntentStatus;
}): PublicationDispatchIntentWarningShape[] => {
  return [
    ...(input.dispatchIntentFamily === "unknown_dispatch_intent"
      ? [{ code: "dispatch_intent_family_ambiguous", message: "dispatch intent family resolved to unknown_dispatch_intent" } as const]
      : []),
    ...(input.dispatchTargetFamily === "unknown_handler_target"
      ? [{ code: "dispatch_target_ambiguous", message: "dispatch target resolved to unknown_handler_target" } as const]
      : []),
    ...(input.dispatchStatus === "dispatch_incomplete"
      ? [{ code: "dispatch_eligibility_incomplete_target", message: "dispatch intent eligibility could not resolve a complete target" } as const]
      : []),
    ...(input.dispatchStatus === "dispatch_blocked"
      ? [{ code: "dispatch_intent_blocked", message: "dispatch intent is blocked by egress gate status mapping" } as const]
      : []),
    ...(input.dispatchStatus === "dispatch_deferred"
      ? [{ code: "dispatch_intent_deferred", message: "dispatch intent is deferred pending future channel eligibility" } as const]
      : []),
    ...(input.dispatchStatus === "dispatch_unsupported"
      ? [{ code: "dispatch_intent_unsupported", message: "dispatch intent is unsupported for current channel-bound publication" } as const]
      : []),
    ...(input.dispatchStatus === "dispatch_incomplete"
      ? [{ code: "dispatch_intent_incomplete", message: "dispatch intent remains incomplete for future handler boundary" } as const]
      : []),
    { code: "surface_dispatch_intent_envelope_emitted", message: "runtime-surface dispatch-intent envelope contract emitted" },
    { code: "integration_dispatch_intent_linkage_emitted", message: "integration dispatch-intent linkage contract emitted" }
  ];
};

const toExpectedHandlerBoundary = (
  targetFamily: PublicationDispatchTargetFamily
): DispatchTargetExpectationShape["expected_handler_boundary"] => {
  if (targetFamily === "mcp_handler_target") return "mcp_handler_boundary";
  if (targetFamily === "api_handler_target") return "api_handler_boundary";
  if (targetFamily === "hybrid_handler_target") return "hybrid_handler_boundary";
  return "unknown_handler_boundary";
};

const toExpectedDispatchMode = (targetFamily: PublicationDispatchTargetFamily): DispatchTargetExpectationShape["expected_dispatch_mode"] => {
  if (targetFamily === "mcp_handler_target") return "asynchronous";
  if (targetFamily === "api_handler_target") return "synchronous";
  if (targetFamily === "hybrid_handler_target") return "mixed";
  return "unknown";
};

const toRequiredCapabilities = (targetFamily: PublicationDispatchTargetFamily): string[] => {
  if (targetFamily === "mcp_handler_target") return ["mcp_channel_dispatch"];
  if (targetFamily === "api_handler_target") return ["api_channel_dispatch"];
  if (targetFamily === "hybrid_handler_target") return ["mcp_channel_dispatch", "api_channel_dispatch"];
  return [];
};

export interface PublicationDispatchIntentBuilder {
  map(input: PublicationDispatchIntentInputShape): PublicationDispatchIntentShape;
}

export interface PublicationDispatchIntentSummaryBuilder {
  summarize(input: { dispatch_intents: PublicationDispatchIntentShape[] }): PublicationDispatchIntentSummaryShape;
}

export const createPublicationDispatchIntentBuilder = (): PublicationDispatchIntentBuilder => {
  const integrationBuilder = createPublicationDispatchIntentLinkageBuilder();
  const traceBuilder = createPublicationDispatchIntentTraceBuilder();
  const auditBuilder = createPublicationDispatchIntentAuditLinkageBuilder();

  return {
    map(input: PublicationDispatchIntentInputShape): PublicationDispatchIntentShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const dispatchIntentFamily = toDispatchIntentFamily(input);
      const dispatchTargetFamily = toDispatchTargetFamily(input);
      const dispatchIntentStatus = toDispatchStatus(input);
      const warnings = buildWarnings({ dispatchIntentFamily, dispatchTargetFamily, dispatchStatus: dispatchIntentStatus });
      const surfaceHint = DISPATCH_INTENT_STATUS_TO_SURFACE_STATUS[dispatchIntentStatus];
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
      const runtimeError = toRuntimeError(dispatchIntentStatus);
      const integrationError = toIntegrationError(runtimeError);

      const targetExpectation: DispatchTargetExpectationShape = {
        dispatch_target_family: dispatchTargetFamily,
        expected_handler_boundary: toExpectedHandlerBoundary(dispatchTargetFamily),
        expected_channel_family: input.channel_egress_result.channel_binding.selected_channel_family,
        required_dispatch_capabilities: toRequiredCapabilities(dispatchTargetFamily),
        expected_dispatch_mode: toExpectedDispatchMode(dispatchTargetFamily),
        warnings
      };

      const dispatchPayload: Record<string, unknown> = {
        channel_egress_id: input.channel_egress_result.channel_egress_id,
        publication_id: input.channel_egress_result.publication_id,
        publication_family: input.channel_egress_result.channel_binding.publication_family,
        channel_family: input.channel_egress_result.channel_binding.selected_channel_family,
        egress_gate_status: input.channel_egress_result.egress_gate_result.gate_status,
        dispatch_target_family: dispatchTargetFamily,
        dispatch_intent_family: dispatchIntentFamily,
        delivery_payload: input.channel_egress_result.channel_bound_surface_envelope.delivery_payload
      };

      const runtimeDispatchIntentFamily = dispatchIntentFamily as RuntimePublicationDispatchIntentFamily;
      const runtimeDispatchIntentStatus = dispatchIntentStatus as RuntimePublicationDispatchIntentStatus;
      const runtimeDispatchTargetFamily = dispatchTargetFamily as RuntimePublicationDispatchTargetFamily;

      const surfaceDispatchIntentEnvelope = {
        request_id: input.channel_egress_result.request_id,
        operation_id: input.channel_egress_result.operation_id,
        publication_family: input.channel_egress_result.channel_binding.publication_family,
        channel_family: input.channel_egress_result.channel_binding.selected_channel_family,
        dispatch_intent_family: runtimeDispatchIntentFamily,
        dispatch_intent_status: runtimeDispatchIntentStatus,
        dispatch_target_family: runtimeDispatchTargetFamily,
        dispatch_status_hint: surfaceHint,
        handler_boundary_expectation: {
          expected_handler_boundary: targetExpectation.expected_handler_boundary,
          required_dispatch_capabilities: targetExpectation.required_dispatch_capabilities,
          expected_dispatch_mode: targetExpectation.expected_dispatch_mode
        },
        dispatch_payload: dispatchPayload,
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        ...(runtimeError ? { error: runtimeError } : {}),
        prepared_at: now
      } as const;

      const integrationDispatchIntentLinkage = integrationBuilder.build({
        linkage_id: `${input.channel_egress_result.channel_egress_id}:dispatch-intent-linkage`,
        request_id: input.channel_egress_result.request_id,
        operation_id: input.channel_egress_result.operation_id,
        channel_family: input.channel_egress_result.channel_binding.selected_channel_family,
        dispatch_intent_family: dispatchIntentFamily,
        dispatch_intent_status: dispatchIntentStatus,
        dispatch_target_family: dispatchTargetFamily,
        handler_boundary_expectation: {
          expected_handler_boundary: targetExpectation.expected_handler_boundary,
          required_dispatch_capabilities: targetExpectation.required_dispatch_capabilities,
          expected_dispatch_mode: targetExpectation.expected_dispatch_mode
        },
        dispatch_status: surfaceStatus,
        canonical_response: {
          request_id: input.channel_egress_result.request_id,
          operation_id: input.channel_egress_result.operation_id,
          status: surfaceStatus,
          result: dispatchPayload,
          warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: input.channel_egress_result.request_id,
            operation_id: input.channel_egress_result.operation_id,
            status: surfaceStatus,
            result: dispatchPayload,
            warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
            served_at: now
          },
          ...(integrationError ? { error: integrationError } : {})
        },
        ...(integrationError ? { linked_error: integrationError } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const dispatchIntentTrace = traceBuilder.build({
        trace_id: `${input.channel_egress_result.channel_egress_id}:dispatch-intent-trace`,
        request_id: input.channel_egress_result.request_id,
        operation_id: input.channel_egress_result.operation_id,
        publication_family: input.channel_egress_result.channel_binding.publication_family,
        channel_family: input.channel_egress_result.channel_binding.selected_channel_family,
        dispatch_intent_family: dispatchIntentFamily,
        dispatch_intent_status: dispatchIntentStatus,
        dispatch_target_family: dispatchTargetFamily,
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const dispatchIntentAuditLinkage = auditBuilder.build({
        linkage_id: `${input.channel_egress_result.channel_egress_id}:dispatch-intent-audit-linkage`,
        request_id: input.channel_egress_result.request_id,
        operation_id: input.channel_egress_result.operation_id,
        publication_family: input.channel_egress_result.channel_binding.publication_family,
        channel_family: input.channel_egress_result.channel_binding.selected_channel_family,
        dispatch_intent_family: dispatchIntentFamily,
        dispatch_intent_status: dispatchIntentStatus,
        dispatch_target_family: dispatchTargetFamily,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const statusMapping: DispatchIntentStatusMappingShape = {
        dispatch_intent_status: dispatchIntentStatus,
        surface_status: surfaceStatus,
        dispatch_intent_family: dispatchIntentFamily
      };

      const channelToDispatchLinkage = {
        linkage_id: `${input.channel_egress_result.channel_egress_id}:channel-dispatch-linkage`,
        channel_egress_id: input.channel_egress_result.channel_egress_id,
        request_id: input.channel_egress_result.request_id,
        operation_id: input.channel_egress_result.operation_id,
        publication_family: input.channel_egress_result.channel_binding.publication_family,
        dispatch_intent_family: dispatchIntentFamily,
        dispatch_target_family: dispatchTargetFamily,
        linked_at: now,
        warnings
      } as const;

      const gateToDispatchEligibility = {
        gate_status: input.channel_egress_result.egress_gate_result.gate_status,
        dispatch_intent_status: dispatchIntentStatus,
        eligible_for_dispatch: dispatchIntentStatus === "dispatch_allowed",
        reason:
          dispatchIntentStatus === "dispatch_allowed"
            ? "egress gate allows dispatch intent mapping"
            : dispatchIntentStatus === "dispatch_blocked"
              ? "egress gate blocks dispatch intent mapping"
              : dispatchIntentStatus === "dispatch_deferred"
                ? "egress gate defers dispatch intent mapping"
                : dispatchIntentStatus === "dispatch_unsupported"
                  ? "egress gate marks dispatch intent as unsupported"
                  : "egress gate produced incomplete dispatch intent eligibility"
      } as const;

      const allowedDispatchIntent =
        dispatchIntentStatus === "dispatch_allowed"
          ? {
              status: "dispatch_allowed" as const,
              reason: "channel-bound egress gate result allowed dispatch intent",
              payload: dispatchPayload
            }
          : undefined;

      const blockedDispatchIntent =
        dispatchIntentStatus === "dispatch_blocked"
          ? {
              status: "dispatch_blocked" as const,
              reason: "channel-bound egress gate result blocked dispatch intent",
              payload: dispatchPayload
            }
          : undefined;

      const deferredDispatchIntent =
        dispatchIntentStatus === "dispatch_deferred"
          ? {
              status: "dispatch_deferred" as const,
              reason: "channel-bound egress gate result deferred dispatch intent",
              payload: dispatchPayload
            }
          : undefined;

      const unsupportedDispatchIntent =
        dispatchIntentStatus === "dispatch_unsupported"
          ? {
              status: "dispatch_unsupported" as const,
              reason: "channel-bound egress gate result produced unsupported dispatch intent",
              payload: dispatchPayload
            }
          : undefined;

      return {
        dispatch_intent_id: `${input.channel_egress_result.channel_egress_id}:dispatch-intent`,
        request_id: input.channel_egress_result.request_id,
        operation_id: input.channel_egress_result.operation_id,
        channel_egress_id: input.channel_egress_result.channel_egress_id,
        dispatch_intent_family: dispatchIntentFamily,
        dispatch_target_expectation: targetExpectation,
        dispatch_intent_status: dispatchIntentStatus,
        dispatch_status_mapping: statusMapping,
        channel_to_dispatch_linkage: channelToDispatchLinkage,
        egress_gate_dispatch_eligibility: gateToDispatchEligibility,
        ...(allowedDispatchIntent ? { allowed_dispatch_intent: allowedDispatchIntent } : {}),
        ...(blockedDispatchIntent ? { blocked_dispatch_intent: blockedDispatchIntent } : {}),
        ...(deferredDispatchIntent ? { deferred_dispatch_intent: deferredDispatchIntent } : {}),
        ...(unsupportedDispatchIntent ? { unsupported_dispatch_intent: unsupportedDispatchIntent } : {}),
        surface_dispatch_intent_envelope: surfaceDispatchIntentEnvelope,
        integration_dispatch_intent_linkage: integrationDispatchIntentLinkage,
        dispatch_intent_trace: dispatchIntentTrace,
        dispatch_intent_audit_linkage: dispatchIntentAuditLinkage,
        warnings,
        prepared_at: now
      };
    }
  };
};

export const createPublicationDispatchIntentSummaryBuilder = (): PublicationDispatchIntentSummaryBuilder => {
  return {
    summarize(input: { dispatch_intents: PublicationDispatchIntentShape[] }): PublicationDispatchIntentSummaryShape {
      return {
        total: input.dispatch_intents.length,
        dispatch_allowed: input.dispatch_intents.filter((item) => item.dispatch_intent_status === "dispatch_allowed").length,
        dispatch_blocked: input.dispatch_intents.filter((item) => item.dispatch_intent_status === "dispatch_blocked").length,
        dispatch_deferred: input.dispatch_intents.filter((item) => item.dispatch_intent_status === "dispatch_deferred").length,
        dispatch_unsupported: input.dispatch_intents.filter((item) => item.dispatch_intent_status === "dispatch_unsupported").length,
        dispatch_incomplete: input.dispatch_intents.filter((item) => item.dispatch_intent_status === "dispatch_incomplete").length,
        by_target_family: {
          mcp_handler_target: input.dispatch_intents.filter(
            (item) => item.dispatch_target_expectation.dispatch_target_family === "mcp_handler_target"
          ).length,
          api_handler_target: input.dispatch_intents.filter(
            (item) => item.dispatch_target_expectation.dispatch_target_family === "api_handler_target"
          ).length,
          hybrid_handler_target: input.dispatch_intents.filter(
            (item) => item.dispatch_target_expectation.dispatch_target_family === "hybrid_handler_target"
          ).length,
          unknown_handler_target: input.dispatch_intents.filter(
            (item) => item.dispatch_target_expectation.dispatch_target_family === "unknown_handler_target"
          ).length
        },
        warnings: input.dispatch_intents.flatMap((item) => item.warnings)
      };
    }
  };
};
