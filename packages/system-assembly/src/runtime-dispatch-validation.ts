import type { DependencyRegistrySnapshot } from "./types.js";
import type {
  ContourInvocationBoundaryContractShape,
  DispatchDependencyValidationResultShape,
  HandlerResolutionResultShape,
  InternalDispatchPlanningShape,
  InternalDispatchWarningShape
} from "./runtime-dispatch-types.js";
import type { OperationFamily } from "@orchestrator/integration-contracts";
import type { ServiceWiringShape } from "./wiring.js";

const pipelineTokenByOperationFamily: Record<OperationFamily, string> = {
  read: "read_path_pipeline",
  bundle: "pack_loop_pipeline",
  write: "write_path_pipeline",
  handoff: "handoff_pipeline",
  audit: "governance_decision_engine",
  policy: "governance_decision_engine",
  capability: "runtime_surface_registry"
};

const contourFamilyByOperationFamily = (operationFamily: OperationFamily) => {
  if (operationFamily === "read") {
    return "read_path" as const;
  }

  if (operationFamily === "bundle") {
    return "pack_loop" as const;
  }

  if (operationFamily === "write") {
    return "write_path" as const;
  }

  if (operationFamily === "handoff") {
    return "handoff" as const;
  }

  return "unsupported" as const;
};

export interface DispatchDependencyValidationInput {
  request_id: string;
  resolution_result: HandlerResolutionResultShape;
  dependency_registry_snapshot: DependencyRegistrySnapshot;
}

export interface DispatchDependencyValidationPrimitive {
  validate(input: DispatchDependencyValidationInput): DispatchDependencyValidationResultShape;
}

export interface ContourInvocationBoundaryPlanner {
  plan_boundary(input: {
    request_id: string;
    operation_id: string;
    operation_family: OperationFamily;
    service_wiring: ServiceWiringShape;
  }): ContourInvocationBoundaryContractShape;
}

export interface InternalDispatchPlanner {
  plan(input: {
    request_id: string;
    operation_id: string;
    boundary: ContourInvocationBoundaryContractShape;
    dependency_validation: DispatchDependencyValidationResultShape;
  }): InternalDispatchPlanningShape;
}

export const createDispatchDependencyValidationPrimitive = (): DispatchDependencyValidationPrimitive => {
  return {
    validate(input: DispatchDependencyValidationInput): DispatchDependencyValidationResultShape {
      const missingTokens = new Set(input.dependency_registry_snapshot.missing_tokens.map((item) => item.dependency_token));

      const missingDependencies = (input.resolution_result.dependency_requirements ?? [])
        .filter((requirement) => requirement.required && missingTokens.has(requirement.dependency_token))
        .map((requirement) => ({
          code: "missing_runtime_configuration" as const,
          dependency_token: requirement.dependency_token,
          required_by_module: input.resolution_result.handler_id ?? "runtime_dispatch"
        }));

      const warnings: InternalDispatchWarningShape[] =
        missingDependencies.length > 0
          ? [
              {
                code: "dependency_validation_failed",
                message: "required handler dependency tokens are missing in dependency registry snapshot"
              }
            ]
          : [];

      return {
        is_valid: missingDependencies.length === 0,
        missing_dependencies: missingDependencies,
        warnings
      };
    }
  };
};

export const createContourInvocationBoundaryPlanner = (): ContourInvocationBoundaryPlanner => {
  return {
    plan_boundary(input: {
      request_id: string;
      operation_id: string;
      operation_family: OperationFamily;
      service_wiring: ServiceWiringShape;
    }): ContourInvocationBoundaryContractShape {
      const pipelineDependencyToken = pipelineTokenByOperationFamily[input.operation_family];
      const contourFamily = contourFamilyByOperationFamily(input.operation_family);

      const pipelineAvailable = Boolean((input.service_wiring.core as Record<string, unknown>)[pipelineDependencyToken]);
      const invocationAllowed = contourFamily !== "unsupported" && pipelineAvailable;

      return {
        request_id: input.request_id,
        operation_id: input.operation_id,
        contour_family: contourFamily,
        operation_family: input.operation_family,
        pipeline_dependency_token: pipelineDependencyToken,
        pipeline_available: pipelineAvailable,
        invocation_allowed: invocationAllowed,
        boundary_notes: [
          "internal dispatch skeleton planned contour invocation boundary",
          ...(pipelineAvailable ? ["pipeline token is present in service wiring"] : ["pipeline token is missing in service wiring"])
        ]
      };
    }
  };
};

export const createInternalDispatchPlanner = (): InternalDispatchPlanner => {
  return {
    plan(input: {
      request_id: string;
      operation_id: string;
      boundary: ContourInvocationBoundaryContractShape;
      dependency_validation: DispatchDependencyValidationResultShape;
    }): InternalDispatchPlanningShape {
      const warnings: InternalDispatchWarningShape[] = [
        ...(input.boundary.invocation_allowed
          ? []
          : [
              {
                code: "missing_contour_pipeline",
                message: "contour pipeline is unavailable for planned internal dispatch boundary"
              } as const
            ]),
        ...input.dependency_validation.warnings
      ];

      return {
        request_id: input.request_id,
        operation_id: input.operation_id,
        dispatch_plan_id: `${input.request_id}:${input.operation_id}:dispatch-plan`,
        contour_boundary: input.boundary,
        planning_status:
          input.boundary.invocation_allowed && input.dependency_validation.is_valid ? "planned" : "deferred",
        warnings
      };
    }
  };
};
