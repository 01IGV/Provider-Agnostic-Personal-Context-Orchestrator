import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  NormalizedInternalDispatchResultShape,
  RuntimeOperationLookupResultShape,
  HandlerResolutionResultShape,
  DispatchDependencyValidationResultShape,
  InternalDispatchWarningShape
} from "./runtime-dispatch-types.js";
import type { ServiceWiringShape } from "./wiring.js";
import type { DependencyRegistrySnapshot } from "./types.js";
import type { NormalizedRuntimeInvocationIntakeShape, RuntimeSurfaceRegistryLookup } from "@orchestrator/runtime-surface";
import type { RuntimeOperationLookupPrimitive, HandlerResolutionPrimitive } from "./runtime-dispatch-resolution.js";
import type {
  DispatchDependencyValidationPrimitive,
  ContourInvocationBoundaryPlanner,
  InternalDispatchPlanner
} from "./runtime-dispatch-validation.js";

export interface InternalRuntimeDispatchPipelineInput {
  intake: NormalizedRuntimeInvocationIntakeShape;
  service_wiring: ServiceWiringShape;
  dependency_registry_snapshot: DependencyRegistrySnapshot;
  now?: IsoDateTimeString;
}

export interface InternalRuntimeDispatchPipeline {
  run(input: InternalRuntimeDispatchPipelineInput): NormalizedInternalDispatchResultShape;
}

export interface InternalRuntimeDispatchPipelineDeps {
  operation_lookup: RuntimeOperationLookupPrimitive;
  handler_resolution: HandlerResolutionPrimitive;
  dependency_validation: DispatchDependencyValidationPrimitive;
  boundary_planner: ContourInvocationBoundaryPlanner;
  dispatch_planner: InternalDispatchPlanner;
}

const createLookup = (input: NormalizedRuntimeInvocationIntakeShape): RuntimeSurfaceRegistryLookup => {
  return {
    operation_id: input.request.operation_id,
    surface_family: input.request.surface_family,
    surface_mode: input.request.surface_mode,
    entrypoint_type: input.request.entrypoint_type
  };
};

const buildWarnings = (parts: {
  lookup: RuntimeOperationLookupResultShape;
  resolution: HandlerResolutionResultShape;
  dependency: DispatchDependencyValidationResultShape;
  planning: InternalDispatchWarningShape[];
  intake: NormalizedRuntimeInvocationIntakeShape;
}): InternalDispatchWarningShape[] => {
  return [
    ...parts.lookup.warnings,
    ...parts.resolution.warnings,
    ...parts.dependency.warnings,
    ...parts.planning,
    ...(parts.intake.validation.status === "valid"
      ? []
      : [
          {
            code: "validation_not_strictly_valid",
            message: "runtime invocation intake is not strictly valid for execution planning"
          } as const
        ])
  ];
};

export const createInternalRuntimeDispatchPipeline = (
  deps: InternalRuntimeDispatchPipelineDeps
): InternalRuntimeDispatchPipeline => {
  return {
    run(input: InternalRuntimeDispatchPipelineInput): NormalizedInternalDispatchResultShape {
      const lookup = deps.operation_lookup.lookup({
        ...(input.service_wiring.core.runtime_surface_registry
          ? { runtime_surface_registry: input.service_wiring.core.runtime_surface_registry }
          : {}),
        lookup: createLookup(input.intake)
      });

      const resolution = deps.handler_resolution.resolve({
        request_id: input.intake.request.request_id,
        operation_lookup: lookup
      });

      const dependencyValidation = deps.dependency_validation.validate({
        request_id: input.intake.request.request_id,
        resolution_result: resolution,
        dependency_registry_snapshot: input.dependency_registry_snapshot
      });

      const producedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);

      if (resolution.status !== "resolved" || !resolution.operation_family) {
        const warnings = buildWarnings({
          lookup,
          resolution,
          dependency: dependencyValidation,
          planning: [],
          intake: input.intake
        });

        return {
          dispatch_result_id: `${input.intake.request.request_id}:dispatch-result`,
          status: lookup.found ? "missing_handler" : "unsupported_path",
          intake: input.intake,
          lookup_result: lookup,
          resolution_result: resolution,
          dependency_validation: dependencyValidation,
          warnings,
          ...(lookup.unsupported_path_code ? { unsupported_path_code: lookup.unsupported_path_code } : {}),
          produced_at: producedAt
        };
      }

      const boundary = deps.boundary_planner.plan_boundary({
        request_id: input.intake.request.request_id,
        operation_id: input.intake.request.operation_id,
        operation_family: resolution.operation_family,
        service_wiring: input.service_wiring
      });

      const dispatchPlan = deps.dispatch_planner.plan({
        request_id: input.intake.request.request_id,
        operation_id: input.intake.request.operation_id,
        boundary,
        dependency_validation: dependencyValidation
      });

      const warnings = buildWarnings({
        lookup,
        resolution,
        dependency: dependencyValidation,
        planning: dispatchPlan.warnings,
        intake: input.intake
      });

      const status = !dependencyValidation.is_valid
        ? "missing_dependency"
        : dispatchPlan.planning_status === "planned"
          ? "dispatch_planned"
          : "planning_deferred";

      return {
        dispatch_result_id: `${input.intake.request.request_id}:dispatch-result`,
        status,
        intake: input.intake,
        lookup_result: lookup,
        resolution_result: resolution,
        dependency_validation: dependencyValidation,
        dispatch_plan: dispatchPlan,
        warnings,
        produced_at: producedAt
      };
    }
  };
};
