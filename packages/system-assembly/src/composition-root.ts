import type { CapabilityRegistrationShape, CompositionRootShape, ModuleWiringShape, NormalizedAssemblyConfiguration } from "./types.js";

export interface CompositionRootBuilder {
  build(input: {
    root_id: string;
    configuration: NormalizedAssemblyConfiguration;
    modules: ModuleWiringShape[];
    capabilities: CapabilityRegistrationShape[];
  }): CompositionRootShape;
}

export const createCompositionRootBuilder = (): CompositionRootBuilder => {
  return {
    build(input): CompositionRootShape {
      return {
        root_id: input.root_id,
        configuration: input.configuration,
        modules: input.modules,
        capabilities: input.capabilities
      };
    }
  };
};
