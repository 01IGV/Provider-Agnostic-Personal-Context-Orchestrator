import type {
  BootstrapContractShape,
  CapabilityRegistrationShape,
  MissingDependency,
  ModuleWiringShape,
  OrchestratorAssemblyResult,
  RuntimeConfigurationShape
} from "./types.js";
import type { DependencyRegistry } from "./dependency-registry.js";
import type { RuntimeConfigurationNormalizer } from "./runtime-config.js";
import type { CompositionRootBuilder } from "./composition-root.js";
import type { ModuleCompositionValidator } from "./validation.js";

export interface OrchestratorAssemblerDeps {
  registry: DependencyRegistry;
  config_normalizer: RuntimeConfigurationNormalizer;
  composition_root_builder: CompositionRootBuilder;
  validator: ModuleCompositionValidator;
}

export interface OrchestratorAssembler {
  assemble(input: {
    root_id: string;
    configuration: RuntimeConfigurationShape;
    modules: ModuleWiringShape[];
    capabilities: CapabilityRegistrationShape[];
    required_registry_tokens: Array<{ token: string; required_by_module: string; code: MissingDependency["code"] }>;
    capability_ids_required: string[];
  }): OrchestratorAssemblyResult;
}

const buildBootstrapContract = (input: {
  composition_root_id: string;
  required_registry_tokens: string[];
  capability_ids_required: string[];
}): BootstrapContractShape => {
  return {
    bootstrap_id: `${input.composition_root_id}:bootstrap`,
    composition_root_id: input.composition_root_id,
    registry_tokens_required: input.required_registry_tokens,
    capability_ids_required: input.capability_ids_required
  };
};

export const createOrchestratorAssembler = (deps: OrchestratorAssemblerDeps): OrchestratorAssembler => {
  return {
    assemble(input) {
      const normalizedConfig = deps.config_normalizer.normalize(input.configuration);
      const registrySnapshot = deps.registry.snapshot(input.required_registry_tokens);

      const compositionRoot = deps.composition_root_builder.build({
        root_id: input.root_id,
        configuration: normalizedConfig,
        modules: input.modules,
        capabilities: input.capabilities
      });

      const validation = deps.validator.validate({
        modules: input.modules,
        registry_snapshot: registrySnapshot,
        strict_boundary_enforcement: normalizedConfig.strict_boundary_enforcement
      });

      const bootstrapContract = buildBootstrapContract({
        composition_root_id: compositionRoot.root_id,
        required_registry_tokens: input.required_registry_tokens.map((item) => item.token),
        capability_ids_required: input.capability_ids_required
      });

      const missingRequiredCapabilities = input.capability_ids_required.filter(
        (requiredId) => !compositionRoot.capabilities.some((capability) => capability.capability_id === requiredId)
      );

      const warnings = [
        ...validation.warnings,
        ...missingRequiredCapabilities.map((missingCapabilityId) => ({
          code: "capability_unregistered" as const,
          message: `required capability is not registered: ${missingCapabilityId}`
        }))
      ];

      return {
        composition_root: compositionRoot,
        registry_snapshot: registrySnapshot,
        validation,
        bootstrap_contract: bootstrapContract,
        warnings
      };
    }
  };
};
