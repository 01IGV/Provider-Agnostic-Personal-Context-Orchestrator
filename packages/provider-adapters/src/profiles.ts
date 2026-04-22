import type { ProviderProfile } from "@orchestrator/core-domain";
import type { ProviderAdapterProfile, RuntimeCapabilityProfile } from "./types.js";
import { ADAPTER_PROVIDER_FAMILIES, ADAPTER_RUNTIME_HOST_TYPES } from "./vocabularies.js";

export interface RuntimeCapabilityProfileResolver {
  resolve(input: { provider_profile: ProviderProfile }): RuntimeCapabilityProfile;
}

export interface ProviderAdapterProfileBuilder {
  build(input: { provider_profile: ProviderProfile }): ProviderAdapterProfile;
}

const normalizeProviderFamily = (value: string): ProviderAdapterProfile["provider_family"] => {
  const lowered = value.toLowerCase();
  if (ADAPTER_PROVIDER_FAMILIES.includes(lowered as ProviderAdapterProfile["provider_family"])) {
    return lowered as ProviderAdapterProfile["provider_family"];
  }

  if (lowered.includes("openai")) {
    return "openai_compatible";
  }

  if (lowered.includes("anthropic")) {
    return "anthropic_compatible";
  }

  if (lowered.includes("google")) {
    return "google_compatible";
  }

  if (lowered.includes("local")) {
    return "local_open_weights";
  }

  return "custom_runtime";
};

const normalizeHostType = (value: string): RuntimeCapabilityProfile["runtime_host_type"] => {
  const lowered = value.toLowerCase();
  if (ADAPTER_RUNTIME_HOST_TYPES.includes(lowered as RuntimeCapabilityProfile["runtime_host_type"])) {
    return lowered as RuntimeCapabilityProfile["runtime_host_type"];
  }

  if (lowered.includes("mcp")) {
    return "mcp_host";
  }

  if (lowered.includes("api")) {
    return "api_runtime";
  }

  return "hybrid_runtime";
};

export const createRuntimeCapabilityProfileResolver = (): RuntimeCapabilityProfileResolver => {
  return {
    resolve(input: { provider_profile: ProviderProfile }): RuntimeCapabilityProfile {
      const constraints = input.provider_profile.tool_invocation_constraints.map((item) => item.toLowerCase());
      return {
        runtime_host_type: normalizeHostType(input.provider_profile.runtime_host_type),
        supports_tool_calling: !constraints.includes("no_tool_calling"),
        supports_structured_output: !input.provider_profile.structured_output_characteristics
          .map((item) => item.toLowerCase())
          .includes("structured_output_unreliable"),
        supports_resource_loading: !input.provider_profile.resource_support_characteristics
          .map((item) => item.toLowerCase())
          .includes("no_resource_support"),
        supports_multi_turn_continuation: !input.provider_profile.supported_interaction_modes
          .map((item) => item.toLowerCase())
          .includes("single_turn_only"),
        constraint_flags: input.provider_profile.normalization_requirements
          .map((item) => item.toLowerCase())
          .flatMap((requirement) => {
            if (requirement.includes("strict_schema")) {
              return ["strict_schema_wrapping"] as const;
            }
            if (requirement.includes("compact")) {
              return ["tight_context_budget"] as const;
            }
            if (requirement.includes("single_turn")) {
              return ["single_turn_bias"] as const;
            }
            return [];
          })
      };
    }
  };
};

export const createProviderAdapterProfileBuilder = (
  resolver: RuntimeCapabilityProfileResolver
): ProviderAdapterProfileBuilder => {
  return {
    build(input: { provider_profile: ProviderProfile }): ProviderAdapterProfile {
      return {
        provider_profile_id: input.provider_profile.provider_profile_id,
        provider_family: normalizeProviderFamily(input.provider_profile.provider_family),
        runtime_profile: resolver.resolve(input),
        supported_interaction_modes: input.provider_profile.supported_interaction_modes,
        schema_strictness_characteristics: input.provider_profile.schema_strictness_characteristics,
        bundle_size_sensitivities: input.provider_profile.bundle_size_sensitivities,
        tool_invocation_constraints: input.provider_profile.tool_invocation_constraints,
        resource_support_characteristics: input.provider_profile.resource_support_characteristics,
        structured_output_characteristics: input.provider_profile.structured_output_characteristics,
        normalization_requirements: input.provider_profile.normalization_requirements
      };
    }
  };
};
