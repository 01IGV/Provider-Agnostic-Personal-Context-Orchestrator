import type { DependencyRegistrySnapshot, ModuleCompositionValidation, ModuleWiringShape } from "./types.js";

export interface ModuleCompositionValidator {
  validate(input: {
    modules: ModuleWiringShape[];
    registry_snapshot: DependencyRegistrySnapshot;
    strict_boundary_enforcement: boolean;
  }): ModuleCompositionValidation;
}

export const createModuleCompositionValidator = (): ModuleCompositionValidator => {
  return {
    validate(input): ModuleCompositionValidation {
      const missingDependencies = input.registry_snapshot.missing_tokens;

      const boundaryViolations = input.modules.flatMap((module) =>
        module.boundary.forbidden_dependency_tokens
          .filter((forbidden) => module.requires_dependency_tokens.includes(forbidden))
          .map((forbidden) => ({
            module_id: module.module_id,
            forbidden_dependency_token: forbidden
          }))
      );

      const warnings = [
        ...missingDependencies.map((missing) => ({
          code: "missing_dependency" as const,
          message: `missing dependency token: ${missing.dependency_token}`,
          module_id: missing.required_by_module
        })),
        ...boundaryViolations.map((violation) => ({
          code: "boundary_violation" as const,
          message: `forbidden dependency token required: ${violation.forbidden_dependency_token}`,
          module_id: violation.module_id
        }))
      ];

      return {
        is_valid: missingDependencies.length === 0 && (!input.strict_boundary_enforcement || boundaryViolations.length === 0),
        missing_dependencies: missingDependencies,
        boundary_violations: boundaryViolations,
        warnings
      };
    }
  };
};
