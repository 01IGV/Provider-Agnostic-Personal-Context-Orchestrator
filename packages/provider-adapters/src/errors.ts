import type { ErrorFamily } from "@orchestrator/core-foundation";
import type { AdapterErrorCode } from "./vocabularies.js";

export interface AdapterErrorNormalizationShape {
  adapter_error_code: AdapterErrorCode;
  canonical_error_family: ErrorFamily;
  retryable: boolean;
  message: string;
  provider_error_code?: string;
  provider_error_message?: string;
  details?: Record<string, unknown>;
}

export interface AdapterErrorMapping {
  provider_error_hint: string;
  adapter_error_code: AdapterErrorCode;
  canonical_error_family: ErrorFamily;
  retryable: boolean;
}

export const ADAPTER_ERROR_MAPPINGS: AdapterErrorMapping[] = [
  {
    provider_error_hint: "schema_invalid",
    adapter_error_code: "normalization_failure",
    canonical_error_family: "invalid_input",
    retryable: false
  },
  {
    provider_error_hint: "unsupported_tool",
    adapter_error_code: "unsupported_capability",
    canonical_error_family: "unsupported_capability",
    retryable: false
  },
  {
    provider_error_hint: "policy_block",
    adapter_error_code: "projection_failure",
    canonical_error_family: "policy_rejection",
    retryable: false
  },
  {
    provider_error_hint: "transient_failure",
    adapter_error_code: "provider_response_invalid",
    canonical_error_family: "transient_service_failure",
    retryable: true
  },
  {
    provider_error_hint: "semantic_drift",
    adapter_error_code: "semantic_preservation_failure",
    canonical_error_family: "provider_adapter_failure",
    retryable: false
  },
  {
    provider_error_hint: "writeback_invalid",
    adapter_error_code: "writeback_envelope_invalid",
    canonical_error_family: "provider_adapter_failure",
    retryable: false
  }
];

export const normalizeAdapterError = (input: {
  provider_error_code?: string;
  provider_error_message?: string;
  details?: Record<string, unknown>;
}): AdapterErrorNormalizationShape => {
  const hint = input.provider_error_code?.toLowerCase() ?? "unknown";
  const mapping = ADAPTER_ERROR_MAPPINGS.find((item) => hint.includes(item.provider_error_hint));

  if (!mapping) {
    return {
      adapter_error_code: "projection_failure",
      canonical_error_family: "provider_adapter_failure",
      retryable: true,
      message: "provider adapter projection failed",
      ...(input.provider_error_code ? { provider_error_code: input.provider_error_code } : {}),
      ...(input.provider_error_message ? { provider_error_message: input.provider_error_message } : {}),
      ...(input.details ? { details: input.details } : {})
    };
  }

  return {
    adapter_error_code: mapping.adapter_error_code,
    canonical_error_family: mapping.canonical_error_family,
    retryable: mapping.retryable,
    message: `provider adapter normalized error: ${mapping.adapter_error_code}`,
    ...(input.provider_error_code ? { provider_error_code: input.provider_error_code } : {}),
    ...(input.provider_error_message ? { provider_error_message: input.provider_error_message } : {}),
    ...(input.details ? { details: input.details } : {})
  };
};
