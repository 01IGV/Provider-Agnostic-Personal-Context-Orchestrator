export const CONTOUR_TARGET_IDENTIFIERS = ["read_path", "pack_loop", "write_path", "handoff"] as const;

export type ContourTargetIdentifier = (typeof CONTOUR_TARGET_IDENTIFIERS)[number];

export const CONTOUR_GATE_RESULT_STATUSES = [
  "eligible",
  "blocked",
  "unsupported_contour",
  "missing_boundary",
  "ambiguous_target"
] as const;

export type ContourInvocationGateResultStatus = (typeof CONTOUR_GATE_RESULT_STATUSES)[number];

export const CONTOUR_GATE_BLOCKED_REASON_CODES = [
  "dispatch_plan_missing",
  "dispatch_status_not_planned",
  "dispatch_readiness_not_ready",
  "dependency_unresolved",
  "pipeline_unavailable",
  "missing_boundary_reference",
  "unsupported_contour_target",
  "ambiguous_contour_target"
] as const;

export type ContourInvocationBlockedReasonCode = (typeof CONTOUR_GATE_BLOCKED_REASON_CODES)[number];

export const CONTOUR_GATE_WARNING_CODES = [
  "dispatch_plan_unavailable",
  "dispatch_status_requires_followup",
  "boundary_reference_incomplete",
  "invocation_request_placeholder_only",
  "eligibility_not_ready"
] as const;

export type ContourInvocationGateWarningCode = (typeof CONTOUR_GATE_WARNING_CODES)[number];

export const CONTOUR_RESULT_EXPECTATION_KINDS = [
  "read_path_pack_input",
  "pack_loop_bundle",
  "write_path_run",
  "handoff_run",
  "no_contour_result"
] as const;

export type ContourResultExpectationKind = (typeof CONTOUR_RESULT_EXPECTATION_KINDS)[number];
