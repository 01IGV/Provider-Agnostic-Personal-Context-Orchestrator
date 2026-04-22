import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { OperationFamily } from "@orchestrator/integration-contracts";
import type {
  NormalizedRuntimeInvocationIntakeShape,
  RuntimeSurfaceRegistryEntryShape,
  RuntimeSurfaceRegistryLookup
} from "@orchestrator/runtime-surface";
import type { MissingDependency } from "./types.js";
import type {
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
