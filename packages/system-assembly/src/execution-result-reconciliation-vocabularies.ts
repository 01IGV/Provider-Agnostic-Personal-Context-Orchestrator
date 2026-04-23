export const EXECUTION_OUTCOME_FAMILIES = [
  "read_path_result",
  "pack_loop_result",
  "write_path_result",
  "handoff_result",
  "unknown_result"
] as const;

export type ExecutionOutcomeFamily = (typeof EXECUTION_OUTCOME_FAMILIES)[number];

export const RECONCILED_OUTCOME_STATUSES = [
  "completed_placeholder",
  "ready_placeholder",
  "blocked_placeholder",
  "deferred_placeholder",
  "failed_placeholder",
  "incomplete_outcome"
] as const;

export type ReconciledOutcomeStatus = (typeof RECONCILED_OUTCOME_STATUSES)[number];

export const RECONCILIATION_WARNING_CODES = [
  "handoff_result_incomplete",
  "attempt_missing",
  "placeholder_only",
  "status_family_ambiguous",
  "integration_response_normalized"
] as const;

export type ReconciliationWarningCode = (typeof RECONCILIATION_WARNING_CODES)[number];

export const RECONCILIATION_STATUS_TO_SURFACE_STATUS: Record<
  ReconciledOutcomeStatus,
  "success" | "accepted" | "partial" | "rejected" | "error"
> = {
  completed_placeholder: "success",
  ready_placeholder: "accepted",
  blocked_placeholder: "rejected",
  deferred_placeholder: "partial",
  failed_placeholder: "error",
  incomplete_outcome: "error"
};
