import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { OperationFamily } from "@orchestrator/integration-contracts";
import type {
  RuntimeInvocationIntakeCompatibility,
  NormalizedRuntimeInvocationIntakeShape,
  RuntimeSurfaceRegistryEntryShape,
  RuntimeSurfaceRegistryLookup
} from "@orchestrator/runtime-surface";
import type { MissingDependency } from "./types.js";
import type {
  DispatchReadinessStatus,
  InternalDispatchContourFamily,
  InternalDispatchResultStatus,
  InternalDispatchUnsupportedPathCode,
  InternalDispatchWarningCode
} from "./runtime-dispatch-vocabularies.js";

export interface InternalDispatchWarningShape {
  code: InternalDispatchWarningCode;
  message: string;
}

export interface RuntimeOperationLookupResultShape {
  lookup: RuntimeSurfaceRegistryLookup;
  found: boolean;
  matched_entry?: RuntimeSurfaceRegistryEntryShape;
  unsupported_path_code?: InternalDispatchUnsupportedPathCode;
  warnings: InternalDispatchWarningShape[];
}

export interface HandlerResolutionResultShape {
  request_id: string;
  operation_id: string;
  status: "resolved" | "missing_handler" | "unsupported_path";
  handler_id?: string;
  operation_family?: OperationFamily;
  dependency_requirements?: RuntimeSurfaceRegistryEntryShape["dependency_requirements"];
  warnings: InternalDispatchWarningShape[];
}

export interface DispatchDependencyValidationResultShape {
  is_valid: boolean;
  missing_dependencies: MissingDependency[];
  warnings: InternalDispatchWarningShape[];
}

export interface ContourInvocationBoundaryContractShape {
  request_id: string;
  operation_id: string;
  contour_family: InternalDispatchContourFamily;
  operation_family: OperationFamily;
  pipeline_dependency_token: string;
  pipeline_available: boolean;
  invocation_allowed: boolean;
  boundary_notes: string[];
}

export interface InternalDispatchPlanningShape {
  request_id: string;
  operation_id: string;
  dispatch_plan_id: string;
  contour_boundary: ContourInvocationBoundaryContractShape;
  planning_status: "planned" | "deferred";
  warnings: InternalDispatchWarningShape[];
}

export interface NormalizedInternalDispatchResultShape {
  dispatch_result_id: string;
  status: InternalDispatchResultStatus;
  intake: NormalizedRuntimeInvocationIntakeShape;
  lookup_result: RuntimeOperationLookupResultShape;
  resolution_result: HandlerResolutionResultShape;
  dependency_validation: DispatchDependencyValidationResultShape;
  dispatch_plan?: InternalDispatchPlanningShape;
  warnings: InternalDispatchWarningShape[];
  unsupported_path_code?: InternalDispatchUnsupportedPathCode;
  produced_at: IsoDateTimeString;
}

export interface UnresolvedDispatchDependencyReportingShape {
  request_id: string;
  operation_id: string;
  dependency_token: string;
  required_by_module: string;
  source: "dispatch_validation" | "assembly_validation";
}

export interface UnresolvedDispatchHandlerReportingShape {
  request_id: string;
  operation_id: string;
  lookup: RuntimeSurfaceRegistryLookup;
  reason: "missing_handler" | "registry_lookup_not_found";
}

export interface UnsupportedDispatchPathReportingShape {
  request_id: string;
  operation_id: string;
  code: InternalDispatchUnsupportedPathCode;
}

export interface DispatchReadinessResultShape {
  request_id: string;
  operation_id: string;
  dispatch_result_status: InternalDispatchResultStatus;
  readiness_status: DispatchReadinessStatus;
  unresolved_dependencies: UnresolvedDispatchDependencyReportingShape[];
  unresolved_handler?: UnresolvedDispatchHandlerReportingShape;
  unsupported_path?: UnsupportedDispatchPathReportingShape;
  warnings: InternalDispatchWarningShape[];
}

export interface DispatchStatusAggregationEntryShape {
  status: InternalDispatchResultStatus;
  count: number;
}

export interface DispatchStatusAggregationShape {
  total: number;
  by_status: DispatchStatusAggregationEntryShape[];
}

export interface DispatchAssemblyValidationLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  dispatch_result_status: InternalDispatchResultStatus;
  dispatch_readiness_status: DispatchReadinessStatus;
  assembly_validation_ok: boolean;
  dispatch_missing_dependencies: MissingDependency[];
  assembly_missing_dependencies: MissingDependency[];
  dependency_overlap_tokens: string[];
  linkage_notes: string[];
}

export interface RuntimeReadinessSummaryShape {
  summary_id: string;
  runtime_ready: boolean;
  dispatches_total: number;
  dispatches_ready: number;
  dispatches_not_ready: number;
  dispatches_unsupported: number;
  unresolved_dependency_count: number;
  unresolved_handler_count: number;
  unsupported_path_count: number;
  intake_compatibility?: RuntimeInvocationIntakeCompatibility;
}

export interface NormalizedAssemblyDispatchReadinessReportShape {
  report_id: string;
  assembly_root_id: string;
  dispatch_readiness_results: DispatchReadinessResultShape[];
  dispatch_status_aggregation: DispatchStatusAggregationShape;
  assembly_validation_linkage: DispatchAssemblyValidationLinkageShape[];
  runtime_readiness_summary: RuntimeReadinessSummaryShape;
  warnings: InternalDispatchWarningShape[];
  produced_at: IsoDateTimeString;
}
