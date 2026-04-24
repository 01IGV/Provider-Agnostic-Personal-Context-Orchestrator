export const PUBLICATION_DISPATCH_READINESS_FAMILIES = [
  "read_path_publication_dispatch_readiness",
  "pack_loop_publication_dispatch_readiness",
  "write_path_publication_dispatch_readiness",
  "handoff_publication_dispatch_readiness",
  "unknown_publication_dispatch_readiness"
] as const;

export type PublicationDispatchReadinessFamily =
  (typeof PUBLICATION_DISPATCH_READINESS_FAMILIES)[number];

export const PUBLICATION_DISPATCH_READINESS_STATUSES = [
  "queued_dispatch_readiness",
  "prepared_dispatch_readiness",
  "blocked_dispatch_readiness",
  "deferred_dispatch_readiness",
  "aborted_dispatch_readiness",
  "expired_dispatch_readiness",
  "cancelled_dispatch_readiness",
  "not_dispatchable_dispatch_readiness"
] as const;

export type PublicationDispatchReadinessStatus =
  (typeof PUBLICATION_DISPATCH_READINESS_STATUSES)[number];

export const PUBLICATION_DISPATCH_READINESS_RESULTS = [
  "dispatch_placeholder_queued",
  "dispatch_placeholder_ready",
  "dispatch_placeholder_blocked",
  "dispatch_placeholder_deferred",
  "dispatch_placeholder_terminal",
  "dispatch_placeholder_not_dispatchable"
] as const;

export type PublicationDispatchReadinessResult =
  (typeof PUBLICATION_DISPATCH_READINESS_RESULTS)[number];

export const PUBLICATION_DISPATCH_READINESS_WARNING_CODES = [
  "dispatch_readiness_family_ambiguous",
  "dispatch_readiness_status_mismatch",
  "dispatch_readiness_runtime_boundary_only",
  "dispatch_readiness_not_actual_dispatch_execution",
  "dispatch_readiness_not_actual_publication_delivery",
  "dispatch_readiness_not_actual_handler_result",
  "dispatch_readiness_not_actual_delivery_result",
  "dispatch_readiness_not_provider_transport_result",
  "dispatch_readiness_authority_context_placeholder_only",
  "dispatch_readiness_provenance_context_placeholder_only",
  "dispatch_readiness_delegation_context_placeholder_only",
  "dispatch_readiness_runtime_surface_envelope_emitted",
  "dispatch_readiness_integration_linkage_emitted",
  "dispatch_readiness_audit_linkage_emitted"
] as const;

export type PublicationDispatchReadinessWarningCode =
  (typeof PUBLICATION_DISPATCH_READINESS_WARNING_CODES)[number];

export const PUBLICATION_PREPARATION_STATUS_TO_DISPATCH_READINESS_STATUS = {
  queued_publication_preparation: "queued_dispatch_readiness",
  prepared_publication_preparation: "prepared_dispatch_readiness",
  blocked_publication_preparation: "blocked_dispatch_readiness",
  deferred_publication_preparation: "deferred_dispatch_readiness",
  aborted_publication_preparation: "aborted_dispatch_readiness",
  expired_publication_preparation: "expired_dispatch_readiness",
  cancelled_publication_preparation: "cancelled_dispatch_readiness",
  not_dispatchable_publication_preparation: "not_dispatchable_dispatch_readiness"
} as const;
