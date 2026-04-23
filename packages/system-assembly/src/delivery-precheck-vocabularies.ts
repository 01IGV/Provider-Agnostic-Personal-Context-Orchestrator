export const DELIVERY_PRECHECK_FAMILIES = [
  "read_path_delivery_precheck",
  "pack_loop_delivery_precheck",
  "write_path_delivery_precheck",
  "handoff_delivery_precheck",
  "unknown_delivery_precheck"
] as const;

export type DeliveryPrecheckFamily = (typeof DELIVERY_PRECHECK_FAMILIES)[number];

export const TARGET_HANDLER_FAMILIES = [
  "mcp_handler_family",
  "api_handler_family",
  "hybrid_handler_family",
  "unknown_handler_family"
] as const;

export type TargetHandlerFamily = (typeof TARGET_HANDLER_FAMILIES)[number];

export const DELIVERY_PRECHECK_STATUSES = [
  "ready",
  "blocked",
  "deferred",
  "unavailable",
  "unsupported",
  "partially_ready"
] as const;

export type DeliveryPrecheckStatus = (typeof DELIVERY_PRECHECK_STATUSES)[number];

export const DELIVERY_PRECHECK_WARNING_CODES = [
  "precheck_family_ambiguous",
  "handler_boundary_ambiguous",
  "handler_unavailable",
  "channel_unavailable",
  "capability_fit_partial",
  "capability_fit_mismatch",
  "precheck_blocked",
  "precheck_deferred",
  "precheck_unsupported",
  "precheck_incomplete_handler_boundary",
  "surface_precheck_envelope_emitted",
  "integration_precheck_linkage_emitted"
] as const;

export type DeliveryPrecheckWarningCode = (typeof DELIVERY_PRECHECK_WARNING_CODES)[number];

export const DELIVERY_PRECHECK_STATUS_TO_SURFACE_STATUS: Record<
  DeliveryPrecheckStatus,
  "success" | "accepted" | "partial" | "rejected" | "error"
> = {
  ready: "success",
  blocked: "rejected",
  deferred: "accepted",
  unavailable: "error",
  unsupported: "error",
  partially_ready: "partial"
};
