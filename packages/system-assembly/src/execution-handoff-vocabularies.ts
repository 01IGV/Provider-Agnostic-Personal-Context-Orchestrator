export const EXECUTION_ATTEMPT_STATUSES = ["ready_to_execute", "blocked", "deferred"] as const;

export type ExecutionAttemptStatus = (typeof EXECUTION_ATTEMPT_STATUSES)[number];

export const EXECUTION_HANDOFF_RESULT_STATUSES = [
  "ready_contract",
  "blocked_contract",
  "deferred_contract",
  "missing_gate_result",
  "unsupported_target"
] as const;

export type ExecutionHandoffResultStatus = (typeof EXECUTION_HANDOFF_RESULT_STATUSES)[number];

export const EXECUTION_ATTEMPT_WARNING_CODES = [
  "gate_status_not_eligible",
  "missing_gate_invocation_request",
  "expectation_placeholder_only",
  "trace_hook_pending",
  "readiness_not_strictly_ready"
] as const;

export type ExecutionAttemptWarningCode = (typeof EXECUTION_ATTEMPT_WARNING_CODES)[number];

export const EXECUTION_ATTEMPT_BLOCKED_REASON_CODES = [
  "blocked_by_gate_status",
  "blocked_by_missing_readiness",
  "blocked_by_missing_boundary",
  "blocked_by_unsupported_target",
  "blocked_by_deferred_dispatch_status"
] as const;

export type ExecutionAttemptBlockedReasonCode = (typeof EXECUTION_ATTEMPT_BLOCKED_REASON_CODES)[number];
