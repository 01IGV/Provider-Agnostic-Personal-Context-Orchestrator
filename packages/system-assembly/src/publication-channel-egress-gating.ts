import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createChannelBoundEgressResponseLinkageBuilder,
  type IntegrationPublicationChannelFamily,
  type SurfaceErrorObject,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type { RuntimePublicationChannelFamily, RuntimeSurfaceErrorShape } from "@orchestrator/runtime-surface";
import {
  createPublicationChannelBindingTraceBuilder,
  createPublicationEgressGateAuditLinkageBuilder
} from "@orchestrator/audit-eval";
import type {
  PublicationChannelEgressGatingInputShape,
  PublicationChannelEgressGatingShape,
  PublicationChannelEgressGatingSummaryShape,
  EgressGatingWarningShape,
  PublicationChannelBindingResultShape,
  EgressGateResultShape,
  RuntimeToIntegrationChannelFamilyMap
} from "./publication-channel-egress-gating-types.js";
import {
  EGRESS_GATE_STATUS_TO_SURFACE_STATUS,
  type ChannelEligibilityStatus,
  type EgressGateStatus,
  type PublicationChannelFamily
} from "./publication-channel-egress-gating-vocabularies.js";

const toChannelFamily = (input: PublicationChannelEgressGatingInputShape): PublicationChannelFamily => {
  const publicationFamily = input.publication_result.publication_family;
  if (publicationFamily === "read_path_publication") return "mcp_channel";
  if (publicationFamily === "pack_loop_publication") return "api_channel";
  if (publicationFamily === "write_path_publication") return "api_channel";
  if (publicationFamily === "handoff_publication") return "hybrid_channel";
  return "unknown_channel";
};

const toEligibilityStatus = (input: PublicationChannelEgressGatingInputShape): ChannelEligibilityStatus => {
  const publicationStatus = input.publication_result.publication_status;
  if (publicationStatus === "publication_ready") return "eligible";
  if (publicationStatus === "publication_partial") return "partially_bindable";
  if (publicationStatus === "publication_blocked") return "ineligible";
  if (publicationStatus === "publication_deferred") return "partially_bindable";
  if (publicationStatus === "publication_failed") return "unsupported";
  return "unknown";
};

const toGateStatus = (input: {
  channelFamily: PublicationChannelFamily;
  eligibilityStatus: ChannelEligibilityStatus;
  publicationStatus: PublicationChannelEgressGatingInputShape["publication_result"]["publication_status"];
}): EgressGateStatus => {
  if (input.channelFamily === "unknown_channel") return "unsupported";
  if (input.publicationStatus === "publication_deferred") return "deferred";
  if (input.eligibilityStatus === "eligible") return "allowed";
  if (input.eligibilityStatus === "ineligible") return "blocked";
  if (input.eligibilityStatus === "partially_bindable") return "partially_bindable";
  if (input.eligibilityStatus === "unsupported") return "unsupported";
  return "incomplete";
};

const buildWarnings = (input: {
  channelFamily: PublicationChannelFamily;
  eligibilityStatus: ChannelEligibilityStatus;
  gateStatus: EgressGateStatus;
}): EgressGatingWarningShape[] => {
  return [
    ...(input.channelFamily === "unknown_channel"
      ? [{ code: "channel_family_ambiguous", message: "publication channel family resolved to unknown_channel" } as const]
      : []),
    ...(input.eligibilityStatus === "ineligible" || input.eligibilityStatus === "unsupported"
      ? [{ code: "channel_capability_mismatch", message: "channel capability fit does not satisfy publication requirements" } as const]
      : []),
    ...(input.eligibilityStatus === "partially_bindable"
      ? [{ code: "channel_binding_partial", message: "channel eligibility is partially bindable" } as const]
      : []),
    ...(input.gateStatus === "blocked"
      ? [{ code: "egress_gate_blocked", message: "egress gate blocked the channel-bound publication" } as const]
      : []),
    ...(input.gateStatus === "deferred"
      ? [{ code: "egress_gate_deferred", message: "egress gate deferred the channel-bound publication" } as const]
      : []),
    ...(input.gateStatus === "unsupported"
      ? [{ code: "egress_gate_unsupported", message: "egress gate marked channel-bound publication as unsupported" } as const]
      : []),
    ...(input.gateStatus === "incomplete"
      ? [{ code: "egress_gate_incomplete", message: "egress gate produced incomplete gating decision" } as const]
      : []),
    { code: "channel_bound_surface_envelope_emitted", message: "channel-bound surface envelope contract emitted" },
    { code: "channel_bound_integration_envelope_emitted", message: "channel-bound integration envelope contract emitted" }
  ];
};

const toRuntimeError = (status: EgressGateStatus): RuntimeSurfaceErrorShape | undefined => {
  if (status === "blocked") {
    return {
      error_code: "boundary_preservation_warning",
      error_family: "internal_orchestration_failure",
      message: "egress gate blocked channel-bound publication at contract boundary",
      retryable: true
    };
  }

  if (status === "unsupported" || status === "incomplete") {
    return {
      error_code: "internal_surface_failure",
      error_family: "internal_orchestration_failure",
      message: "egress gate returned unsupported or incomplete result",
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

const RUNTIME_TO_INTEGRATION_CHANNEL_MAP: RuntimeToIntegrationChannelFamilyMap = {
  mcp_channel: "mcp_channel",
  api_channel: "api_channel",
  hybrid_channel: "hybrid_channel",
  unknown_channel: "unknown_channel"
};

const toSurfaceType = (channelFamily: PublicationChannelFamily): "mcp" | "api" | "hybrid" | undefined => {
  if (channelFamily === "mcp_channel") return "mcp";
  if (channelFamily === "api_channel") return "api";
  if (channelFamily === "hybrid_channel") return "hybrid";
  return undefined;
};

export interface PublicationChannelEgressGatingBuilder {
  evaluate(input: PublicationChannelEgressGatingInputShape): PublicationChannelEgressGatingShape;
}

export interface PublicationChannelEgressGatingSummaryBuilder {
  summarize(input: { egress_results: PublicationChannelEgressGatingShape[] }): PublicationChannelEgressGatingSummaryShape;
}

export const createPublicationChannelEgressGatingBuilder = (): PublicationChannelEgressGatingBuilder => {
  const integrationBuilder = createChannelBoundEgressResponseLinkageBuilder();
  const traceBuilder = createPublicationChannelBindingTraceBuilder();
  const auditBuilder = createPublicationEgressGateAuditLinkageBuilder();

  return {
    evaluate(input: PublicationChannelEgressGatingInputShape): PublicationChannelEgressGatingShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const channelFamily = toChannelFamily(input);
      const eligibilityStatus = toEligibilityStatus(input);
      const gateStatus = toGateStatus({
        channelFamily,
        eligibilityStatus,
        publicationStatus: input.publication_result.publication_status
      });
      const warnings = buildWarnings({ channelFamily, eligibilityStatus, gateStatus });
      const surfaceHint = EGRESS_GATE_STATUS_TO_SURFACE_STATUS[gateStatus];
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
      const runtimeError = toRuntimeError(gateStatus);
      const integrationError = toIntegrationError(runtimeError);

      const deliveryPayload: Record<string, unknown> = {
        publication_id: input.publication_result.publication_id,
        publication_status: input.publication_result.publication_status,
        publication_family: input.publication_result.publication_family,
        channel_family: channelFamily,
        egress_gate_status: gateStatus,
        delivery_payload: input.publication_result.delivery_ready_surface_envelope.delivery_payload
      };

      const bindingResult: PublicationChannelBindingResultShape = {
        binding_id: `${input.publication_result.publication_id}:channel-binding`,
        request_id: input.publication_result.request_id,
        operation_id: input.publication_result.operation_id,
        publication_family: input.publication_result.publication_family,
        selected_channel_family: channelFamily,
        candidate_channel_families: ["mcp_channel", "api_channel", "hybrid_channel", "unknown_channel"],
        binding_status:
          eligibilityStatus === "eligible"
            ? "bound"
            : eligibilityStatus === "partially_bindable"
              ? "partially_bound"
              : eligibilityStatus === "unsupported"
                ? "unsupported"
                : "unbound",
        eligibility: {
          channel_family: channelFamily,
          eligibility_status: eligibilityStatus,
          capability_fit:
            eligibilityStatus === "eligible"
              ? "fit"
              : eligibilityStatus === "partially_bindable"
                ? "partial_fit"
                : eligibilityStatus === "ineligible" || eligibilityStatus === "unsupported"
                  ? "no_fit"
                  : "unknown_fit",
          required_capabilities: [`${input.publication_result.publication_family}:publication`],
          available_capabilities:
            channelFamily === "mcp_channel"
              ? ["mcp_tools", "mcp_resources"]
              : channelFamily === "api_channel"
                ? ["api_request_response"]
                : channelFamily === "hybrid_channel"
                  ? ["mcp_tools", "api_request_response"]
                  : [],
          warnings
        },
        warnings,
        bound_at: now
      };

      const egressGateResult: EgressGateResultShape = {
        gate_id: `${input.publication_result.publication_id}:egress-gate`,
        request_id: input.publication_result.request_id,
        operation_id: input.publication_result.operation_id,
        channel_family: channelFamily,
        gate_status: gateStatus,
        reason:
          gateStatus === "allowed"
            ? "channel eligibility satisfied for egress publication contract"
            : gateStatus === "blocked"
              ? "channel eligibility rejected publication contract"
              : gateStatus === "deferred"
                ? "channel eligibility deferred publication contract"
                : gateStatus === "unsupported"
                  ? "channel family is unsupported for publication contract"
                  : gateStatus === "partially_bindable"
                    ? "channel eligibility is partially bindable for publication contract"
                    : "egress gate could not complete publication decision",
        warnings
      };

      const runtimeChannelFamily = channelFamily as RuntimePublicationChannelFamily;
      const integrationChannelFamily =
        RUNTIME_TO_INTEGRATION_CHANNEL_MAP[runtimeChannelFamily] as IntegrationPublicationChannelFamily;
      const surfaceType = toSurfaceType(channelFamily);

      const channelBoundSurfaceEnvelope = {
        request_id: input.publication_result.request_id,
        operation_id: input.publication_result.operation_id,
        publication_family: input.publication_result.publication_family,
        channel_family: runtimeChannelFamily,
        egress_gate_status: gateStatus,
        delivery_status_hint: surfaceHint,
        delivery_payload: deliveryPayload,
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        ...(runtimeError ? { error: runtimeError } : {}),
        prepared_at: now
      } as const;

      const channelBoundIntegrationEnvelope = integrationBuilder.build({
        linkage_id: `${input.publication_result.publication_id}:channel-bound-egress-linkage`,
        request_id: input.publication_result.request_id,
        operation_id: input.publication_result.operation_id,
        channel_family: integrationChannelFamily,
        egress_gate_status: gateStatus,
        egress_status: surfaceStatus,
        canonical_response: {
          request_id: input.publication_result.request_id,
          operation_id: input.publication_result.operation_id,
          status: surfaceStatus,
          result: deliveryPayload,
          warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: input.publication_result.request_id,
            operation_id: input.publication_result.operation_id,
            status: surfaceStatus,
            result: deliveryPayload,
            warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
            served_at: now
          },
          ...(integrationError ? { error: integrationError } : {})
        },
        ...(surfaceType ? { surface_type: surfaceType } : {}),
        ...(integrationError ? { linked_error: integrationError } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const channelBindingTrace = traceBuilder.build({
        trace_id: `${input.publication_result.publication_id}:channel-binding-trace`,
        request_id: input.publication_result.request_id,
        operation_id: input.publication_result.operation_id,
        publication_family: input.publication_result.publication_family,
        channel_family: channelFamily,
        eligibility_status: eligibilityStatus,
        egress_gate_status: gateStatus,
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      const egressGateAuditLinkage = auditBuilder.build({
        linkage_id: `${input.publication_result.publication_id}:channel-egress-audit-linkage`,
        request_id: input.publication_result.request_id,
        operation_id: input.publication_result.operation_id,
        publication_family: input.publication_result.publication_family,
        channel_family: channelFamily,
        egress_gate_status: gateStatus,
        ...(input.publication_result.publication_audit_linkage.attempt_id
          ? { attempt_id: input.publication_result.publication_audit_linkage.attempt_id }
          : {}),
        ...(input.publication_result.publication_audit_linkage.contour_target
          ? { contour_target: input.publication_result.publication_audit_linkage.contour_target }
          : {}),
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: warnings.map((warning) => ({ code: warning.code, message: warning.message })),
        now
      });

      return {
        channel_egress_id: `${input.publication_result.publication_id}:channel-egress`,
        request_id: input.publication_result.request_id,
        operation_id: input.publication_result.operation_id,
        publication_id: input.publication_result.publication_id,
        channel_binding: bindingResult,
        channel_binding_to_egress_linkage: {
          linkage_id: `${input.publication_result.publication_id}:binding-egress-linkage`,
          publication_id: input.publication_result.publication_id,
          binding_id: bindingResult.binding_id,
          request_id: input.publication_result.request_id,
          operation_id: input.publication_result.operation_id,
          channel_family: channelFamily,
          linked_at: now,
          warnings
        },
        egress_gate_result: egressGateResult,
        ...(gateStatus === "allowed" ? { allowed_egress: { status: "allowed", gate: egressGateResult } } : {}),
        ...(gateStatus === "blocked" ? { blocked_egress: { status: "blocked", gate: egressGateResult } } : {}),
        ...(gateStatus === "deferred" ? { deferred_egress: { status: "deferred", gate: egressGateResult } } : {}),
        ...(gateStatus === "unsupported"
          ? { unsupported_egress: { status: "unsupported", gate: egressGateResult } }
          : {}),
        ...(gateStatus === "partially_bindable"
          ? { partially_bindable_egress: { status: "partially_bindable", gate: egressGateResult } }
          : {}),
        channel_bound_surface_envelope: channelBoundSurfaceEnvelope,
        channel_bound_integration_envelope: channelBoundIntegrationEnvelope,
        channel_binding_trace: channelBindingTrace,
        egress_gate_audit_linkage: egressGateAuditLinkage,
        surface_status: surfaceStatus,
        warnings,
        prepared_at: now
      };
    }
  };
};

export const createPublicationChannelEgressGatingSummaryBuilder = (): PublicationChannelEgressGatingSummaryBuilder => {
  return {
    summarize(input: { egress_results: PublicationChannelEgressGatingShape[] }): PublicationChannelEgressGatingSummaryShape {
      return {
        total: input.egress_results.length,
        allowed: input.egress_results.filter((item) => item.egress_gate_result.gate_status === "allowed").length,
        blocked: input.egress_results.filter((item) => item.egress_gate_result.gate_status === "blocked").length,
        deferred: input.egress_results.filter((item) => item.egress_gate_result.gate_status === "deferred").length,
        unsupported: input.egress_results.filter((item) => item.egress_gate_result.gate_status === "unsupported").length,
        partially_bindable: input.egress_results.filter(
          (item) => item.egress_gate_result.gate_status === "partially_bindable"
        ).length,
        incomplete: input.egress_results.filter((item) => item.egress_gate_result.gate_status === "incomplete").length,
        warnings: input.egress_results.flatMap((item) => item.warnings)
      };
    }
  };
};
