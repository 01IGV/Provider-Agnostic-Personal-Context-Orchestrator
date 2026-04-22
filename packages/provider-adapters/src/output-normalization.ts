import type { ErrorFamily, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AdapterWarning,
  ProviderAdapterProfile,
  SemanticPreservationNote
} from "./types.js";

export interface ProviderRuntimeOutputEnvelope {
  provider_request_id?: string;
  provider_response_id?: string;
  response_payload: Record<string, unknown>;
  tool_events?: Array<{ tool_name: string; input: Record<string, unknown>; output?: Record<string, unknown> }>;
  error_payload?: Record<string, unknown>;
  received_at?: IsoDateTimeString;
}

export interface NormalizedOutputEnvelope {
  provider_profile_id: string;
  provider_family: string;
  runtime_host_type: string;
  normalized_payload: Record<string, unknown>;
  normalized_tool_events: Array<{ canonical_tool_name: string; payload: Record<string, unknown> }>;
  normalized_error_family?: ErrorFamily;
  warnings: AdapterWarning[];
  semantic_notes: SemanticPreservationNote[];
  normalized_at: IsoDateTimeString;
}

export interface OutputNormalizerInput {
  profile: ProviderAdapterProfile;
  output: ProviderRuntimeOutputEnvelope;
}

export interface OutputNormalizer {
  normalize(input: OutputNormalizerInput): NormalizedOutputEnvelope;
}

const normalizeErrorFamily = (payload?: Record<string, unknown>): ErrorFamily | undefined => {
  const rawCode = typeof payload?.code === "string" ? payload.code.toLowerCase() : undefined;
  if (!rawCode) {
    return undefined;
  }

  if (rawCode.includes("policy") || rawCode.includes("forbidden")) {
    return "policy_rejection";
  }
  if (rawCode.includes("scope") || rawCode.includes("permission")) {
    return "scope_denial";
  }
  if (rawCode.includes("invalid") || rawCode.includes("schema")) {
    return "invalid_input";
  }
  if (rawCode.includes("timeout") || rawCode.includes("transient")) {
    return "transient_service_failure";
  }

  return "provider_adapter_failure";
};

export const createOutputNormalizer = (): OutputNormalizer => {
  return {
    normalize(input: OutputNormalizerInput): NormalizedOutputEnvelope {
      const warnings: AdapterWarning[] = [];
      if (!input.profile.runtime_profile.supports_structured_output) {
        warnings.push({
          code: "normalization_loss_risk",
          note: "runtime has limited structured output reliability"
        });
      }

      return {
        provider_profile_id: input.profile.provider_profile_id,
        provider_family: input.profile.provider_family,
        runtime_host_type: input.profile.runtime_profile.runtime_host_type,
        normalized_payload: input.output.response_payload,
        normalized_tool_events: (input.output.tool_events ?? []).map((event) => ({
          canonical_tool_name: event.tool_name,
          payload: {
            input: event.input,
            ...(event.output ? { output: event.output } : {})
          }
        })),
        ...(input.output.error_payload
          ? (() => {
              const normalizedErrorFamily = normalizeErrorFamily(input.output.error_payload);
              return normalizedErrorFamily ? { normalized_error_family: normalizedErrorFamily } : {};
            })()
          : {}),
        warnings,
        semantic_notes: [
          { code: "writeback_linkage_preserved", note: "normalized output remains linked to provider invocation" }
        ],
        normalized_at: (input.output.received_at ?? new Date().toISOString()) as IsoDateTimeString
      };
    }
  };
};
