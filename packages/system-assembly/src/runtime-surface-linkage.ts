import type { MissingDependency } from "./types.js";
import type { RuntimeSurfaceRegistryShape } from "@orchestrator/runtime-surface";
import { RUNTIME_SURFACE_DEPENDENCY_TOKENS } from "@orchestrator/runtime-surface";

export interface RuntimeSurfaceAssemblyRequirement {
  required_registry_tokens: Array<{ token: string; required_by_module: string; code: MissingDependency["code"] }>;
  handler_ids: string[];
  operation_ids: string[];
}

export interface RuntimeSurfaceAssemblyRequirementInput {
  runtime_surface_registry: RuntimeSurfaceRegistryShape;
  required_by_module?: string;
}

export const createRuntimeSurfaceAssemblyRequirement = (
  input: RuntimeSurfaceAssemblyRequirementInput
): RuntimeSurfaceAssemblyRequirement => {
  const requiredByModule = input.required_by_module ?? "runtime_surface";

  return {
    required_registry_tokens: [
      {
        token: RUNTIME_SURFACE_DEPENDENCY_TOKENS[0],
        required_by_module: requiredByModule,
        code: "missing_runtime_surface_registry"
      },
      {
        token: RUNTIME_SURFACE_DEPENDENCY_TOKENS[1],
        required_by_module: requiredByModule,
        code: "missing_runtime_surface_consistency"
      }
    ],
    handler_ids: input.runtime_surface_registry.entries.map((entry) => entry.handler_id),
    operation_ids: input.runtime_surface_registry.entries.map((entry) => entry.operation_id)
  };
};
