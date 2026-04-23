import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type { AuditTraceContext } from "./types.js";

export const EXECUTION_ATTEMPT_TRACE_STATUSES = [
  "ready_to_execute",
  "blocked",
  "deferred",
  "handoff_recorded"
] as const;

export type ExecutionAttemptTraceStatus = (typeof EXECUTION_ATTEMPT_TRACE_STATUSES)[number];

export const EXECUTION_ATTEMPT_TRACE_WARNING_CODES = [
  "attempt_status_requires_followup",
  "missing_readiness_signal",
  "gate_warning_forwarded",
  "expectation_placeholder_only"
] as const;

export type ExecutionAttemptTraceWarningCode = (typeof EXECUTION_ATTEMPT_TRACE_WARNING_CODES)[number];

export interface ExecutionAttemptTraceWarning {
  code: ExecutionAttemptTraceWarningCode;
  message: string;
}

export interface ExecutionAttemptTraceRecord {
  trace_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  contour_target: OperationalContour;
  attempt_status: ExecutionAttemptTraceStatus;
  blocked_reason_codes: string[];
  expected_result_kind: string;
  created_at: IsoDateTimeString;
  trace_context: AuditTraceContext;
  warnings: ExecutionAttemptTraceWarning[];
}

export interface ExecutionAttemptAuditHookLinkage {
  linkage_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  contour_target: OperationalContour;
  linked_audit_id?: AuditId;
  hook_status: "pending_audit_hook" | "audit_hook_linked";
  linked_at: IsoDateTimeString;
  notes: string[];
}

export interface ExecutionAttemptTraceBuilder {
  build(input: {
    trace_id: string;
    attempt_id: string;
    request_id: string;
    operation_id: string;
    contour_target: OperationalContour;
    attempt_status: ExecutionAttemptTraceStatus;
    blocked_reason_codes: string[];
    expected_result_kind: string;
    trace_context: AuditTraceContext;
    warnings?: ExecutionAttemptTraceWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptTraceRecord;
}

export const createExecutionAttemptTraceBuilder = (): ExecutionAttemptTraceBuilder => {
  return {
    build(input) {
      const createdAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        attempt_id: input.attempt_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        contour_target: input.contour_target,
        attempt_status: input.attempt_status,
        blocked_reason_codes: input.blocked_reason_codes,
        expected_result_kind: input.expected_result_kind,
        created_at: createdAt,
        trace_context: input.trace_context,
        warnings: input.warnings ?? []
      };
    }
  };
};
