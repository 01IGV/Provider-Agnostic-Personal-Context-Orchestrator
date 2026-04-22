export const INTEGRATION_SURFACE_TYPES = ["mcp", "api", "hybrid"] as const;
export type IntegrationSurfaceType = (typeof INTEGRATION_SURFACE_TYPES)[number];

export const SURFACE_RESPONSE_STATUSES = [
  "success",
  "accepted",
  "partial",
  "validation_failed",
  "rejected",
  "error"
] as const;
export type SurfaceResponseStatus = (typeof SURFACE_RESPONSE_STATUSES)[number];

export const OPERATION_FAMILIES = [
  "read",
  "bundle",
  "write",
  "handoff",
  "audit",
  "policy",
  "capability"
] as const;
export type OperationFamily = (typeof OPERATION_FAMILIES)[number];

export const CAPABILITY_CLASSES = [
  "context_read",
  "context_expand",
  "write_candidate",
  "handoff_transfer",
  "audit_inspection",
  "policy_inspection",
  "capability_discovery"
] as const;
export type CapabilityClass = (typeof CAPABILITY_CLASSES)[number];

export const REQUEST_VISIBILITY_LEVELS = [
  "private",
  "subject_scoped",
  "workspace_visible",
  "system_internal"
] as const;
export type RequestVisibilityLevel = (typeof REQUEST_VISIBILITY_LEVELS)[number];

export const SIDE_EFFECT_CLASSES = [
  "read_only",
  "derived_artifact_refresh",
  "candidate_submission",
  "state_transition_planning",
  "no_side_effect"
] as const;
export type SideEffectClass = (typeof SIDE_EFFECT_CLASSES)[number];

export const SURFACE_ERROR_CODES = [
  "validation_failure",
  "policy_rejection",
  "scope_denial",
  "not_found",
  "expired",
  "transient_failure",
  "unsupported_capability",
  "internal_failure"
] as const;
export type SurfaceErrorCode = (typeof SURFACE_ERROR_CODES)[number];
