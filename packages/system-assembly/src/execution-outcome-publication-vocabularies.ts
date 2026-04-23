export const EXECUTION_PUBLICATION_OUTCOME_FAMILIES = [
  "read_path_publication",
  "pack_loop_publication",
  "write_path_publication",
  "handoff_publication",
  "unknown_publication"
] as const;

export type ExecutionPublicationOutcomeFamily = (typeof EXECUTION_PUBLICATION_OUTCOME_FAMILIES)[number];

export const EXECUTION_PUBLICATION_STATUSES = [
  "publication_ready",
  "publication_blocked",
  "publication_deferred",
  "publication_partial",
  "publication_incomplete",
  "publication_failed"
] as const;

export type ExecutionPublicationStatus = (typeof EXECUTION_PUBLICATION_STATUSES)[number];

export const EXECUTION_PUBLICATION_WARNING_CODES = [
  "finalized_status_not_ready_for_publication",
  "publication_family_ambiguous",
  "publication_incomplete",
  "publication_blocked",
  "publication_deferred",
  "delivery_ready_surface_envelope_emitted",
  "integration_egress_envelope_emitted"
] as const;

export type ExecutionPublicationWarningCode = (typeof EXECUTION_PUBLICATION_WARNING_CODES)[number];

export const PUBLICATION_STATUS_TO_SURFACE_STATUS: Record<
  ExecutionPublicationStatus,
  "success" | "accepted" | "partial" | "rejected" | "error"
> = {
  publication_ready: "success",
  publication_partial: "partial",
  publication_blocked: "rejected",
  publication_deferred: "partial",
  publication_incomplete: "error",
  publication_failed: "error"
};
