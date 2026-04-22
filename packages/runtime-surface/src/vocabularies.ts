export const RUNTIME_SURFACE_FAMILIES = [
  "mcp_entrypoint",
  "api_entrypoint",
  "generic_runtime_entrypoint"
] as const;

export type RuntimeSurfaceFamily = (typeof RUNTIME_SURFACE_FAMILIES)[number];

export const RUNTIME_SURFACE_MODES = [
  "sync_request",
  "async_request",
  "tool_call",
  "resource_read",
  "batch_dispatch",
  "handoff_dispatch"
] as const;

export type RuntimeSurfaceMode = (typeof RUNTIME_SURFACE_MODES)[number];

export const RUNTIME_ENTRYPOINT_TYPES = ["mcp", "api", "generic_runtime"] as const;
export type RuntimeEntrypointType = (typeof RUNTIME_ENTRYPOINT_TYPES)[number];

export const HANDLER_EXECUTION_INTENT_TYPES = [
  "read_intent",
  "bundle_intent",
  "write_intent",
  "handoff_intent",
  "audit_intent",
  "policy_intent",
  "capability_intent",
  "no_execution_intent"
] as const;

export type HandlerExecutionIntentType = (typeof HANDLER_EXECUTION_INTENT_TYPES)[number];

export const HANDLER_DISPATCH_INTENT_TYPES = [
  "dispatch_to_handler",
  "return_missing_handler",
  "return_unsupported_surface",
  "return_unsupported_mode",
  "return_validation_failure",
  "return_boundary_warning"
] as const;

export type HandlerDispatchIntentType = (typeof HANDLER_DISPATCH_INTENT_TYPES)[number];

export const ENTRYPOINT_VALIDATION_STATUSES = ["valid", "invalid", "deferred"] as const;
export type EntrypointValidationStatus = (typeof ENTRYPOINT_VALIDATION_STATUSES)[number];

export const RUNTIME_SURFACE_BOUNDARY_WARNING_CODES = [
  "normalization_assumption_applied",
  "response_shape_fallback",
  "capability_visibility_gap",
  "canonical_linkage_partial",
  "boundary_contract_mismatch"
] as const;

export type RuntimeSurfaceBoundaryWarningCode = (typeof RUNTIME_SURFACE_BOUNDARY_WARNING_CODES)[number];

export const RUNTIME_HANDLER_RESULT_STATUSES = [
  "handled",
  "rejected",
  "deferred",
  "missing_handler",
  "unsupported_surface",
  "unsupported_mode"
] as const;

export type RuntimeHandlerResultStatus = (typeof RUNTIME_HANDLER_RESULT_STATUSES)[number];
