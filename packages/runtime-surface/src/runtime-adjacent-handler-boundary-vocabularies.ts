export const RUNTIME_ADJACENT_HANDLER_BOUNDARY_CONTOUR_TARGETS = [
  "read_path",
  "pack_loop",
  "write_path",
  "handoff",
  "unknown"
] as const;

export type RuntimeAdjacentHandlerBoundaryContourTarget =
  (typeof RUNTIME_ADJACENT_HANDLER_BOUNDARY_CONTOUR_TARGETS)[number];

export const RUNTIME_ADJACENT_HANDLER_BOUNDARY_STATUSES = [
  "handler_boundary_candidate",
  "handler_boundary_blocked",
  "handler_boundary_not_permitted"
] as const;

export type RuntimeAdjacentHandlerBoundaryStatus =
  (typeof RUNTIME_ADJACENT_HANDLER_BOUNDARY_STATUSES)[number];

export const RUNTIME_ADJACENT_HANDLER_BOUNDARY_DENIAL_REASONS = [
  "runtime_handler_boundary_contract_only",
  "handler_invocation_denied_by_default",
  "handler_execution_denied_by_default",
  "runtime_dispatch_denied_by_default",
  "provider_sdk_call_denied_by_default",
  "transport_execution_denied_by_default",
  "concrete_persistence_write_denied_by_default",
  "direct_canonical_context_access_denied_by_default",
  "direct_canonical_writeback_denied_by_default",
  "actual_contour_execution_denied_by_default",
  "runtime_permission_denied_by_default",
  "source_invocation_denial_proof_required",
  "unknown_contour_target_not_permitted"
] as const;

export type RuntimeAdjacentHandlerBoundaryDenialReason =
  (typeof RUNTIME_ADJACENT_HANDLER_BOUNDARY_DENIAL_REASONS)[number];

export const RUNTIME_ADJACENT_HANDLER_BOUNDARY_WARNING_CODES = [
  "runtime_adjacent_not_runtime_execution",
  "handler_boundary_not_handler_invocation",
  "runtime_permission_still_denied",
  "provider_sdk_call_still_denied",
  "transport_execution_still_denied",
  "concrete_persistence_write_still_denied",
  "canonical_context_access_still_denied",
  "canonical_writeback_still_denied",
  "authority_context_placeholder_only",
  "provenance_context_placeholder_only",
  "source_invocation_denial_proof_reference_only"
] as const;

export type RuntimeAdjacentHandlerBoundaryWarningCode =
  (typeof RUNTIME_ADJACENT_HANDLER_BOUNDARY_WARNING_CODES)[number];
