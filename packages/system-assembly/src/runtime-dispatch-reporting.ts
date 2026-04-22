import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeInvocationIntakeCompatibility } from "@orchestrator/runtime-surface";
import type { ModuleCompositionValidation } from "./types.js";
import type {
  DispatchAssemblyValidationLinkageShape,
  DispatchReadinessResultShape,
  DispatchStatusAggregationShape,
  NormalizedAssemblyDispatchReadinessReportShape,
  NormalizedInternalDispatchResultShape,
  UnresolvedDispatchDependencyReportingShape
} from "./runtime-dispatch-types.js";
import type { InternalDispatchResultStatus } from "./runtime-dispatch-vocabularies.js";

export interface AssemblyDispatchReadinessReporterInput {
  assembly_root_id: string;
  validation: ModuleCompositionValidation;
  dispatch_results: NormalizedInternalDispatchResultShape[];
  intake_compatibility?: RuntimeInvocationIntakeCompatibility;
  now?: IsoDateTimeString;
}

export interface AssemblyDispatchReadinessReporter {
  build(input: AssemblyDispatchReadinessReporterInput): NormalizedAssemblyDispatchReadinessReportShape;
}

const toReadinessStatus = (input: {
  dispatch: NormalizedInternalDispatchResultShape;
  intake_compatibility?: RuntimeInvocationIntakeCompatibility;
}) => {
  if (input.dispatch.status === "unsupported_path") {
    return "unsupported" as const;
  }

  if (input.dispatch.status === "dispatch_planned") {
    if (input.intake_compatibility && !input.intake_compatibility.is_compatible) {
      return "not_ready" as const;
    }

    return "ready" as const;
  }

  return "not_ready" as const;
};

const toUnresolvedDependencies = (
  dispatch: NormalizedInternalDispatchResultShape
): UnresolvedDispatchDependencyReportingShape[] => {
  return dispatch.dependency_validation.missing_dependencies.map((dependency) => ({
    request_id: dispatch.intake.request.request_id,
    operation_id: dispatch.intake.request.operation_id,
    dependency_token: dependency.dependency_token,
    required_by_module: dependency.required_by_module,
    source: "dispatch_validation"
  }));
};

const buildDispatchStatusAggregation = (
  dispatchResults: NormalizedInternalDispatchResultShape[]
): DispatchStatusAggregationShape => {
  const byStatusMap = new Map<InternalDispatchResultStatus, number>();

  for (const dispatch of dispatchResults) {
    byStatusMap.set(dispatch.status, (byStatusMap.get(dispatch.status) ?? 0) + 1);
  }

  return {
    total: dispatchResults.length,
    by_status: Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count }))
  };
};

const buildDispatchReadinessResults = (input: {
  dispatch_results: NormalizedInternalDispatchResultShape[];
  intake_compatibility?: RuntimeInvocationIntakeCompatibility;
}): DispatchReadinessResultShape[] => {
  return input.dispatch_results.map((dispatch) => {
    const unresolvedDependencies = toUnresolvedDependencies(dispatch);
    const isMissingHandler = dispatch.status === "missing_handler";
    const isUnsupported = dispatch.status === "unsupported_path";

    return {
      request_id: dispatch.intake.request.request_id,
      operation_id: dispatch.intake.request.operation_id,
      dispatch_result_status: dispatch.status,
      readiness_status: toReadinessStatus({
        dispatch,
        ...(input.intake_compatibility ? { intake_compatibility: input.intake_compatibility } : {})
      }),
      unresolved_dependencies: unresolvedDependencies,
      ...(isMissingHandler
        ? {
            unresolved_handler: {
              request_id: dispatch.intake.request.request_id,
              operation_id: dispatch.intake.request.operation_id,
              lookup: dispatch.lookup_result.lookup,
              reason: dispatch.lookup_result.found ? "missing_handler" : "registry_lookup_not_found"
            }
          }
        : {}),
      ...(isUnsupported && dispatch.unsupported_path_code
        ? {
            unsupported_path: {
              request_id: dispatch.intake.request.request_id,
              operation_id: dispatch.intake.request.operation_id,
              code: dispatch.unsupported_path_code
            }
          }
        : {}),
      warnings: dispatch.warnings
    };
  });
};

const buildAssemblyValidationLinkage = (input: {
  validation: ModuleCompositionValidation;
  readiness_results: DispatchReadinessResultShape[];
  dispatch_results: NormalizedInternalDispatchResultShape[];
}): DispatchAssemblyValidationLinkageShape[] => {
  return input.readiness_results.map((result) => {
    const dispatch = input.dispatch_results.find(
      (candidate) =>
        candidate.intake.request.request_id === result.request_id &&
        candidate.intake.request.operation_id === result.operation_id
    );
    const dispatchMissingDependencies = dispatch?.dependency_validation.missing_dependencies ?? [];
    const assemblyMissingDependencies = input.validation.missing_dependencies;

    const dispatchTokens = new Set(dispatchMissingDependencies.map((dependency) => dependency.dependency_token));
    const dependencyOverlapTokens = assemblyMissingDependencies
      .map((dependency) => dependency.dependency_token)
      .filter((token) => dispatchTokens.has(token));

    return {
      linkage_id: `${result.request_id}:${result.operation_id}:assembly-linkage`,
      request_id: result.request_id,
      operation_id: result.operation_id,
      dispatch_result_status: result.dispatch_result_status,
      dispatch_readiness_status: result.readiness_status,
      assembly_validation_ok: input.validation.is_valid,
      dispatch_missing_dependencies: dispatchMissingDependencies,
      assembly_missing_dependencies: assemblyMissingDependencies,
      dependency_overlap_tokens: dependencyOverlapTokens,
      linkage_notes: [
        "dispatch result is linked to system-assembly validation diagnostics",
        ...(dependencyOverlapTokens.length > 0
          ? ["dispatch and assembly dependency diagnostics share missing dependency tokens"]
          : [])
      ]
    };
  });
};

const buildSummary = (input: {
  readiness_results: DispatchReadinessResultShape[];
  intake_compatibility?: RuntimeInvocationIntakeCompatibility;
}) => {
  const dispatchesReady = input.readiness_results.filter((item) => item.readiness_status === "ready").length;
  const dispatchesNotReady = input.readiness_results.filter((item) => item.readiness_status === "not_ready").length;
  const dispatchesUnsupported = input.readiness_results.filter((item) => item.readiness_status === "unsupported").length;
  const unresolvedDependencyCount = input.readiness_results.reduce(
    (acc, item) => acc + item.unresolved_dependencies.length,
    0
  );
  const unresolvedHandlerCount = input.readiness_results.filter((item) => item.unresolved_handler).length;
  const unsupportedPathCount = input.readiness_results.filter((item) => item.unsupported_path).length;
  const intakeCompatible = input.intake_compatibility ? input.intake_compatibility.is_compatible : true;

  return {
    runtime_ready:
      intakeCompatible &&
      input.readiness_results.length > 0 &&
      dispatchesNotReady === 0 &&
      dispatchesUnsupported === 0 &&
      unresolvedDependencyCount === 0 &&
      unresolvedHandlerCount === 0,
    dispatches_total: input.readiness_results.length,
    dispatches_ready: dispatchesReady,
    dispatches_not_ready: dispatchesNotReady,
    dispatches_unsupported: dispatchesUnsupported,
    unresolved_dependency_count: unresolvedDependencyCount,
    unresolved_handler_count: unresolvedHandlerCount,
    unsupported_path_count: unsupportedPathCount
  };
};

export const createAssemblyDispatchReadinessReporter = (): AssemblyDispatchReadinessReporter => {
  return {
    build(input: AssemblyDispatchReadinessReporterInput): NormalizedAssemblyDispatchReadinessReportShape {
      const producedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const dispatchReadinessResults = buildDispatchReadinessResults({
        dispatch_results: input.dispatch_results,
        ...(input.intake_compatibility ? { intake_compatibility: input.intake_compatibility } : {})
      });
      const dispatchStatusAggregation = buildDispatchStatusAggregation(input.dispatch_results);
      const assemblyValidationLinkage = buildAssemblyValidationLinkage({
        validation: input.validation,
        readiness_results: dispatchReadinessResults,
        dispatch_results: input.dispatch_results
      });
      const summary = buildSummary({
        readiness_results: dispatchReadinessResults,
        ...(input.intake_compatibility ? { intake_compatibility: input.intake_compatibility } : {})
      });

      return {
        report_id: `${input.assembly_root_id}:dispatch-readiness`,
        assembly_root_id: input.assembly_root_id,
        dispatch_readiness_results: dispatchReadinessResults,
        dispatch_status_aggregation: dispatchStatusAggregation,
        assembly_validation_linkage: assemblyValidationLinkage,
        runtime_readiness_summary: {
          summary_id: `${input.assembly_root_id}:runtime-readiness-summary`,
          ...summary,
          ...(input.intake_compatibility ? { intake_compatibility: input.intake_compatibility } : {})
        },
        warnings: dispatchReadinessResults.flatMap((result) => result.warnings),
        produced_at: producedAt
      };
    }
  };
};
