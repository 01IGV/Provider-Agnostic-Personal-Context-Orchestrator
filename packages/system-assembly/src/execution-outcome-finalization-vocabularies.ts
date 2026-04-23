export const EXECUTION_FINALIZED_OUTCOME_FAMILIES = [
  "read_path_finalized",
  "pack_loop_finalized",
  "write_path_finalized",
  "handoff_finalized",
  "unknown_finalized"
] as const;

export type ExecutionFinalizedOutcomeFamily = (typeof EXECUTION_FINALIZED_OUTCOME_FAMILIES)[number];

export const EXECUTION_FINALIZATION_STATUSES = [
  "completed_finalized",
  "partial_finalized",
  "blocked_finalized",
  "deferred_finalized",
  "failed_finalized",
  "incomplete_finalization"
] as const;

export type ExecutionFinalizationStatus = (typeof EXECUTION_FINALIZATION_STATUSES)[number];

export const EXECUTION_FINALIZATION_WARNING_CODES = [
  "completion_not_accepted",
  "completion_and_reconciliation_mismatch",
  "reconciliation_status_ambiguous",
  "partial_finalization_generated",
  "finalized_surface_envelope_emitted",
  "finalized_integration_envelope_emitted"
] as const;

export type ExecutionFinalizationWarningCode = (typeof EXECUTION_FINALIZATION_WARNING_CODES)[number];

export const FINALIZATION_STATUS_TO_SURFACE_STATUS: Record<
  ExecutionFinalizationStatus,
  "success" | "accepted" | "partial" | "rejected" | "error"
> = {
  completed_finalized: "success",
  partial_finalized: "partial",
  blocked_finalized: "rejected",
  deferred_finalized: "partial",
  failed_finalized: "error",
  incomplete_finalization: "error"
};
