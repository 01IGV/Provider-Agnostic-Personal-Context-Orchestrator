import type { NormalizedAssemblyConfiguration, RuntimeConfigurationShape } from "./types.js";

export interface RuntimeConfigurationNormalizer {
  normalize(config: RuntimeConfigurationShape): NormalizedAssemblyConfiguration;
}

export const createRuntimeConfigurationNormalizer = (): RuntimeConfigurationNormalizer => {
  return {
    normalize(config: RuntimeConfigurationShape): NormalizedAssemblyConfiguration {
      return {
        environment: config.environment,
        assembly_mode: config.assembly_mode,
        strict_boundary_enforcement: config.strict_boundary_enforcement,
        capability_filtering_enabled: config.assembly_mode !== "contracts_only",
        audit_contracts_enabled: config.enable_audit_contracts,
        provider_projection_enabled: config.enable_provider_projection,
        ...(config.target_runtime ? { target_runtime: config.target_runtime } : {}),
        ...(config.target_provider ? { target_provider: config.target_provider } : {}),
        feature_flags: config.feature_flags
      };
    }
  };
};
