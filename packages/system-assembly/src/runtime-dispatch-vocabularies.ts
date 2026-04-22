export const INTERNAL_DISPATCH_WARNING_CODES = [
  "validation_not_strictly_valid",
  "registry_missing",
  "unsupported_operation_family",
  "missing_contour_pipeline",
  "dependency_validation_failed",
  "dispatch_planning_deferred"
] as const;

export type InternalDispatchWarningCode = (typeof INTERNAL_DISPATCH_WARNING_CODES)[number];

export const INTERNAL_DISPATCH_UNSUPPORTED_PATH_CODES = [
  "unsupported_operation",
  "unsupported_surface",
  "unsupported_mode",
  "unsupported_entrypoint",
  "unsupported_operation_family"
] as const;

export type InternalDispatchUnsupportedPathCode = (typeof INTERNAL_DISPATCH_UNSUPPORTED_PATH_CODES)[number];

export const INTERNAL_DISPATCH_RESULT_STATUSES = [
  "dispatch_planned",
  "unsupported_path",
  "missing_handler",
  "missing_dependency",
  "validation_failed",
  "planning_deferred"
] as const;

export type InternalDispatchResultStatus = (typeof INTERNAL_DISPATCH_RESULT_STATUSES)[number];

export const DISPATCH_READINESS_STATUSES = ["ready", "not_ready", "unsupported"] as const;

export type DispatchReadinessStatus = (typeof DISPATCH_READINESS_STATUSES)[number];

export const INTERNAL_DISPATCH_CONTOUR_FAMILIES = [
  "read_path",
  "pack_loop",
  "write_path",
  "handoff",
  "unsupported"
] as const;

export type InternalDispatchContourFamily = (typeof INTERNAL_DISPATCH_CONTOUR_FAMILIES)[number];
