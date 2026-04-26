export const FIRST_EXECUTABLE_ADJACENT_CONTOUR_INVOCATION_TARGETS = [
  "read_path",
  "pack_loop",
  "write_path",
  "handoff",
  "unknown"
] as const;

export type FirstExecutableAdjacentContourInvocationTarget =
  (typeof FIRST_EXECUTABLE_ADJACENT_CONTOUR_INVOCATION_TARGETS)[number];

export const FIRST_EXECUTABLE_ADJACENT_INVOCATION_BOUNDARY_STATUSES = [
  "invocation_candidate",
  "invocation_blocked",
  "invocation_deferred",
  "invocation_not_permitted"
] as const;

export type FirstExecutableAdjacentInvocationBoundaryStatus =
  (typeof FIRST_EXECUTABLE_ADJACENT_INVOCATION_BOUNDARY_STATUSES)[number];

export const FIRST_EXECUTABLE_ADJACENT_INVOCATION_DENIAL_REASONS = [
  "actual_contour_execution_denied_by_default",
  "runtime_handler_invocation_denied_by_default",
  "provider_sdk_call_denied_by_default",
  "concrete_persistence_write_denied_by_default",
  "direct_canonical_context_access_denied_by_default",
  "direct_canonical_writeback_denied_by_default",
  "unknown_contour_target_not_permitted",
  "source_proof_artifact_non_executing_only"
] as const;

export type FirstExecutableAdjacentInvocationDenialReason =
  (typeof FIRST_EXECUTABLE_ADJACENT_INVOCATION_DENIAL_REASONS)[number];

export const FIRST_EXECUTABLE_ADJACENT_INVOCATION_WARNING_CODES = [
  "executable_adjacent_not_executable",
  "actual_contour_execution_still_denied",
  "runtime_handler_invocation_still_denied",
  "provider_sdk_call_still_denied",
  "concrete_persistence_write_still_denied",
  "canonical_context_access_still_denied",
  "canonical_writeback_still_denied",
  "authority_context_placeholder_only",
  "provenance_context_placeholder_only",
  "source_proof_reference_only"
] as const;

export type FirstExecutableAdjacentInvocationWarningCode =
  (typeof FIRST_EXECUTABLE_ADJACENT_INVOCATION_WARNING_CODES)[number];
