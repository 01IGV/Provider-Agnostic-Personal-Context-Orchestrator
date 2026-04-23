import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  ExecutionAttemptAuditHookLinkage,
  ExecutionAttemptTraceRecord,
  ExecutionAttemptTraceWarning
} from "@orchestrator/audit-eval";
import type {
  ContourBoundaryReferenceShape,
  ContourInvocationGateResultShape,
  ContourInvocationGateWarningShape,
  ContourInvocationResultExpectationShape,
  NormalizedContourInvocationRequestShape
} from "./contour-invocation-gate-types.js";
import type { ContourTargetIdentifier } from "./contour-invocation-gate-vocabularies.js";
import type {
  ExecutionAttemptBlockedReasonCode,
  ExecutionAttemptStatus,
  ExecutionAttemptWarningCode,
  ExecutionHandoffResultStatus
} from "./execution-handoff-vocabularies.js";

export interface ExecutionAttemptIdentifierShape {
  attempt_id: string;
  request_id: string;
  operation_id: string;
  contour_target: ContourTargetIdentifier;
}

export interface ExecutionAttemptContextShape {
  dispatch_result_id: string;
  gate_result_id: string;
  contour_target: ContourTargetIdentifier;
  invocation_request?: NormalizedContourInvocationRequestShape;
  boundary_reference?: ContourBoundaryReferenceShape;
  expected_result: ContourInvocationResultExpectationShape;
  prepared_at: IsoDateTimeString;
}

export interface ExecutionAttemptWarningShape {
  code: ExecutionAttemptWarningCode;
  message: string;
}

export interface ContourExecutionAttemptShape {
  identifier: ExecutionAttemptIdentifierShape;
  status: ExecutionAttemptStatus;
  context: ExecutionAttemptContextShape;
  blocked_reason_codes: ExecutionAttemptBlockedReasonCode[];
  warnings: ExecutionAttemptWarningShape[];
}

export interface ExecutionResultPlaceholderShape {
  attempt_id: string;
  request_id: string;
  operation_id: string;
  contour_target: ContourTargetIdentifier;
  expectation_status: ContourInvocationResultExpectationShape["expectation_status"];
  expected_result_kind: ContourInvocationResultExpectationShape["expected_result_kind"];
  placeholder_status: "awaiting_execution" | "blocked_before_execution" | "deferred_before_execution";
  notes: string[];
}

export interface BlockedExecutionHandoffResultShape {
  status: "blocked_contract";
  attempt: ContourExecutionAttemptShape;
  blocked_reason_codes: ExecutionAttemptBlockedReasonCode[];
  placeholder_result: ExecutionResultPlaceholderShape;
}

export interface DeferredExecutionHandoffResultShape {
  status: "deferred_contract";
  attempt: ContourExecutionAttemptShape;
  defer_reason_codes: ExecutionAttemptBlockedReasonCode[];
  placeholder_result: ExecutionResultPlaceholderShape;
}

export interface ReadyToExecuteContractShape {
  status: "ready_contract";
  attempt: ContourExecutionAttemptShape;
  ready_for_future_execution_layer: true;
  placeholder_result: ExecutionResultPlaceholderShape;
}

export interface GateToExecutionHandoffLinkageShape {
  linkage_id: string;
  gate_result_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  contour_target?: ContourTargetIdentifier;
  linkage_notes: string[];
}

export interface ExecutionTraceContractShape {
  trace: ExecutionAttemptTraceRecord;
  warnings: ExecutionAttemptTraceWarning[];
}

export interface ExecutionAuditHookLinkageShape {
  audit_hook_linkage: ExecutionAttemptAuditHookLinkage;
  hook_status: ExecutionAttemptAuditHookLinkage["hook_status"];
}

export interface ExecutionHandoffInputShape {
  gate_result: ContourInvocationGateResultShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface ExecutionHandoffResultShape {
  handoff_result_id: string;
  status: ExecutionHandoffResultStatus;
  gate_linkage: GateToExecutionHandoffLinkageShape;
  attempt?: ContourExecutionAttemptShape;
  ready_result?: ReadyToExecuteContractShape;
  blocked_result?: BlockedExecutionHandoffResultShape;
  deferred_result?: DeferredExecutionHandoffResultShape;
  placeholder_result?: ExecutionResultPlaceholderShape;
  trace_contract?: ExecutionTraceContractShape;
  audit_hook_linkage?: ExecutionAuditHookLinkageShape;
  gate_warnings: ContourInvocationGateWarningShape[];
  produced_at: IsoDateTimeString;
}

export interface ExecutionHandoffSummaryShape {
  total: number;
  ready_contracts: number;
  blocked_contracts: number;
  deferred_contracts: number;
  missing_gate_results: number;
  unsupported_targets: number;
  warnings: ExecutionAttemptWarningShape[];
}
