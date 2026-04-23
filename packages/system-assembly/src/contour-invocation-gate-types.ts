import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { OperationFamily } from "@orchestrator/integration-contracts";
import type { ReadPipelineContext } from "@orchestrator/read-path";
import type { PackInputConsumption } from "@orchestrator/pack-loop";
import type { RawWritebackInput } from "@orchestrator/write-path";
import type { HandoffTriggerInput } from "@orchestrator/handoff";
import type {
  DispatchReadinessResultShape,
  InternalDispatchPlanningShape,
  InternalDispatchWarningShape,
  NormalizedInternalDispatchResultShape
} from "./runtime-dispatch-types.js";
import type {
  ContourInvocationBlockedReasonCode,
  ContourInvocationGateResultStatus,
  ContourInvocationGateWarningCode,
  ContourResultExpectationKind,
  ContourTargetIdentifier
} from "./contour-invocation-gate-vocabularies.js";

export interface ContourInvocationGateWarningShape {
  code: ContourInvocationGateWarningCode;
  message: string;
}

export interface ContourTargetResolutionShape {
  request_id: string;
  operation_id: string;
  dispatch_plan_id?: string;
  resolution_status: "resolved" | "unsupported" | "missing_plan" | "ambiguous";
  contour_target?: ContourTargetIdentifier;
  operation_family?: OperationFamily;
  notes: string[];
}

export interface ContourBoundaryReferenceShape {
  request_id: string;
  operation_id: string;
  contour_target: ContourTargetIdentifier;
  operation_family: OperationFamily;
  pipeline_dependency_token: string;
  pipeline_available: boolean;
  invocation_allowed: boolean;
  boundary_notes: string[];
}

export interface DispatchPlanContourLinkageShape {
  linkage_id: string;
  dispatch_result_id: string;
  request_id: string;
  operation_id: string;
  dispatch_plan_id?: string;
  planning_status?: InternalDispatchPlanningShape["planning_status"];
  contour_target_resolution: ContourTargetResolutionShape;
  linked_boundary?: ContourBoundaryReferenceShape;
  linkage_warnings: ContourInvocationGateWarningShape[];
}

export type ContourInvocationPlaceholderShape =
  | {
      contour_target: "read_path";
      expected_request_contract: "ReadPipelineContext";
      request_placeholder?: Partial<ReadPipelineContext>;
    }
  | {
      contour_target: "pack_loop";
      expected_request_contract: "PackInputConsumption";
      request_placeholder?: Partial<PackInputConsumption>;
    }
  | {
      contour_target: "write_path";
      expected_request_contract: "RawWritebackInput";
      request_placeholder?: Partial<RawWritebackInput>;
    }
  | {
      contour_target: "handoff";
      expected_request_contract: "HandoffTriggerInput";
      request_placeholder?: Partial<HandoffTriggerInput>;
    };

export interface NormalizedContourInvocationRequestShape {
  contour_request_id: string;
  request_id: string;
  operation_id: string;
  contour_target: ContourTargetIdentifier;
  operation_family: OperationFamily;
  source_dispatch_result_id: string;
  source_dispatch_plan_id: string;
  request_placeholder: ContourInvocationPlaceholderShape;
  normalized_at: IsoDateTimeString;
  notes: string[];
}

export interface ContourInvocationEligibilityShape {
  request_id: string;
  operation_id: string;
  status: ContourInvocationGateResultStatus;
  ready_for_execution_layer: boolean;
  blocked_reason_codes: ContourInvocationBlockedReasonCode[];
  warnings: ContourInvocationGateWarningShape[];
}

export interface UnsupportedContourTargetResultShape {
  request_id: string;
  operation_id: string;
  status: "unsupported_contour";
  blocked_reason_codes: ContourInvocationBlockedReasonCode[];
  warnings: ContourInvocationGateWarningShape[];
}

export interface MissingContourBoundaryResultShape {
  request_id: string;
  operation_id: string;
  status: "missing_boundary";
  blocked_reason_codes: ContourInvocationBlockedReasonCode[];
  warnings: ContourInvocationGateWarningShape[];
}

export interface BlockedContourInvocationResultShape {
  request_id: string;
  operation_id: string;
  status: "blocked";
  blocked_reason_codes: ContourInvocationBlockedReasonCode[];
  warnings: ContourInvocationGateWarningShape[];
}

export interface ContourInvocationResultExpectationShape {
  request_id: string;
  operation_id: string;
  contour_target?: ContourTargetIdentifier;
  expected_result_kind: ContourResultExpectationKind;
  expectation_status: "awaiting_execution_layer" | "unavailable";
  expectation_notes: string[];
}

export interface ContourInvocationGateResultShape {
  gate_result_id: string;
  request_id: string;
  operation_id: string;
  status: ContourInvocationGateResultStatus;
  dispatch_linkage: DispatchPlanContourLinkageShape;
  invocation_request?: NormalizedContourInvocationRequestShape;
  eligibility: ContourInvocationEligibilityShape;
  result_expectation: ContourInvocationResultExpectationShape;
  blocked_result?: BlockedContourInvocationResultShape;
  unsupported_result?: UnsupportedContourTargetResultShape;
  missing_boundary_result?: MissingContourBoundaryResultShape;
  dispatch_warnings: InternalDispatchWarningShape[];
  produced_at: IsoDateTimeString;
}

export interface ContourInvocationGateInput {
  dispatch_result: NormalizedInternalDispatchResultShape;
  dispatch_readiness?: DispatchReadinessResultShape;
  placeholders?: Partial<Record<ContourTargetIdentifier, Record<string, unknown>>>;
  now?: IsoDateTimeString;
}

export interface ContourInvocationGateSummaryShape {
  total: number;
  eligible: number;
  blocked: number;
  unsupported_contour: number;
  missing_boundary: number;
  ambiguous_target: number;
  warnings: ContourInvocationGateWarningShape[];
}
